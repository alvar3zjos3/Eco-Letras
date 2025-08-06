/**
 * Configuración de URLs dinámicas para desarrollo y producción
 */
import { getBaseUrl, isDevelopment } from './env';

// URLs base para diferentes entornos
const PRODUCTION_DOMAIN = 'https://ecoiglesialetras.com';

// URL base actual (dinámicamente detectada)
export const BASE_URL = isDevelopment ? getBaseUrl() : PRODUCTION_DOMAIN;

// URLs específicas para SEO y Schema.org
export const SITE_CONFIG = {
  name: 'Eco Iglesia Letras',
  description: 'Letras y acordes de música cristiana y canciones de iglesia',
  baseUrl: BASE_URL,
  
  // Generar URL completa para una ruta
  getUrl: (path: string) => `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`,
  
  // URLs específicas
  urls: {
    home: BASE_URL,
    songs: `${BASE_URL}/canciones`,
    artists: `${BASE_URL}/artistas`,
    song: (slug: string) => `${BASE_URL}/cancion/${slug}`,
    artist: (slug: string) => `${BASE_URL}/artista/${slug}`,
  }
};

// Configuración de metadatos por defecto
export const DEFAULT_METADATA = {
  title: 'Eco Iglesia Letras - Letras y Acordes de Música Cristiana',
  description: 'Encuentra letras y acordes de tus canciones cristianas favoritas. Música de adoración, alabanza e himnos para la iglesia.',
  keywords: ['música cristiana', 'letras', 'acordes', 'adoración', 'alabanza', 'himnos', 'iglesia'],
  author: 'Eco Iglesia Letras',
  language: 'es-ES',
  robots: 'index, follow',
};

export default SITE_CONFIG;
