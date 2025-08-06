from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, text, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import json
import re
from ..core.database import get_db
from ..models.artist import Artist
from ..models.song import Song
from ..models.user import User
from ..models.activity import Activity
from ..schemas.artist import Artist as ArtistSchema, ArtistCreate, ArtistUpdate
from ..schemas.song import Song as SongSchema
from ..routers.auth import get_current_admin_user

router = APIRouter()


def create_slug(name: str) -> str:
    """Crear slug a partir del nombre del artista"""
    # Eliminar caracteres especiales y normalizar
    slug = re.sub(r'[^\w\s-]', '', name.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    slug = slug.strip('-')
    
    # Manejar casos especiales para nombres en español
    slug = slug.replace('ñ', 'n')
    slug = re.sub(r'[áàäâ]', 'a', slug)
    slug = re.sub(r'[éèëê]', 'e', slug)
    slug = re.sub(r'[íìïî]', 'i', slug)
    slug = re.sub(r'[óòöô]', 'o', slug)
    slug = re.sub(r'[úùüû]', 'u', slug)
    
    return slug


def ensure_unique_slug(db: Session, base_slug: str, artist_id: Optional[int] = None) -> str:
    """Asegurar que el slug sea único"""
    slug = base_slug
    counter = 1
    
    while True:
        query = db.query(Artist).filter(Artist.slug == slug)
        if artist_id:
            query = query.filter(Artist.id != artist_id)
        
        if not query.first():
            return slug
        
        slug = f"{base_slug}-{counter}"
        counter += 1


@router.get("/", response_model=List[ArtistSchema])
def get_artists(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = Query(None, description="Buscar por nombre del artista"),
    verified_only: bool = Query(False, description="Solo artistas verificados"),
    has_songs: bool = Query(False, description="Solo artistas con canciones"),
    db: Session = Depends(get_db)
):
    """Obtener lista de artistas con filtros opcionales"""
    
    query = db.query(Artist)
    
    # Filtro de búsqueda
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Artist.name.ilike(search_term),
                Artist.biography.ilike(search_term)
            )
        )
    
    # Filtro por verificación
    if verified_only:
        query = query.filter(Artist.verified == True)
    
    # Filtro por artistas con canciones
    if has_songs:
        query = query.join(Song).group_by(Artist.id)
    
    # Ordenar por nombre
    query = query.order_by(Artist.name.asc())
    
    artists = query.offset(skip).limit(limit).all()
    return artists


@router.get("/stats")
def get_artists_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Obtener estadísticas de artistas"""
    
    total_artists = db.query(func.count(Artist.id)).scalar()
    verified_artists = db.query(func.count(Artist.id)).filter(Artist.verified == True).scalar()
    artists_with_songs = db.query(func.count(Artist.id.distinct())).join(Song).scalar()
    
    # Artista con más canciones
    top_artist = db.query(
        Artist.name,
        func.count(Song.id).label('song_count')
    ).join(Song).group_by(Artist.id, Artist.name).order_by(text("song_count DESC")).first()
    
    return {
        "total_artists": total_artists,
        "verified_artists": verified_artists,
        "artists_with_songs": artists_with_songs,
        "top_artist": {
            "name": top_artist.name,
            "song_count": top_artist.song_count
        } if top_artist else None
    }


@router.get("/search")
def search_artists(
    q: str = Query(..., min_length=2, description="Término de búsqueda"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Búsqueda rápida de artistas para autocompletado"""
    
    search_term = f"%{q}%"
    artists = db.query(Artist).filter(
        Artist.name.ilike(search_term)
    ).order_by(Artist.name.asc()).limit(limit).all()
    
    return [
        {
            "id": artist.id,
            "name": artist.name,
            "slug": artist.slug,
            "verified": artist.verified,
            "song_count": len(artist.songs) if artist.songs else 0
        }
        for artist in artists
    ]


@router.get("/{slug}", response_model=ArtistSchema)
def get_artist(slug: str, db: Session = Depends(get_db)) -> ArtistSchema:
    """Obtener un artista específico por slug"""
    
    artist = db.query(Artist).filter(Artist.slug == slug).first()
    if artist is None:
        raise HTTPException(status_code=404, detail="Artista no encontrado")
    
    return artist


