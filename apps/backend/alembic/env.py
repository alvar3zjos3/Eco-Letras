"""
Configuración de entorno para migraciones Alembic
Eco Iglesia Letras API - Versión Profesional

Integrado con el sistema de configuración de la aplicación
para usar variables de entorno y configuración unificada.
"""

import sys
from logging.config import fileConfig
from pathlib import Path
from typing import Any, Optional, Dict

from sqlalchemy import engine_from_config, pool
from alembic import context

# Agregar el directorio raíz al path para importar módulos de la app
sys.path.append(str(Path(__file__).parent.parent))

try:
    # Importar configuración de la aplicación
    from app.core.config import settings
    from app.core.database import Base
except ImportError as e:
    # Si no se puede importar la configuración, usar valores por defecto
    print(f"Warning: Could not import app configuration: {e}")
    print("Using default database URL from alembic.ini")
    settings = None
    Base = None

# Importar todos los modelos para asegurar que estén registrados
# Estos imports son necesarios para que SQLAlchemy detecte los modelos
def import_models() -> None:
    """Importar todos los modelos para registro en SQLAlchemy."""
    try:
        # Importar explícitamente cada modelo para que SQLAlchemy los detecte
        import app.models.user
        import app.models.artist  
        import app.models.song
        import app.models.favorite_songs
        import app.models.activity
        
        # Asegurar que las variables no se optimicen
        _ = (app.models.user, app.models.artist, app.models.song, 
            app.models.favorite_songs, app.models.activity)
        
    except ImportError as e:
        print(f"Warning: Could not import some models: {e}")
        print("Some models may not be included in migrations")

# Ejecutar la importación de modelos
import_models()

# Configuración de Alembic
config = context.config

# Configurar logging si el archivo ini está disponible
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadatos de los modelos para autogenerate
target_metadata = Base.metadata if Base is not None else None

# Sobrescribir la URL de la base de datos desde la configuración de la app
if settings is not None:
    config.set_main_option("sqlalchemy.url", settings.database_url)


def include_object(object: Any, name: Optional[str], type_: str, reflected: bool, compare_to: Any) -> bool:
    """
    Función para filtrar objetos durante autogenerate.
    
    Permite excluir ciertas tablas o columnas de las migraciones automáticas.
    
    Args:
        object: El objeto de SQLAlchemy
        name: Nombre del objeto (tabla, columna, etc.)
        type_: Tipo de objeto ('table', 'column', 'index', etc.)
        reflected: Si el objeto fue reflejado desde la base de datos
        compare_to: Objeto con el cual se está comparando
        
    Returns:
        bool: True si el objeto debe incluirse en la migración
    """
    # Si el nombre es None, incluir el objeto
    if name is None:
        return True
        
    # Excluir tablas temporales o de sistema
    if type_ == "table" and name.startswith('_'):
        return False
    
    # Excluir tablas de Alembic
    if type_ == "table" and name == "alembic_version":
        return False
    
    # Incluir todo lo demás
    return True


def get_engine_config() -> Dict[str, Any]:
    """Obtener configuración del motor de base de datos."""
    base_config = config.get_section(config.config_ini_section, {})
    
    # Si tenemos acceso a settings, usar la URL de ahí
    if settings is not None:
        base_config['sqlalchemy.url'] = settings.database_url
    
    return {
        **base_config,
        # No incluir parámetros de pool para NullPool
        'sqlalchemy.pool_pre_ping': True,
        'sqlalchemy.pool_recycle': 3600,
    }


def run_migrations_offline() -> None:
    """
    Ejecutar migraciones en modo 'offline'.
    
    Configura el contexto solo con una URL sin crear un Engine.
    Las llamadas a context.execute() emiten la cadena dada a la salida del script.
    """
    # Obtener URL de la configuración o usar la por defecto
    if settings is not None:
        url = settings.database_url
    else:
        url = config.get_main_option("sqlalchemy.url")
    
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
        render_as_batch=True,  # Para compatibilidad con SQLite
        include_object=include_object,
        # Configuraciones adicionales para mejor detección de cambios
        include_schemas=False,
        user_module_prefix='app.models.',
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Ejecutar migraciones en modo 'online'.
    
    Crea un Engine y asocia una conexión con el contexto.
    Utiliza la configuración de la aplicación para parámetros de conexión.
    """
    # Configurar el motor con la configuración de la aplicación
    configuration = get_engine_config()
    
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
            render_as_batch=True,  # Para compatibilidad con SQLite
            include_object=include_object,
            # Configuraciones adicionales para mejor detección de cambios
            include_schemas=False,
            user_module_prefix='app.models.',
            # Configuración de transacciones
            transaction_per_migration=True,
        )

        with context.begin_transaction():
            context.run_migrations()


# Ejecutar migraciones según el modo
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
