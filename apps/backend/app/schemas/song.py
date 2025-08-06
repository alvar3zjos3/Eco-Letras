"""
Esquemas Pydantic para canciones.

Este módulo define todos los modelos de datos para el sistema de canciones:
- Validación de entrada y salida
- Secciones y estructura musical
- Metadatos y multimedia
- Documentación automática de OpenAPI
- Relaciones con artistas y favoritos
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, HttpUrl, field_validator
from enum import Enum
import re

# Importar esquema de artista para evitar uso de Dict[str, Any]
from .artist import ArtistSummary


class SongSectionType(str, Enum):
    """Tipos de secciones de una canción."""
    INTRO = "intro"
    VERSO = "verso"
    PRECORO = "precoro"
    CORO = "coro"
    PUENTE = "puente"
    REPETIR = "repetir"
    REFRAIN = "refrain"
    FINAL = "final"
    INSTRUMENTAL = "instrumental"
    SOLO = "solo"


class SongGenre(str, Enum):
    """Géneros musicales disponibles."""
    ADORACION = "Adoración"
    ALABANZA = "Alabanza"
    CONTEMPORANEO = "Contemporáneo"
    TRADICIONAL = "Tradicional"
    GOSPEL = "Gospel"
    HIMNO = "Himno"
    NAVIDAD = "Navidad"
    PASCUA = "Pascua"
    BALADA = "Balada"
    ROCK = "Rock"
    POP = "Pop"
    ACUSTICO = "Acústico"
    INSTRUMENTAL = "Instrumental"
    INFANTIL = "Infantil"
    JUVENIL = "Juvenil"
    HIP_HOP = "Hip-Hop"
    OTRO = "Otro"


class SongStatus(str, Enum):
    """Estados de una canción."""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    PRIVATE = "private"
    PENDING_REVIEW = "pending_review"




class MusicalKey(str, Enum):
    """Tonalidades musicales."""
    C = "C"
    C_SHARP = "C#"
    D_FLAT = "Db"
    D = "D"
    D_SHARP = "D#"
    E_FLAT = "Eb"
    E = "E"
    F = "F"
    F_SHARP = "F#"
    G_FLAT = "Gb"
    G = "G"
    G_SHARP = "G#"
    A_FLAT = "Ab"
    A = "A"
    A_SHARP = "A#"
    B_FLAT = "Bb"
    B = "B"
    
    # Menores
    C_MINOR = "Cm"
    C_SHARP_MINOR = "C#m"
    D_MINOR = "Dm"
    D_SHARP_MINOR = "D#m"
    E_FLAT_MINOR = "Ebm"
    E_MINOR = "Em"
    F_MINOR = "Fm"
    F_SHARP_MINOR = "F#m"
    G_MINOR = "Gm"
    G_SHARP_MINOR = "G#m"
    A_FLAT_MINOR = "Abm"
    A_MINOR = "Am"
    A_SHARP_MINOR = "A#m"
    B_FLAT_MINOR = "Bbm"
    B_MINOR = "Bm"


class SongSection(BaseModel):
    """
    Sección de una canción con tipo, texto y acordes.
    """
    id: Optional[int] = Field(None, description="ID de la sección")
    type: SongSectionType = Field(..., description="Tipo de sección")
    title: Optional[str] = Field(None, max_length=100, description="Título de la sección")
    text: str = Field(..., min_length=1, description="Letra de la sección")
    chords_lyrics: Optional[str] = Field(None, description="Acordes con letra")
    notes: Optional[str] = Field(None, max_length=500, description="Notas adicionales")
    order: int = Field(1, ge=1, description="Orden de la sección en la canción")
    repeat_count: int = Field(1, ge=1, le=10, description="Número de repeticiones")
    
    # Metadatos musicales
    tempo_change: Optional[str] = Field(None, description="Cambio de tempo en esta sección")
    key_change: Optional[MusicalKey] = Field(None, description="Cambio de tonalidad")
    dynamics: Optional[str] = Field(None, description="Dinámicas (forte, piano, etc.)")

    model_config = {"from_attributes": True}


class SongBase(BaseModel):
    """
    Esquema base para canciones.
    """
    title: str = Field(..., min_length=1, max_length=200, description="Título de la canción")
    subtitle: Optional[str] = Field(None, max_length=200, description="Subtítulo")
    lyrics: str = Field(..., min_length=1, description="Letra completa de la canción")
    chords_lyrics: Optional[str] = Field(None, description="Letra con acordes")
    
    # Metadatos musicales
    key_signature: Optional[MusicalKey] = Field(None, description="Tonalidad principal")
    tempo: Optional[str] = Field(None, description="Tempo (ej: 120 BPM, Moderato)")
    time_signature: Optional[str] = Field(None, description="Compás (ej: 4/4, 3/4)")
    genre: Optional[SongGenre] = Field(SongGenre.ADORACION, description="Género musical")
    
    # Enlaces multimedia
    youtube_url: Optional[HttpUrl] = Field(None, description="URL de YouTube")
    spotify_url: Optional[HttpUrl] = Field(None, description="URL de Spotify")
    
    # Metadatos adicionales
    language: str = Field("es", min_length=2, max_length=5, description="Idioma principal")
    tags: Optional[List[str]] = Field(default_factory=list, description="Etiquetas")
    capo: Optional[int] = Field(None, ge=0, le=12, description="Posición del capo")
    tuning: Optional[str] = Field("Standard", description="Afinación del instrumento")
    
    # Configuración
    status: SongStatus = Field(SongStatus.DRAFT, description="Estado de la canción")
    
    # Estructura
    sections: Optional[Any] = Field(None, description="Secciones de la canción")

    @field_validator('youtube_url')
    @classmethod
    def validate_youtube_url(cls, v: Optional[HttpUrl]) -> Optional[HttpUrl]:
        """Valida que sea una URL válida de YouTube."""
        if v is None:
            return v
        url_str = str(v)
        if not re.search(r'(youtube\.com|youtu\.be)', url_str):
            raise ValueError('Debe ser una URL válida de YouTube')
        return v

    @field_validator('spotify_url')
    @classmethod
    def validate_spotify_url(cls, v: Optional[HttpUrl]) -> Optional[HttpUrl]:
        """Valida que sea una URL válida de Spotify."""
        if v is None:
            return v
        url_str = str(v)
        if not re.search(r'(spotify\.com|open\.spotify\.com)', url_str):
            raise ValueError('Debe ser una URL válida de Spotify')
        return v

    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v: Optional[List[str]]) -> List[str]:
        """Valida y limpia las etiquetas."""
        if not v:
            return []
        
        # Procesar cada tag
        cleaned_tags: List[str] = []
        for tag in v:
            cleaned_tag = tag.strip().lower()
            if cleaned_tag and len(cleaned_tag) <= 30:
                cleaned_tags.append(cleaned_tag)
        
        # Remover duplicados
        unique_tags = list(dict.fromkeys(cleaned_tags))
        
        return unique_tags[:10]  # Máximo 10 etiquetas

    model_config = {"from_attributes": True}


class SongCreate(BaseModel):
    """
    Esquema para crear una nueva canción.
    """
    title: str = Field(..., min_length=1, max_length=200, description="Título de la canción")
    subtitle: Optional[str] = Field(None, max_length=200, description="Subtítulo")
    lyrics: str = Field(..., min_length=1, description="Letra completa")
    chords_lyrics: Optional[str] = Field(None, description="Letra con acordes")
    artist_id: int = Field(..., description="ID del artista")
    
    # Metadatos musicales
    key_signature: Optional[MusicalKey] = Field(None, description="Tonalidad")
    tempo: Optional[str] = Field(None, description="Tempo")
    time_signature: Optional[str] = Field(None, description="Compás")
    genre: Optional[SongGenre] = Field(SongGenre.ADORACION, description="Género")
    
    # Enlaces
    youtube_url: Optional[HttpUrl] = Field(None, description="URL de YouTube")
    spotify_url: Optional[HttpUrl] = Field(None, description="URL de Spotify")
    
    # Metadatos
    language: str = Field("es", description="Idioma")
    tags: Optional[List[str]] = Field(default_factory=list, description="Etiquetas")
    capo: Optional[int] = Field(None, ge=0, le=12, description="Capo")
    tuning: Optional[str] = Field("Standard", description="Afinación")
    
    # Configuración
    status: SongStatus = Field(SongStatus.DRAFT, description="Estado inicial")
    
    # Estructura
    sections: Any = Field(None, description="Secciones")

    model_config = {"from_attributes": True}


class SongUpdate(BaseModel):
    """
    Esquema para actualizar una canción existente.
    """
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Título")
    subtitle: Optional[str] = Field(None, max_length=200, description="Subtítulo")
    lyrics: Optional[str] = Field(None, min_length=1, description="Letra")
    chords_lyrics: Optional[str] = Field(None, description="Acordes con letra")
    artist_id: Optional[int] = Field(None, description="ID del artista")
    
    # Metadatos musicales
    key_signature: Optional[MusicalKey] = Field(None, description="Tonalidad")
    tempo: Optional[str] = Field(None, description="Tempo")
    time_signature: Optional[str] = Field(None, description="Compás")
    genre: Optional[SongGenre] = Field(None, description="Género")
    
    # Enlaces
    youtube_url: Optional[HttpUrl] = Field(None, description="URL de YouTube")
    spotify_url: Optional[HttpUrl] = Field(None, description="URL de Spotify")
    
    # Metadatos
    language: Optional[str] = Field(None, description="Idioma")
    tags: Optional[List[str]] = Field(None, description="Etiquetas")
    capo: Optional[int] = Field(None, ge=0, le=12, description="Capo")
    tuning: Optional[str] = Field(None, description="Afinación")
    
    # Configuración
    status: Optional[SongStatus] = Field(None, description="Estado")
    
    # Estructura
    sections: Optional[List[Dict[str, Any]]] = Field(None, description="Secciones")

    model_config = {"from_attributes": True}


class SongInDB(SongBase):
    """
    Esquema para canción tal como se almacena en la base de datos.
    """
    id: int = Field(..., description="ID único de la canción")
    slug: str = Field(..., description="Slug único para URLs")
    artist_id: int = Field(..., description="ID del artista")
    
    # Estadísticas
    views: int = Field(0, ge=0, description="Número de visualizaciones")
    likes: int = Field(0, ge=0, description="Número de likes")
    downloads: int = Field(0, ge=0, description="Número de descargas")
    shares: int = Field(0, ge=0, description="Número de veces compartida")
    
    # Metadatos de sistema
    created_at: datetime = Field(..., description="Fecha de creación")
    updated_at: Optional[datetime] = Field(None, description="Fecha de última actualización")
    published_at: Optional[datetime] = Field(None, description="Fecha de publicación")
    
    # SEO y búsqueda
    search_vector: Optional[str] = Field(None, description="Vector de búsqueda")
    popularity_score: float = Field(0.0, ge=0.0, description="Puntuación de popularidad")

    model_config = {"from_attributes": True}


class Song(SongInDB):
    """
    Esquema público para canción.
    """
    pass


class SongSummary(BaseModel):
    """
    Esquema resumido de canción para listas.
    """
    id: int = Field(..., description="ID de la canción")
    title: str = Field(..., description="Título")
    subtitle: Optional[str] = Field(None, description="Subtítulo")
    slug: str = Field(..., description="Slug")
    artist_id: int = Field(..., description="ID del artista")
    artist_name: str = Field(..., description="Nombre del artista")
    genre: SongGenre = Field(..., description="Género")
    key_signature: Optional[MusicalKey] = Field(None, description="Tonalidad")
    views: int = Field(..., description="Visualizaciones")
    likes: int = Field(..., description="Likes")
    created_at: datetime = Field(..., description="Fecha de creación")
    status: SongStatus = Field(..., description="Estado")
    
    # URLs de portadas/thumbnails
    thumbnail_url: Optional[HttpUrl] = Field(None, description="URL de miniatura")

    model_config = {"from_attributes": True}


class SongWithArtist(Song):
    """
    Esquema de canción con información del artista.
    """
    # Información del artista
    artist: ArtistSummary = Field(..., description="Información del artista")

    model_config = {"from_attributes": True}


class SongWithStats(Song):
    """
    Esquema de canción con estadísticas detalladas.
    """
    # Estadísticas adicionales
    daily_views: Any = Field(None, description="Vistas diarias")
    favorite_count: int = Field(0, description="Número de favoritos")
    comment_count: int = Field(0, description="Número de comentarios")
    rating_average: Optional[float] = Field(None, description="Calificación promedio")
    rating_count: int = Field(0, description="Número de calificaciones")

    model_config = {"from_attributes": True}


class SongStats(BaseModel):
    """
    Estadísticas de una canción específica.
    """
    song_id: int = Field(..., description="ID de la canción")
    
    # Métricas de engagement
    total_views: int = Field(0, description="Total de visualizaciones")
    unique_views: int = Field(0, description="Visualizaciones únicas")
    total_likes: int = Field(0, description="Total de likes")
    total_shares: int = Field(0, description="Total de compartidas")
    total_downloads: int = Field(0, description="Total de descargas")
    total_favorites: int = Field(0, description="Total agregada a favoritos")
    
    # Métricas temporales
    views_last_7_days: int = Field(0, description="Vistas últimos 7 días")
    views_last_30_days: int = Field(0, description="Vistas últimos 30 días")
    peak_views_date: Optional[datetime] = Field(None, description="Fecha de mayor tráfico")
    
    # Análisis de audiencia
    avg_session_duration: Optional[float] = Field(None, description="Duración promedio de sesión")
    bounce_rate: Optional[float] = Field(None, description="Tasa de rebote")
    
    # Rankings
    popularity_rank: Optional[int] = Field(None, description="Ranking de popularidad")
    genre_rank: Optional[int] = Field(None, description="Ranking en su género")

    model_config = {"from_attributes": True}


class SongSearch(BaseModel):
    """
    Esquema para búsqueda de canciones.
