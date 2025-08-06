"""
Esquemas Pydantic para usuarios.

Este módulo define todos los modelos de datos para el sistema de usuarios:
- Validación de entrada y salida
- Autenticación y autorización
- Perfiles y preferencias
- Documentación automática de OpenAPI
- Gestión de roles y permisos
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator
from enum import Enum
import re


class UserRole(str, Enum):
    """Roles de usuario en el sistema."""
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MODERATOR = "moderator"
    CONTRIBUTOR = "contributor"
    PREMIUM = "premium"
    USER = "user"
    GUEST = "guest"


class UserStatus(str, Enum):
    """Estados de cuenta de usuario."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    BANNED = "banned"
    PENDING_VERIFICATION = "pending_verification"
    DELETED = "deleted"


class MusicalInstrument(str, Enum):
    """Instrumentos musicales."""
    GUITAR = "guitar"
    PIANO = "piano"
    BASS = "bass"
    DRUMS = "drums"
    VIOLIN = "violin"
    VOICE = "voice"
    KEYBOARD = "keyboard"
    ACOUSTIC_GUITAR = "acoustic_guitar"
    ELECTRIC_GUITAR = "electric_guitar"
    UKULELE = "ukulele"
    HARMONICA = "harmonica"
    FLUTE = "flute"
    TRUMPET = "trumpet"
    SAXOPHONE = "saxophone"
    OTHER = "other"


