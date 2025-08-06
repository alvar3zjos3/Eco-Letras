"""
Configuración de la aplicación Eco Iglesia Letras API.

Este módulo contiene todas las configuraciones y variables de entorno
necesarias para el funcionamiento de la aplicación.
"""

from pydantic_settings import BaseSettings
from typing import List, Dict, Any


class Settings(BaseSettings):
    """
    Configuración principal de la aplicación.
    
    Todas las configuraciones se cargan desde variables de entorno
    definidas en el archivo .env
    """
    
    # =================================================================
    # APLICACIÓN
    # =================================================================
    app_name: str = "Eco Iglesia Letras API"
    debug: bool = True
    environment: str = "development"
    host: str = "0.0.0.0"
    port: int = 8000
    
    # =================================================================
    # BASE DE DATOS
    # =================================================================
    database_url: str = "postgresql://eco:561834@localhost/eco_iglesia_letras"
    database_pool_size: int = 10
    database_max_overflow: int = 20
    database_pool_timeout: int = 30
    
    # =================================================================
    # SEGURIDAD Y AUTENTICACIÓN
    # =================================================================
    secret_key: str = "6b8f2e1c-4d7a-4e9b-9f3a-2c5d1e7f8a6b-7c3e-4f2d-8b1a-9e6c3d2f1b7a-5e4d-3c2b-1a0f-9e8d7c6b5a4f"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    password_reset_token_expire_minutes: int = 15
    email_verification_token_expire_hours: int = 24
    
    # =================================================================
    # RATE LIMITING
    # =================================================================
    rate_limit_requests: int = 100
    rate_limit_window: int = 60
    
    # =================================================================
    # CORS Y HOSTS PERMITIDOS
    # =================================================================
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://192.168.1.198:3000"
    ]
    allowed_hosts: List[str] = [
        "localhost",
        "192.168.1.198"
    ]
    
    # =================================================================
    # EMAIL / SMTP
    # =================================================================
    email_enabled: bool = True
    email_user: str = ""
    email_pass: str = ""
    email_from: str = ""
    email_from_name: str = "Eco Iglesia Letras"
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_tls: bool = True
    smtp_ssl: bool = False
    
    # =================================================================
    # FRONTEND
    # =================================================================
    frontend_url: str = "http://localhost:3000"
    frontend_reset_password_url: str = "http://localhost:3000/reset-password"
    frontend_email_verification_url: str = "http://localhost:3000/verify-email"
    
    # =================================================================
    # LOGGING
    # =================================================================
    log_level: str = "INFO"
    log_file: str = "app.log"
    log_max_size: int = 10485760  # 10MB
    log_backup_count: int = 5
    
    # =================================================================
    # CACHE (Redis - opcional)
    # =================================================================
    redis_enabled: bool = False
    redis_url: str = "redis://localhost:6379/0"
    cache_ttl: int = 3600
    
    # =================================================================
    # MONITORING Y MÉTRICAS
    # =================================================================
    metrics_enabled: bool = True
    health_check_timeout: int = 30
    
    # =================================================================
    # DESARROLLO Y TESTING
    # =================================================================
    testing: bool = False
    seed_data: bool = True
    
    # =================================================================
    # SSL/TLS (HTTPS)
    # =================================================================
    ssl_enabled: bool = False
    ssl_cert_path: str = ""
    ssl_key_path: str = ""
    
    # =================================================================
    # BACKUP Y MANTENIMIENTO
    # =================================================================
    backup_enabled: bool = False
    backup_schedule: str = "0 2 * * *"  # Cron expression
    backup_retention_days: int = 30
    maintenance_mode: bool = False
    
    # =================================================================
    # PERFORMANCE
    # =================================================================
    workers: int = 1
    max_connections: int = 100
    keepalive_timeout: int = 65
    client_timeout: int = 60
    
    # =================================================================
    # PROPIEDADES COMPUTADAS
    # =================================================================
    @property
    def is_development(self) -> bool:
        """Retorna True si está en modo desarrollo."""
        return self.environment.lower() in ["development", "dev"]
    
    @property
    def is_production(self) -> bool:
        """Retorna True si está en modo producción."""
        return self.environment.lower() in ["production", "prod"]
    
    @property
    def is_testing(self) -> bool:
        """Retorna True si está en modo testing."""
        return self.testing or self.environment.lower() in ["testing", "test"]
    
    @property
    def database_config(self) -> Dict[str, Any]:
        """Configuración de la base de datos."""
        return {
            "url": self.database_url,
            "pool_size": self.database_pool_size,
            "max_overflow": self.database_max_overflow,
            "pool_timeout": self.database_pool_timeout,
        }
    
    @property
    def email_config(self) -> Dict[str, Any]:
        """Configuración del email."""
        return {
            "enabled": self.email_enabled,
            "user": self.email_user,
            "password": self.email_pass,
            "from_email": self.email_from,
            "from_name": self.email_from_name,
            "smtp_host": self.smtp_host,
            "smtp_port": self.smtp_port,
            "smtp_tls": self.smtp_tls,
            "smtp_ssl": self.smtp_ssl,
        }
    
    @property
    def cors_config(self) -> Dict[str, Any]:
        """Configuración de CORS."""
        return {
            "allow_origins": self.allowed_origins,
            "allow_credentials": True,
            "allow_methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
            "allow_headers": ["*"],
        }
    
    @property
    def is_ssl_enabled(self) -> bool:
        """Determina si SSL/HTTPS está habilitado."""
        return (
            self.ssl_enabled and 
            bool(self.ssl_cert_path) and 
            bool(self.ssl_key_path)
        )
    
    @property
    def is_backup_enabled(self) -> bool:
        """Determina si el backup automático está habilitado."""
        return self.backup_enabled and not self.is_development
    
    @property
    def is_maintenance_mode(self) -> bool:
        """Determina si la aplicación está en modo mantenimiento."""
        return self.maintenance_mode
    
    @property
    def server_config(self) -> Dict[str, Any]:
        """Configuración del servidor para producción."""
        return {
            "host": self.host,
            "port": self.port,
            "workers": self.workers if self.is_production else 1,
            "keepalive_timeout": self.keepalive_timeout,
            "timeout_keep_alive": self.keepalive_timeout,
            "limit_max_requests": self.max_connections,
            "ssl_enabled": self.is_ssl_enabled,
        }
    
    @property
    def backup_config(self) -> Dict[str, Any]:
        """Configuración de backup."""
        return {
            "enabled": self.is_backup_enabled,
            "schedule": self.backup_schedule,
            "retention_days": self.backup_retention_days,
            "database_url": self.database_url,
        }

    class Config:
        """Configuración de Pydantic."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        
        # Permitir campos extra en caso de que se agreguen nuevas variables
        extra = "ignore"


# Instancia global de configuración
settings = Settings()


def get_settings() -> Settings:
    """
    Función factory para obtener la configuración.
    
    Útil para dependency injection y testing.
    """
    return settings


# Validaciones de configuración en tiempo de importación
def validate_config():
    """Valida la configuración al importar el módulo."""
    
    # Validar que las variables críticas estén configuradas
    if not settings.secret_key or len(settings.secret_key) < 32:
        raise ValueError("SECRET_KEY debe estar configurado y tener al menos 32 caracteres")
    
    if not settings.database_url:
        raise ValueError("DATABASE_URL debe estar configurado")
    
    if settings.email_enabled and not all([settings.email_user, settings.email_pass, settings.email_from]):
        print("Warning: Email está habilitado pero faltan configuraciones de SMTP")


# Ejecutar validaciones
validate_config()
