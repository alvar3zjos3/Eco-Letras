"""
Esquemas Pydantic para restablecimiento de contraseñas.

Este módulo define todos los modelos de datos para el sistema de recuperación
y cambio de contraseñas:
- Validación de entrada y salida
- Seguridad y tokens
- Auditoría de cambios
- Documentación automática de OpenAPI
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator, ValidationInfo
from enum import Enum
import re


class ResetTokenStatus(str, Enum):
    """Estados posibles de un token de reset."""
    ACTIVE = "active"
    USED = "used"
    EXPIRED = "expired"
    REVOKED = "revoked"


class PasswordResetMethod(str, Enum):
    """Métodos de restablecimiento de contraseña."""
    EMAIL = "email"
    SMS = "sms"
    SECURITY_QUESTIONS = "security_questions"
    ADMIN_RESET = "admin_reset"


class PasswordResetRequest(BaseModel):
    """
    Esquema para solicitar restablecimiento de contraseña.
    """
    email: EmailStr = Field(..., description="Dirección de email del usuario")
    method: PasswordResetMethod = Field(
        PasswordResetMethod.EMAIL, 
        description="Método de restablecimiento preferido"
    )
    client_info: Optional[Dict[str, Any]] = Field(
        None, 
        description="Información del cliente (IP, user-agent, etc.)"
    )
    language: str = Field(
        "es", 
        min_length=2, 
        max_length=5, 
        description="Idioma preferido para notificaciones"
    )

    model_config = {"from_attributes": True}


class PasswordResetConfirm(BaseModel):
    """
    Esquema para confirmar restablecimiento de contraseña.
    """
    token: str = Field(
        ..., 
        min_length=32, 
        max_length=128, 
        description="Token de restablecimiento"
    )
    new_password: str = Field(
        ..., 
        min_length=8, 
        max_length=128, 
        description="Nueva contraseña"
    )
    confirm_password: str = Field(
        ..., 
        min_length=8, 
        max_length=128, 
        description="Confirmación de la nueva contraseña"
    )
    client_info: Optional[Dict[str, Any]] = Field(
        None, 
        description="Información del cliente para auditoría"
    )

    @field_validator('new_password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """
        Valida la fortaleza de la contraseña.
        """
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        
        if not re.search(r'[A-Z]', v):
            raise ValueError('La contraseña debe contener al menos una letra mayúscula')
        
        if not re.search(r'[a-z]', v):
            raise ValueError('La contraseña debe contener al menos una letra minúscula')
        
        if not re.search(r'\d', v):
            raise ValueError('La contraseña debe contener al menos un número')
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('La contraseña debe contener al menos un carácter especial')
        
        return v

    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v: str, info: ValidationInfo) -> str:
        """
        Verifica que las contraseñas coincidan.
        """
        if info.data and 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('Las contraseñas no coinciden')
        return v

    model_config = {"from_attributes": True}


class PasswordChangeRequest(BaseModel):
    """
    Esquema para cambio de contraseña (usuario autenticado).
    """
    current_password: str = Field(
        ..., 
        min_length=1, 
        description="Contraseña actual del usuario"
    )
    new_password: str = Field(
        ..., 
        min_length=8, 
        max_length=128, 
        description="Nueva contraseña"
    )
    confirm_password: str = Field(
        ..., 
        min_length=8, 
        max_length=128, 
        description="Confirmación de la nueva contraseña"
    )
    logout_all_devices: bool = Field(
        True, 
        description="Si cerrar sesión en todos los dispositivos"
    )

    @field_validator('new_password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Aplica las mismas reglas de fortaleza."""
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        
        if not re.search(r'[A-Z]', v):
            raise ValueError('La contraseña debe contener al menos una letra mayúscula')
        
        if not re.search(r'[a-z]', v):
            raise ValueError('La contraseña debe contener al menos una letra minúscula')
        
        if not re.search(r'\d', v):
            raise ValueError('La contraseña debe contener al menos un número')
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('La contraseña debe contener al menos un carácter especial')
        
        return v

    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v: str, info: ValidationInfo) -> str:
        """Verifica que las contraseñas coincidan."""
        if info.data and 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('Las contraseñas no coinciden')
        return v

    model_config = {"from_attributes": True}


class PasswordResetTokenInDB(BaseModel):
    """
    Esquema para token de reset en la base de datos.
    """
    id: int = Field(..., description="ID único del token")
    user_id: int = Field(..., description="ID del usuario")
    token_hash: str = Field(..., description="Hash del token")
    status: ResetTokenStatus = Field(..., description="Estado del token")
    method: PasswordResetMethod = Field(..., description="Método usado")
    expires_at: datetime = Field(..., description="Fecha de expiración")
    created_at: datetime = Field(..., description="Fecha de creación")
    used_at: Optional[datetime] = Field(None, description="Fecha de uso")
    ip_address: Optional[str] = Field(None, description="Dirección IP de origen")
    user_agent: Optional[str] = Field(None, description="User agent del cliente")
    attempts: int = Field(0, ge=0, description="Intentos de uso")
    max_attempts: int = Field(3, ge=1, description="Máximo intentos permitidos")

    model_config = {"from_attributes": True}


class PasswordResetToken(BaseModel):
    """
    Esquema público para token de reset.
    """
    id: int = Field(..., description="ID del token")
    status: ResetTokenStatus = Field(..., description="Estado del token")
    method: PasswordResetMethod = Field(..., description="Método usado")
    expires_at: datetime = Field(..., description="Fecha de expiración")
    created_at: datetime = Field(..., description="Fecha de creación")
    attempts: int = Field(..., description="Intentos realizados")
    max_attempts: int = Field(..., description="Máximo intentos permitidos")

    model_config = {"from_attributes": True}


