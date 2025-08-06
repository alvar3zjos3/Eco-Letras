"""
Router para la gestión de canciones favoritas de los usuarios.

Este módulo maneja todas las operaciones relacionadas con las canciones favoritas:
- Obtener lista de favoritos del usuario
- Agregar canciones a favoritos
- Eliminar canciones de favoritos
- Verificar si una canción es favorita
"""

import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError

from ..core.database import get_db
from ..models.favorite_songs import FavoriteSong
from ..models.song import Song
from ..models.user import User
from ..models.activity import Activity
from ..schemas.song import SongWithArtist
from ..routers.auth import get_current_user

# Configurar logging
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="",
    tags=["favorites"],
    responses={404: {"description": "No encontrado"}}
)


def get_client_ip(request: Optional[Request]) -> str:
    """Obtener IP del cliente de forma segura."""
    if not request or not request.client:
        return "unknown"
    return request.client.host


@router.get("/", response_model=List[SongWithArtist])
async def get_favoritos(
    skip: int = Query(0, ge=0, description="Número de registros a omitir"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros a devolver"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener todas las canciones favoritas del usuario actual.
    
    Args:
        skip: Número de registros a omitir para paginación
        limit: Número máximo de registros a devolver
        db: Sesión de base de datos
        current_user: Usuario autenticado actual
    
    Returns:
        Lista de canciones favoritas del usuario
    """
    try:
        logger.info(f"Usuario {current_user.email} obteniendo favoritos (skip={skip}, limit={limit})")
        
        favoritos = (
            db.query(Song)
            .options(joinedload(Song.artist))  # Cargar el artista junto con la canción
            .join(FavoriteSong, FavoriteSong.song_id == Song.id)
            .filter(
                FavoriteSong.user_id == current_user.id
            )
            .order_by(FavoriteSong.created_at.desc())  # Más recientes primero
            .offset(skip)
            .limit(limit)
            .all()
        )
        
        logger.info(f"Se encontraron {len(favoritos)} canciones favoritas para el usuario {current_user.email}")
        return favoritos
        
    except SQLAlchemyError as e:
        logger.error(f"Error de base de datos al obtener favoritos del usuario {current_user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al obtener favoritos"
        )
    except Exception as e:
        logger.error(f"Error inesperado al obtener favoritos del usuario {current_user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.get("/count")
async def get_favoritos_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, int]:
    """
    Obtener el número total de canciones favoritas del usuario.
    
    Args:
        db: Sesión de base de datos
        current_user: Usuario autenticado actual
    
    Returns:
        Diccionario con el conteo de favoritos
    """
    try:
        logger.info(f"Usuario {current_user.email} obteniendo conteo de favoritos")
        
        count = (
            db.query(FavoriteSong)
            .join(Song, FavoriteSong.song_id == Song.id)
            .filter(
                FavoriteSong.user_id == current_user.id
            )
            .count()
        )
        
        logger.info(f"Usuario {current_user.email} tiene {count} canciones favoritas")
        return {"count": count}
        
    except SQLAlchemyError as e:
        logger.error(f"Error de base de datos al contar favoritos del usuario {current_user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al contar favoritos"
        )


@router.get("/check/{song_id}")
async def check_favorito(
    song_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, bool]:
    """
    Verificar si una canción específica está en los favoritos del usuario.
    
    Args:
        song_id: ID de la canción a verificar
        db: Sesión de base de datos
        current_user: Usuario autenticado actual
    
    Returns:
        Diccionario indicando si la canción es favorita
    """
    try:
        logger.info(f"Usuario {current_user.email} verificando si canción {song_id} es favorita")
        
        # Verificar que la canción existe
        song = db.query(Song).filter(Song.id == song_id).first()
        if not song:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Canción no encontrada"
            )
        
        is_favorite = db.query(FavoriteSong).filter(
            FavoriteSong.user_id == current_user.id,
            FavoriteSong.song_id == song_id
        ).first() is not None
        
        logger.info(f"Canción {song_id} {'es' if is_favorite else 'no es'} favorita del usuario {current_user.email}")
        return {"is_favorite": is_favorite}
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Error de base de datos al verificar favorito: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al verificar favorito"
        )


@router.post("/{song_id}", status_code=status.HTTP_201_CREATED)
async def add_favorito(
    song_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Agregar una canción a los favoritos del usuario.
    
    Args:
        song_id: ID de la canción a agregar a favoritos
        db: Sesión de base de datos
        current_user: Usuario autenticado actual
    
    Returns:
        Mensaje de confirmación
    
    Raises:
        HTTPException: Si la canción no existe, ya está en favoritos, o hay un error del servidor
    """
    try:
        logger.info(f"Usuario {current_user.email} agregando canción {song_id} a favoritos")
        
        # Verificar que la canción existe
        song = db.query(Song).filter(Song.id == song_id).first()
        if not song:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Canción no encontrada"
            )
        
        # Verificar si ya está en favoritos
        exists = db.query(FavoriteSong).filter(
            FavoriteSong.user_id == current_user.id,
            FavoriteSong.song_id == song_id
        ).first()
        
        if exists:
            logger.warning(f"Usuario {current_user.email} intentó agregar canción {song_id} que ya está en favoritos")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La canción ya está en favoritos"
            )
        
        # Crear el favorito
        favorito = FavoriteSong(user_id=current_user.id, song_id=song_id)
        db.add(favorito)
        
        # Registrar actividad
        activity = Activity(
            user_id=current_user.id,
            action="favorite_added",
            description=f"Agregó la canción '{song.title}' a favoritos",
            ip_address=get_client_ip(request)
        )
        db.add(activity)
        
        db.commit()
        
        logger.info(f"Usuario {current_user.email} agregó exitosamente canción {song_id} '{song.title}' a favoritos")
        return {"detail": "Canción agregada a favoritos exitosamente"}
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error de base de datos al agregar favorito: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al agregar favorito"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error inesperado al agregar favorito: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.delete("/{song_id}", status_code=status.HTTP_200_OK)
async def remove_favorito(
    song_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Eliminar una canción de los favoritos del usuario.
    
    Args:
        song_id: ID de la canción a eliminar de favoritos
        db: Sesión de base de datos
        current_user: Usuario autenticado actual
    
    Returns:
        Mensaje de confirmación
    
    Raises:
        HTTPException: Si el favorito no existe o hay un error del servidor
    """
    try:
        logger.info(f"Usuario {current_user.email} eliminando canción {song_id} de favoritos")
        
        # Buscar el favorito
        favorito = db.query(FavoriteSong).filter(
            FavoriteSong.user_id == current_user.id,
            FavoriteSong.song_id == song_id
        ).first()
        
        if not favorito:
            logger.warning(f"Usuario {current_user.email} intentó eliminar favorito inexistente {song_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Favorito no encontrado"
            )
        
        # Obtener información de la canción para el log de actividad
        song = db.query(Song).filter(Song.id == song_id).first()
        song_title = song.title if song else f"ID {song_id}"
        
        # Eliminar el favorito
        db.delete(favorito)
        
        # Registrar actividad
        activity = Activity(
            user_id=current_user.id,
            action="favorite_removed",
            description=f"Eliminó la canción '{song_title}' de favoritos",
            ip_address=get_client_ip(request)
        )
        db.add(activity)
        
        db.commit()
        
        logger.info(f"Usuario {current_user.email} eliminó exitosamente canción {song_id} '{song_title}' de favoritos")
        return {"detail": "Canción eliminada de favoritos exitosamente"}
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error de base de datos al eliminar favorito: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al eliminar favorito"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error inesperado al eliminar favorito: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.delete("/", status_code=status.HTTP_200_OK)
async def clear_favoritos(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Eliminar todas las canciones favoritas del usuario.
    
    Args:
        db: Sesión de base de datos
        current_user: Usuario autenticado actual
    
    Returns:
        Mensaje de confirmación con número de favoritos eliminados
    """
    try:
        logger.info(f"Usuario {current_user.email} eliminando todos los favoritos")
        
        # Contar favoritos antes de eliminar
        count = db.query(FavoriteSong).filter(FavoriteSong.user_id == current_user.id).count()
        
        if count == 0:
            logger.info(f"Usuario {current_user.email} no tiene favoritos para eliminar")
            return {"detail": "No hay favoritos para eliminar", "deleted_count": 0}
        
        # Eliminar todos los favoritos del usuario
        deleted = db.query(FavoriteSong).filter(FavoriteSong.user_id == current_user.id).delete()
        
        # Registrar actividad
        activity = Activity(
            user_id=current_user.id,
            action="favorites_cleared",
            description=f"Eliminó todos los favoritos ({deleted} canciones)",
            ip_address=get_client_ip(request)
        )
        db.add(activity)
        
        db.commit()
        
        logger.info(f"Usuario {current_user.email} eliminó {deleted} favoritos exitosamente")
        return {
            "detail": "Todos los favoritos eliminados exitosamente",
            "deleted_count": deleted
        }
        
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error de base de datos al limpiar favoritos: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al limpiar favoritos"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error inesperado al limpiar favoritos: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )