import axios from 'axios';
import { API_ENDPOINTS } from './api';
import { User, Song, Artist, LoginRequest, RegisterRequest, TokenResponse, AdminStats } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRoute = error.config?.url?.includes('/auth/token');

    if (error.response?.status === 401 && !isLoginRoute) {
      localStorage.removeItem('access_token');
      window.location.href = '/login'; // Solo redirige si NO es el login
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    const response = await api.post(API_ENDPOINTS.LOGIN, formData);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await api.post(API_ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get(API_ENDPOINTS.ME);
    return response.data;
  },

  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    const response = await api.post(API_ENDPOINTS.PASSWORD_RESET_REQUEST, { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await api.post(API_ENDPOINTS.PASSWORD_RESET_CONFIRM, { token, new_password: password });
    return response.data;
  },
};

export const songsService = {
  getSongs: async (params?: {
    skip?: number;
    limit?: number;
    search?: string;
    artist_id?: number;
    genre?: string;
    key_signature?: string;
  }): Promise<Song[]> => {
    const response = await api.get(API_ENDPOINTS.SONGS, { params });
    let data: Song[] = response.data;
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      data = data.filter(song =>
        song.title.toLowerCase().includes(searchLower) ||
        song.lyrics?.toLowerCase().includes(searchLower)
      );
    }
    return data;
  },

  getSongBySlug: async (slug: string): Promise<Song> => {
    const response = await api.get(API_ENDPOINTS.SONG_BY_SLUG(slug));
    return response.data;
  },

  getSongById: async (id: number): Promise<Song> => {
    const response = await api.get(`${API_ENDPOINTS.SONGS}/id/${id}`);
    return response.data;
  },

  createSong: async (songData: Partial<Song>): Promise<Song> => {
    const response = await api.post(API_ENDPOINTS.SONGS, songData);
    return response.data;
  },

  updateSong: async (id: number, songData: Partial<Song>): Promise<Song> => {
    const response = await api.put(`${API_ENDPOINTS.SONGS}/${id}`, songData);
    return response.data;
  },

  deleteSong: async (id: number): Promise<void> => {
    const response = await api.delete(`${API_ENDPOINTS.SONGS}/${id}`);
    return response.data;
  },

  // Nuevas funciones disponibles en el backend
  getSongCount: async (params?: {
    search?: string;
    artist_id?: number;
    genre?: string;
    key_signature?: string;
  }): Promise<number> => {
    const response = await api.get(`${API_ENDPOINTS.SONGS}/count`, { params });
    return response.data.count;
  },

  getGenres: async (): Promise<string[]> => {
    const response = await api.get(`${API_ENDPOINTS.SONGS}/genres`);
    return response.data.genres;
  },

  getKeySignatures: async (): Promise<string[]> => {
    const response = await api.get(`${API_ENDPOINTS.SONGS}/keys`);
    return response.data.keys;
  },

  getSongStats: async (songId: number): Promise<{
    views: number;
    likes: number;
    downloads: number;
    shares: number;
    popularity_score: number;
  }> => {
    const response = await api.get(`${API_ENDPOINTS.SONGS}/${songId}/stats`);
    return response.data;
  },

  getAdminStats: async (): Promise<{
    total_songs: number;
    total_artists: number;
    total_users: number;
    total_views: number;
    new_users_last_30_days: number;
    new_songs_last_30_days: number;
    top_songs: Array<{
      id: number;
      title: string;
      views: number;
      artist: { name: string };
    }>;
    top_artists: Array<{
      name: string;
      song_count: number;
    }>;
  }> => {
    const response = await api.get('/api/admin/stats');
    return response.data;
  },

  getFeaturedSongs: async (limit: number = 10): Promise<Song[]> => {
    // Usar canciones populares en lugar del sistema de destacadas eliminado
    const response = await api.get(`${API_ENDPOINTS.SONGS}/popular`, { params: { limit, period: 'all' } });
    return response.data;
  },

  getPopularSongs: async (days?: number): Promise<Song[]> => {
    const params = days ? { days } : {};
    const response = await api.get(`${API_ENDPOINTS.SONGS}/popular`, { params });
    return response.data;
  },
};

