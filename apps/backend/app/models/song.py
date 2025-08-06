from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Index, text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from typing import Optional, Dict, Any
import re
from ..core.database import Base


class Song(Base):
    """
    Modelo para representar canciones con letras, acordes y metadatos.
    Incluye información musical, enlaces externos y sistema de visualizaciones.
    """
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), index=True, nullable=False)  # Títulos pueden ser largos
    slug = Column(String(600), unique=True, index=True, nullable=False)  # Slug más largo para títulos largos
    lyrics = Column(Text, nullable=False)  # Sin límite - letras completas
    sections = Column(JSON, nullable=True)  # Estructura: {"intro": "...", "verse1": "...", "chorus": "..."}
    chords_lyrics = Column(Text, nullable=True)  # Sin límite - letras con acordes pueden ser muy largas
    key_signature = Column(String(20), nullable=True)  # Ej: "C", "G#m", "Bb", "F#m/A"
    tempo = Column(String(50), nullable=True)  # Ej: "120 BPM", "Moderado", "Allegro con brio"
    genre = Column(String(100), nullable=True, index=True)  # Ej: "Adoración", "Alabanza", "Himno Tradicional"
    language = Column(String(10), default="es", nullable=False, index=True, server_default=text("'es'"))  # ISO 639-1
    
    # URLs externas
    youtube_url = Column(String(500), nullable=True)
    spotify_url = Column(String(500), nullable=True)
    
    # Estadísticas y estado
    views = Column(Integer, default=0, nullable=False, index=True)
    likes_count = Column(Integer, default=0, nullable=False, server_default=text('0'))
    favorites_count = Column(Integer, default=0, nullable=False, server_default=text('0'))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relaciones
    artist_id = Column(Integer, ForeignKey("artists.id", ondelete="CASCADE"), nullable=False)
    artist = relationship("Artist", back_populates="songs")
    
    # Índices compuestos para consultas frecuentes
    __table_args__ = (
        Index('idx_song_artist', 'artist_id'),
        Index('idx_song_title', 'title'),
        Index('idx_song_genre', 'genre'),
        Index('idx_song_views', 'views'),
        Index('idx_song_language', 'language'),
        Index('idx_song_created', 'created_at'),
    )

    def __repr__(self) -> str:
        return f"<Song(id={self.id}, title='{self.title}', artist_id={self.artist_id})>"

    @staticmethod
    def create_slug(title: str, artist_name: str = "") -> str:
        """
        Crear un slug URL-friendly a partir del título y artista.
        Optimizado para canciones con títulos largos y caracteres especiales.
        """
        if not title:
            raise ValueError("El título de la canción no puede estar vacío")
        
        # Combinar título y artista para slug único
        full_text = f"{title}"
        if artist_name:
            full_text = f"{artist_name}-{title}"
        
        # Convertir a minúsculas y limpiar caracteres especiales
        # Mantener acentos comunes en español
        slug = full_text.lower()
        
        # Reemplazar caracteres especiales comunes en canciones
        replacements = {
            'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u',
            'ñ': 'n', '¿': '', '¡': '', '"': '', '"': '', '"': '',
            ''': '', ''': '', '…': '', '&': 'y', '+': 'y'
        }
        
        for old, new in replacements.items():
            slug = slug.replace(old, new)
        
        # Limpiar caracteres no alfanuméricos excepto espacios y guiones
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'[-\s]+', '-', slug)
        slug = slug.strip('-')
        
        if not slug:
            raise ValueError("No se pudo generar un slug válido")
        
        return slug[:580]  # Limitar longitud pero más generoso

    @classmethod
    def create_song(cls, title: str, lyrics: str, artist_id: int,
                artist_name: str = "", genre: Optional[str] = None,
                key_signature: Optional[str] = None, tempo: Optional[str] = None,
                youtube_url: Optional[str] = None, language: str = "es"):
        """
        Método helper para crear una nueva canción con slug automático.
        """
        if not title or not title.strip():
            raise ValueError("El título de la canción es requerido")
        if not lyrics or not lyrics.strip():
            raise ValueError("Las letras de la canción son requeridas")
        if not artist_id or artist_id <= 0:
            raise ValueError("ID de artista inválido")
        
        slug = cls.create_slug(title.strip(), artist_name)
        
        return cls(
            title=title.strip(),
            slug=slug,
            lyrics=lyrics.strip(),
            artist_id=artist_id,
            genre=genre,
            key_signature=key_signature,
            tempo=tempo,
            youtube_url=youtube_url,
            language=language
        )

    def increment_views(self) -> None:
        """
        Incrementar el contador de visualizaciones.
        """
        self.views = (self.views or 0) + 1
        self.updated_at = func.now()

    def get_streaming_links(self) -> Dict[str, Optional[str]]:
        """
        Obtener todos los enlaces de streaming en un diccionario.
        """
        return {
            'youtube': getattr(self, 'youtube_url', None),
            'spotify': getattr(self, 'spotify_url', None)
        }

    def has_streaming_links(self) -> bool:
        """
        Verificar si la canción tiene al menos un enlace de streaming.
        """
        streaming_links = self.get_streaming_links()
        return any(url for url in streaming_links.values())

    def has_chords(self) -> bool:
        """
        Verificar si la canción tiene acordes disponibles.
        """
        chords_data = getattr(self, 'chords_lyrics', None)
        return bool(chords_data and str(chords_data).strip())

    def has_sections(self) -> bool:
        """
        Verificar si la canción tiene secciones estructuradas (verso, coro, etc.).
        """
        sections_data = getattr(self, 'sections', None)
        return sections_data is not None and sections_data != {}

    def get_sections_count(self) -> int:
        """
        Obtener el número de secciones en la canción.
        """
        try:
            sections_data = getattr(self, 'sections', {})
            if sections_data:
                # Contar manualmente las claves
                count = 0
                for _ in sections_data:
                    count += 1
                return count
        except:
            pass
        return 0

    def get_word_count(self) -> int:
        """
        Obtener el número aproximado de palabras en las letras.
        """
        lyrics_data = getattr(self, 'lyrics', '')
        if not lyrics_data:
            return 0
        # Remover caracteres especiales y contar palabras
        words = re.findall(r'\b\w+\b', str(lyrics_data))
        return len(words)

    def soft_delete(self) -> None:
        """
        Desactivar canción en lugar de eliminarla (soft delete).
        """
        self.is_active = False
        self.updated_at = func.now()

    def restore(self) -> None:
        """
        Reactivar canción.
        """
        self.is_active = True
        self.updated_at = func.now()

    def to_basic_dict(self) -> Dict[str, Any]:
        """
        Convertir la canción a diccionario básico para serialización.
        Incluye información esencial para una página de letras.
        """
        return {
            'id': self.id,
            'title': getattr(self, 'title', ''),
            'slug': getattr(self, 'slug', ''),
            'artist_id': self.artist_id,
            'genre': getattr(self, 'genre', None),
            'key_signature': getattr(self, 'key_signature', None),
            'tempo': getattr(self, 'tempo', None),
            'language': getattr(self, 'language', 'es'),
            'views': getattr(self, 'views', 0),
            'likes_count': getattr(self, 'likes_count', 0),
            'favorites_count': getattr(self, 'favorites_count', 0),
            'has_chords': self.has_chords(),
            'has_sections': self.has_sections(),
            'sections_count': self.get_sections_count(),
            'has_streaming_links': self.has_streaming_links(),
            'word_count': self.get_word_count(),
            'created_at': str(self.created_at),
        }

    def to_full_dict(self) -> Dict[str, Any]:
        """
        Convertir la canción a diccionario completo incluyendo letras y acordes.
        Para mostrar la canción completa en la página de detalles.
        """
        basic_data = self.to_basic_dict()
        basic_data.update({
            'lyrics': getattr(self, 'lyrics', ''),
            'chords_lyrics': getattr(self, 'chords_lyrics', None),
            'sections': getattr(self, 'sections', None),
            'streaming_links': self.get_streaming_links(),
            'updated_at': str(self.updated_at),
        })
        return basic_data

