# Importar todos los modelos para que Alembic los detecte
from .user import User
from .artist import Artist
from .song import Song
from .activity import Activity
from .favorite_songs import FavoriteSong

__all__ = ["User", "Artist", "Song", "Activity", "FavoriteSong"]

