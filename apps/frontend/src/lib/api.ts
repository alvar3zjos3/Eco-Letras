const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/token`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  ME: `${API_BASE_URL}/api/auth/me`,

  // Password Reset
  PASSWORD_RESET_REQUEST: `${API_BASE_URL}/api/password-reset/request`,
  PASSWORD_RESET_CONFIRM: `${API_BASE_URL}/api/password-reset/confirm`,
  PASSWORD_RESET_VERIFY: `${API_BASE_URL}/api/password-reset/verify`,

  // Songs
  SONGS: `${API_BASE_URL}/api/songs`,
  SONG_BY_SLUG: (slug: string) => `${API_BASE_URL}/api/songs/${slug}`,

  // Artists
  ARTISTS: `${API_BASE_URL}/api/artists`,
  ARTIST_BY_SLUG: (slug: string) => `${API_BASE_URL}/api/artists/${slug}`,

  // Admin
  ADMIN_STATS: `${API_BASE_URL}/api/admin/stats`,
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_ACTIVITY: `${API_BASE_URL}/api/admin/activity`,

  // Favoritos
  FAVORITOS: `${API_BASE_URL}/api/favorites/`,
  FAVORITO_BY_ID: (songId: number) => `${API_BASE_URL}/api/favorites/${songId}`,

  // Usuarios
  USER_BY_ID: (userId: string | number) => `${API_BASE_URL}/api/users/${userId}`,
  USER_PASSWORD: (userId: string | number) => `${API_BASE_URL}/api/users/${userId}/password`,
  USER_LOGOUT_ALL: (userId: string | number) => `${API_BASE_URL}/api/users/${userId}/logout-all`,
  USER_ACTIVITY: (userId: string | number) => `${API_BASE_URL}/api/users/${userId}/activity`,
  USER_RESEND_VERIFICATION: (userId: string | number) => `${API_BASE_URL}/api/users/${userId}/resend-verification`,
};

export default API_BASE_URL;

