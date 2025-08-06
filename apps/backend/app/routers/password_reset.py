"""
Router para la gestión de restablecimiento de contraseñas.

Este módulo maneja todas las operaciones relacionadas con el restablecimiento de contraseñas:
- Solicitar restablecimiento de contraseña por email
- Confirmar y establecer nueva contraseña
- Verificar tokens de restablecimiento
- Notificaciones por email de cambios de contraseña
"""

import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from ..core.database import get_db
from ..models.user import User
from ..models.activity import Activity
from ..schemas.password_reset import PasswordResetRequest, PasswordResetConfirm
from ..core.email import send_reset_email, send_password_changed_email
from ..core.security import (
    get_password_hash, 
    create_password_reset_token, 
    verify_password_reset_token,
    verify_password
)
from ..routers.auth import get_current_user

# Configurar logging
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/password-reset",
    tags=["password-reset"],
    responses={404: {"description": "No encontrado"}}
)


@router.post("/request", status_code=status.HTTP_200_OK)
async def request_password_reset(
    request: Request,
    data: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Solicitar restablecimiento de contraseña por email.
    
    Este endpoint siempre devuelve el mismo mensaje para evitar revelar
    si una dirección de email existe en el sistema (seguridad).
    
    Args:
        request: Objeto de request para obtener información del cliente
        data: Datos de la solicitud con el email
        background_tasks: Tareas en segundo plano para envío de emails
        db: Sesión de base de datos
    
    Returns:
        Mensaje estándar de confirmación
    """
    try:
        # Obtener IP del cliente para logging
        client_ip = request.client.host if request.client else "unknown"
        
        logger.info(f"Solicitud de restablecimiento de contraseña para {data.email} desde IP {client_ip}")
        
        # Buscar usuario por email
        user = db.query(User).filter(getattr(User, 'email') == data.email).first()
        
        if user:
            # Solo proceder si el usuario existe y está activo
            if getattr(user, 'is_active', True):
                logger.info(f"Usuario encontrado para {data.email}, generando token de restablecimiento")
                
                # Crear token de restablecimiento
                token = create_password_reset_token(getattr(user, 'email'))
                
                # Registrar actividad
                activity = Activity(
                    user_id=getattr(user, 'id'),
                    action="password_reset_requested",
                    details=f"Solicitó restablecimiento de contraseña desde IP {client_ip}",
                    ip_address=client_ip
                )
                db.add(activity)
                db.commit()
                
                # Enviar email en segundo plano
                background_tasks.add_task(
                    send_reset_email, 
                    getattr(user, 'email'), 
                    token
                )
                
                logger.info(f"Token de restablecimiento generado y email programado para {data.email}")
            else:
                logger.warning(f"Usuario {data.email} existe pero está inactivo")
        else:
            logger.warning(f"Intento de restablecimiento para email inexistente: {data.email} desde IP {client_ip}")
        
        # Siempre devolver el mismo mensaje por seguridad
        return {
            "message": "Si el correo electrónico existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña."
        }
        
    except SQLAlchemyError as e:
        logger.error(f"Error de base de datos al solicitar restablecimiento para {data.email}: {str(e)}")
        # Aún así devolver el mensaje estándar por seguridad
        return {
            "message": "Si el correo electrónico existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña."
        }
    except Exception as e:
        logger.error(f"Error inesperado al solicitar restablecimiento para {data.email}: {str(e)}")
        # Aún así devolver el mensaje estándar por seguridad
        return {
            "message": "Si el correo electrónico existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña."
        }


@router.post("/verify-token")
async def verify_reset_token(
    token: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Verificar si un token de restablecimiento es válido.
    
    Args:
        token: Token de restablecimiento a verificar
        db: Sesión de base de datos
    
    Returns:
        Información sobre la validez del token
    
    Raises:
        HTTPException: Si el token es inválido o ha expirado
    """
    try:
        logger.info(f"Verificando token de restablecimiento")
        
        email = verify_password_reset_token(token)
        if not email:
            logger.warning("Token de restablecimiento inválido o expirado")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token inválido o expirado"
            )
        
        # Verificar que el usuario aún existe y está activo
        user = db.query(User).filter(getattr(User, 'email') == email).first()
        if not user or not getattr(user, 'is_active', True):
            logger.warning(f"Token válido pero usuario {email} no existe o está inactivo")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token inválido o expirado"
            )
        
        logger.info(f"Token verificado exitosamente para {email}")
        return {
            "valid": True,
            "email": email,
            "message": "Token válido"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error inesperado al verificar token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.post("/confirm", status_code=status.HTTP_200_OK)
async def confirm_password_reset(
    request: Request,
    data: PasswordResetConfirm,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Confirmar y establecer nueva contraseña usando el token de restablecimiento.
    
    Args:
        request: Objeto de request para obtener información del cliente
        data: Datos de confirmación con token y nueva contraseña
        background_tasks: Tareas en segundo plano para envío de emails
        db: Sesión de base de datos
    
    Returns:
        Mensaje de confirmación
    
    Raises:
        HTTPException: Si el token es inválido, el usuario no existe, o hay un error del servidor
    """
    try:
        # Obtener IP del cliente para logging
        client_ip = request.client.host if request.client else "unknown"
        
        logger.info(f"Confirmación de restablecimiento de contraseña desde IP {client_ip}")
        
        # Verificar token
        email = verify_password_reset_token(data.token)
        if not email:
            logger.warning(f"Intento de restablecimiento con token inválido desde IP {client_ip}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token inválido o expirado"
            )
        
        # Buscar usuario
        user = db.query(User).filter(getattr(User, 'email') == email).first()
        if not user:
            logger.error(f"Token válido pero usuario {email} no existe")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        if not getattr(user, 'is_active', True):
            logger.warning(f"Intento de restablecimiento para usuario inactivo {email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cuenta de usuario inactiva"
            )
        
        # Validar que la nueva contraseña sea diferente a la actual
        if verify_password(data.new_password, getattr(user, 'hashed_password')):
            logger.warning(f"Usuario {email} intentó establecer la misma contraseña actual")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La nueva contraseña debe ser diferente a la actual"
            )
        
        # Establecer nueva contraseña
        new_hashed_password = get_password_hash(data.new_password)
        setattr(user, 'hashed_password', new_hashed_password)
        
        # Invalidar sesiones existentes incrementando password_changed_at
        from datetime import datetime, timezone
        setattr(user, 'password_changed_at', datetime.now(timezone.utc))
        
        # Registrar actividad
        activity = Activity(
            user_id=getattr(user, 'id'),
            action="password_reset_completed",
            details=f"Completó restablecimiento de contraseña desde IP {client_ip}",
            ip_address=client_ip
        )
        db.add(activity)
        
        db.commit()
        
        # Enviar email de confirmación en segundo plano
        background_tasks.add_task(
            send_password_changed_email,
            getattr(user, 'email')
        )
        
        logger.info(f"Contraseña restablecida exitosamente para {email}")
        return {"message": "Contraseña restablecida correctamente"}
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error de base de datos al confirmar restablecimiento: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al restablecer contraseña"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error inesperado al confirmar restablecimiento: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_password_authenticated(
    request: Request,
    current_password: str,
    new_password: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Cambiar contraseña para usuarios autenticados (requiere contraseña actual).
    
    Args:
        request: Objeto de request para obtener información del cliente
        current_password: Contraseña actual del usuario
        new_password: Nueva contraseña a establecer
        background_tasks: Tareas en segundo plano para envío de emails
        db: Sesión de base de datos
        current_user: Usuario autenticado actual
    
    Returns:
        Mensaje de confirmación
    
    Raises:
        HTTPException: Si la contraseña actual es incorrecta o hay un error del servidor
    """
    try:
        # Obtener IP del cliente para logging
        client_ip = request.client.host if request.client else "unknown"
        
        logger.info(f"Usuario {getattr(current_user, 'email')} cambiando contraseña desde IP {client_ip}")
        
        # Verificar contraseña actual
        if not verify_password(current_password, getattr(current_user, 'hashed_password')):
            logger.warning(f"Usuario {getattr(current_user, 'email')} proporcionó contraseña actual incorrecta")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Contraseña actual incorrecta"
            )
        
        # Validar que la nueva contraseña sea diferente
        if verify_password(new_password, getattr(current_user, 'hashed_password')):
            logger.warning(f"Usuario {getattr(current_user, 'email')} intentó establecer la misma contraseña")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La nueva contraseña debe ser diferente a la actual"
            )
        
        # Establecer nueva contraseña
        new_hashed_password = get_password_hash(new_password)
        setattr(current_user, 'hashed_password', new_hashed_password)
        
        # Actualizar timestamp de cambio de contraseña
        from datetime import datetime, timezone
        setattr(current_user, 'password_changed_at', datetime.now(timezone.utc))
        
        # Registrar actividad
        activity = Activity(
            user_id=getattr(current_user, 'id'),
            action="password_changed",
            details=f"Cambió su contraseña desde IP {client_ip}",
            ip_address=client_ip
        )
        db.add(activity)
        
        db.commit()
        
        # Enviar email de notificación en segundo plano
        background_tasks.add_task(
            send_password_changed_email,
            getattr(current_user, 'email')
        )
        
        logger.info(f"Contraseña cambiada exitosamente para {getattr(current_user, 'email')}")
        return {"message": "Contraseña cambiada correctamente"}
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error de base de datos al cambiar contraseña: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al cambiar contraseña"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error inesperado al cambiar contraseña: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )