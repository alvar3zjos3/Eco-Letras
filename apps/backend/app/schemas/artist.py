"""
Esquemas Pydantic para artistas musicales.

Este módulo define todos los modelos de datos para artistas utilizados en la API:
- Validación de entrada y salida
- Serialización/deserialización
- Documentación automática de OpenAPI
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class ArtistStatus(str, Enum):
    """Estados posibles de un artista."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    VERIFIED = "verified"


class ArtistBase(BaseModel):
    """
    Esquema base para artistas con campos comunes.
    """
    name: str = Field(..., min_length=1, max_length=100, description="Nombre del artista o grupo musical")
    biography: Optional[str] = Field(None, max_length=2000, description="Biografía o descripción del artista")
    country: Optional[str] = Field(None, max_length=100, description="País de origen del artista")
    city: Optional[str] = Field(None, max_length=100, description="Ciudad de origen del artista")
    genre: Optional[str] = Field(None, max_length=100, description="Género musical principal")
    foundation_year: Optional[int] = Field(None, ge=1800, le=2025, description="Año de fundación")
    
    # Redes sociales
    facebook_url: Optional[str] = Field(None, description="URL de la página de Facebook")
    instagram_url: Optional[str] = Field(None, description="URL del perfil de Instagram")
    twitter_url: Optional[str] = Field(None, description="URL del perfil de Twitter")
    youtube_url: Optional[str] = Field(None, description="URL del canal de YouTube")
    spotify_url: Optional[str] = Field(None, description="URL del perfil de Spotify")
    website_url: Optional[str] = Field(None, description="Sitio web oficial del artista")
    
    # Información adicional
    description: Optional[str] = Field(None, max_length=500, description="Descripción breve del artista")
    verified: bool = Field(False, description="Estado de verificación del artista")

    model_config = {"from_attributes": True}


class ArtistCreate(ArtistBase):
    """
    Esquema para crear un nuevo artista.
    """
    is_active: bool = Field(True, description="Si el artista está activo en el sistema")

    model_config = {"from_attributes": True}


class ArtistUpdate(BaseModel):
    """
    Esquema para actualizar un artista existente.
    Todos los campos son opcionales para permitir actualizaciones parciales.
    """
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Nombre del artista")
    biography: Optional[str] = Field(None, max_length=2000, description="Biografía del artista")
    country: Optional[str] = Field(None, max_length=100, description="País de origen")
    city: Optional[str] = Field(None, max_length=100, description="Ciudad de origen")
    genre: Optional[str] = Field(None, max_length=100, description="Género musical principal")
    foundation_year: Optional[int] = Field(None, ge=1800, le=2025, description="Año de fundación")
    facebook_url: Optional[str] = Field(None, description="URL de Facebook")
    instagram_url: Optional[str] = Field(None, description="URL de Instagram")
    twitter_url: Optional[str] = Field(None, description="URL de Twitter")
    youtube_url: Optional[str] = Field(None, description="URL de YouTube")
    spotify_url: Optional[str] = Field(None, description="URL de Spotify")
    website_url: Optional[str] = Field(None, description="Sitio web oficial")
    description: Optional[str] = Field(None, max_length=500, description="Descripción breve")
    verified: Optional[bool] = Field(None, description="Estado de verificación")
    is_active: Optional[bool] = Field(None, description="Si el artista está activo")

    model_config = {"from_attributes": True}


class ArtistInDB(ArtistBase):
    """
    Esquema para artista tal como se almacena en la base de datos.
    """
    id: int = Field(..., description="Identificador único del artista")
    slug: str = Field(..., description="Slug único para URLs amigables")
    is_active: bool = Field(True, description="Si el artista está activo")
    
    # Timestamps
    created_at: datetime = Field(..., description="Fecha y hora de creación")
    updated_at: Optional[datetime] = Field(None, description="Fecha y hora de última actualización")
    
    # Estadísticas
    songs_count: Optional[int] = Field(0, ge=0, description="Número total de canciones")
    views_count: Optional[int] = Field(0, ge=0, description="Número total de visualizaciones")

    model_config = {"from_attributes": True}


class Artist(ArtistInDB):
    """
    Esquema público para artista.
    """
    pass


class ArtistSummary(BaseModel):
    """
    Esquema resumido de artista para listas y búsquedas.
    """
    id: int = Field(..., description="Identificador único del artista")
    name: str = Field(..., description="Nombre del artista")
    slug: str = Field(..., description="Slug único para URLs")
    description: Optional[str] = Field(None, description="Descripción breve")
    genre: Optional[str] = Field(None, description="Género musical principal")
    country: Optional[str] = Field(None, description="País de origen")
    verified: bool = Field(False, description="Si está verificado")
    songs_count: int = Field(0, description="Número de canciones")
    created_at: datetime = Field(..., description="Fecha de creación")

    model_config = {"from_attributes": True}


class ArtistStats(BaseModel):
    """
    Esquema para estadísticas detalladas del artista.
    """
    id: int = Field(..., description="ID del artista")
    name: str = Field(..., description="Nombre del artista")
    
    # Estadísticas de contenido
    total_songs: int = Field(0, ge=0, description="Total de canciones")
    active_songs: int = Field(0, ge=0, description="Canciones activas")
    
    # Estadísticas de engagement
    total_views: int = Field(0, ge=0, description="Total de visualizaciones")
    avg_song_views: float = Field(0, ge=0, description="Promedio de vistas por canción")
    
    # Estadísticas temporales
    created_at: datetime = Field(..., description="Fecha de creación")
    last_song_added: Optional[datetime] = Field(None, description="Fecha de última canción agregada")
    
    # Rankings
    popularity_rank: Optional[int] = Field(None, description="Posición en ranking de popularidad")

    model_config = {"from_attributes": True}


class ArtistSearch(BaseModel):
    """
    Esquema para resultados de búsqueda de artistas.
    """
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    genre: Optional[str] = None
    verified: bool = False
    songs_count: int = 0

    model_config = {"from_attributes": True}