+    """
    query: Optional[str] = Field(None, description="Término de búsqueda")
    artist_id: Optional[int] = Field(None, description="Filtrar por artista")
    genre: Optional[SongGenre] = Field(None, description="Filtrar por género")
    key_signature: Optional[MusicalKey] = Field(None, description="Filtrar por tonalidad")
    language: Optional[str] = Field(None, description="Filtrar por idioma")
    tags: Optional[List[str]] = Field(None, description="Filtrar por etiquetas")
    status: Optional[SongStatus] = Field(None, description="Filtrar por estado")
    has_chords: Optional[bool] = Field(None, description="Si tiene acordes")
    has_video: Optional[bool] = Field(None, description="Si tiene video")
    created_after: Optional[datetime] = Field(None, description="Creadas después de")
    created_before: Optional[datetime] = Field(None, description="Creadas antes de")
    
    # Ordenamiento
    sort_by: Optional[str] = Field("created_at", description="Campo de ordenamiento")
    sort_order: Optional[str] = Field("desc", description="Orden: asc o desc")

    model_config = {"from_attributes": True}


class SongPlaylist(BaseModel):
    """
    Esquema para playlist de canciones.
    """
    id: int = Field(..., description="ID de la playlist")
    name: str = Field(..., description="Nombre de la playlist")
    description: Optional[str] = Field(None, description="Descripción")
    user_id: int = Field(..., description="ID del usuario propietario")
    is_public: bool = Field(..., description="Si es pública")
    song_count: int = Field(0, description="Número de canciones")
    created_at: datetime = Field(..., description="Fecha de creación")
    updated_at: Optional[datetime] = Field(None, description="Última actualización")

    model_config = {"from_attributes": True}


class SongExport(BaseModel):
    """
    Esquema para exportar canciones.
    """
    song_ids: List[int] = Field(..., description="IDs de canciones a exportar")
    format: str = Field("json", description="Formato de exportación")
    include_chords: bool = Field(True, description="Incluir acordes")
    include_sections: bool = Field(True, description="Incluir secciones")
    include_metadata: bool = Field(True, description="Incluir metadatos")

    model_config = {"from_attributes": True}


class SongImport(BaseModel):
    """
    Esquema para importar canciones.
    """
    songs: List[SongCreate] = Field(..., description="Lista de canciones a importar")
    artist_id: int = Field(..., description="ID del artista por defecto")
    overwrite_existing: bool = Field(False, description="Sobrescribir existentes")
    validate_urls: bool = Field(True, description="Validar URLs")

    model_config = {"from_attributes": True}


class SongActivity(BaseModel):
    """
    Esquema para actividad relacionada con canciones.
    """
    id: int = Field(..., description="ID de la actividad")
    song_id: int = Field(..., description="ID de la canción")
    user_id: Optional[int] = Field(None, description="ID del usuario")
    action: str = Field(..., description="Tipo de acción")
    details: Optional[Dict[str, Any]] = Field(None, description="Detalles adicionales")
    ip_address: Optional[str] = Field(None, description="Dirección IP")
    user_agent: Optional[str] = Field(None, description="User agent")
    created_at: datetime = Field(..., description="Fecha de la actividad")

    model_config = {"from_attributes": True}


# Reconstruir modelos para resolver referencias hacia adelante
SongBase.model_rebuild()
SongCreate.model_rebuild()
SongUpdate.model_rebuild()

