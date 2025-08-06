from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import re
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Expresión regular para validación básica de email
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

def validate_email(email: str) -> bool:
    """Validar formato de email"""
    if not email:
        return False
    return bool(EMAIL_REGEX.match(email.strip()))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar contraseña plana contra hash"""
    if not plain_password or not hashed_password:
        return False
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generar hash de contraseña"""
    if not password:
        raise ValueError("La contraseña no puede estar vacía")
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Crear token JWT de acceso"""
    if not data:
        raise ValueError("Los datos no pueden estar vacíos")
    
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def verify_token(token: str) -> Dict[str, Any]:
    """Verificar y decodificar token JWT"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no proporcionado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

# --- Token de recuperación de contraseña ---

RESET_TOKEN_EXPIRE_MINUTES = 30

def create_password_reset_token(email: str) -> str:
    """Crear token para recuperación de contraseña"""
    if not email or not validate_email(email):
        raise ValueError("Email inválido")
    
    expire = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    to_encode: Dict[str, Any] = {"sub": email, "exp": expire, "type": "password_reset"}
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

def verify_password_reset_token(token: str) -> Optional[str]:
    """Verificar token de recuperación de contraseña"""
    if not token:
        return None
    
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        
        # Verificar que es el tipo correcto de token
        if payload.get("type") != "password_reset":
            return None
            
        return payload.get("sub")
    except JWTError:
        return None

# --- Token de verificación de correo electrónico ---

def create_email_verification_token(email: str) -> str:
    """Crear token para verificación de email"""
    if not email or not validate_email(email):
        raise ValueError("Email inválido")
    
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    to_encode: Dict[str, Any] = {"sub": email, "exp": expire, "type": "email_verification"}
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

def verify_email_verification_token(token: str) -> Optional[str]:
    """Verificar token de verificación de email"""
    if not token:
        return None
    
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        
        # Verificar que es el tipo correcto de token
        if payload.get("type") != "email_verification":
            return None
            
        return payload.get("sub")
    except JWTError:
        return None

# --- Token de confirmación de cambio de correo electrónico ---

EMAIL_CHANGE_TOKEN_EXPIRE_HOURS = 24

def create_email_change_token(user_id: int, new_email: str) -> str:
    """Crear token para cambio de email"""
    if not user_id or user_id <= 0:
        raise ValueError("ID de usuario inválido")
    if not new_email or not validate_email(new_email):
        raise ValueError("Email inválido")
    
    expire = datetime.now(timezone.utc) + timedelta(hours=EMAIL_CHANGE_TOKEN_EXPIRE_HOURS)
    to_encode: Dict[str, Any] = {
        "sub": str(user_id), 
        "new_email": new_email, 
        "exp": expire,
        "type": "email_change"
    }
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

def verify_email_change_token(token: str) -> Optional[Dict[str, Any]]:
    """Verificar token de cambio de email"""
    if not token:
        return None
    
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        
        # Verificar que es el tipo correcto de token
        if payload.get("type") != "email_change":
            return None
        
        user_id = payload.get("sub")
        new_email = payload.get("new_email")
        
        if not user_id or not new_email:
            return None
            
        return {"user_id": int(user_id), "new_email": new_email}
    except (JWTError, ValueError):
        return None


# =================================================================
# TOKENS DE ELIMINACIÓN DE CUENTA
# =================================================================

ACCOUNT_DELETION_TOKEN_EXPIRE_HOURS = 24

def create_account_deletion_token(user_id: int) -> str:
    """
    Crear token para confirmación de eliminación de cuenta.
    
    Args:
        user_id: ID del usuario
        
    Returns:
        Token JWT para confirmar eliminación
    """
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCOUNT_DELETION_TOKEN_EXPIRE_HOURS)
    to_encode: Dict[str, Any] = {
        "sub": str(user_id),
        "exp": expire,
        "type": "account_deletion"
    }
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

def verify_account_deletion_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verificar token de eliminación de cuenta.
    
    Args:
        token: Token JWT a verificar
        
    Returns:
        Datos del token si es válido, None si no
    """
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        
        # Verificar que es el tipo correcto de token
        if payload.get("type") != "account_deletion":
            return None
        
        user_id = payload.get("sub")
        
        if not user_id:
            return None
            
        return {"user_id": int(user_id)}
    except (JWTError, ValueError):
        return None

