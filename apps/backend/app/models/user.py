import json
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Index, text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from typing import Optional, Dict, Any, List
import re
from datetime import datetime, timezone
from ..core.database import Base


class User(Base):
    """
    Modelo para representar usuarios de la aplicación.
    Incluye información personal, preferencias musicales y configuraciones de cuenta.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(320), unique=True, index=True, nullable=False)  # RFC 5322 compliant
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)  # bcrypt hash length
    
    # Información personal
    full_name = Column(String(200), nullable=True)
    bio = Column(Text, nullable=True)  # Biografía o descripción personal
    avatar_url = Column(String(500), nullable=True)
    
    # Preferencias musicales (como JSON strings por compatibilidad)
    musical_tastes = Column(Text, nullable=True)  # Géneros favoritos
    favorite_artists = Column(Text, nullable=True)  # Lista de artistas favoritos
    favorite_instruments = Column(String(200), nullable=True)  # Instrumentos que toca
    musical_experience = Column(String(50), nullable=True)  # "Principiante", "Intermedio", "Avanzado"
    
    # Redes sociales
    social_links = Column(Text, nullable=True)  # Almacena un JSON de enlaces sociales

    @property
    def social_links_dict(self) -> Dict[str, Optional[str]]:
        social_links_value = getattr(self, 'social_links', None)
        if social_links_value:
            try:
                return json.loads(social_links_value)
            except json.JSONDecodeError:
                pass
        return {}

    @social_links_dict.setter
    def social_links_dict(self, value: Dict[str, Optional[str]]):
        self.social_links = json.dumps(value)
    
    # Estado de la cuenta
    is_active = Column(Boolean, default=True, nullable=False, index=True, server_default=text('true'))
    is_admin = Column(Boolean, default=False, nullable=False, index=True, server_default=text('false'))
    is_verified = Column(Boolean, default=False, nullable=False, index=True, server_default=text('false'))
    is_musician = Column(Boolean, default=False, nullable=False, index=True, server_default=text('false'))  # ¿Es músico?
    is_private = Column(Boolean, default=False, nullable=False, server_default=text('false'))  # Perfil privado
    is_premium = Column(Boolean, default=False, nullable=False, index=True, server_default=text('false'))  # Usuario premium
    
    # Rol y estado del usuario
    role = Column(String(20), default="user", nullable=False, index=True)  # user, admin, moderator, etc.
    status = Column(String(20), default="active", nullable=False, index=True)  # active, inactive, suspended, etc.
    
    # Configuraciones
    email_notifications = Column(Boolean, default=True, nullable=False, server_default=text('true'))
    newsletter_subscription = Column(Boolean, default=True, nullable=False, server_default=text('true'))
    preferred_language = Column(String(10), default="es", nullable=False)  # ISO 639-1
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Eliminación programada de cuenta
    deletion_requested_at = Column(DateTime(timezone=True), nullable=True)  # Cuándo se solicitó la eliminación
    deletion_scheduled_at = Column(DateTime(timezone=True), nullable=True)  # Cuándo se eliminará (24h después)
    
    # Relaciones
    activities = relationship("Activity", back_populates="user", cascade="all, delete-orphan")
    favorite_songs = relationship("FavoriteSong", back_populates="user", cascade="all, delete-orphan")
    
    # Índices compuestos para consultas frecuentes
    __table_args__ = (
        Index('idx_user_email_verified', 'email', 'is_verified'),
        Index('idx_user_active_created', 'is_active', 'created_at'),
        Index('idx_user_musician_active', 'is_musician', 'is_active'),
        Index('idx_user_last_login', 'last_login'),
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"

    @staticmethod
    def validate_username(username: str) -> bool:
        """
        Validar que el username cumpla con las reglas:
        - 3-50 caracteres
        - Solo letras, números, guiones y guiones bajos
        - No puede empezar o terminar con guión/guión bajo
        """
        if not username or len(username) < 3 or len(username) > 50:
            return False
        
        # Patrón: letras/números/guiones, no empieza/termina con guión
        pattern = r'^[a-zA-Z0-9]([a-zA-Z0-9_-]*[a-zA-Z0-9])?$'
        return bool(re.match(pattern, username))

    @staticmethod
    def validate_email(email: str) -> bool:
        """
        Validar formato de email básico.
        """
        if not email or len(email) > 320:
            return False
        
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))

    @classmethod
    def create_user(cls, email: str, username: str, hashed_password: str,
                full_name: Optional[str] = None, is_musician: bool = False):
        """
        Método helper para crear un nuevo usuario con validaciones.
        """
        # Validaciones
        if not cls.validate_email(email):
            raise ValueError("Email inválido")
        if not cls.validate_username(username):
            raise ValueError("Username inválido")
        if not hashed_password:
            raise ValueError("Password hasheado requerido")
        
        return cls(
            email=email.lower().strip(),
            username=username.strip(),
            hashed_password=hashed_password,
            full_name=full_name.strip() if full_name else None,
            is_musician=is_musician
        )

    def update_last_login(self) -> None:
        """
        Actualizar timestamp del último login.
        """
        self.last_login = datetime.now(timezone.utc)
        self.updated_at = func.now()

    def verify_email(self) -> None:
        """
        Marcar email como verificado.
        """
        self.is_verified = True
        self.email_verified_at = datetime.now(timezone.utc)
        self.updated_at = func.now()



    def get_musical_preferences(self) -> Dict[str, Any]:
        """
        Obtener preferencias musicales estructuradas.
        """
        # Convertir strings separados por comas a listas
        def parse_comma_separated(value: Optional[str]) -> List[str]:
            if not value:
                return []
            return [item.strip() for item in value.split(',') if item.strip()]
        
        return {
            'instruments': parse_comma_separated(getattr(self, 'favorite_instruments', None)),
            'favorite_artists': parse_comma_separated(getattr(self, 'favorite_artists', None)),
            'favorite_genres': parse_comma_separated(getattr(self, 'musical_tastes', None)),
            'skill_levels': {},
            'musical_experience_years': None,
            'can_read_music': False,
            'can_improvise': False
        }

    def is_profile_complete(self) -> bool:
        """
        Verificar si el perfil está completo (información básica).
        """
        return bool(
            self.full_name and
            self.bio and
            self.musical_experience
        )

    def get_age(self) -> Optional[int]:
        """
        Calcular edad basada en fecha de nacimiento.
        No disponible - campo removido.
        """
        return None

    def soft_delete(self) -> None:
        """
        Desactivar usuario en lugar de eliminarlo (soft delete).
        """
        self.is_active = False
        self.updated_at = func.now()

    def restore(self) -> None:
        """
        Reactivar usuario.
        """
        self.is_active = True
        self.updated_at = func.now()

    def to_public_dict(self) -> Dict[str, Any]:
        """
        Convertir a diccionario público (sin información sensible).
        """
        return {
            'id': self.id,
            'username': self.username,
            'full_name': self.full_name,
            'bio': self.bio,
            'avatar_url': self.avatar_url,
            'is_musician': self.is_musician,
            'is_verified': self.is_verified,
            'musical_preferences': self.get_musical_preferences(),
            'social_links': self.social_links_dict if not getattr(self, 'is_private', False) else {},
            'profile_complete': self.is_profile_complete(),
            'age': self.get_age(),
            'member_since': str(self.created_at),
        }

    def to_private_dict(self) -> Dict[str, Any]:
        """
        Convertir a diccionario privado (con información personal).
        """
        public_data = self.to_public_dict()
        public_data.update({
            'email': self.email,
            'is_active': self.is_active,
            'is_admin': self.is_admin,
            'is_private': self.is_private,
            'email_notifications': self.email_notifications,
            'newsletter_subscription': self.newsletter_subscription,
            'preferred_language': self.preferred_language,
            'email_verified': bool(self.email_verified_at),
            'last_login': str(last_login_value) if (last_login_value := getattr(self, 'last_login', None)) else None,
            'updated_at': str(self.updated_at),
        })
        return public_data

