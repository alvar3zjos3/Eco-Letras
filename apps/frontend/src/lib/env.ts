/**
 * Variables de entorno adaptables para desarrollo local y producción
 */

// Detectar el entorno
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// URLs del backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// URLs dinámicas según el entorno
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Cliente: usar la URL actual del navegador
    return window.location.origin;
  }
  
  // Servidor: usar variable de entorno o localhost
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

// Configuración de CORS para desarrollo
export const CORS_ORIGINS = [
  'http://localhost:3000',
  'https://ecoiglesialetras.com',
  'https://www.ecoiglesialetras.com'
];

// Headers para requests al backend
export const getApiHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

export default {
  isDevelopment,
  isProduction,
  API_BASE_URL,
  getBaseUrl,
  CORS_ORIGINS,
  getApiHeaders,
};
