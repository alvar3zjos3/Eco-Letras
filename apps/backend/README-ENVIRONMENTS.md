# 🚀 Eco Iglesia Letras API - Configuraciones de Entorno

Este directorio contiene múltiples configuraciones de entorno para diferentes casos de uso.

## 📁 Archivos de Configuración Disponibles

### 🔧 `.env` (Principal)

- **Uso**: Configuración activa actual
- **Descripción**: Este es el archivo que lee la aplicación
- **Gestión**: Se cambia automáticamente con `env_manager.py`

### 🛠️ `.env.example` (Desarrollo - SQLite)

- **Uso**: Desarrollo local básico
- **Base de datos**: SQLite (no requiere PostgreSQL)
- **Características**:
  - Debug habilitado
  - Configuración mínima
  - Perfecto para empezar

### 🐘 `.env.postgres` (PostgreSQL - Producción)

- **Uso**: Desarrollo avanzado y producción
- **Base de datos**: PostgreSQL
- **Características**:
  - Configuración completa de producción
  - SSL/TLS habilitado
  - Backup automático
  - Performance optimizada
  - Monitoring habilitado

### 📖 `.env.postgres.example` (Documentación)

- **Uso**: Plantilla documentada para PostgreSQL
- **Descripción**: Incluye explicaciones de todas las variables
- **Características**:
  - Comentarios detallados
  - Valores de ejemplo
  - Notas de seguridad

### 🧪 `.env.testing` (Testing)

- **Uso**: Pruebas automatizadas
- **Base de datos**: SQLite en memoria
- **Características**:
  - Configuración optimizada para testing
  - Timeouts reducidos
  - Email deshabilitado
  - Logs detallados

## 🔄 Gestión de Configuraciones

### Usar el Script de Gestión

```bash
# Ver configuraciones disponibles
python env_manager.py list

# Cambiar a configuración de desarrollo
python env_manager.py switch --env dev

# Cambiar a configuración PostgreSQL
python env_manager.py switch --env postgres

# Crear archivo de testing
python env_manager.py create-testing

# Cambiar a configuración de testing
python env_manager.py switch --env testing
```

### Cambio Manual

```bash
# Copiar configuración específica
cp .env.postgres .env

# O para desarrollo
cp .env.example .env
```

## 🗂️ Configuraciones por Entorno

### 🔵 Desarrollo Avanzado (PostgreSQL)

```bash
python env_manager.py switch --env postgres
```

**Requisitos:**

- PostgreSQL instalado y ejecutándose
- Base de datos `eco_iglesia_letras` creada
- Usuario `eco` con permisos

**Características:**

- ✅ Base de datos real
- ✅ Performance mejorada
- ✅ Configuración de producción
- ✅ Funcionalidades completas

### 🟡 Testing

```bash
python env_manager.py create-testing
python env_manager.py switch --env testing
```

**Características:**

- ✅ Base de datos en memoria
- ✅ Configuración aislada
- ✅ Timeouts reducidos
- ✅ Logs detallados

### 🔴 Producción

```bash
# Editar .env.postgres con valores reales
nano .env.postgres

# Aplicar configuración
python env_manager.py switch --env production
```

**Requisitos:**

- PostgreSQL configurado
- SSL/TLS certificados
- Redis para cache
- Backup configurado

## 🔒 Variables de Seguridad Críticas

### ⚠️ Cambiar OBLIGATORIAMENTE en Producción

```bash
# Generar nueva SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(64))"

# Configurar en .env.postgres
SECRET_KEY=tu_clave_generada_aqui
```

### 🛡️ Configuraciones de Seguridad

1. **Base de Datos**:

   ```bash
   DATABASE_URL=postgresql://usuario:contraseña_segura@host/db
   ```

2. **CORS** (solo dominios permitidos):

   ```bash
   ALLOWED_ORIGINS=["https://tu-dominio.com"]
   ```

3. **Email SMTP**:

   ```bash
   EMAIL_USER=tu_email@dominio.com
   EMAIL_PASS=contraseña_de_aplicacion
   ```

## 🚀 Comandos de Inicio

### Desarrollo con SQLite

```bash
python env_manager.py switch --env dev
uvicorn run:app --reload
```

### Desarrollo con PostgreSQL

```bash
python env_manager.py switch --env postgres
uvicorn run:app --reload
```

### Testing

```bash
python env_manager.py switch --env testing
pytest
```

### Producción

```bash
python env_manager.py switch --env production
gunicorn run:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 📊 Monitoreo y Logs

### Ver Logs en Tiempo Real

```bash
tail -f app.log
```

### Health Check

```bash
curl http://localhost:8000/api/health
```

### Métricas (si están habilitadas)

```bash
curl http://localhost:8000/api/metrics
```

## 🆘 Solución de Problemas

### Error de Base de Datos

```bash
# Verificar PostgreSQL
pg_isready -h localhost -p 5432

# Crear base de datos si no existe
createdb eco_iglesia_letras
```

### Error de Dependencias

```bash
# Reinstalar dependencias
pip install -r requirements.txt
```

### Error de Permisos

```bash
# Dar permisos al script
chmod +x env_manager.py
```

## 📚 Documentación Adicional

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [PostgreSQL Setup](https://postgresql.org/docs/)
- [Pydantic Settings](https://docs.pydantic.dev/usage/settings/)

---

💡 **Tip**: Siempre usa `env_manager.py` para cambiar configuraciones. Esto asegura que se mantengan backups y que la configuración sea consistente.
