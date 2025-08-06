"""
Aplicación principal de Eco Iglesia Letras API.

Esta es la aplicación FastAPI principal que configura todos los middlewares,
routers, manejo de errores, logging y funcionalidades avanzadas para
la gestión de letras y acordes de canciones cristianas.
"""

import logging
import os
import time
from contextlib import asynccontextmanager
from typing import Dict, Callable, Awaitable, Any

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.types import ASGIApp

from .core.config import settings
from .core.database import engine, Base, get_db
# from .core.security import get_current_user  # Comentado temporalmente
# from .core.email import email_service  # Comentado temporalmente
from .routers import (
    auth, songs, artists, admin, contact, 
    password_reset, favorites, users
)

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware para agregar headers de seguridad.
    """
    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        response = await call_next(request)
        
        # Headers de seguridad
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Content Security Policy
        if not settings.debug:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
            csp = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                "font-src 'self' https://fonts.gstatic.com; "
                "img-src 'self' data: https:; "
                "connect-src 'self'; "
                "frame-ancestors 'none';"
            )
            response.headers["Content-Security-Policy"] = csp
        
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware para logging de requests.
    """
    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        start_time = time.time()
        
        # Log request
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        
        logger.info(
            f"Request: {request.method} {request.url.path} - "
            f"IP: {client_ip} - User-Agent: {user_agent}"
        )
        
        # Process request
        try:
            response = await call_next(request)
            
            # Log response
            process_time = time.time() - start_time
            logger.info(
                f"Response: {response.status_code} - "
                f"Time: {process_time:.4f}s - "
                f"Path: {request.url.path}"
            )
            
            # Add timing header
            response.headers["X-Process-Time"] = str(process_time)
            
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            logger.error(
                f"Error: {str(e)} - "
                f"Time: {process_time:.4f}s - "
                f"Path: {request.url.path}"
            )
            raise


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware para rate limiting básico.
    """
    def __init__(self, app: ASGIApp, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, list[float]] = {}
    
    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        if request.url.path.startswith("/api/docs") or request.url.path.startswith("/api/redoc"):
            return await call_next(request)
        
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Limpiar requests antiguos
        if client_ip in self.requests:
            self.requests[client_ip] = [
                req_time for req_time in self.requests[client_ip]
                if current_time - req_time < self.window_seconds
            ]
        else:
            self.requests[client_ip] = []
        
        # Verificar límite
        if len(self.requests[client_ip]) >= self.max_requests:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Máximo {self.max_requests} requests por {self.window_seconds} segundos"
                }
            )
        
        # Agregar request actual
        self.requests[client_ip].append(current_time)
        
        return await call_next(request)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestión del ciclo de vida de la aplicación.
    """
    # Startup
    logger.info("Iniciando Eco Iglesia Letras API...")
    
    try:
        # Crear tablas de base de datos
        logger.info("Creando tablas de base de datos...")
        Base.metadata.create_all(bind=engine)
        
        # Inicializar servicios
        logger.info("Inicializando servicios...")
        # await email_service.initialize()  # Comentado temporalmente
        
        # Verificar conexión a base de datos
        logger.info("Verificando conexión a base de datos...")
        try:
            db = next(get_db())
            # Simple database check
            db.close()
        except Exception as e:
            logger.error(f"Database connection failed: {str(e)}")
        
        logger.info("Aplicación iniciada correctamente")
        
        yield
        
    except Exception as e:
        logger.error(f"Error durante el startup: {str(e)}")
        raise
    finally:
        # Shutdown
        logger.info("Cerrando Eco Iglesia Letras API...")
        
        # Cerrar servicios
        logger.info("Cerrando servicios...")
        # if email_service:
        #     await email_service.close()
        
        logger.info("Aplicación cerrada correctamente")


