from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from typing import Dict, Any
from ..core.database import Base


class FavoriteSong(Base):
    """
    Modelo para representar canciones favoritas de los usuarios.
    Tabla de relación muchos-a-muchos entre User y Song.
    """
    __tablename__ = "favorite_songs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    song_id = Column(Integer, ForeignKey("songs.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relaciones
    user = relationship("User", back_populates="favorite_songs")
    song = relationship("Song")

    # Constraints e índices
    __table_args__ = (
        UniqueConstraint('user_id', 'song_id', name='unique_user_song_favorite'),
        Index('idx_user_favorites', 'user_id', 'created_at'),
        Index('idx_song_favorites', 'song_id', 'created_at'),
        Index('idx_favorites_created', 'created_at'),
    )

    def __repr__(self) -> str:
        return f"<FavoriteSong(id={self.id}, user_id={self.user_id}, song_id={self.song_id})>"

    @classmethod
    def create_favorite(cls, user_id: int, song_id: int):
        """
        Método helper para crear una nueva canción favorita con validaciones.
        """
        if not user_id or user_id <= 0:
            raise ValueError("ID de usuario inválido")
        if not song_id or song_id <= 0:
            raise ValueError("ID de canción inválido")
        
        return cls(
            user_id=user_id,
            song_id=song_id
        )

    def to_dict(self) -> Dict[str, Any]:
        """
        Convertir el favorito a diccionario para serialización.
        """
        return {
            'id': self.id,
            'user_id': self.user_id,
            'song_id': self.song_id,
            'created_at': str(self.created_at),
        }

    @staticmethod
    def validate_ids(user_id: int, song_id: int) -> bool:
        """
        Validar que los IDs sean válidos.
        """
        return user_id > 0 and song_id > 0