from datetime import timedelta, datetime, timezone
from fastapi import (
    APIRouter, Depends, HTTPException, status, BackgroundTasks, Query
)
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError
from typing import Union, Dict
import logging
from ..core.database import get_db
from ..core.security import (
    verify_password,
    create_access_token,
    verify_token,
    get_password_hash,
    create_email_verification_token,
    verify_email_verification_token,
    verify_email_change_token,
    verify_account_deletion_token,
)
from ..models.user import User
from ..schemas.user import UserCreate, User as UserSchema, Token, UserUpdate
from ..core.config import settings
from ..core.email import send_verification_email, send_email_change_alert, send_account_deletion_cancelled
from sqlalchemy import or_

router = APIRouter()

logger = logging.getLogger(__name__)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")


def get_user_by_username(db: Session, username: str) -> Union[User, None]:
    """Obtener usuario por nombre de usuario"""
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Union[User, None]:
    """Obtener usuario por email"""
    return db.query(User).filter(User.email == email).first()


def authenticate_user(db: Session, username: str, password: str) -> Union[User, bool]:
    """Autenticar usuario con username/email y contraseña"""
    # Intentar buscar por username o email
    user = get_user_by_username(db, username)
    if not user:
        user = get_user_by_email(db, username)
    
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Obtener usuario actual desde el token JWT"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = verify_token(token)
        username = payload.get("sub")
        if not username:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = get_user_by_username(db, username=username)
    if not user:
        raise credentials_exception
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Verificar que el usuario esté activo"""
    if not getattr(current_user, 'is_active', False):
        raise HTTPException(status_code=400, detail="Usuario inactivo")
    return current_user


def get_current_verified_user(current_user: User = Depends(get_current_active_user)) -> User:
    """Verificar que el usuario esté verificado"""
    if not getattr(current_user, 'is_verified', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Debes verificar tu correo electrónico para acceder a esta función"
        )
    return current_user


def get_current_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """Verificar que el usuario sea administrador"""
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador"
        )
    return current_user


@router.post("/register", response_model=UserSchema)
def register_user(
    user: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Registrar un nuevo usuario"""
    # Verificar que el usuario no existe
    db_user = db.query(User).filter(
        or_(User.username == user.username, User.email == user.email)
    ).first()
    if db_user:
        if getattr(db_user, 'username', '') == user.username:
            raise HTTPException(status_code=400, detail="Nombre de usuario ya registrado")
        else:
            raise HTTPException(status_code=400, detail="Email ya registrado")

    # Crear nuevo usuario
    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        is_active=True,
        is_verified=False,
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Enviar email de verificación
    token = create_email_verification_token(getattr(new_user, 'email', ''))
    background_tasks.add_task(send_verification_email, getattr(new_user, 'email', ''), token)

    return new_user


