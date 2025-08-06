"""
Router para la gestión de canciones y letras.

Este módulo maneja todas las operaciones CRUD relacionadas con las canciones:
- Listado y búsqueda de canciones
- Obtener canciones individuales por slug o ID
- Crear, actualizar y eliminar canciones (solo administradores)
- Gestión de slugs únicos y vistas
- Manejo de secciones con acordes y letras
"""

import logging
import re
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError

from ..core.database import get_db
from ..models.song import Song
from ..models.artist import Artist
from ..models.user import User
from ..models.activity import Activity
from ..models.favorite_songs import FavoriteSong
from ..schemas.song import Song as SongSchema, SongWithArtist, SongCreate, SongUpdate
from ..routers.auth import get_current_admin_user

# Configurar logging
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/songs",
    tags=["songs"],
    responses={404: {"description": "No encontrado"}}
)


def get_client_ip(request: Optional[Request]) -> str:
    """Obtener IP del cliente de forma segura."""
    if not request or not request.client:
        return "unknown"
    return request.client.host


def create_slug(title: str) -> str:
    """
    Crear slug URL-friendly a partir del título de la canción.
    
    Args:
        title: Título de la canción
    
    Returns:
        Slug generado para URLs
    """
    if not title:
        return ""
    
    # Convertir a minúsculas y reemplazar caracteres especiales
    slug = title.lower()
    # Reemplazar acentos
    slug = slug.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')
    slug = slug.replace('ñ', 'n')
    # Reemplazar espacios y caracteres especiales con guiones
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    # Eliminar guiones al inicio y final
    slug = slug.strip('-')
    
    return slug


def ensure_chords_lyrics(sections: Any) -> Any:
    """
    Asegurar que cada sección tenga el campo chords_lyrics aunque esté vacío.
    
    Args:
        sections: Lista de secciones de la canción
    
    Returns:
        Lista de secciones con chords_lyrics garantizado
    """
    if not sections:
        return []
    
    result = []
    for section in sections:
        try:
            # Convertir a diccionario si es un objeto Pydantic
            if hasattr(section, "model_dump"):
                section_dict = section.model_dump()
            else:
                section_dict = dict(section) if section else {}
            
            # Asegurar que chords_lyrics existe
            if "chords_lyrics" not in section_dict:
                section_dict["chords_lyrics"] = ""
            elif section_dict["chords_lyrics"] is None:
                section_dict["chords_lyrics"] = ""
                
            result.append(section_dict) # type: ignore
        except Exception:
            # Si hay error, agregar la sección tal como está
            result.append(section) # type: ignore
    
    return result # type: ignore


def generate_unique_slug(db: Session, base_slug: str, song_id: Optional[int] = None) -> str:
    """
    Generar un slug único para la canción.
    
    Args:
        db: Sesión de base de datos
        base_slug: Slug base generado del título
        song_id: ID de la canción (para updates)
    
    Returns:
        Slug único
    """
    slug = base_slug
    counter = 1
    
    while True:
        query = db.query(Song).filter(getattr(Song, 'slug') == slug)
        if song_id:
            query = query.filter(Song.id != song_id)
        
        if not query.first():
            break
            
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    return slug