export const artistsService = {
  getArtists: async (params?: {
    skip?: number;
    limit?: number;
    search?: string;
    verified_only?: boolean;
    has_songs?: boolean;
  }): Promise<Artist[]> => {
    const response = await api.get(API_ENDPOINTS.ARTISTS, { params });
    return response.data;
  },

  searchArtists: async (query: string, limit: number = 10): Promise<Array<{
    id: number;
    name: string;
    slug: string;
    verified: boolean;
    song_count: number;
  }>> => {
    const response = await api.get(`${API_ENDPOINTS.ARTISTS}/search`, {
      params: { q: query, limit }
    });
    return response.data;
  },

  getArtistStats: async (): Promise<{
    total_artists: number;
    verified_artists: number;
    artists_with_songs: number;
    top_artist: {
      name: string;
      song_count: number;
    } | null;
  }> => {
    const response = await api.get(`${API_ENDPOINTS.ARTISTS}/stats`);
    return response.data;
  },

  getArtistBySlug: async (slug: string): Promise<Artist & { songs: Song[] }> => {
    const artistResponse = await api.get(API_ENDPOINTS.ARTIST_BY_SLUG(slug));
    const artist = artistResponse.data;
    
    // Obtener las canciones del artista
    try {
      const songsResponse = await api.get(`${API_ENDPOINTS.ARTIST_BY_SLUG(slug)}/songs`);
      return {
        ...artist,
        songs: songsResponse.data.songs || []
      };
    } catch (error) {
      // Si no puede obtener las canciones, devolver el artista sin canciones
      console.warn(`No se pudieron cargar las canciones del artista ${slug}:`, error);
      return {
        ...artist,
        songs: []
      };
    }
  },

  createArtist: async (artistData: Partial<Artist>): Promise<Artist> => {
    const { 
      name, biography, description, country, city, genre, foundation_year,
      website_url, facebook_url, instagram_url, twitter_url, youtube_url, spotify_url,
      verified, is_active 
    } = artistData;

    const formattedData = {
      name,
      biography: biography || undefined,
      description: description || undefined,
      country: country || undefined,
      city: city || undefined,
      genre: genre || undefined,
      foundation_year: foundation_year || undefined,
      website_url: website_url || undefined,
      facebook_url: facebook_url || undefined,
      instagram_url: instagram_url || undefined,
      twitter_url: twitter_url || undefined,
      youtube_url: youtube_url || undefined,
      spotify_url: spotify_url || undefined,
      verified: verified || false,
      is_active: is_active || true
    };

    const response = await api.post(API_ENDPOINTS.ARTISTS, formattedData);
    return response.data;
  },

  updateArtist: async (id: number, artistData: Partial<Artist>): Promise<Artist> => {
    const { 
      name, biography, description, country, city, genre, foundation_year,
      website_url, facebook_url, instagram_url, twitter_url, youtube_url, spotify_url,
      verified, is_active 
    } = artistData;

    const formattedData = {
      ...(name && { name }),
      ...(biography !== undefined && { biography }),
      ...(description !== undefined && { description }),
      ...(country !== undefined && { country }),
      ...(city !== undefined && { city }),
      ...(genre !== undefined && { genre }),
      ...(foundation_year !== undefined && { foundation_year }),
      ...(website_url !== undefined && { website_url }),
      ...(facebook_url !== undefined && { facebook_url }),
      ...(instagram_url !== undefined && { instagram_url }),
      ...(twitter_url !== undefined && { twitter_url }),
      ...(youtube_url !== undefined && { youtube_url }),
      ...(spotify_url !== undefined && { spotify_url }),
      ...(verified !== undefined && { verified }),
      ...(is_active !== undefined && { is_active })
    };

    const response = await api.put(`${API_ENDPOINTS.ARTISTS}/${id}`, formattedData);
    return response.data;
  },

  deleteArtist: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.ARTISTS}/${id}`);
  },
};

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get(API_ENDPOINTS.ADMIN_STATS);
    return response.data;
  },

  getUsers: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    is_verified?: boolean;
  }): Promise<{ users: User[]; total: number; pages: number }> => {
    const response = await api.get(API_ENDPOINTS.ADMIN_USERS, { params });
    const data = response.data;
    return {
      users: data.users,
      total: data.pagination.total,
      pages: data.pagination.pages
    };
  },

  getUserActivity: async (params?: {
    user_id?: number;
    page?: number;
    per_page?: number;
    days?: number;
  }): Promise<any> => {
    const response = await api.get(API_ENDPOINTS.ADMIN_ACTIVITY, { params });
    return response.data;
  },

  verifyUser: async (userId: number): Promise<{ message: string }> => {
    const response = await api.patch(`/api/admin/users/${userId}/verify`);
    return response.data;
  },

  deleteUser: async (userId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/api/admin/users/${userId}`);
    return response.data;
  },
};

export const favoritesService = {
  getUserFavorites: async (): Promise<Song[]> => {
    const response = await api.get(API_ENDPOINTS.FAVORITOS);
    return response.data;
  },

  addFavorite: async (songId: number): Promise<void> => {
    await api.post(API_ENDPOINTS.FAVORITO_BY_ID(songId));
  },

  removeFavorite: async (songId: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.FAVORITO_BY_ID(songId));
  },

  clearAllFavorites: async (): Promise<void> => {
    await api.delete(API_ENDPOINTS.FAVORITOS);
  },
};

export const userService = {
  updateUser: async (id: string | number, data: Partial<User>): Promise<User> => {
    const response = await api.put(API_ENDPOINTS.USER_BY_ID(id) + '/profile', data);
    return response.data;
  },

  updatePassword: async (userId: string, data: { old_password: string; new_password: string }) => {
    const response = await api.put(API_ENDPOINTS.USER_PASSWORD(userId), data);
    return response.data;
  },

  logoutAllSessions: async (userId: string | number) => {
    const response = await api.post(API_ENDPOINTS.USER_LOGOUT_ALL(userId));
    return response.data;
  },

  getActivity: async (userId: string | number) => {
    const response = await api.get(API_ENDPOINTS.USER_ACTIVITY(userId));
    return response.data;
  },

  resendVerificationEmail: async (userId: string | number) => {
    const response = await api.post(API_ENDPOINTS.USER_RESEND_VERIFICATION(userId));
    return response.data;
  },

  deleteAccount: async (userId: string | number) => {
    const response = await api.delete(API_ENDPOINTS.USER_BY_ID(userId));
    return response.data;
  },

  changeEmail: async (userId: string | number, email: string) => {
    const response = await api.put(API_ENDPOINTS.USER_BY_ID(userId) + '/change-email', { new_email: email });
    return response.data;
  },
};

export const contactService = {
  getContactTypes: async (): Promise<{ types: Record<string, string>; default: string }> => {
    const response = await api.get('/api/contact/types');
    return response.data;
  },

  submitContactForm: async (formData: {
    nombre: string;
    email: string;
    asunto: string;
    tipo: string;
    mensaje: string;
    telefono?: string;
  }): Promise<{ success: boolean; message: string; contact_id?: string }> => {
    const response = await api.post('/api/contact/', formData);
    return response.data;
  },
};

export default api;