@router.post("/token", response_model=Token)
def login_for_access_token(
    background_tasks: BackgroundTasks,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Token:
    """Iniciar sesión y obtener token de acceso"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar que el usuario esté verificado (opcional)
    if not getattr(user, 'is_verified', False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Debes verificar tu correo antes de iniciar sesión.",
        )

    # Actualizar último login
    setattr(user, 'last_login', datetime.now(timezone.utc))
    
    # Verificar si hay eliminación programada y cancelarla
    deletion_requested_at = getattr(user, 'deletion_requested_at', None)
    if deletion_requested_at:
        setattr(user, 'deletion_requested_at', None)
        setattr(user, 'deletion_scheduled_at', None)
        # Enviar email de confirmación de cancelación
        background_tasks.add_task(send_account_deletion_cancelled, getattr(user, 'email'))
    
    db.commit()

    # Crear token de acceso
    access_token = create_access_token(
        data={"sub": getattr(user, 'username', '')},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes)
    )

    return Token(
        access_token=access_token, 
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,  # Convertir a segundos
        refresh_token=None,
        scope=None
    )


@router.post("/logout")
def logout_user(
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, str]:
    """Cerrar sesión del usuario"""
    return {"msg": "Sesión cerrada correctamente"}


@router.get("/me", response_model=UserSchema)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Obtener información del usuario actual"""
    # Usar model_validate con from_attributes para convertir automáticamente
    return UserSchema.model_validate({
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "bio": current_user.bio,
        "avatar_url": current_user.avatar_url,
        "role": getattr(current_user, 'role', 'user'),
        "status": getattr(current_user, 'status', 'active'),
        "is_active": getattr(current_user, 'is_active', True),
        "is_admin": getattr(current_user, 'is_admin', False),
        "is_verified": current_user.is_verified,
        "is_premium": getattr(current_user, 'is_premium', False),
        "created_at": current_user.created_at,
        "last_login": current_user.last_login,
        "social_links": current_user.social_links_dict if getattr(current_user, 'social_links', None) else None,
        "musical_profile": current_user.get_musical_preferences(),
        "songs_viewed": 0,
        "favorites_count": 0
    })


@router.put("/me", response_model=UserSchema)
def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Actualizar perfil del usuario actual"""
    
    # Actualizar campos permitidos
    update_data = user_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "username" and value != getattr(current_user, 'username', ''):
            # Verificar que el nuevo username no existe
            existing = db.query(User).filter(
                User.username == value, 
                User.id != current_user.id
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso")
        
        setattr(current_user, field, value)
    
    # Actualizar timestamp
    setattr(current_user, 'updated_at', datetime.now(timezone.utc))
    db.commit()
    db.refresh(current_user)

    return current_user


@router.get("/verify-email")
def verify_email(
    token: str = Query(...), 
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """Verificar email del usuario"""
    
    email = verify_email_verification_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")

    user = get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if getattr(user, 'is_verified', False):
        return {"msg": "El correo ya estaba verificado"}

    setattr(user, 'is_verified', True)
    setattr(user, 'email_verified_at', datetime.now(timezone.utc))
    db.commit()

    return {"msg": "Correo verificado correctamente"}


@router.post("/resend-verification")
def resend_verification_email(
    email: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """Reenviar email de verificación"""
    
    user = get_user_by_email(db, email)
    if not user:
        return {"msg": "Si el correo existe y no está verificado, recibirás un nuevo email de verificación"}
    
    if getattr(user, 'is_verified', False):
        raise HTTPException(status_code=400, detail="El correo ya está verificado")
    
    # Crear nuevo token y enviar email
    token = create_email_verification_token(email)
    background_tasks.add_task(send_verification_email, email, token)
    
    return {"msg": "Si el correo existe y no está verificado, recibirás un nuevo email de verificación"}


@router.get("/confirm-email-change")
def confirm_email_change(
    token: str = Query(..., description="Token de confirmación de cambio de correo"),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """Confirmar cambio de email"""
    
    data = verify_email_change_token(token)
    if not data:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")

    user = db.query(User).filter(User.id == data["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    old_email = getattr(user, 'email', '')
    new_email = data["new_email"]

    if db.query(User).filter(User.email == new_email, User.id != user.id).first():
        raise HTTPException(status_code=400, detail="El correo ya está en uso por otro usuario")

    setattr(user, 'email', new_email)
    setattr(user, 'is_verified', False)
    db.commit()
    db.refresh(user)

    # Enviar alerta al correo anterior
    send_email_change_alert(old_email, new_email)

    return {"msg": "Correo actualizado correctamente. Por favor verifica tu nuevo correo."}


@router.post("/confirm-account-deletion")
def confirm_account_deletion(
    token_data: Dict[str, str],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """Confirmar eliminación de cuenta mediante token del email"""
    
    token = token_data.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Token requerido")
    
    # Verificar token
    data = verify_account_deletion_token(token)
    if not data:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")

    user_id = data["user_id"]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Verificar que el usuario tiene una eliminación solicitada
    deletion_requested_at = getattr(user, 'deletion_requested_at', None)
    if not deletion_requested_at:
        raise HTTPException(status_code=400, detail="No hay solicitud de eliminación pendiente")

    # Programar eliminación para 24 horas después de la confirmación
    now = datetime.now(timezone.utc)
    deletion_time = now + timedelta(hours=24)
    
    setattr(user, 'deletion_scheduled_at', deletion_time)
    db.commit()

    logger.info(f"Eliminación confirmada para usuario {user_id} ({getattr(user, 'email')}). Programada para {deletion_time}")
    
    return {
        "msg": "Eliminación confirmada. Tu cuenta será eliminada automáticamente en 24 horas.",
        "deletion_scheduled_at": deletion_time.isoformat()
    }