@router.get("/", response_model=List[SongWithArtist])
async def get_songs(
    skip: int = Query(0, ge=0, description="Número de registros a omitir"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros"),
    search: Optional[str] = Query(None, description="Término de búsqueda"),
    artist_id: Optional[int] = Query(None, description="ID del artista"),
    genre: Optional[str] = Query(None, description="Género musical"),
    key_signature: Optional[str] = Query(None, description="Tonalidad"),
    sort_by: str = Query("created_at", description="Campo por el que ordenar"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Orden de clasificación"),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Obtener lista de canciones con filtros y búsqueda.
    
    Args:
        skip: Número de registros a omitir para paginación
        limit: Número máximo de registros a devolver
        search: Término de búsqueda en título, artista o letras
        artist_id: Filtrar por ID de artista
        genre: Filtrar por género musical
        key_signature: Filtrar por tonalidad
        sort_by: Campo por el que ordenar
        sort_order: Orden ascendente o descendente
        db: Sesión de base de datos
    
    Returns:
        Lista de canciones que coinciden con los criterios
    """
    try:
        logger.info(f"Obteniendo canciones (skip={skip}, limit={limit}, search='{search}')")
        
        # Consulta base con join a artista
        query = db.query(Song, Artist).join(Artist)
        
        # Aplicar filtros de búsqueda
        if search:
            search_filter = or_(
                getattr(Song, 'title').ilike(f"%{search}%"),
                getattr(Artist, 'name').ilike(f"%{search}%"),
                getattr(Song, 'lyrics').ilike(f"%{search}%"),
                getattr(Song, 'genre').ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        # Filtros específicos
        if artist_id:
            query = query.filter(Song.artist_id == artist_id)
        
        if genre:
            query = query.filter(getattr(Song, 'genre') == genre)
        
        if key_signature:
            query = query.filter(getattr(Song, 'key_signature') == key_signature)
        
        # Ordenamiento
        order_column = getattr(Song, sort_by, getattr(Song, 'created_at'))
        if sort_order == "desc":
            query = query.order_by(order_column.desc())
        else:
            query = query.order_by(order_column.asc())
        
        # Aplicar paginación
        results = query.offset(skip).limit(limit).all()
        
        # Transformar los resultados en el formato esperado por SongWithArtist
        songs_with_artists: List[Dict[str, Any]] = []
        for song, artist in results:
            # Convertir la canción a diccionario con tipos específicos
            song_dict: Dict[str, Any] = {
                "id": song.id,
                "title": song.title,
                "slug": song.slug,
                "lyrics": song.lyrics,
                "chords_lyrics": song.chords_lyrics,
                "sections": song.sections,
                "key_signature": song.key_signature,
                "tempo": song.tempo,
                "genre": song.genre,
                "language": song.language,
                "youtube_url": song.youtube_url,
                "spotify_url": song.spotify_url,
                "views": song.views,
                "likes_count": song.likes_count,
                "favorites_count": song.favorites_count,
                
                "created_at": song.created_at,
                "updated_at": song.updated_at,
                "artist_id": song.artist_id,
                "artist": {
                    "id": artist.id,
                    "name": artist.name,
                    "slug": getattr(artist, 'slug', f"{artist.name.lower().replace(' ', '-')}"),
                    "description": getattr(artist, 'biography', None),
                    "genre": getattr(artist, 'genre', None),
                    "country": getattr(artist, 'country', None),
                    "verified": artist.verified,
                    "songs_count": 0,  # Se podría calcular si es necesario
                    "created_at": artist.created_at
                }
            }
            songs_with_artists.append(song_dict)
        
        logger.info(f"Se encontraron {len(songs_with_artists)} canciones")
        return songs_with_artists
        
    except SQLAlchemyError as e:
        logger.error(f"Error de base de datos al obtener canciones: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al obtener canciones"
        )
    except Exception as e:
        logger.error(f"Error inesperado al obtener canciones: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.get("/count")
async def get_songs_count(
    search: Optional[str] = Query(None, description="Término de búsqueda"),
    artist_id: Optional[int] = Query(None, description="ID del artista"),
    genre: Optional[str] = Query(None, description="Género musical"),
    key_signature: Optional[str] = Query(None, description="Tonalidad"),
    db: Session = Depends(get_db)
) -> Dict[str, int]:
    """
    Obtener el número total de canciones que coinciden con los filtros.
    
    Args:
        search: Término de búsqueda
        artist_id: ID del artista
        genre: Género musical
        key_signature: Tonalidad
        db: Sesión de base de datos
    
    Returns:
        Diccionario con el conteo total
    """
    try:
        query = db.query(Song).join(Artist)
        
        # Aplicar los mismos filtros que en get_songs
        if search:
            search_filter = or_(
                getattr(Song, 'title').ilike(f"%{search}%"),
                getattr(Artist, 'name').ilike(f"%{search}%"),
                getattr(Song, 'lyrics').ilike(f"%{search}%"),
                getattr(Song, 'genre').ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        if artist_id:
            query = query.filter(Song.artist_id == artist_id)
        
        if genre:
            query = query.filter(getattr(Song, 'genre') == genre)
        
        if key_signature:
            query = query.filter(getattr(Song, 'key_signature') == key_signature)
        
        count = query.count()
        return {"count": count}
        
    except SQLAlchemyError as e:
        logger.error(f"Error al contar canciones: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al contar canciones"
        )


@router.get("/genres")
async def get_genres(db: Session = Depends(get_db)) -> Dict[str, List[str]]:
    """
    Obtener lista de géneros musicales disponibles.
    
    Args:
        db: Sesión de base de datos
    
    Returns:
        Lista de géneros únicos
    """
    try:
        genres = (
            db.query(getattr(Song, 'genre'))
            .filter(
                getattr(Song, 'genre').isnot(None),
                getattr(Song, 'genre') != ""
            )
            .distinct()
            .all()
        )
        
        genre_list = [genre[0] for genre in genres if genre[0]]
        genre_list.sort()
        
        return {"genres": genre_list}
        
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener géneros: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.get("/keys")
async def get_key_signatures(db: Session = Depends(get_db)) -> Dict[str, List[str]]:
    """
    Obtener lista de tonalidades disponibles.
    
    Args:
        db: Sesión de base de datos
    
    Returns:
        Lista de tonalidades únicas
    """
    try:
        keys = (
            db.query(getattr(Song, 'key_signature'))
            .filter(
                getattr(Song, 'key_signature').isnot(None),
                getattr(Song, 'key_signature') != ""
            )
            .distinct()
            .all()
        )
        
        key_list = [key[0] for key in keys if key[0]]
        key_list.sort()
        
        return {"keys": key_list}
        
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener tonalidades: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.get("/{slug}", response_model=SongWithArtist)
async def get_song(
    slug: str, 
    db: Session = Depends(get_db)
) -> Song:
    """
    Obtener una canción específica por su slug.
    
    Args:
        slug: Slug único de la canción
        db: Sesión de base de datos
        current_user: Usuario actual (opcional)
    
    Returns:
        Datos completos de la canción
    
    Raises:
        HTTPException: Si la canción no existe o no está activa
    """
    try:
        logger.info(f"Obteniendo canción con slug '{slug}'")
        
        song = (
            db.query(Song)
            .filter(getattr(Song, 'slug') == slug)
            .first()
        )
        
        if not song:
            logger.warning(f"Canción con slug '{slug}' no encontrada")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Canción no encontrada"
            )
        
        # Incrementar contador de vistas
        current_views = getattr(song, 'views', 0)
        setattr(song, 'views', current_views + 1)
        
        db.commit()
        
        logger.info(f"Canción '{getattr(song, 'title')}' obtenida exitosamente (vistas: {getattr(song, 'views')})")
        return song
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error de base de datos al obtener canción '{slug}': {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error inesperado al obtener canción '{slug}': {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.post("/", response_model=SongSchema, status_code=status.HTTP_201_CREATED)
async def create_song(
    song: SongCreate,
    request: Request,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_admin_user)
) -> Song:
    """
    Crear una nueva canción (solo administradores).
    
    Args:
        song: Datos de la canción a crear
        db: Sesión de base de datos
        current_user: Usuario administrador autenticado
    
    Returns:
        Canción creada
    
    Raises:
        HTTPException: Si el artista no existe o hay un error del servidor
    """
    try:
        logger.info(f"Admin {getattr(current_user, 'email')} creando canción '{song.title}'")
        
        # Verificar que el artista existe
        artist = (
            db.query(Artist)
            .filter(Artist.id == song.artist_id)
            .first()
        )
        
        if not artist:
            logger.warning(f"Artista con ID {song.artist_id} no encontrado")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Artista no encontrado"
            )
        
        # Generar slug único
        base_slug = create_slug(song.title)
        unique_slug = generate_unique_slug(db, base_slug)
        
        # Procesar secciones
        processed_sections = ensure_chords_lyrics(song.sections) if song.sections else None
        
        # Crear la canción
        db_song = Song(
            title=song.title,
            slug=unique_slug,
            lyrics=song.lyrics,
            sections=processed_sections,
            chords_lyrics=song.chords_lyrics,
            key_signature=song.key_signature,
            tempo=song.tempo,
            genre=song.genre,
            youtube_url=str(song.youtube_url) if song.youtube_url else None,
            spotify_url=str(song.spotify_url) if song.spotify_url else None,
            artist_id=song.artist_id
        )
        
        db.add(db_song)
        db.commit()  # Commit inicial para obtener el ID
        db.refresh(db_song)
        
        # Registrar actividad
        activity = Activity(
            user_id=getattr(current_user, 'id'),
            action="song_created",
            description=f"Creó la canción '{song.title}' del artista '{getattr(artist, 'name')}'",
            ip_address=get_client_ip(request)
        )
        db.add(activity)
        
        db.commit()
        db.refresh(db_song)
        
        logger.info(f"Canción '{song.title}' creada exitosamente con ID {getattr(db_song, 'id')}")
        return db_song
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error de base de datos al crear canción '{song.title}': {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al crear canción"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error inesperado al crear canción '{song.title}': {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.put("/{song_id}", response_model=SongSchema)
async def update_song(
    song_id: int, 
    song: SongUpdate,
    request: Request,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_admin_user)
) -> Song:
    """
    Actualizar una canción existente (solo administradores).
    
    Args:
        song_id: ID de la canción a actualizar
        song: Datos de actualización
        db: Sesión de base de datos
        current_user: Usuario administrador autenticado
    
    Returns:
        Canción actualizada
    
    Raises:
        HTTPException: Si la canción no existe o hay un error del servidor
    """
    try:
        logger.info(f"Admin {getattr(current_user, 'email')} actualizando canción ID {song_id}")
        
        db_song = db.query(Song).filter(Song.id == song_id).first()
        if not db_song:
            logger.warning(f"Canción con ID {song_id} no encontrada")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Canción no encontrada"
            )
        
        # Almacenar título original para logging
        original_title = getattr(db_song, 'title')
        
        # Actualizar campos
        update_data = song.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            if hasattr(db_song, field):
                if field == "sections" and value is not None:
                    value = ensure_chords_lyrics(value)
                elif field == "title" and value and value != original_title:
                    # Actualizar slug si cambia el título
                    new_base_slug = create_slug(value)
                    new_unique_slug = generate_unique_slug(db, new_base_slug, song_id)
                    setattr(db_song, 'slug', new_unique_slug)
                    logger.info(f"Slug actualizado de '{getattr(db_song, 'slug')}' a '{new_unique_slug}'")
                elif field in ("youtube_url", "spotify_url") and value is not None:
                    # Convertir HttpUrl a string para PostgreSQL
                    value = str(value) if value else None
                
                setattr(db_song, field, value)
        
        # Registrar actividad
        activity = Activity(
            user_id=getattr(current_user, 'id'),
            action="song_updated",
            description=f"Actualizó la canción '{original_title}' (ID: {song_id})",
            ip_address=get_client_ip(request)
        )
        db.add(activity)
        
        db.commit()
        db.refresh(db_song)
        
        logger.info(f"Canción ID {song_id} actualizada exitosamente")
        return db_song
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error de base de datos al actualizar canción ID {song_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al actualizar canción"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error inesperado al actualizar canción ID {song_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.delete("/{song_id}")
async def delete_song(
    song_id: int,
    request: Request,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_admin_user)
) -> Dict[str, str]:
    """
    Eliminar una canción (eliminación suave - solo administradores).
    
    Args:
        song_id: ID de la canción a eliminar
        db: Sesión de base de datos
        current_user: Usuario administrador autenticado
    
    Returns:
        Mensaje de confirmación
    
    Raises:
        HTTPException: Si la canción no existe o hay un error del servidor
    """
    try:
        logger.info(f"Admin {getattr(current_user, 'email')} eliminando canción ID {song_id}")
        
        db_song = db.query(Song).filter(Song.id == song_id).first()
        if not db_song:
            logger.warning(f"Canción con ID {song_id} no encontrada")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Canción no encontrada"
            )
        
        song_title = getattr(db_song, 'title')
        
        # Eliminación física de la canción
        db.delete(db_song)
        
        # Registrar actividad
        activity = Activity(
            user_id=getattr(current_user, 'id'),
            action="song_deleted",
            description=f"Eliminó la canción '{song_title}' (ID: {song_id})",
            ip_address=get_client_ip(request)
        )
        db.add(activity)
        
        db.commit()
        
        logger.info(f"Canción '{song_title}' (ID: {song_id}) marcada como eliminada")
        return {"message": "Canción eliminada correctamente"}
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error de base de datos al eliminar canción ID {song_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al eliminar canción"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error inesperado al eliminar canción ID {song_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.get("/id/{song_id}", response_model=SongWithArtist)
async def get_song_by_id(
    song_id: int, 
    db: Session = Depends(get_db)
) -> Song:
    """
    Obtener una canción específica por su ID.
    
    Args:
        song_id: ID de la canción
        db: Sesión de base de datos
        current_user: Usuario actual (opcional)
    
    Returns:
        Datos completos de la canción
    
    Raises:
        HTTPException: Si la canción no existe
    """
    try:
        logger.info(f"Obteniendo canción con ID {song_id}")
        
        song = (
            db.query(Song)
            .filter(Song.id == song_id)
            .first()
        )
        
        if not song:
            logger.warning(f"Canción con ID {song_id} no encontrada")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Canción no encontrada"
            )
        
        logger.info(f"Canción '{getattr(song, 'title')}' obtenida exitosamente por ID")
        return song
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Error de base de datos al obtener canción ID {song_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )
    except Exception as e:
        logger.error(f"Error inesperado al obtener canción ID {song_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.get("/{song_id}/stats")
async def get_song_stats(
    song_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """
    Obtener estadísticas de una canción (solo administradores).
    
    Args:
        song_id: ID de la canción
        db: Sesión de base de datos
        current_user: Usuario administrador autenticado
    
    Returns:
        Estadísticas de la canción
    """
    try:
        song = db.query(Song).filter(Song.id == song_id).first()
        if not song:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Canción no encontrada"
            )
        
        # Contar favoritos
        favorites_count = (
            db.query(FavoriteSong)
            .filter(FavoriteSong.song_id == song_id)
            .count()
        )
        
        # Obtener actividades relacionadas
        recent_views = (
            db.query(Activity)
            .filter(
                Activity.action == "song_viewed",
                Activity.description.like(f"%{getattr(song, 'title')}%")
            )
            .order_by(Activity.created_at.desc())
            .limit(10)
            .all()
        )
        
        return {
            "song_id": song_id,
            "title": getattr(song, 'title'),
            "views": getattr(song, 'views', 0),
            "favorites_count": favorites_count,
            "recent_views_count": len(recent_views),
            # is_active field removed
        }
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener estadísticas de canción {song_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )
    except Exception as e:
        logger.error(f"Error inesperado al obtener estadísticas de canción {song_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.get("/featured", response_model=List[SongWithArtist])
async def get_featured_songs(
    limit: int = Query(10, ge=1, le=50, description="Número máximo de canciones destacadas"),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Obtener canciones destacadas.
    
    Args:
        limit: Número máximo de canciones a devolver
        db: Sesión de base de datos
    
    Returns:
        Lista de canciones destacadas ordenadas por popularidad
    """
    try:
        logger.info(f"Obteniendo canciones destacadas (limit={limit})")
        
        # Consulta para canciones destacadas con artista  
        query = db.query(Song, Artist).join(Artist).order_by(
            getattr(Song, 'views').desc(),
            getattr(Song, 'created_at').desc()
        )
        
        results = query.limit(limit).all()
        
        # Transformar los resultados
        featured_songs: List[Dict[str, Any]] = []
        for song, artist in results:
            song_dict: Dict[str, Any] = {
                "id": song.id,
                "title": song.title,
                "slug": song.slug,
                "lyrics": song.lyrics,
                "sections": song.sections,
                "chords_lyrics": song.chords_lyrics,
                "key_signature": song.key_signature,
                "tempo": song.tempo,
                "genre": song.genre,
                "language": song.language,
                "youtube_url": song.youtube_url,
                "spotify_url": song.spotify_url,
                "views": song.views,
                "likes_count": song.likes_count,
                "favorites_count": song.favorites_count,
                
                "artist_id": song.artist_id,
                "created_at": song.created_at.isoformat() if song.created_at else None,
                "updated_at": song.updated_at.isoformat() if song.updated_at else None,
                "artist": {
                    "id": artist.id,
                    "name": artist.name,
                    "slug": artist.slug,
                    "verified": artist.verified,
                    # is_active field removed
                }
            }
            featured_songs.append(song_dict)
        
        logger.info(f"Retornando {len(featured_songs)} canciones destacadas")
        return featured_songs
        
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener canciones destacadas: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.get("/popular", response_model=List[SongWithArtist])
async def get_popular_songs(
    limit: int = Query(10, ge=1, le=50, description="Número máximo de canciones populares"),
    period: str = Query("week", description="Período de popularidad: week, month, all"),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Obtener canciones populares basadas en vistas y favoritos.
    
    Args:
        limit: Número máximo de canciones a devolver
        period: Período de tiempo (week, month, all)
        db: Sesión de base de datos
    
    Returns:
        Lista de canciones populares ordenadas por métricas de popularidad
    """
    try:
        logger.info(f"Obteniendo canciones populares (limit={limit}, period={period})")
        
        # Consulta base
        query = db.query(Song, Artist).join(Artist)
        
        # Filtro por período de tiempo
        if period in ["week", "month"]:
            from datetime import datetime, timedelta
            if period == "week":
                cutoff_date = datetime.now() - timedelta(days=7)
            else:  # month
                cutoff_date = datetime.now() - timedelta(days=30)
            
            query = query.filter(getattr(Song, 'created_at') >= cutoff_date)
        
        # Ordenar por popularidad (vistas + favoritos)
        query = query.order_by(
            (getattr(Song, 'views') + getattr(Song, 'favorites_count')).desc(),
            getattr(Song, 'views').desc(),
            getattr(Song, 'created_at').desc()
        )
        
        results = query.limit(limit).all()
        
        # Transformar los resultados
        popular_songs: List[Dict[str, Any]] = []
        for song, artist in results:
            song_dict: Dict[str, Any] = {
                "id": song.id,
                "title": song.title,
                "slug": song.slug,
                "lyrics": song.lyrics,
                "sections": song.sections,
                "chords_lyrics": song.chords_lyrics,
                "key_signature": song.key_signature,
                "tempo": song.tempo,
                "genre": song.genre,
                "language": song.language,
                "youtube_url": song.youtube_url,
                "spotify_url": song.spotify_url,
                "views": song.views,
                "likes_count": song.likes_count,
                "favorites_count": song.favorites_count,
                
                "artist_id": song.artist_id,
                "created_at": song.created_at.isoformat() if song.created_at else None,
                "updated_at": song.updated_at.isoformat() if song.updated_at else None,
                "artist": {
                    "id": artist.id,
                    "name": artist.name,
                    "slug": artist.slug,
                    "verified": artist.verified,
                    # is_active field removed
                }
            }
            popular_songs.append(song_dict)
        
        logger.info(f"Retornando {len(popular_songs)} canciones populares")
        return popular_songs
        
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener canciones populares: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )



