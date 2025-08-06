// Representa un usuario registrado en la plataforma
export interface User {
  id: number;                    // ID único del usuario
  email: string;                 // Correo electrónico
  username: string;              // Nombre de usuario
  full_name?: string;            // Nombre completo (opcional)
  avatar_url?: string;           // Foto de perfil (opcional, permite delete)
  musical_tastes?: string;       // Gustos musicales (opcional)
  favorite_artists?: string;     // Artistas favoritos (opcional)
  instagram?: string;            // Instagram (opcional)
  twitter?: string;              // Twitter/X (opcional)
  facebook?: string;             // Facebook (opcional)
  youtube_url?: string;          // URL de YouTube (opcional)
  is_active?: boolean;           // ¿Está activo el usuario? (deprecated, usar is_verified)
  is_admin: boolean;             // ¿Es administrador?
  is_musician?: boolean;         // ¿Es músico?
  is_verified: boolean;          // ¿Está verificado por email?
  role?: string;                 // Rol del usuario (admin, user, etc.)
  status?: string;               // Estado del usuario (active, inactive, etc.)
  created_at: string;            // Fecha de creación
  updated_at?: string;           // Fecha de última actualización (opcional)
  last_login?: string;           // Último login (opcional)
}

// Representa un artista musical
export interface Artist {
  id: number;                    // ID único del artista
  name: string;                  // Nombre del artista
  slug: string;                  // Slug para URLs amigables
  biography?: string;            // Biografía (opcional)
  description?: string;          // Descripción corta (opcional)
  country?: string;              // País de origen (opcional)
  city?: string;                 // Ciudad de origen (opcional)
  genre?: string;                // Género musical (opcional)
  foundation_year?: number;      // Año de fundación/inicio (opcional)
  website_url?: string;          // URL del sitio web oficial (opcional)
  facebook_url?: string;         // URL de Facebook (opcional)
  instagram_url?: string;        // URL de Instagram (opcional)
  youtube_url?: string;          // URL de YouTube (opcional)
  spotify_url?: string;          // URL de Spotify (opcional)
  twitter_url?: string;          // URL de Twitter (opcional)
  verified?: boolean;            // ¿Artista verificado? (opcional)
  is_active?: boolean;           // ¿Está activo? (opcional)
  views?: number;                // Número de visualizaciones del perfil (opcional)
  created_at: string;            // Fecha de creación
  updated_at?: string;           // Fecha de última actualización (opcional)
  songs?: Song[];                // Lista de canciones asociadas al artista (opcional)
}

// Representa una sección de la letra de la canción (ej: verso, coro, etc.)
export interface SongSection {
  type: "intro" | "verso" | "precoro" | "coro" | "puente" | "repetir" | "refrain" | "final" | "instrumental" | "solo";
  text: string;
  chords_lyrics: string;
}

// Representa una canción en la plataforma
export interface Song {
  id: number;                    // ID único de la canción
  title: string;                 // Título de la canción
  slug: string;                  // Slug para URLs amigables
  lyrics: string;                // Letra completa (legacy, usar sections en frontend)
  sections?: SongSection[];      // Secciones de la canción (intro, verso, coro, etc.)
  chords_lyrics?: string;        // Acordes y letra alternados (para vista de acordes)
  key_signature?: string;        // Tonalidad de la canción (opcional)
  tempo?: string;                // Tempo (opcional)
  genre?: string;                // Género musical (opcional)
  language?: string;             // Idioma de la canción (opcional)
  status?: string;               // Estado de publicación (opcional)
  youtube_url?: string;          // URL de YouTube (opcional)
  spotify_url?: string;          // URL de Spotify (opcional)
  views: number;                 // Número de vistas
  likes?: number;                // Número de likes (opcional)
  likes_count?: number;          // Número de likes (legacy) (opcional)
  favorites_count?: number;      // Número de favoritos (opcional)
  artist_id: number;             // ID del artista
  created_at: string;            // Fecha de creación
  updated_at?: string;           // Fecha de última actualización (opcional)
  artist?: Artist;               // Objeto artista (opcional, para relaciones)
}

// Payload para login de usuario
export interface LoginRequest {
  username: string;              // Nombre de usuario
  password: string;              // Contraseña
}

// Solicitud de registro - Sincronizado exactamente con UserCreate del backend
export interface RegisterRequest {
  email: string;                    // Correo electrónico
  username: string;                 // Nombre de usuario
  password: string;                 // Contraseña
  full_name: string;                // Nombre completo (ahora obligatorio)
  accept_terms: boolean;            // Acepta términos y condiciones
  accept_privacy: boolean;          // Acepta política de privacidad

  // Campos del flujo multi-paso
  account_type: string;             // Tipo de cuenta: 'personal' o 'organization'
  user_role?: string | null;        // Rol del usuario (opcional)
  organization_type?: string | null; // Tipo de organización (opcional)
  organization_name?: string | null; // Nombre de la organización (opcional)
  organization_size?: string | null; // Tamaño de organización (opcional)
  instruments?: string[];           // Instrumentos que toca (opcional)
  musical_level?: string | null;    // Nivel musical (opcional)
}

// Respuesta de autenticación (token JWT)
export interface TokenResponse {
  access_token: string;          // Token de acceso
  token_type: string;            // Tipo de token (ej: "bearer")
}

// Estadísticas para el panel de administración
export interface AdminStats {
  total_songs: number;           // Total de canciones
  total_artists: number;         // Total de artistas
  total_users: number;           // Total de usuarios
  total_views: number;           // Total de vistas
  new_users_last_30_days: number; // Nuevos usuarios en 30 días
  new_songs_last_30_days: number; // Nuevas canciones en 30 días
  top_songs: Array<{
    id: number;                  // ID de la canción
    title: string;               // Título de la canción
    slug: string;                // Slug de la canción
    views: number;               // Vistas de la canción
    artist: string;              // Nombre del artista
  }>;
  top_artists: Array<{
    name: string;                // Nombre del artista
    song_count: number;          // Número de canciones del artista
  }>;
}

// Para cambiar contraseña
export interface PasswordUpdateRequest {
  old_password: string;
  password: string;
}

// Para cambiar correo
export interface ChangeEmailRequest {
  email: string;
}

// Para historial de actividad
export interface UserActivity {
  action: string;
  date: string;
  ip: string;
}

// Para eliminar cuenta (si necesitas algún payload)
export interface DeleteAccountRequest {
  password: string; // si pides confirmación de contraseña
}

// Respuesta del registro de usuario
export interface RegisterResponse {
  message: string;
  email: string;
  verification_required: boolean;
}