class PasswordResetResponse(BaseModel):
    """
    Respuesta de solicitud de restablecimiento.
    """
    success: bool = Field(..., description="Si la solicitud fue exitosa")
    message: str = Field(..., description="Mensaje descriptivo")
    email_sent: bool = Field(..., description="Si se envió email de confirmación")
    token_expires_in: Optional[int] = Field(
        None, 
        description="Minutos hasta expiración del token"
    )
    next_request_allowed_in: Optional[int] = Field(
        None, 
        description="Minutos hasta próxima solicitud permitida"
    )

    model_config = {"from_attributes": True}


class PasswordResetConfirmResponse(BaseModel):
    """
    Respuesta de confirmación de restablecimiento.
    """
    success: bool = Field(..., description="Si el reset fue exitoso")
    message: str = Field(..., description="Mensaje descriptivo")
    user_id: Optional[int] = Field(None, description="ID del usuario (si exitoso)")
    sessions_invalidated: int = Field(
        0, 
        description="Número de sesiones invalidadas"
    )
    
    model_config = {"from_attributes": True}


class PasswordChangeResponse(BaseModel):
    """
    Respuesta de cambio de contraseña.
    """
    success: bool = Field(..., description="Si el cambio fue exitoso")
    message: str = Field(..., description="Mensaje descriptivo")
    sessions_invalidated: int = Field(
        0, 
        description="Número de sesiones invalidadas"
    )
    password_changed_at: datetime = Field(..., description="Fecha del cambio")

    model_config = {"from_attributes": True}


class PasswordStrengthCheck(BaseModel):
    """
    Resultado de verificación de fortaleza de contraseña.
    """
    password: str = Field(..., min_length=1, description="Contraseña a verificar")

    model_config = {"from_attributes": True}


class PasswordStrengthResult(BaseModel):
    """
    Resultado de análisis de fortaleza.
    """
    score: int = Field(..., ge=0, le=100, description="Puntuación de fortaleza (0-100)")
    level: str = Field(..., description="Nivel: weak, medium, strong, very_strong")
    feedback: List[str] = Field(..., description="Recomendaciones de mejora")
    meets_requirements: bool = Field(..., description="Si cumple requisitos mínimos")
    estimated_crack_time: str = Field(..., description="Tiempo estimado para romperla")

    model_config = {"from_attributes": True}


class PasswordResetAttempt(BaseModel):
    """
    Registro de intento de reset.
    """
    id: int = Field(..., description="ID del intento")
    user_id: Optional[int] = Field(None, description="ID del usuario (si se encontró)")
    email: str = Field(..., description="Email usado en el intento")
    ip_address: str = Field(..., description="Dirección IP")
    user_agent: Optional[str] = Field(None, description="User agent")
    success: bool = Field(..., description="Si el intento fue exitoso")
    failure_reason: Optional[str] = Field(None, description="Razón del fallo")
    created_at: datetime = Field(..., description="Fecha del intento")

    model_config = {"from_attributes": True}


class PasswordResetStats(BaseModel):
    """
    Estadísticas de restablecimientos de contraseña.
    """
    total_requests: int = Field(0, ge=0, description="Total de solicitudes")
    successful_resets: int = Field(0, ge=0, description="Resets exitosos")
    failed_attempts: int = Field(0, ge=0, description="Intentos fallidos")
    expired_tokens: int = Field(0, ge=0, description="Tokens expirados")
    average_reset_time: Optional[float] = Field(
        None, 
        description="Tiempo promedio para completar reset (minutos)"
    )
    
    # Estadísticas por período
    requests_last_24h: int = Field(0, ge=0, description="Solicitudes últimas 24h")
    requests_last_week: int = Field(0, ge=0, description="Solicitudes última semana")
    requests_last_month: int = Field(0, ge=0, description="Solicitudes último mes")
    
    # Métodos más usados
    method_distribution: Dict[str, int] = Field(
        default_factory=dict, 
        description="Distribución por método"
    )

    model_config = {"from_attributes": True}


class SecurityAuditLog(BaseModel):
    """
    Log de auditoría de seguridad.
    """
    id: int = Field(..., description="ID del log")
    user_id: Optional[int] = Field(None, description="ID del usuario afectado")
    action: str = Field(..., description="Acción realizada")
    details: Dict[str, Any] = Field(..., description="Detalles de la acción")
    ip_address: str = Field(..., description="Dirección IP")
    user_agent: Optional[str] = Field(None, description="User agent")
    risk_level: str = Field(..., description="Nivel de riesgo: low, medium, high")
    created_at: datetime = Field(..., description="Fecha de la acción")

    model_config = {"from_attributes": True}


class PasswordPolicy(BaseModel):
    """
    Política de contraseñas configurable.
    """
    min_length: int = Field(8, ge=4, le=128, description="Longitud mínima")
    require_uppercase: bool = Field(True, description="Requiere mayúsculas")
    require_lowercase: bool = Field(True, description="Requiere minúsculas")
    require_numbers: bool = Field(True, description="Requiere números")
    require_special_chars: bool = Field(True, description="Requiere caracteres especiales")
    max_age_days: Optional[int] = Field(
        None, 
        ge=1, 
        description="Días máximos antes de requerir cambio"
    )
    prevent_reuse_count: int = Field(
        5, 
        ge=0, 
        description="Número de contraseñas anteriores a evitar"
    )
    lockout_attempts: int = Field(
        5, 
        ge=1, 
        description="Intentos antes de bloqueo"
    )
    lockout_duration_minutes: int = Field(
        30, 
        ge=1, 
        description="Duración del bloqueo en minutos"
    )

    model_config = {"from_attributes": True}