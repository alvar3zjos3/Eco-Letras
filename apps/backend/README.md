# Eco Iglesia Letras - Backend API

Una plataforma moderna para la gestión de letras y acordes cristianos, construida con FastAPI, PostgreSQL y Redis.

## 🚀 Características

- **API REST completa** con FastAPI
- **Autenticación JWT** segura
- **Base de datos PostgreSQL** con SQLAlchemy ORM
- **Cache Redis** para rendimiento optimizado
- **Migraciones automáticas** con Alembic
- **Validación de datos** con Pydantic v2
- **Documentación automática** con Swagger/OpenAPI
- **Logging profesional** con rotación de archivos
- **Rate limiting** y middleware de seguridad
- **Dockerización completa** para desarrollo y producción
- **Backup automático** de base de datos
- **Configuración multi-entorno**

## 📋 Requisitos

- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+ (para desarrollo local)
- Redis 7+ (para cache)

## 🔧 Instalación

### Desarrollo Local

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd eco-iglesia-letras/apps/backend
```

1. **Configurar entorno virtual**

```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

1. **Configurar variables de entorno**

```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

1. **Ejecutar migraciones**

```bash
alembic upgrade head
```

1. **Iniciar servidor de desarrollo**

```bash
python run.py
```

### Desarrollo con Docker

1. **Iniciar servicios de desarrollo**

```bash
docker-compose up -d
```

1. **Ejecutar migraciones**

```bash
docker-compose exec backend alembic upgrade head
```

1. **Ver logs**

```bash
docker-compose logs -f backend
```

## 🐳 Despliegue con Docker

### Desarrollo

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver estado de servicios
docker-compose ps

# Ver logs
docker-compose logs -f [servicio]
```

### Producción

1. **Configurar entorno de producción**

```bash
cp .env.production .env.prod
# Editar .env.prod con configuraciones de producción
```

1. **Despliegue automatizado**

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh production
```

1. **Despliegue manual**

```bash
# Usar docker-compose de producción
docker-compose -f docker-compose.prod.yml up -d
```

## 🗄️ Base de Datos

### Migraciones

```bash
# Crear nueva migración
alembic revision --autogenerate -m "descripción del cambio"

# Aplicar migraciones
alembic upgrade head

# Ver historial
alembic history

# Rollback
alembic downgrade -1
```

### Backup y Restauración

```bash
# Backup automático (ejecuta diariamente)
docker-compose exec backup /scripts/backup.sh

# Backup manual
docker-compose exec postgres pg_dump -U eco_user -d eco_iglesia > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U eco_user -d eco_iglesia < backup.sql
```

## 🔧 Configuración

### Variables de Entorno

El proyecto utiliza diferentes archivos de configuración según el entorno:

- `.env` - Desarrollo local
- `.env.postgres` - Desarrollo con PostgreSQL
- `.env.production` - Producción

#### Variables Principales

```env
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
POSTGRES_DB=eco_iglesia
POSTGRES_USER=eco
POSTGRES_PASSWORD=secure_password

# Redis
REDIS_URL=redis://localhost:6379/0

# Seguridad
SECRET_KEY=your-super-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Configuración de Nginx (Producción)

El archivo `nginx/nginx.prod.conf` incluye:

- SSL/TLS automático
- Rate limiting
- Compresión GZIP
- Headers de seguridad
- Proxy reverso optimizado

## 📊 API Endpoints

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios

- `GET /api/users/me` - Perfil actual
- `PUT /api/users/me` - Actualizar perfil
- `GET /api/users/{id}` - Obtener usuario

### Canciones

- `GET /api/songs` - Listar canciones
- `POST /api/songs` - Crear canción
- `GET /api/songs/{id}` - Obtener canción
- `PUT /api/songs/{id}` - Actualizar canción
- `DELETE /api/songs/{id}` - Eliminar canción

### Artistas

- `GET /api/artists` - Listar artistas
- `POST /api/artists` - Crear artista
- `GET /api/artists/{id}` - Obtener artista
- `PUT /api/artists/{id}` - Actualizar artista

### Favoritos

- `GET /api/favorites` - Mis favoritos
- `POST /api/favorites` - Agregar favorito
- `DELETE /api/favorites/{song_id}` - Quitar favorito

### Administración

- `GET /api/admin/stats` - Estadísticas
- `GET /api/admin/users` - Gestión de usuarios
- `POST /api/admin/backup` - Backup manual

## 🧪 Testing

```bash
# Ejecutar tests
pytest

# Tests con cobertura
pytest --cov=app

# Tests específicos
pytest tests/test_auth.py

# Tests en Docker
docker-compose exec backend pytest
```

## 📝 Logs

Los logs se almacenan en:

- `logs/app.log` - Logs de aplicación
- `logs/access.log` - Logs de acceso
- `logs/error.log` - Logs de errores
- `logs/security.log` - Logs de seguridad

```bash
# Ver logs en tiempo real
tail -f logs/app.log

# Ver logs en Docker
docker-compose logs -f backend
```

## 🚨 Monitoreo

### Health Checks

- `GET /api/health` - Estado general
- `GET /api/health/db` - Estado de base de datos
- `GET /api/health/redis` - Estado de Redis

### Métricas

- `GET /api/metrics` - Métricas de aplicación

## 🔒 Seguridad

### Características de Seguridad

- Autenticación JWT con refresh tokens
- Rate limiting por IP
- CORS configurado
- Headers de seguridad HTTP
- Validación de entrada con Pydantic
- Logs de seguridad
- Encriptación de contraseñas con bcrypt

### Configuración HTTPS (Producción)

1. Obtener certificados SSL (Let's Encrypt recomendado)
2. Colocar certificados en `ssl/`
3. Configurar dominios en `nginx.prod.conf`

## 🛠️ Desarrollo

### Estructura del Proyecto

```text
app/
├── core/           # Configuración core
├── models/         # Modelos SQLAlchemy
├── schemas/        # Esquemas Pydantic
├── routers/        # Endpoints de API
├── services/       # Lógica de negocio
└── static/         # Archivos estáticos

scripts/            # Scripts de automatización
nginx/              # Configuración Nginx
redis/              # Configuración Redis
logs/               # Logs de aplicación
```

### Comandos de Desarrollo

```bash
# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Formatear código
black app/
isort app/

# Linting
flake8 app/
mypy app/

# Ejecutar servidor con recarga
uvicorn app.main:app --reload

# Abrir shell interactivo
python -c "from app.core.database import SessionLocal; db = SessionLocal()"
```

## 📚 Documentación API

Una vez ejecutándose, la documentación está disponible en:

- **Swagger UI**: <http://localhost:8000/docs>
- **ReDoc**: <http://localhost:8000/redoc>
- **OpenAPI JSON**: <http://localhost:8000/openapi.json>

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:

- Email: <contacto@eco-iglesia.com>
- GitHub Issues: [Crear issue](repository-url/issues)

---

Eco Iglesia Letras