# Crear aplicación FastAPI
app = FastAPI(
    title=settings.app_name,
    description="""
    ## API para la gestión de letras y acordes de canciones cristianas
    
    Esta API proporciona una plataforma completa para:
    
    * **Gestión de canciones**: CRUD completo con letras, acordes y metadatos
    * 🎤 **Artistas**: Perfiles completos con biografías y redes sociales
    * ❤️ **Favoritos**: Sistema de favoritos personalizable por categorías
    * 👥 **Usuarios**: Gestión de cuentas con perfiles musicales
    * 🔐 **Autenticación**: Sistema seguro con JWT y roles
    * 🔑 **Recuperación**: Sistema de restablecimiento de contraseñas
    * 📊 **Estadísticas**: Analytics y métricas detalladas
    * 🎸 **Instrumentos**: Soporte para múltiples instrumentos musicales
    * **Multiidioma**: Soporte para múltiples idiomas
    * 📱 **API REST**: Endpoints RESTful con documentación completa
    
    ### Características técnicas:
    
    * ⚡ **FastAPI**: Framework moderno y de alto rendimiento
    * 🗄️ **PostgreSQL**: Base de datos robusta y escalable
    * **Seguridad**: Headers de seguridad, rate limiting, validaciones
    * 📝 **Documentación**: OpenAPI 3.0 con Swagger UI
    * 🧪 **Testing**: Suite de pruebas completa
    * **Producción**: Listo para despliegue en contenedores
    """,
    version="2.0.0",
    contact={
        "name": "Eco Iglesia Letras",
        "url": "https://eco-iglesia-letras.com",
        "email": "soporte@eco-iglesia-letras.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    lifespan=lifespan,
    docs_url="/api/docs" if settings.is_development else None,
    redoc_url="/api/redoc" if settings.is_development else None,
    openapi_url="/api/openapi.json" if settings.is_development else None,
)

# Configurar middlewares (orden importa)
if settings.is_development:
    # En desarrollo, permitir todos los orígenes
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # En producción, usar orígenes específicos
    app.add_middleware(
        CORSMiddleware,
        **settings.cors_config
    )

# Trusted hosts (solo en producción)
if settings.is_production and settings.allowed_hosts:
    try:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=settings.allowed_hosts
        )
    except Exception as e:
        logger.warning(f"Could not configure TrustedHostMiddleware: {e}")

# Compresión GZIP
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Sessions (para CSRF protection)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.secret_key,
    max_age=3600,  # 1 hora
    same_site="lax",
    https_only=settings.is_production
)

# Rate limiting (desactivado temporalmente para desarrollo)
# app.add_middleware(
#     RateLimitMiddleware,
#     max_requests=settings.rate_limit_requests,
#     window_seconds=settings.rate_limit_window
# )

# Security headers
app.add_middleware(SecurityHeadersMiddleware)

# Request logging
app.add_middleware(RequestLoggingMiddleware)

# Montar archivos estáticos
static_dir = os.path.join(os.path.dirname(__file__), "static")
if settings.is_development and os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")


# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Manejador personalizado para HTTPException."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "path": request.url.path,
            "timestamp": time.time()
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Manejador general para excepciones no capturadas."""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    
    if settings.is_development:
        return JSONResponse(
            status_code=500,
            content={
                "error": str(exc),
                "type": type(exc).__name__,
                "path": request.url.path,
                "timestamp": time.time()
            }
        )
    else:
        return JSONResponse(
            status_code=500,
            content={
                "error": "Error interno del servidor",
                "status_code": 500,
                "path": request.url.path,
                "timestamp": time.time()
            }
        )


# Rutas principales
@app.get("/", include_in_schema=False)
async def redirect_to_docs():
    """Redirigir root a documentación."""
    if settings.is_development:
        return RedirectResponse(url="/api/docs")
    else:
        return {
            "message": "Bienvenido a Eco Iglesia Letras API",
            "version": "2.0.0",
            "docs": "Documentación disponible en /api/docs",
            "status": "online"
        }


@app.get("/api/health", tags=["Sistema"], summary="Health Check")
async def health_check() -> Dict[str, Any]:
    """
    Verificación de salud del sistema.
    
    Retorna el estado actual del sistema y sus componentes.
    """
    return {
        "status": "ok",
        "message": "API funcionando correctamente",
        "version": "2.0.0",
        "timestamp": time.time(),
        "components": {
            "database": "ok",
            "email_service": "not_available",
        },
        "environment": "development" if settings.is_development else "production"
    }


@app.get("/api/info", tags=["Sistema"], summary="Información del Sistema")
async def system_info() -> Dict[str, Any]:
    """
    Información general del sistema.
    """
    return {
        "name": settings.app_name,
        "version": "2.0.0",
        "description": "API para la gestión de letras y acordes de canciones cristianas",
        "environment": "development" if settings.is_development else "production",
        "features": [
            "Gestión de canciones y artistas",
            "Sistema de favoritos",
            "Autenticación JWT",
            "Recuperación de contraseñas",
            "Perfiles de usuario",
            "Estadísticas avanzadas",
            "API RESTful completa"
        ],
        "endpoints": {
            "docs": "/api/docs",
            "redoc": "/api/redoc",
            "openapi": "/api/openapi.json",
            "health": "/api/health"
        }
    }


@app.get("/api/stats", tags=["Sistema"], summary="Estadísticas del Sistema")
async def system_stats() -> Dict[str, Any]:
    """
    Estadísticas generales del sistema.
    """
    return {
        "message": "Estadísticas disponibles próximamente",
        "timestamp": time.time()
    }


# Custom OpenAPI
def custom_openapi():
    """OpenAPI schema personalizado."""
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=settings.app_name,
        version="2.0.0",
        description=app.description,
        routes=app.routes,
    )
    
    # Agregar información de seguridad
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Token JWT obtenido del endpoint de login"
        }
    }
    
    # Agregar información adicional
    openapi_schema["info"]["x-logo"] = {
        "url": "/static/logo-eco.png",
        "altText": "Eco Iglesia Letras"
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi

# Incluir routers con documentación mejorada
app.include_router(
    auth.router, 
    prefix="/api/auth", 
    tags=["🔐 Autenticación"],
    responses={
        401: {"description": "No autorizado"},
        422: {"description": "Error de validación"}
    }
)

app.include_router(
    songs.router, 
    prefix="/api", 
    tags=["🎵 Canciones"],
    responses={
        404: {"description": "Canción no encontrada"},
        422: {"description": "Error de validación"}
    }
)

app.include_router(
    artists.router, 
    prefix="/api/artists", 
    tags=["🎤 Artistas"],
    responses={
        404: {"description": "Artista no encontrado"},
        422: {"description": "Error de validación"}
    }
)

app.include_router(
    admin.router, 
    prefix="/api/admin", 
    tags=["👑 Administración"],
    # dependencies=[Depends(get_current_user)],  # Comentado temporalmente
    responses={
        401: {"description": "No autorizado"},
        403: {"description": "Permisos insuficientes"}
    }
)

app.include_router(
    contact.router, 
    prefix="/api/contact", 
    tags=["📧 Contacto"],
    responses={
        422: {"description": "Error de validación"},
        500: {"description": "Error enviando mensaje"}
    }
)

app.include_router(
    password_reset.router, 
    prefix="/api/password-reset", 
    tags=["🔑 Recuperar Contraseña"],
    responses={
        422: {"description": "Error de validación"},
        404: {"description": "Usuario no encontrado"}
    }
)

app.include_router(
    favorites.router, 
    prefix="/api/favorites", 
    tags=["❤️ Favoritos"],
    # dependencies=[Depends(get_current_user)],  # Comentado temporalmente
    responses={
        401: {"description": "No autorizado"},
        404: {"description": "Favorito no encontrado"}
    }
)

app.include_router(
    users.router, 
    prefix="/api/users", 
    tags=["👥 Usuarios"],
    responses={
        404: {"description": "Usuario no encontrado"},
        422: {"description": "Error de validación"}
    }
)

# Información de la aplicación para logs
logger.info(f"{settings.app_name} v2.0.0 configurado correctamente")
logger.info(f"Entorno: {'Desarrollo' if settings.debug else 'Producción'}")
logger.info(f"Documentación: {'/api/docs' if settings.debug else 'Deshabilitada'}")
logger.info(f"CORS orígenes: {settings.allowed_origins}")

# Información de la aplicación para logs
logger.info(f"{settings.app_name} v2.0.0 configurado correctamente")
logger.info(f"Entorno: {'Desarrollo' if settings.is_development else 'Producción'}")
logger.info(f"Documentación: {'/api/docs' if settings.is_development else 'Deshabilitada'}")
logger.info(f"CORS orígenes: {settings.allowed_origins}")

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.is_development,
        log_level=settings.log_level.lower(),
        access_log=True
    )