@router.post("/", response_model=ArtistSchema)
def create_artist(
    artist: ArtistCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_admin_user)
) -> ArtistSchema:
    """Crear un nuevo artista (solo administradores)"""
    
    # Verificar que el artista no existe
    existing_artist = db.query(Artist).filter(Artist.name == artist.name).first()
    if existing_artist:
        raise HTTPException(status_code=400, detail="Ya existe un artista con ese nombre")
    
    # Crear slug único
    base_slug = create_slug(artist.name)
    unique_slug = ensure_unique_slug(db, base_slug)
    
    # Crear el artista de forma tradicional
    db_artist = Artist(
        name=artist.name,
        slug=unique_slug,
        biography=getattr(artist, "biography", None),
        website_url=getattr(artist, "website_url", None),
        facebook_url=getattr(artist, "facebook_url", None),
        instagram_url=getattr(artist, "instagram_url", None),
        youtube_url=getattr(artist, "youtube_url", None),
        spotify_url=getattr(artist, "spotify_url", None),
        verified=getattr(artist, "verified", False),
        is_active=getattr(artist, "is_active", True)
    )
    
    db.add(db_artist)
    db.commit()
    db.refresh(db_artist)
    
    # Registrar actividad
    activity = Activity(
        user_id=current_user.id,
        action="create_artist",
        description=f"Creó el artista: {artist.name}",
        ip_address="api"
    )
    db.add(activity)
    db.commit()
    
    return db_artist


@router.put("/{artist_id}", response_model=ArtistSchema)
def update_artist(
    artist_id: int, 
    artist: ArtistUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_admin_user)
) -> ArtistSchema:
    """Actualizar un artista existente (solo administradores)"""
    
    db_artist = db.query(Artist).filter(Artist.id == artist_id).first()
    if db_artist is None:
        raise HTTPException(status_code=404, detail="Artista no encontrado")
    
    # Guardar el nombre original para el log
    original_name = db_artist.name
    
    # Actualizar campos
    update_data = artist.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "name" and value and value != db_artist.name:
            # Verificar que el nuevo nombre no existe
            existing = db.query(Artist).filter(
                Artist.name == value, 
                Artist.id != artist_id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=400, 
                    detail="Ya existe un artista con ese nombre"
                )
            
            # Actualizar slug si cambia el nombre
            new_slug = create_slug(value)
            unique_slug = ensure_unique_slug(db, new_slug, artist_id)
            setattr(db_artist, 'slug', unique_slug)
        
        setattr(db_artist, field, value)
    
    # Actualizar timestamp
    setattr(db_artist, 'updated_at', datetime.now(timezone.utc))
    
    db.commit()
    db.refresh(db_artist)
    
    # Registrar actividad
    activity = Activity(
        user_id=current_user.id,
        action="update_artist",
        description=f"Actualizó el artista: {original_name} -> {db_artist.name}",
        ip_address="api"
    )
    db.add(activity)
    db.commit()
    
    return db_artist


@router.patch("/{artist_id}/verify")
def verify_artist(
    artist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Dict[str, str]:
    """Verificar un artista (solo administradores)"""
    
    artist = db.query(Artist).filter(Artist.id == artist_id).first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artista no encontrado")
    
    if getattr(artist, 'verified', False):
        raise HTTPException(status_code=400, detail="El artista ya está verificado")
    
    setattr(artist, 'verified', True)
    setattr(artist, 'updated_at', datetime.now(timezone.utc))
    db.commit()
    
    # Registrar actividad
    activity = Activity(
        user_id=current_user.id,
        action="verify_artist",
        description=f"Verificó al artista: {artist.name}",
        ip_address="api"
    )
    db.add(activity)
    db.commit()
    
    return {"message": f"Artista {artist.name} verificado exitosamente"}


@router.patch("/{artist_id}/unverify")
def unverify_artist(
    artist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Dict[str, str]:
    """Desverificar un artista (solo administradores)"""
    
    artist = db.query(Artist).filter(Artist.id == artist_id).first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artista no encontrado")
    
    if not getattr(artist, 'verified', False):
        raise HTTPException(status_code=400, detail="El artista no está verificado")
    
    setattr(artist, 'verified', False)
    setattr(artist, 'updated_at', datetime.now(timezone.utc))
    db.commit()
    
    # Registrar actividad
    activity = Activity(
        user_id=current_user.id,
        action="unverify_artist",
        description=f"Desverificó al artista: {artist.name}",
        ip_address="api"
    )
    db.add(activity)
    db.commit()
    
    return {"message": f"Artista {artist.name} desverificado exitosamente"}


@router.delete("/{artist_id}")
def delete_artist(
    artist_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_admin_user)
) -> Dict[str, str]:
    """Eliminar un artista (solo administradores)"""
    
    db_artist = db.query(Artist).filter(Artist.id == artist_id).first()
    if db_artist is None:
        raise HTTPException(status_code=404, detail="Artista no encontrado")
    
    # Verificar que no tenga canciones asociadas
    songs_count = db.query(func.count(Song.id)).filter(Song.artist_id == artist_id).scalar()
    if songs_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"No se puede eliminar el artista porque tiene {songs_count} canciones asociadas. Elimine primero las canciones."
        )
    
    artist_name = getattr(db_artist, 'name', '')
    
    # Limpiar el artista de los favoritos de todos los usuarios
    users_with_favorites = db.query(User).filter(User.favorite_artists.isnot(None)).all()
    updated_users_count = 0
    
    for user in users_with_favorites:
        current_favorites = getattr(user, 'favorite_artists', None)
        if current_favorites:
            try:
                # Intentar parsear como JSON primero
                favorite_artists = json.loads(current_favorites)
                if isinstance(favorite_artists, list):
                    # Si es una lista, filtrar por nombre
                    if artist_name in favorite_artists:
                        favorite_artists.remove(artist_name)  # type: ignore
                        setattr(user, 'favorite_artists', json.dumps(favorite_artists) if favorite_artists else None)
                        updated_users_count += 1
                elif isinstance(favorite_artists, str):
                    # Si es string, tratar como lista separada por comas
                    artists_list = [a.strip() for a in favorite_artists.split(',')]
                    if artist_name in artists_list:
                        artists_list.remove(artist_name)
                        setattr(user, 'favorite_artists', ', '.join(artists_list) if artists_list else None)
                        updated_users_count += 1
            except (json.JSONDecodeError, TypeError):
                # Si no es JSON válido, tratar como string separado por comas
                if artist_name in current_favorites:
                    artists_list = [a.strip() for a in current_favorites.split(',')]
                    if artist_name in artists_list:
                        artists_list.remove(artist_name)
                        setattr(user, 'favorite_artists', ', '.join(artists_list) if artists_list else None)
                        updated_users_count += 1
    
    # Eliminar el artista
    db.delete(db_artist)
    db.commit()
    
    # Registrar actividad
    activity = Activity(
        user_id=current_user.id,
        action="delete_artist",
        description=f"Eliminó al artista: {artist_name} (ID: {artist_id}). Removido de {updated_users_count} perfiles de usuario.",
        ip_address="api"
    )
    db.add(activity)
    db.commit()
    
    message = f"Artista {artist_name} eliminado correctamente"
    if updated_users_count > 0:
        message += f". Removido automáticamente de {updated_users_count} perfiles de usuario."
    
    return {"message": message}


@router.get("/{slug}/songs")
def get_artist_songs(
    slug: str, 
    db: Session = Depends(get_db),
    limit: int = Query(default=20, le=100, description="Número máximo de canciones a retornar"),
    offset: int = Query(default=0, ge=0, description="Número de canciones a omitir")
) -> Dict[str, Any]:
    """Obtener las canciones de un artista específico"""
    
    artist = db.query(Artist).filter(Artist.slug == slug).first()
    if artist is None:
        raise HTTPException(status_code=404, detail="Artista no encontrado")
    
    # Obtener las canciones del artista
    songs_query = db.query(Song).filter(Song.artist_id == artist.id)
    total = songs_query.count()
    songs = songs_query.offset(offset).limit(limit).all()
    
    # Convertir a schemas para serialización
    artist_schema = ArtistSchema.model_validate(artist)
    songs_schema = [SongSchema.model_validate(song) for song in songs]
    
    return {
        "artist": artist_schema,
        "songs": songs_schema,
        "total": total,
        "limit": limit,
        "offset": offset
    }