class MusicalSkillLevel(str, Enum):
    """Niveles de habilidad musical."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"
    PROFESSIONAL = "professional"


class NotificationPreference(str, Enum):
    """Preferencias de notificación."""
    ALL = "all"
    IMPORTANT_ONLY = "important_only"
    NONE = "none"


class PrivacyLevel(str, Enum):
    """Niveles de privacidad."""
    PUBLIC = "public"
    FRIENDS_ONLY = "friends_only"
    PRIVATE = "private"


class UserPreferences(BaseModel):
    """
    Preferencias de usuario.
    """
    # Notificaciones
    email_notifications: NotificationPreference = Field(
        NotificationPreference.IMPORTANT_ONLY,
        description="Preferencia de notificaciones por email"
    )
    push_notifications: bool = Field(True, description="Notificaciones push habilitadas")
    newsletter_subscription: bool = Field(True, description="Suscripción al boletín")
    
    # Música
    auto_play: bool = Field(False, description="Reproducción automática")
    default_volume: float = Field(0.7, ge=0.0, le=1.0, description="Volumen por defecto")
    show_chords: bool = Field(True, description="Mostrar acordes por defecto")
    
    # Privacidad
    profile_visibility: PrivacyLevel = Field(
        PrivacyLevel.PUBLIC,
        description="Visibilidad del perfil"
    )
    activity_visibility: PrivacyLevel = Field(
        PrivacyLevel.FRIENDS_ONLY,
        description="Visibilidad de actividad"
    )
    
    # Idioma y región
    language: str = Field("es", description="Idioma preferido")
    timezone: str = Field("America/Mexico_City", description="Zona horaria")
    
    # Tema
    theme: str = Field("light", description="Tema de la interfaz")
    
    model_config = {"from_attributes": True}


class MusicalProfile(BaseModel):
    """
    Perfil musical del usuario.
    """
    instruments: List[str] = Field(
        default_factory=list,
        description="Instrumentos que toca"
    )
    skill_levels: Dict[str, MusicalSkillLevel] = Field(
        default_factory=dict,
        description="Nivel de habilidad por instrumento"
    )
    favorite_genres: List[str] = Field(
        default_factory=list,
        description="Géneros musicales favoritos"
    )
    favorite_artists: List[str] = Field(
        default_factory=list,
        description="Artistas favoritos"
    )
    musical_experience_years: Optional[int] = Field(
        None,
        ge=0,
        le=100,
        description="Años de experiencia musical"
    )
    can_read_music: bool = Field(False, description="Puede leer partituras")
    can_improvise: bool = Field(False, description="Puede improvisar")
    
    model_config = {"from_attributes": True}



class UserBase(BaseModel):
    """
    Esquema base para usuarios.
    """
    email: EmailStr = Field(..., description="Dirección de email única")
    username: str = Field(
        ...,
        min_length=3,
        max_length=30,
        description="Nombre de usuario único"
    )
    full_name: Optional[str] = Field(
        None,
        max_length=100,
        description="Nombre completo del usuario"
    )
    bio: Optional[str] = Field(
        None,
        max_length=500,
        description="Biografía del usuario"
    )
    avatar_url: Optional[str] = Field(None, description="URL del avatar")
    
    # Enlaces sociales
    social_links: Optional[Dict[str, Any]] = Field(None, description="Redes sociales")
    
    # Perfil musical
    musical_profile: Optional[MusicalProfile] = Field(None, description="Perfil musical")
    
    # Preferencias
    preferences: Optional[Dict[str, Any]] = Field(
        None,
        description="Preferencias del usuario"
    )

    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Valida el nombre de usuario."""
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('El username solo puede contener letras, números, guiones y guiones bajos')
        if v.lower() in ['admin', 'root', 'user', 'guest', 'null', 'undefined']:
            raise ValueError('Nombre de usuario no permitido')
        return v.lower()

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    """
    Esquema para crear un nuevo usuario.
    """
    email: EmailStr = Field(..., description="Email único")
    username: str = Field(..., min_length=3, max_length=30, description="Username único")
    password: str = Field(..., min_length=8, max_length=128, description="Contraseña")
    full_name: Optional[str] = Field(None, max_length=100, description="Nombre completo")
    
    # Términos y condiciones
    accept_terms: bool = Field(..., description="Acepta términos y condiciones")
    accept_privacy: bool = Field(..., description="Acepta política de privacidad")

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Valida la contraseña."""
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        if not re.search(r'[A-Z]', v):
            raise ValueError('La contraseña debe contener al menos una mayúscula')
        if not re.search(r'[a-z]', v):
            raise ValueError('La contraseña debe contener al menos una minúscula')
        if not re.search(r'\d', v):
            raise ValueError('La contraseña debe contener al menos un número')
        return v

    @field_validator('accept_terms')
    @classmethod
    def terms_must_be_accepted(cls, v: bool) -> bool:
        """Los términos deben ser aceptados."""
        if not v:
            raise ValueError('Debe aceptar los términos y condiciones')
        return v

    @field_validator('accept_privacy')
    @classmethod
    def privacy_must_be_accepted(cls, v: bool) -> bool:
        """La política de privacidad debe ser aceptada."""
        if not v:
            raise ValueError('Debe aceptar la política de privacidad')
        return v

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    """
    Esquema para actualizar usuario existente.
    """
    email: Optional[EmailStr] = Field(None, description="Nuevo email")
    username: Optional[str] = Field(None, min_length=3, max_length=30, description="Nuevo username")
    full_name: Optional[str] = Field(None, max_length=100, description="Nombre completo")
    bio: Optional[str] = Field(None, max_length=500, description="Biografía")
    avatar_url: Optional[str] = Field(None, description="Avatar")
    
    # Enlaces sociales
    social_links: Optional[Dict[str, Any]] = Field(None, description="Redes sociales")
    
    # Perfil musical
    musical_profile: Optional[MusicalProfile] = Field(None, description="Perfil musical")
    
    # Preferencias
    preferences: Optional[Dict[str, Any]] = Field(None, description="Preferencias")

    model_config = {"from_attributes": True}


class UserInDB(UserBase):
    """
    Esquema para usuario tal como se almacena en la base de datos.
    """
    id: int = Field(..., description="ID único del usuario")
    
    # Estados y permisos
    role: UserRole = Field(UserRole.USER, description="Rol del usuario")
    status: UserStatus = Field(UserStatus.ACTIVE, description="Estado de la cuenta")
    is_active: bool = Field(True, description="Si la cuenta está activa")
    is_verified: bool = Field(False, description="Si el email está verificado")
    is_premium: bool = Field(False, description="Si tiene cuenta premium")
    
    # Seguridad
    hashed_password: str = Field(..., description="Hash de la contraseña")
    last_login: Optional[datetime] = Field(None, description="Última conexión")
    failed_login_attempts: int = Field(0, description="Intentos fallidos de login")
    locked_until: Optional[datetime] = Field(None, description="Bloqueado hasta")
    
    # Verificaciones
    email_verified_at: Optional[datetime] = Field(None, description="Fecha verificación email")
    
    # Metadatos
    created_at: datetime = Field(..., description="Fecha de creación")
    updated_at: Optional[datetime] = Field(None, description="Última actualización")
    deleted_at: Optional[datetime] = Field(None, description="Fecha de eliminación")
    
    # Estadísticas
    login_count: int = Field(0, description="Número de logins")
    songs_viewed: int = Field(0, description="Canciones vistas")
    favorites_count: int = Field(0, description="Número de favoritos")
    
    # Configuración de privacidad
    privacy_settings: Dict[str, Any] = Field(
        default_factory=dict,
        description="Configuraciones de privacidad"
    )

    model_config = {"from_attributes": True}


class User(BaseModel):
    """
    Esquema público para usuario (sin datos sensibles).
    """
    id: int = Field(..., description="ID del usuario")
    username: str = Field(..., description="Nombre de usuario")
    email: str = Field(..., description="Email del usuario")
    full_name: Optional[str] = Field(None, description="Nombre completo")
    bio: Optional[str] = Field(None, description="Biografía")
    avatar_url: Optional[str] = Field(None, description="Avatar")
    role: UserRole = Field(..., description="Rol")
    status: UserStatus = Field(..., description="Estado")
    is_active: bool = Field(..., description="Usuario activo")
    is_admin: bool = Field(..., description="Es administrador")
    is_verified: bool = Field(..., description="Verificado")
    is_premium: bool = Field(..., description="Premium")
    created_at: datetime = Field(..., description="Fecha de registro")
    last_login: Optional[datetime] = Field(None, description="Última conexión")
    
    # Enlaces sociales públicos
    social_links: Optional[Dict[str, Any]] = Field(None, description="Redes sociales")
    
    # Perfil musical público
    musical_profile: Optional[MusicalProfile] = Field(None, description="Perfil musical")
    
    # Estadísticas públicas
    songs_viewed: int = Field(0, description="Canciones vistas")
    favorites_count: int = Field(0, description="Favoritos")

    model_config = {"from_attributes": True}


class UserSummary(BaseModel):
    """
    Esquema resumido de usuario para listas.
    """
    id: int = Field(..., description="ID")
    username: str = Field(..., description="Username")
    full_name: Optional[str] = Field(None, description="Nombre")
    avatar_url: Optional[str] = Field(None, description="Avatar")
    role: UserRole = Field(..., description="Rol")
    is_verified: bool = Field(..., description="Verificado")
    is_premium: bool = Field(..., description="Premium")
    created_at: datetime = Field(..., description="Registro")

    model_config = {"from_attributes": True}


class UserLogin(BaseModel):
    """
    Esquema para login de usuario.
    """
    identifier: str = Field(..., description="Email o username")
    password: str = Field(..., description="Contraseña")
    remember_me: bool = Field(False, description="Recordar sesión")
    
    model_config = {"from_attributes": True}


class UserRegister(UserCreate):
    """
    Esquema para registro de usuario (alias de UserCreate).
    """
    pass


class Token(BaseModel):
    """
    Esquema para token de acceso.
    """
    access_token: str = Field(..., description="Token de acceso")
    refresh_token: Optional[str] = Field(None, description="Token de renovación")
    token_type: str = Field("bearer", description="Tipo de token")
    expires_in: int = Field(..., description="Segundos hasta expiración")
    scope: Optional[str] = Field(None, description="Alcance del token")
    
    model_config = {"from_attributes": True}


class TokenData(BaseModel):
    """
    Datos del token decodificado.
    """
    user_id: Optional[int] = Field(None, description="ID del usuario")
    username: Optional[str] = Field(None, description="Nombre de usuario")
    email: Optional[str] = Field(None, description="Email")
    role: Optional[UserRole] = Field(None, description="Rol")
    scopes: List[str] = Field(default_factory=list, description="Permisos")
    
    model_config = {"from_attributes": True}


class UserStats(BaseModel):
    """
    Estadísticas de usuario.
    """
    user_id: int = Field(..., description="ID del usuario")
    
    # Actividad
    total_logins: int = Field(0, description="Total de logins")
    songs_viewed: int = Field(0, description="Canciones vistas")
    songs_liked: int = Field(0, description="Canciones con like")
    songs_shared: int = Field(0, description="Canciones compartidas")
    playlists_created: int = Field(0, description="Playlists creadas")
    
    # Favoritos
    total_favorites: int = Field(0, description="Total de favoritos")
    favorite_genres: Dict[str, int] = Field(
        default_factory=dict,
        description="Géneros favoritos con conteos"
    )
    favorite_artists: Dict[str, int] = Field(
        default_factory=dict,
        description="Artistas favoritos con conteos"
    )
    
    # Temporales
    activity_last_7_days: int = Field(0, description="Actividad últimos 7 días")
    activity_last_30_days: int = Field(0, description="Actividad últimos 30 días")
    streak_days: int = Field(0, description="Días consecutivos de actividad")
    
    # Engagement
    avg_session_duration: Optional[float] = Field(None, description="Duración promedio de sesión")
    most_active_hour: Optional[int] = Field(None, description="Hora más activa")
    most_active_day: Optional[str] = Field(None, description="Día más activo")

    model_config = {"from_attributes": True}


class UserActivity(BaseModel):
    """
    Actividad de usuario.
    """
    id: int = Field(..., description="ID de la actividad")
    user_id: int = Field(..., description="ID del usuario")
    action: str = Field(..., description="Tipo de acción")
    resource_type: Optional[str] = Field(None, description="Tipo de recurso")
    resource_id: Optional[int] = Field(None, description="ID del recurso")
    details: Optional[Dict[str, Any]] = Field(None, description="Detalles adicionales")
    ip_address: Optional[str] = Field(None, description="Dirección IP")
    user_agent: Optional[str] = Field(None, description="User agent")
    created_at: datetime = Field(..., description="Fecha de la actividad")

    model_config = {"from_attributes": True}


class UserNotification(BaseModel):
    """
    Notificación de usuario.
    """
    id: int = Field(..., description="ID de la notificación")
    user_id: int = Field(..., description="ID del usuario")
    title: str = Field(..., description="Título de la notificación")
    message: str = Field(..., description="Mensaje")
    type: str = Field(..., description="Tipo de notificación")
    is_read: bool = Field(False, description="Si fue leída")
    action_url: Optional[str] = Field(None, description="URL de acción")
    created_at: datetime = Field(..., description="Fecha de creación")
    read_at: Optional[datetime] = Field(None, description="Fecha de lectura")

    model_config = {"from_attributes": True}


class UserSession(BaseModel):
    """
    Sesión de usuario.
    """
    id: str = Field(..., description="ID de la sesión")
    user_id: int = Field(..., description="ID del usuario")
    ip_address: str = Field(..., description="Dirección IP")
    user_agent: str = Field(..., description="User agent")
    device_info: Optional[Dict[str, Any]] = Field(None, description="Información del dispositivo")
    is_active: bool = Field(True, description="Si está activa")
    created_at: datetime = Field(..., description="Fecha de creación")
    last_activity: datetime = Field(..., description="Última actividad")
    expires_at: datetime = Field(..., description="Fecha de expiración")

    model_config = {"from_attributes": True}

