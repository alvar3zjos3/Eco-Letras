from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Index, text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from typing import Optional, Dict
import re
from ..core.database import Base


class Artist(Base):
    """
    Modelo para representar artistas musicales.
    Incluye información básica, biografía y enlaces a redes sociales.
    """
    __tablename__ = "artists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, index=True, nullable=False)
    slug = Column(String(250), unique=True, index=True, nullable=False)
    biography = Column(Text, nullable=True)
    description = Column(String(500), nullable=True)
    country = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    genre = Column(String(100), nullable=True)
    foundation_year = Column(Integer, nullable=True)
    
    # URLs
    website_url = Column(String(500), nullable=True)
    facebook_url = Column(String(500), nullable=True)
    instagram_url = Column(String(500), nullable=True)
    youtube_url = Column(String(500), nullable=True)
    spotify_url = Column(String(500), nullable=True)
    twitter_url = Column(String(500), nullable=True)
    verified = Column(Boolean, default=False, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True, server_default=text('true'))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relaciones
    songs = relationship("Song", back_populates="artist", cascade="all, delete-orphan")
    
    # Índices compuestos para búsquedas frecuentes
    __table_args__ = (
        Index('idx_artist_name_active', 'name', 'is_active'),
        Index('idx_artist_verified_active', 'verified', 'is_active'),
        Index('idx_artist_created', 'created_at'),
    )

    def __repr__(self) -> str:
        return f"<Artist(id={self.id}, name='{self.name}', verified={self.verified})>"
    
    @staticmethod
    def create_slug(name: str) -> str:
        """
        Crear un slug URL-friendly a partir del nombre del artista.
        """
        if not name:
            raise ValueError("El nombre del artista no puede estar vacío")
        
        # Convertir a minúsculas y reemplazar espacios/caracteres especiales
        slug = re.sub(r'[^\w\s-]', '', name.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        slug = slug.strip('-')
        
        if not slug:
            raise ValueError("No se pudo generar un slug válido")
        
        return slug
    
    @classmethod
    def create_artist(cls, name: str, biography: Optional[str] = None,
                    description: Optional[str] = None, country: Optional[str] = None,
                    city: Optional[str] = None, genre: Optional[str] = None,
                    foundation_year: Optional[int] = None, website_url: Optional[str] = None,
                    facebook_url: Optional[str] = None, instagram_url: Optional[str] = None,
                    youtube_url: Optional[str] = None, spotify_url: Optional[str] = None,
                    twitter_url: Optional[str] = None, verified: bool = False):
        """
        Método helper para crear un nuevo artista con slug automático.
        """
        if not name or not name.strip():
            raise ValueError("El nombre del artista es requerido")
        
        slug = cls.create_slug(name.strip())
        
        return cls(
            name=name.strip(),
            slug=slug,
            biography=biography,
            description=description,
            country=country,
            city=city,
            genre=genre,
            foundation_year=foundation_year,
            website_url=website_url,
            facebook_url=facebook_url,
            instagram_url=instagram_url,
            youtube_url=youtube_url,
            spotify_url=spotify_url,
            twitter_url=twitter_url,
            verified=verified
        )
    
    def get_social_links(self) -> Dict[str, Optional[str]]:
        """
        Obtener todas las redes sociales del artista en un diccionario.
        """
        return {
            'website': getattr(self, 'website_url', None),
            'facebook': getattr(self, 'facebook_url', None),
            'instagram': getattr(self, 'instagram_url', None),
            'youtube': getattr(self, 'youtube_url', None),
            'spotify': getattr(self, 'spotify_url', None),
            'twitter': getattr(self, 'twitter_url', None)
        }
    
    def has_social_links(self) -> bool:
        """
        Verificar si el artista tiene al menos una red social configurada.
        """
        social_links = self.get_social_links()
        return any(url for url in social_links.values())
    
    @property
    def songs_count(self) -> int:
        """
        Obtener el número de canciones del artista.
        """
        return len(self.songs) if self.songs else 0
    
    def soft_delete(self) -> None:
        """
        Desactivar artista en lugar de eliminarlo (soft delete).
        """
        self.is_active = False
        self.updated_at = func.now()
    
    def restore(self) -> None:
        """
        Reactivar artista.
        """
        self.is_active = True
        self.updated_at = func.now()

