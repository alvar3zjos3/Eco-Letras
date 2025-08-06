"""
Punto de entrada para ejecutar el servidor FastAPI de desarrollo.

Este script inicia el servidor uvicorn con configuraciones optimizadas
para desarrollo local, incluyendo hot-reload y logging apropiado.
"""

import os
import uvicorn
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def main():
    """Ejecutar el servidor de desarrollo."""
    # Obtener configuraciones del entorno
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("ENVIRONMENT", "development") == "development"
    log_level = os.getenv("LOG_LEVEL", "info").lower()
    
    # Configuración del servidor
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload,
        log_level=log_level,
        access_log=True,
        use_colors=True,
        reload_dirs=["app"] if reload else None,
        reload_excludes=["*.pyc", "__pycache__", "*.log"] if reload else None
    )

if __name__ == "__main__":
    main()

