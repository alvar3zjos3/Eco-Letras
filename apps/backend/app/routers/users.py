"""
Router para la gestión de perfiles y configuraciones de usuarios.

Este módulo maneja todas las operaciones relacionadas con los usuarios:
- Actualización de perfil y datos personales
- Cambio de contraseña y email
- Gestión de sesiones y actividad
- Eliminación de cuentas
- Reenvío de verificación de email
"""

import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel, EmailStr, Field

from ..core.database import get_db
from ..models.user import User
from ..models.activity import Activity
from ..routers.auth import get_current_user
from ..core.email import send_verification_email, send_email_change_confirmation, send_account_deletion_confirmation, send_account_deletion_cancelled
from ..core.security import (
    create_email_change_token, 
    create_email_verification_token,
    get_password_hash,
    verify_password,
    create_account_deletion_token
)

# Configurar logging
logger = logging.getLogger(__name__)

router = APIRouter(
    tags=["users"],
    responses={404: {"description": "No encontrado"}}
)


# ----------- Esquemas Pydantic -----------

class UserUpdate(BaseModel):
    """Esquema para actualizar datos del usuario."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100, description="Nombre completo")
    username: Optional[str] = Field(None, min_length=3, max_length=50, description="Nombre de usuario")
    email: Optional[EmailStr] = Field(None, description="Correo electrónico")
    avatar_url: Optional[str] = Field(None, max_length=500, description="URL del avatar")
    musical_tastes: Optional[str] = Field(None, max_length=1000, description="Gustos musicales")
    favorite_artists: Optional[str] = Field(None, max_length=1000, description="Artistas favoritos")
    instagram: Optional[str] = Field(None, max_length=100, description="Usuario de Instagram")
    twitter: Optional[str] = Field(None, max_length=100, description="Usuario de Twitter")
    facebook: Optional[str] = Field(None, max_length=100, description="Usuario de Facebook")
    youtube_url: Optional[str] = Field(None, max_length=500, description="Canal de YouTube")

    model_config = {"from_attributes": True}


class PasswordUpdate(BaseModel):
    """Esquema para cambio de contraseña."""
    old_password: str = Field(..., min_length=8, max_length=128, description="Contraseña actual")
    new_password: str = Field(..., min_length=8, max_length=128, description="Nueva contraseña")

    model_config = {"from_attributes": True}


class ChangeEmailRequest(BaseModel):
    """Esquema para solicitud de cambio de email."""
    new_email: EmailStr = Field(..., description="Nuevo correo electrónico")

    model_config = {"from_attributes": True}


class ActivityOut(BaseModel):
    """Esquema para historial de actividad."""
    id: int
    action: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserProfile(BaseModel):
    """Esquema para respuesta de perfil de usuario."""
    id: int
    email: str
    full_name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    musical_tastes: Optional[str] = None
    favorite_artists: Optional[str] = None
    instagram: Optional[str] = None
    twitter: Optional[str] = None
    facebook: Optional[str] = None
    youtube_url: Optional[str] = None
    is_verified: bool
    is_active: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ----------- Funciones auxiliares -----------

def get_client_ip(request: Optional[Request]) -> str:
    """Obtener IP del cliente de forma segura."""
    if not request or not request.client:
        return "unknown"
    return request.client.host


def get_user_agent(request: Optional[Request]) -> str:
    """Obtener User-Agent del cliente de forma segura."""
    if not request or not request.headers:
        return "unknown"
    return request.headers.get("user-agent", "unknown")


def check_user_authorization(current_user: User, user_id: int) -> None:
    """Verificar si el usuario actual puede acceder/modificar el perfil."""
    current_user_id = getattr(current_user, 'id')
    is_admin = getattr(current_user, 'is_admin', False)
    
    if current_user_id != user_id and not is_admin:
        logger.warning(f"Usuario {getattr(current_user, 'email')} intentó acceder sin autorización al usuario {user_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes autorización para realizar esta acción"
        )


def log_user_activity(
    db: Session, 
    user_id: int, 
    action: str, 
    details: str, 
    request: Optional[Request] = None
) -> None:
    """Registrar actividad del usuario."""
    try:
        activity = Activity(
            user_id=user_id,
            action=action,
            details=details,
            ip_address=get_client_ip(request)
        )
        db.add(activity)
        db.commit()
        logger.info(f"Actividad registrada: {action} para usuario {user_id}")
    except Exception as e:
        logger.error(f"Error registrando actividad {action} para usuario {user_id}: {str(e)}")


# ----------- Endpoints -----------

@router.get("/{user_id}/profile", response_model=UserProfile)
async def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Obtener perfil de usuario.
    
    Args:
        user_id: ID del usuario
        db: Sesión de base de datos
        current_user: Usuario autenticado actual
    
    Returns:
        Datos del perfil de usuario
    
    Raises:
        HTTPException: Si no tiene autorización o el usuario no existe
    """
    try:
        logger.info(f"Usuario {getattr(current_user, 'email')} obteniendo perfil de usuario {user_id}")
        
        check_user_authorization(current_user, user_id)
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.warning(f"Usuario con ID {user_id} no encontrado")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        logger.info(f"Perfil de usuario {user_id} obtenido exitosamente")
        return user
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Error de base de datos al obtener perfil {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.put("/{user_id}/profile", response_model=UserProfile)
async def update_user_profile(
    user_id: int,
    data: UserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Actualizar perfil de usuario.
    
    Args:
        user_id: ID del usuario a actualizar
        data: Datos de actualización
        request: Objeto de request
        db: Sesión de base de datos
        current_user: Usuario autenticado actual
    
    Returns:
        Usuario actualizado
    
    Raises:
        HTTPException: Si no tiene autorización, el usuario no existe, o hay conflictos
    """
    try:
        logger.info(f"Usuario {getattr(current_user, 'email')} actualizando perfil {user_id}")
        
        check_user_authorization(current_user, user_id)
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.warning(f"Usuario con ID {user_id} no encontrado")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        # Obtener datos de actualización
        update_data = data.model_dump(exclude_unset=True)
        
        # El email se maneja por separado en otro endpoint por seguridad
        update_data.pop("email", None)
        
        # Verificar username único si se está cambiando
        if "username" in update_data and update_data["username"]:
            existing_user = (
                db.query(User)
                .filter(
                    getattr(User, 'username') == update_data["username"],
                    User.id != user_id
                )
                .first()
            )
            if existing_user:
                logger.warning(f"Intento de usar username ya existente: {update_data['username']}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El nombre de usuario ya está en uso"
                )
        
        # Aplicar actualizaciones
        changes: List[str] = []
        for field, value in update_data.items():
            if hasattr(user, field):
                old_value = getattr(user, field, None)
                if old_value != value:
                    setattr(user, field, value)
                    changes.append(f"{field}: '{old_value}' -> '{value}'")
        
        if changes:
            # Actualizar timestamp de modificación
            setattr(user, 'updated_at', datetime.now(timezone.utc))
            
            db.commit()
            db.refresh(user)
            
            # Registrar actividad
            log_user_activity(
                db, user_id, 
                "profile_updated", 
                f"Actualizó perfil: {', '.join(changes[:3])}{'...' if len(changes) > 3 else ''}",
                request
            )
            
            logger.info(f"Perfil de usuario {user_id} actualizado exitosamente")
        else:
            logger.info(f"No hay cambios en el perfil de usuario {user_id}")
        
        return user
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error de base de datos al actualizar perfil {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al actualizar perfil"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error inesperado al actualizar perfil {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.put("/{user_id}/password")
async def update_password(
    user_id: int,
    data: PasswordUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Cambiar contraseña del usuario.
    
    Args:
        user_id: ID del usuario
        data: Datos de cambio de contraseña
        request: Objeto de request
        db: Sesión de base de datos
        current_user: Usuario autenticado actual
    
    Returns:
        Mensaje de confirmación
    
    Raises:
        HTTPException: Si no tiene autorización, contraseña incorrecta, o error del servidor
    """
    try:
        logger.info(f"Usuario {getattr(current_user, 'email')} cambiando contraseña para usuario {user_id}")
        
        check_user_authorization(current_user, user_id)
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.warning(f"Usuario con ID {user_id} no encontrado")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        # Verificar contraseña actual
        current_password_hash = getattr(user, 'hashed_password')
        if not verify_password(data.old_password, current_password_hash):
            logger.warning(f"Usuario {user_id} proporcionó contraseña actual incorrecta")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La contraseña actual es incorrecta"
            )
        
        # Verificar que la nueva contraseña sea diferente
        if verify_password(data.new_password, current_password_hash):
            logger.warning(f"Usuario {user_id} intentó establecer la misma contraseña")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La nueva contraseña debe ser diferente a la actual"
            )
        
        # Actualizar contraseña
        new_password_hash = get_password_hash(data.new_password)
        setattr(user, 'hashed_password', new_password_hash)
        setattr(user, 'password_changed_at', datetime.now(timezone.utc))
        setattr(user, 'updated_at', datetime.now(timezone.utc))
        
        db.commit()
        
        # Registrar actividad
        log_user_activity(
            db, user_id,
            "password_changed",
            f"Cambió su contraseña desde IP {get_client_ip(request)}",
            request
        )
        
        logger.info(f"Contraseña actualizada exitosamente para usuario {user_id}")
        return {"message": "Contraseña actualizada correctamente"}
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error de base de datos al cambiar contraseña {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al cambiar contraseña"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error inesperado al cambiar contraseña {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.post("/{user_id}/logout-all")
async def logout_all_sessions(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Cerrar todas las sesiones del usuario.
    
    Args:
        user_id: ID del usuario
        request: Objeto de request
        db: Sesión de base de datos
        current_user: Usuario autenticado actual
    
    Returns:
        Mensaje de confirmación
    """
    try:
        logger.info(f"Usuario {getattr(current_user, 'email')} cerrando todas las sesiones para usuario {user_id}")
        
        check_user_authorization(current_user, user_id)
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        # Actualizar timestamp para invalidar tokens JWT existentes
        setattr(user, 'password_changed_at', datetime.now(timezone.utc))
        db.commit()
        
        # Registrar actividad
        log_user_activity(
            db, user_id,
            "logout_all_sessions",
            f"Cerró todas las sesiones desde IP {get_client_ip(request)}",
            request
        )
        
        logger.info(f"Todas las sesiones cerradas para usuario {user_id}")
        return {"message": "Sesiones cerradas en todos los dispositivos"}
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error de base de datos al cerrar sesiones {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


def format_user_activity(activity: Activity) -> Optional[Dict[str, Any]]:
    """Formatear actividad del usuario para mostrar mensajes amigables."""
    
    action = getattr(activity, 'action', '')
    details = getattr(activity, 'details', '')
    
    # Mapeo de acciones técnicas a mensajes amigables
    user_actions_mapping = {
        'login': 'Iniciaste sesión',
        'logout': 'Cerraste sesión',
        'password_changed': 'Cambiaste tu contraseña',
        'profile_updated': 'Actualizaste tu perfil',
        'email_change_requested': 'Solicitaste cambio de email',
        'email_changed': 'Cambiaste tu email',
        'favorite_added': 'Agregaste una canción a favoritos',
        'favorite_removed': 'Eliminaste una canción de favoritos',
        'favorites_cleared': 'Eliminaste todos tus favoritos',
        'verification_email_resent': 'Reenviaste email de verificación',
        'account_deletion_requested': 'Solicitaste eliminación de cuenta',
        'account_deletion_cancelled': 'Cancelaste eliminación de cuenta',
        'logout_all_sessions': 'Cerraste sesión en todos los dispositivos',
        'password_reset_requested': 'Solicitaste restablecer contraseña',
        'password_reset_completed': 'Restableciste tu contraseña',
        'user_registered': 'Te registraste en la plataforma',
        'email_verified': 'Verificaste tu email'
    }
    
    # Solo incluir actividades relevantes para el usuario
    if action not in user_actions_mapping:
        return None
    
    # Obtener mensaje base
    action_message = user_actions_mapping[action]
    
    # Personalizar mensaje según la acción y descripción
    if action == 'favorite_added' and details:
        # Extraer nombre de la canción de la descripción
        import re
        match = re.search(r"'([^']+)'", details)
        if match:
            song_title = match.group(1)
            action_message = f"Agregaste '{song_title}' a favoritos"
    elif action == 'favorite_removed' and details:
        # Extraer nombre de la canción de la descripción
        import re
        match = re.search(r"'([^']+)'", details)
        if match:
            song_title = match.group(1)
            action_message = f"Eliminaste '{song_title}' de favoritos"
    elif action == 'favorites_cleared' and details:
        # Extraer número de canciones eliminadas
        import re
        match = re.search(r'\((\d+) canciones\)', details)
        if match:
            count = match.group(1)
            action_message = f"Eliminaste {count} canciones de favoritos"
    
    created_at = getattr(activity, 'created_at')
    ip_address = getattr(activity, 'ip_address', 'unknown')
    
    # Formatear fecha de manera amigable
    if created_at:
        try:
            formatted_date = created_at.strftime('%d/%m/%Y a las %H:%M')
        except:
            formatted_date = str(created_at)
    else:
        formatted_date = 'Fecha desconocida'
    
    return {
        'id': getattr(activity, 'id'),
        'action': action_message,
        'date': formatted_date,
        'ip': ip_address,
        'details': details
    }


@router.get("/{user_id}/activity", response_model=List[Dict[str, Any]])
async def get_user_activity(
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """
    Obtener historial de actividad del usuario.
    
    Args:
        user_id: ID del usuario
        skip: Número de registros a omitir
        limit: Número máximo de registros
        db: Sesión de base de datos
        current_user: Usuario autenticado actual
    
    Returns:
        Lista de actividades del usuario
    """
    try:
        logger.info(f"Usuario {getattr(current_user, 'email')} obteniendo actividad para usuario {user_id}")
        
        check_user_authorization(current_user, user_id)
        
        activities = (
            db.query(Activity)
            .filter(Activity.user_id == user_id)
            .order_by(Activity.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        
        # Formatear actividades para mostrar solo las relevantes del usuario
        formatted_activities: List[Dict[str, Any]] = []
        for activity in activities:
            formatted = format_user_activity(activity)
            if formatted:  # Solo incluir actividades relevantes
                formatted_activities.append(formatted)
        
        logger.info(f"Se encontraron {len(formatted_activities)} actividades relevantes para usuario {user_id}")
        return formatted_activities
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Error de base de datos al obtener actividad {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.post("/{user_id}/resend-verification")
async def resend_verification_email(
    user_id: int,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Reenviar email de verificación.
    
    Args:
        user_id: ID del usuario
        request: Objeto de request
        background_tasks: Tareas en segundo plano
        db: Sesión de base de datos
        current_user: Usuario autenticado actual
    
    Returns:
        Mensaje de confirmación
    """
    try:
        logger.info(f"Usuario {getattr(current_user, 'email')} reenviando verificación para usuario {user_id}")
        
        check_user_authorization(current_user, user_id)
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        is_verified = getattr(user, 'is_verified', False)
        if is_verified:
            logger.info(f"Usuario {user_id} ya está verificado")
            return {"message": "El correo electrónico ya está verificado"}
        
        # Generar nuevo token y enviar email
        user_email = getattr(user, 'email')
        token = create_email_verification_token(user_email)
        background_tasks.add_task(send_verification_email, user_email, token)
        
        # Registrar actividad
        log_user_activity(
            db, user_id,
            "verification_email_resent",
            f"Reenvió email de verificación a {user_email}",
            request
        )
        
        logger.info(f"Email de verificación reenviado para usuario {user_id}")
        return {"message": "Correo de verificación reenviado exitosamente"}
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Error de base de datos al reenviar verificación {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.delete("/{user_id}")
async def request_account_deletion(
    user_id: int,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Solicitar eliminación de cuenta (se eliminará en 24 horas).
    
    Args:
        user_id: ID del usuario
        request: Objeto de request
        background_tasks: Tareas en segundo plano
        db: Sesión de base de datos
        current_user: Usuario autenticado actual
    
    Returns:
        Mensaje de confirmación
    """
    try:
        logger.info(f"Usuario {getattr(current_user, 'email')} solicitando eliminación de cuenta {user_id}")
        
        check_user_authorization(current_user, user_id)
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        user_email = getattr(user, 'email')
        
        # Verificar si ya hay una eliminación programada
        if getattr(user, 'deletion_requested_at', None):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe una solicitud de eliminación pendiente"
            )
        
        # Programar eliminación para 24 horas después
        now = datetime.now(timezone.utc)
        deletion_time = now + timedelta(hours=24)
        
        # Actualizar usuario con datos de eliminación
        setattr(user, 'deletion_requested_at', now)
        setattr(user, 'deletion_scheduled_at', deletion_time)
        
        # Generar token para confirmación inmediata (opcional)
        token = create_account_deletion_token(user_id)
        
        # Enviar email de confirmación
        background_tasks.add_task(send_account_deletion_confirmation, user_email, token)
        
        # Registrar actividad
        log_user_activity(
            db, user_id,
            "account_deletion_requested",
            f"Solicitó eliminación de cuenta desde IP {get_client_ip(request)}",
            request
        )
        
        db.commit()
        
        logger.info(f"Eliminación de cuenta programada para usuario {user_id} ({user_email}) para {deletion_time}")
        return {
            "message": "Solicitud de eliminación enviada. Tu cuenta será eliminada en 24 horas. Revisa tu correo para confirmar o inicia sesión para cancelar.",
            "deletion_scheduled_at": deletion_time.isoformat()
        }
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error de base de datos al solicitar eliminación de cuenta {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error inesperado al solicitar eliminación de cuenta {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.put("/{user_id}/cancel-deletion")
async def cancel_account_deletion(
    user_id: int,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Cancelar eliminación programada de cuenta.
    
    Args:
        user_id: ID del usuario
        request: Objeto de request
        background_tasks: Tareas en segundo plano
        db: Sesión de base de datos
        current_user: Usuario autenticado actual
    
    Returns:
        Mensaje de confirmación
    """
    try:
        logger.info(f"Usuario {getattr(current_user, 'email')} cancelando eliminación de cuenta {user_id}")
        
        check_user_authorization(current_user, user_id)
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        # Verificar si hay una eliminación programada
        deletion_requested_at = getattr(user, 'deletion_requested_at', None)
        if not deletion_requested_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay ninguna eliminación programada para cancelar"
            )
        
        user_email = getattr(user, 'email')
        
        # Cancelar eliminación
        setattr(user, 'deletion_requested_at', None)
        setattr(user, 'deletion_scheduled_at', None)
        
        # Enviar email de confirmación de cancelación
        background_tasks.add_task(send_account_deletion_cancelled, user_email)
        
        # Registrar actividad
        log_user_activity(
            db, user_id,
            "account_deletion_cancelled",
            f"Canceló eliminación de cuenta desde IP {get_client_ip(request)}",
            request
        )
        
        db.commit()
        
        logger.info(f"Eliminación de cuenta cancelada para usuario {user_id} ({user_email})")
        return {"message": "Eliminación de cuenta cancelada correctamente"}
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error de base de datos al cancelar eliminación de cuenta {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error inesperado al cancelar eliminación de cuenta {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.put("/{user_id}/change-email")
async def request_email_change(
    user_id: int,
    data: ChangeEmailRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Solicitar cambio de email (envía confirmación al nuevo email).
    
    Args:
        user_id: ID del usuario
        data: Datos de cambio de email
        request: Objeto de request
        background_tasks: Tareas en segundo plano
        db: Sesión de base de datos
        current_user: Usuario autenticado actual
    
    Returns:
        Mensaje de confirmación
    """
    try:
        logger.info(f"Usuario {getattr(current_user, 'email')} solicitando cambio de email para usuario {user_id}")
        
        check_user_authorization(current_user, user_id)
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        current_email = getattr(user, 'email')
        new_email = data.new_email
        
        # Verificar que el nuevo email sea diferente
        if current_email == new_email:
            logger.warning(f"Usuario {user_id} intentó cambiar al mismo email")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nuevo correo electrónico debe ser diferente al actual"
            )
        
        # Verificar que el nuevo email no esté en uso
        existing_user = db.query(User).filter(getattr(User, 'email') == new_email).first()
        if existing_user:
            logger.warning(f"Intento de cambiar a email ya existente: {new_email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electrónico ya está en uso"
            )
        
        # Generar token y enviar email de confirmación
        token = create_email_change_token(getattr(user, 'id'), new_email)
        background_tasks.add_task(send_email_change_confirmation, new_email, token)
        
        # Registrar actividad
        log_user_activity(
            db, user_id,
            "email_change_requested",
            f"Solicitó cambio de email de {current_email} a {new_email}",
            request
        )
        
        logger.info(f"Cambio de email solicitado para usuario {user_id}")
        return {"message": "Te enviamos un correo para confirmar el cambio de email"}
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Error de base de datos al solicitar cambio de email {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al solicitar cambio de email"
        )
    except Exception as e:
        logger.error(f"Error inesperado al solicitar cambio de email {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )