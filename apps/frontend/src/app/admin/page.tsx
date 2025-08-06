'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/api-service';
import { User } from '@/types';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        setError('');
        const userData = await authService.getMe();
        setUser(userData);
      } catch (error: any) {
        console.error('Error al verificar autenticación:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          router.push('/login');
        } else {
          setError('Error al verificar la autenticación');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-24 w-24 border-b-4 border-primary mx-auto"></div>
          </div>
          <p className="mt-6 text-foreground font-medium">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-24 w-24 border-b-4 border-primary mx-auto"></div>
          </div>
          <p className="mt-6 text-foreground font-medium">Cargando...</p>
          {error && (
            <div className="mt-6 p-4 glass-card border border-red-500/30 rounded-xl backdrop-blur-sm shadow-xl">
              <p className="text-red-300 font-medium">{error}</p>
              <Button 
                variant="outline" 
                className="mt-3 border-red-500/30 text-red-300 hover:bg-red-500/10 hover:border-red-400 transition-all duration-300" 
                onClick={() => window.location.reload()}
              >
                Reintentar
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!user.is_admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6 fade-in">
          <div className="glass-card border border-red-500/30 rounded-2xl p-8 backdrop-blur-sm shadow-2xl hover:border-red-500/50 transition-all duration-300">
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-red-500/25">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13-9.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-red-600/20 rounded-2xl blur-xl opacity-50"></div>
            </div>
            <h2 className="text-red-300 text-2xl font-bold mb-3">Acceso Denegado</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              No tienes permisos de administrador para acceder a esta página.
            </p>
            <Button 
              onClick={() => router.push('/')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
            >
              Volver al Inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

