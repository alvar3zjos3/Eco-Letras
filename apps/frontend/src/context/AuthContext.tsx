"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

type AuthContextType = {
  isAuthenticated: boolean;
  setAuthenticated: (v: boolean) => void;
  user: User | null;
  setUser: (u: User | null) => void;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setAuthenticated: () => { },
  user: null,
  setUser: () => { },
  isLoading: true,
  login: async () => { },
  logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(0);

  // Función para obtener el usuario actual (con debounce)
  const fetchUser = async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetch < 5000) {
      // No hacer fetch si se hizo uno hace menos de 5 segundos
      return;
    }
    setLastFetch(now);

    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    setAuthenticated(!!token);
    if (token) {
      try {
        const { authService } = await import('@/lib/api-service');
        const userData = await authService.getMe();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        localStorage.removeItem('access_token');
        setUser(null);
        setAuthenticated(false);
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  // Función login que guarda el token y actualiza el usuario
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    const { authService } = await import('@/lib/api-service');
    const res = await authService.login({ username, password });
    localStorage.setItem('access_token', res.access_token);
    await fetchUser(true); // Force fetch after login
  };

  // Función logout
  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setAuthenticated(false);
  };

  useEffect(() => {
    // Solo hacer fetch inicial
    fetchUser(true);

    const onStorage = (e: StorageEvent) => {
      // Solo reaccionar a cambios en access_token
      if (e.key === 'access_token') {
        const hasToken = !!e.newValue;
        setAuthenticated(hasToken);
        if (!hasToken) {
          setUser(null);
        } else {
          fetchUser(true);
        }
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setAuthenticated,
        user,
        setUser,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}