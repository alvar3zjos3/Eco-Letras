"""
Esquemas Pydantic para canciones favoritas.

Este módulo define todos los modelos de datos para el sistema de favoritos:
- Validación de entrada y salida
- Serialización/deserialización
- Documentación automática de OpenAPI
- Gestión de relaciones usuario-canción
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class FavoriteStatus(str, Enum):
    """Estados posibles de un favorito."""
    ACTIVE = "active"
    REMOVED = "removed"
    ARCHIVED = "archived"


class FavoriteCategory(str, Enum):
    """Categorías de favoritos."""
    WORSHIP = "worship"
    PRAISE = "praise"
    CHRISTMAS = "christmas"
    EASTER = "easter"
    GENERAL = "general"
    PERSONAL = "personal"


class FavoriteSongBase(BaseModel):
    """
    Esquema base para canciones favoritas.
    """
    user_id: int = Field(..., description="ID del usuario")
    song_id: int = Field(..., description="ID de la canción")
    category: Optional[FavoriteCategory] = Field(
        FavoriteCategory.GENERAL, 
        description="Categoría del favorito"
    )
    notes: Optional[str] = Field(
        None, 
        max_length=500, 
        description="Notas personales sobre la canción"
    )
    rating: Optional[int] = Field(
        None, 
        ge=1, 
        le=5, 
        description="Calificación personal (1-5 estrellas)"
    )
    is_public: bool = Field(
        True, 
        description="Si el favorito es visible para otros usuarios"
    )

    model_config = {"from_attributes": True}


class FavoriteSongCreate(BaseModel):
    """
    Esquema para crear un nuevo favorito.
    """
    song_id: int = Field(..., description="ID de la canción a agregar a favoritos")
    category: Optional[FavoriteCategory] = Field(
        FavoriteCategory.GENERAL, 
        description="Categoría del favorito"
    )
    notes: Optional[str] = Field(
        None, 
        max_length=500, 
        description="Notas personales sobre la canción"
    )
    rating: Optional[int] = Field(
        None, 
        ge=1, 
        le=5, 
        description="Calificación personal (1-5 estrellas)"
    )
    is_public: bool = Field(
        True, 
        description="Si el favorito es visible para otros usuarios"
    )

    model_config = {"from_attributes": True}


class FavoriteSongUpdate(BaseModel):
    """
    Esquema para actualizar un favorito existente.
    """
    category: Optional[FavoriteCategory] = Field(
        None, 
        description="Categoría del favorito"
    )
    notes: Optional[str] = Field(
        None, 
        max_length=500, 
        description="Notas personales sobre la canción"
    )
    rating: Optional[int] = Field(
        None, 
        ge=1, 
        le=5, 
        description="Calificación personal (1-5 estrellas)"
    )
    is_public: Optional[bool] = Field(
        None, 
        description="Si el favorito es visible para otros usuarios"
    )

    model_config = {"from_attributes": True}


class FavoriteSongInDB(FavoriteSongBase):
    """
    Esquema para favorito tal como se almacena en la base de datos.
    """
    id: int = Field(..., description="Identificador único del favorito")
    created_at: datetime = Field(..., description="Fecha y hora de creación")
    updated_at: Optional[datetime] = Field(None, description="Fecha y hora de última actualización")
    
    # Metadatos adicionales
    play_count: int = Field(0, ge=0, description="Número de veces que se ha reproducido")
    last_played_at: Optional[datetime] = Field(None, description="Última vez que se reprodujo")
    
    # Estado del favorito
    status: FavoriteStatus = Field(FavoriteStatus.ACTIVE, description="Estado del favorito")

    model_config = {"from_attributes": True}


class FavoriteSong(FavoriteSongInDB):
    """
    Esquema público para favorito.
    """
    pass


class FavoriteSongOut(BaseModel):
    """
    Esquema para mostrar favoritos con información de la canción.
    """
    id: int = Field(..., description="ID del favorito")
    category: FavoriteCategory = Field(..., description="Categoría del favorito")
    notes: Optional[str] = Field(None, description="Notas personales")
    rating: Optional[int] = Field(None, description="Calificación personal")
    is_public: bool = Field(..., description="Si es público")
    created_at: datetime = Field(..., description="Fecha de creación")
    updated_at: Optional[datetime] = Field(None, description="Fecha de actualización")
    play_count: int = Field(..., description="Número de reproducciones")
    last_played_at: Optional[datetime] = Field(None, description="Última reproducción")
    
    # Información de la canción (evitando importación circular)
    song: Dict[str, Any] = Field(..., description="Información de la canción")

    model_config = {"from_attributes": True}


class FavoriteSongSummary(BaseModel):
    """
    Esquema resumido de favorito para listas.
    """
    id: int = Field(..., description="ID del favorito")
    song_id: int = Field(..., description="ID de la canción")
    song_title: str = Field(..., description="Título de la canción")
    artist_name: str = Field(..., description="Nombre del artista")
    category: FavoriteCategory = Field(..., description="Categoría del favorito")
    rating: Optional[int] = Field(None, description="Calificación personal")
    created_at: datetime = Field(..., description="Fecha de creación")
    play_count: int = Field(..., description="Número de reproducciones")

    model_config = {"from_attributes": True}


class FavoriteSongStats(BaseModel):
    """
    Esquema para estadísticas de favoritos.
    """
    user_id: int = Field(..., description="ID del usuario")
    
    # Conteos por categoría
    total_favorites: int = Field(0, ge=0, description="Total de favoritos")
    worship_count: int = Field(0, ge=0, description="Favoritos de adoración")
    praise_count: int = Field(0, ge=0, description="Favoritos de alabanza")
    christmas_count: int = Field(0, ge=0, description="Favoritos navideños")
    easter_count: int = Field(0, ge=0, description="Favoritos de pascua")
    general_count: int = Field(0, ge=0, description="Favoritos generales")
    personal_count: int = Field(0, ge=0, description="Favoritos personales")
    
    # Estadísticas de actividad
    total_plays: int = Field(0, ge=0, description="Total de reproducciones")
    avg_rating: Optional[float] = Field(None, description="Calificación promedio")
    most_played_song_id: Optional[int] = Field(None, description="ID de canción más reproducida")
    
    # Estadísticas temporales
    first_favorite_date: Optional[datetime] = Field(None, description="Fecha del primer favorito")
    last_favorite_date: Optional[datetime] = Field(None, description="Fecha del último favorito")
    last_activity_date: Optional[datetime] = Field(None, description="Última actividad")

    model_config = {"from_attributes": True}


class FavoritePlaylistCreate(BaseModel):
    """
    Esquema para crear una playlist de favoritos.
    """
    name: str = Field(..., min_length=1, max_length=100, description="Nombre de la playlist")
    description: Optional[str] = Field(None, max_length=500, description="Descripción de la playlist")
    category: FavoriteCategory = Field(..., description="Categoría principal")
    is_public: bool = Field(False, description="Si la playlist es pública")
    favorite_ids: List[int] = Field(..., description="IDs de favoritos a incluir")

    model_config = {"from_attributes": True}


class FavoritePlaylist(BaseModel):
    """
    Esquema para playlist de favoritos.
    """
    id: int = Field(..., description="ID de la playlist")
    user_id: int = Field(..., description="ID del usuario propietario")
    name: str = Field(..., description="Nombre de la playlist")
    description: Optional[str] = Field(None, description="Descripción")
    category: FavoriteCategory = Field(..., description="Categoría principal")
    is_public: bool = Field(..., description="Si es pública")
    song_count: int = Field(0, description="Número de canciones")
    total_duration: Optional[int] = Field(None, description="Duración total en segundos")
    created_at: datetime = Field(..., description="Fecha de creación")
    updated_at: Optional[datetime] = Field(None, description="Fecha de actualización")

    model_config = {"from_attributes": True}


class FavoriteActivity(BaseModel):
    """
    Esquema para actividad relacionada con favoritos.
    """
    id: int = Field(..., description="ID de la actividad")
    user_id: int = Field(..., description="ID del usuario")
    action: str = Field(..., description="Tipo de acción realizada")
    song_id: int = Field(..., description="ID de la canción")
    song_title: str = Field(..., description="Título de la canción")
    artist_name: str = Field(..., description="Nombre del artista")
    details: Optional[str] = Field(None, description="Detalles adicionales")
    created_at: datetime = Field(..., description="Fecha y hora de la actividad")

    model_config = {"from_attributes": True}


class FavoritesExport(BaseModel):
    """
    Esquema para exportar favoritos del usuario.
    """
    user_id: int = Field(..., description="ID del usuario")
    export_date: datetime = Field(..., description="Fecha de exportación")
    total_favorites: int = Field(..., description="Total de favoritos exportados")
    categories: Dict[str, int] = Field(..., description="Conteo por categorías")
    favorites: List[FavoriteSongSummary] = Field(..., description="Lista de favoritos")

    model_config = {"from_attributes": True}


class FavoritesImport(BaseModel):
    """
    Esquema para importar favoritos.
    """
    favorites: List[FavoriteSongCreate] = Field(..., description="Lista de favoritos a importar")
    replace_existing: bool = Field(False, description="Si reemplazar favoritos existentes")
    default_category: FavoriteCategory = Field(
        FavoriteCategory.GENERAL, 
        description="Categoría por defecto"
    )

    model_config = {"from_attributes": True}


class FavoriteRecommendation(BaseModel):
    """
    Esquema para recomendaciones basadas en favoritos.
    """
    song_id: int = Field(..., description="ID de la canción recomendada")
    song_title: str = Field(..., description="Título de la canción")
    artist_name: str = Field(..., description="Nombre del artista")
    similarity_score: float = Field(..., ge=0, le=1, description="Puntuación de similitud")
    reason: str = Field(..., description="Razón de la recomendación")
    category: FavoriteCategory = Field(..., description="Categoría sugerida")

    model_config = {"from_attributes": True}


class FavoriteSharing(BaseModel):
    """
    Esquema para compartir favoritos.
    """
    favorite_id: int = Field(..., description="ID del favorito")
    shared_with_user_id: Optional[int] = Field(None, description="ID del usuario destinatario")
    shared_publicly: bool = Field(False, description="Si se comparte públicamente")
    share_message: Optional[str] = Field(
        None, 
        max_length=200, 
        description="Mensaje personalizado"
    )
    expiry_date: Optional[datetime] = Field(None, description="Fecha de expiración del enlace")

    model_config = {"from_attributes": True}