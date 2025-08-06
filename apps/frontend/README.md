# Eco Iglesia Letras - Frontend

Aplicación web frontend para la plataforma de letras de canciones de adoración **Eco Iglesia Letras**, construida con [Next.js](https://nextjs.org) 15.3.4.

## 🎵 Acerca del Proyecto

Eco Iglesia Letras es una plataforma dedicada a proporcionar letras de canciones de adoración y música cristiana. El frontend ofrece una experiencia moderna y optimizada para buscar, visualizar y gestionar canciones y artistas.

### ✨ Características Principales

- 🎨 **Interfaz Moderna**: Diseño limpio y responsivo con Tailwind CSS
- 🔍 **Búsqueda Avanzada**: Búsqueda inteligente de canciones y artistas
- 👤 **Perfiles de Artistas**: Páginas dedicadas con biografías y discografías
- 🎵 **Gestión de Canciones**: Visualización detallada de letras, acordes y metadatos
- ❤️ **Favoritos**: Sistema de canciones favoritas para usuarios registrados
- 🔐 **Autenticación**: Sistema completo de login, registro y verificación por email
- 🛡️ **Panel de Administración**: Dashboard completo para administradores
- 📱 **Responsive**: Optimizado para dispositivos móviles y desktop
- 🎨 **Componentes UI**: Biblioteca de componentes consistente con Shadcn/ui

## 🚀 Comenzar

### Prerrequisitos

- Node.js 18+
- npm, yarn, pnpm o bun
- Backend API ejecutándose en `http://localhost:8000`

### Instalación

1. **Instalar dependencias:**

```bash
npm install
# o
yarn install
# o
pnpm install
```

1. **Configurar variables de entorno:**

```bash
# Crear archivo .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

1. **Ejecutar el servidor de desarrollo:**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

1. **Abrir en el navegador:**

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.

### Desarrollo

- La aplicación se recarga automáticamente al editar archivos
- Los componentes principales están en `src/components/`
- Las páginas están en `src/app/` (App Router de Next.js)
- Los tipos TypeScript están en `src/types/`
- La configuración de la API está en `src/lib/`
- El contexto de autenticación está en `src/context/AuthContext.tsx`

## 🛠️ Tecnologías Utilizadas

- **Framework**: Next.js 15.3.4 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Estado**: React Hooks + Context API (AuthContext)
- **HTTP Client**: Fetch API nativo
- **Validación**: Zod (para formularios)
- **Iconos**: Lucide React
- **Gestión de Estado**: React Context para autenticación

## 📦 Estructura del Proyecto

```text
src/
├── app/                # Páginas (App Router)
│   ├── admin/         # Panel de administración
│   ├── artista/       # Perfiles de artistas
│   ├── cancion/       # Páginas de canciones
│   ├── canciones/     # Listado de canciones
│   ├── artistas/      # Listado de artistas
│   ├── login/         # Autenticación
│   ├── register/      # Registro de usuarios
│   ├── perfil-usuario/ # Perfil del usuario
│   ├── acerca/        # Página acerca de
│   ├── contacto/      # Página de contacto
│   └── globals.css    # Estilos globales
├── components/        # Componentes reutilizables
│   ├── admin/        # Componentes del panel admin
│   ├── ui/           # Componentes base de UI (Shadcn)
│   └── Navigation.tsx # Navegación principal
├── context/          # Context providers de React
│   └── AuthContext.tsx # Contexto de autenticación
├── lib/              # Utilidades y configuración
│   ├── api-service.ts # Cliente de API
│   └── utils.ts      # Utilidades generales
└── types/            # Definiciones de tipos TypeScript
    └── index.ts      # Tipos principales (User, Song, Artist, etc.)
```

## 🔌 API Integration

El frontend se comunica con el backend FastAPI a través de:

- **Base URL**: `http://localhost:8000`
- **Endpoints principales**:
  - `/api/auth/token` - Autenticación (login)
  - `/api/auth/register` - Registro de usuarios
  - `/api/auth/me` - Información del usuario actual
  - `/api/songs` - Gestión de canciones
  - `/api/artists` - Gestión de artistas
  - `/api/favorites` - Sistema de favoritos
  - `/api/admin` - Endpoints de administración

### Autenticación

El sistema utiliza JWT tokens:

- Los tokens se almacenan en `localStorage`
- Se incluyen automáticamente en las peticiones
- El contexto `AuthContext` maneja el estado de autenticación
- Renovación automática al refrescar la página

## 📱 Características Responsive

La aplicación está optimizada para:

- 📱 **Móviles**: 320px - 768px
- 📟 **Tablets**: 768px - 1024px
- 💻 **Desktop**: 1024px+

## 🔍 Funcionalidades Clave

### Páginas Principales

- **Home** (`/`): Página principal con canciones destacadas
- **Artistas** (`/artistas`): Listado de artistas con búsqueda
- **Canciones** (`/canciones`): Catálogo de canciones con filtros
- **Perfil Artista** (`/artista/[slug]`): Página individual del artista
- **Canción** (`/cancion/[slug]`): Página individual de la canción con letras
- **Login/Registro** (`/login`, `/register`): Sistema de autenticación
- **Perfil de Usuario** (`/perfil-usuario`): Gestión del perfil personal
- **Panel Admin** (`/admin`): Dashboard de administración (solo admins)

### Roles y Permisos

- **Usuario Regular**: Puede ver canciones, crear favoritos, editar perfil
- **Administrador**: Acceso completo al panel de administración
  - Gestión de canciones (crear, editar, eliminar)
  - Gestión de artistas (crear, editar, eliminar)
  - Administración de usuarios

### Componentes Clave

- **Navigation**: Navegación principal responsiva con enlaces condicionales según rol
- **AuthContext**: Contexto de autenticación global
- **SongCard**: Tarjeta de previsualización de canción
- **ArtistCard**: Tarjeta de previsualización de artista
- **AdminDashboard**: Panel de administración completo
- **FavoriteButton**: Botón para agregar/quitar favoritos

## 🚀 Despliegue

### Build de Producción

```bash
npm run build
npm start
```

### Variables de Entorno para Producción

```bash
NEXT_PUBLIC_API_URL=https://api.eco-iglesia-letras.com
```

### Comandos Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter
- `npm run type-check` - Verifica los tipos de TypeScript

## 🧪 Testing y Desarrollo

### Configuración de VS Code

El proyecto incluye configuración para VS Code:

- Tasks para iniciar backend y frontend automáticamente
- Configuración de TypeScript
- Extensiones recomendadas

### Usuario Administrador de Prueba

Para testing, existe un usuario administrador:

- **Email**: `admin@ecoiglesialetras.es`
- **Contraseña**: (contactar al administrador del sistema)
- **Funcionalidades**: Acceso completo al panel de administración

## 📚 Documentación y Recursos

Para aprender más sobre las tecnologías utilizadas:

- [Next.js Documentation](https://nextjs.org/docs) - Funcionalidades y API de Next.js
- [Learn Next.js](https://nextjs.org/learn) - Tutorial interactivo de Next.js
- [Tailwind CSS](https://tailwindcss.com/docs) - Framework de CSS utilitario
- [Shadcn/ui](https://ui.shadcn.com/) - Componentes de UI reutilizables
- [TypeScript](https://www.typescriptlang.org/docs/) - Documentación de TypeScript
- [React Context](https://react.dev/reference/react/useContext) - Documentación de Context API

## 🤝 Contribución

Este proyecto es parte del sistema Eco Iglesia Letras. Para contribuir:

1. Fork el repositorio
1. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
1. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
1. Push a la rama (`git push origin feature/AmazingFeature`)
1. Abre un Pull Request

### Estándares de Código

- Usar TypeScript para todo el código
- Seguir las convenciones de ESLint
- Componentes funcionales con hooks
- Nombres descriptivos para variables y funciones
- Comentarios en español para documentación

## 📄 Licencia

Proyecto desarrollado para Eco Iglesia Letras.

---

**Eco Iglesia Letras** - Conectando corazones a través de la música de adoración 🎵
