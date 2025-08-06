from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, text, or_
from typing import Dict, Any, Optional
from datetime import datetime, timedelta, timezone
from ..core.database import get_db
from ..models.user import User
from ..models.song import Song
from ..models.artist import Artist
from ..models.activity import Activity
from ..routers.auth import get_current_admin_user

router = APIRouter()

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """Obtener estadísticas generales del sitio para el panel de administración"""
    
    total_songs = db.query(func.count(Song.id)).scalar()
    total_artists = db.query(func.count(Artist.id)).scalar()
    total_users = db.query(func.count(User.id)).scalar()
    total_views = db.query(func.sum(Song.views)).scalar() or 0
    
    # Canciones más vistas
    top_songs = db.query(Song).order_by(text("views DESC")).limit(5).all()
    
    # Artistas con más canciones
    top_artists = db.query(
        Artist.name,
        func.count(Song.id).label('song_count')
    ).join(Song).group_by(Artist.id, Artist.name).order_by(text("song_count DESC")).limit(5).all()
    
    # Usuarios registrados en los últimos 30 días
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    new_users_count = db.query(func.count(User.id)).filter(
        User.created_at >= thirty_days_ago
    ).scalar()
    
    # Canciones agregadas en los últimos 30 días
    new_songs_count = db.query(func.count(Song.id)).filter(
        Song.created_at >= thirty_days_ago
    ).scalar()
    
    return {
        "total_songs": total_songs,
        "total_artists": total_artists,
        "total_users": total_users,
        "total_views": total_views,
        "new_users_last_30_days": new_users_count,
        "new_songs_last_30_days": new_songs_count,
        "top_songs": [
            {
                "id": song.id,
                "title": song.title,
                "slug": song.slug,
                "views": song.views,
                "artist": song.artist.name if song.artist else None
            } for song in top_songs
        ],
        "top_artists": [
            {
                "name": artist.name,
                "song_count": artist.song_count
            } for artist in top_artists
        ]
    }


@router.get("/users")
def get_admin_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    is_verified: Optional[bool] = Query(None)
) -> Dict[str, Any]:
    """Obtener lista paginada de usuarios para administración"""
    
    query = db.query(User)
    
    # Filtros
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                User.username.ilike(search_term),
                User.email.ilike(search_term),
                User.full_name.ilike(search_term)
            )
        )
    
    if is_verified is not None:
        if is_verified:
            query = query.filter(text("email_verified_at IS NOT NULL"))
        else:
            query = query.filter(text("email_verified_at IS NULL"))
    
    # Paginación
    total = query.count()
    users = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return {
        "users": [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "is_verified": bool(user.email_verified_at),
                "is_admin": user.is_admin,
                "is_musician": user.is_musician,
                "created_at": str(user.created_at),
                "last_login": str(last_login_value) if (last_login_value := getattr(user, 'last_login', None)) else None
            } for user in users
        ],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page
        }
    }


@router.get("/songs")
def get_admin_songs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    artist_id: Optional[int] = Query(None)
) -> Dict[str, Any]:
    """Obtener lista paginada de canciones para administración"""
    
    query = db.query(Song)
    
    # Filtros
    if search:
        search_term = f"%{search}%"
        query = query.filter(Song.title.ilike(search_term))
    
    if artist_id:
        query = query.filter(Song.artist_id == artist_id)
    
    # Paginación
    total = query.count()
    songs = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return {
        "songs": [
            {
                "id": song.id,
                "title": song.title,
                "slug": song.slug,
                "artist": song.artist.name if song.artist else None,
                "views": song.views,
                "has_lyrics": bool(song.lyrics),
                "has_chords": bool(song.chords_lyrics),
                "created_at": str(song.created_at),
                "updated_at": str(song.updated_at)
            } for song in songs
        ],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page
        }
    }


@router.get("/activity")
def get_admin_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    action: Optional[str] = Query(None)
) -> Dict[str, Any]:
    """Obtener actividad reciente del sitio para administración"""
    
    query = db.query(Activity).order_by(Activity.created_at.desc())
    
    # Filtro por acción
    if action:
        query = query.filter(Activity.action == action)
    
    # Paginación
    total = query.count()
    activities = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return {
        "activities": [
            {
                "id": activity.id,
                "user_id": activity.user_id,
                "username": activity.user.username if activity.user else None,
                "action": activity.action,
                "description": activity.description,
                "ip_address": activity.ip_address,
                "created_at": str(activity.created_at)
            } for activity in activities
        ],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page
        }
    }


@router.patch("/users/{user_id}/verify")
def verify_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Dict[str, str]:
    """Verificar manualmente un usuario"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if getattr(user, 'email_verified_at', None):
        raise HTTPException(status_code=400, detail="El usuario ya está verificado")
    
    user.email_verified_at = datetime.now(timezone.utc)
    db.commit()
    
    # Registrar actividad
    activity = Activity(
        user_id=current_user.id,
        action="admin_verify_user",
        description=f"Verificó manualmente al usuario {user.username} (ID: {user_id})",
        ip_address="admin_panel"
    )
    db.add(activity)
    db.commit()
    
    return {"message": f"Usuario {user.username} verificado exitosamente"}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Dict[str, str]:
    """Eliminar un usuario (solo administradores)"""
    
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    username = user.username
    db.delete(user)
    db.commit()
    
    # Registrar actividad
    activity = Activity(
        user_id=current_user.id,
        action="admin_delete_user",
        description=f"Eliminó al usuario {username} (ID: {user_id})",
        ip_address="admin_panel"
    )
    db.add(activity)
    db.commit()
    
    return {"message": f"Usuario {username} eliminado exitosamente"}

