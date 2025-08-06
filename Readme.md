# Eco Iglesia Letras Monorepo

## Manual de Despliegue Inicial (Primera vez)

### Requisitos Previos

- **Python 3.10+**
- **Node.js y npm** (para el frontend)
- **PostgreSQL** (instalado y corriendo)
- **Git**

---

### 1. Clona el repositorio

```sh
git clone https://github.com/tu-usuario/eco-iglesia-letras.git
cd eco-iglesia-letras
```

---

### 2. Configura la base de datos PostgreSQL

Abre tu cliente de PostgreSQL y ejecuta:

```sql
CREATE DATABASE eco_iglesia_letras;
CREATE USER eco WITH PASSWORD 'tu_contraseña';
GRANT ALL PRIVILEGES ON DATABASE eco_iglesia_letras TO eco;
```

---

### 3. Configura variables de entorno

En `apps/backend/.env` asegúrate de tener:

```sh
DATABASE_URL=postgresql://eco:tu_contraseña@localhost/eco_iglesia_letras
SECRET_KEY=tu-clave-secreta-muy-segura-aqui
ACCESS_TOKEN_EXPIRE_MINUTES=30

EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
FRONTEND_URL=http://localhost:3000
```

---

### 4. Instala dependencias del backend

```sh
cd apps/backend
python -m venv venv
# Quitar la restriccion
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# En Windows:
.\venv\Scripts\Activate
# En Linux/Mac:
# source venv/bin/activate

pip install -r requirements.txt
```

---

### 5. Aplica migraciones y agrega datos de ejemplo

```sh
alembic upgrade head
python seed_data.py
```

---

### 6. Instala dependencias del frontend

```sh
cd apps/frontend

# Tener instalado antes Nodes Js

npm install
```

---

### 7. Compila el frontend (opcional para producción)

```sh
npm run build
```

---

## Manual para solo iniciar el proyecto

### 1. Inicia el backend

```sh
cd apps/backend
# Activa el entorno virtual:
.\venv\Scripts\Activate
# Inicia el backend:
python run.py
```

---

### 2. Inicia el frontend

```sh
cd apps/frontend
npm run dev
```

---

**¡Listo! Tu proyecto debería estar corriendo. Visita `http://localhost:3000` para el frontend y `http://localhost:8000` para el backend.
