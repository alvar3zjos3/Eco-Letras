'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

function ConfirmDeletionForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Token de confirmación no válido.');
      return;
    }

    // Aquí harías la llamada al backend para confirmar la eliminación
    confirmDeletion(token);
  }, [searchParams]);

  const confirmDeletion = async (token: string) => {
    try {
      // Llamada al backend para confirmar la eliminación
      const response = await fetch(`http://localhost:8000/api/auth/confirm-account-deletion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatus('success');
        setMessage(data.msg || 'Tu cuenta ha sido programada para eliminación. Se eliminará automáticamente en las próximas 24 horas.');
      } else {
        const data = await response.json();
        if (response.status === 400 && data.detail?.includes('expirado')) {
          setStatus('expired');
          setMessage('El enlace de confirmación ha expirado. Por favor, solicita una nueva eliminación desde tu perfil.');
        } else {
          setStatus('error');
          setMessage(data.detail || 'No se pudo confirmar la eliminación de la cuenta.');
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error de conexión. Por favor, inténtalo más tarde.');
    }
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="w-full min-h-screen text-foreground overflow-hidden smooth-transition fade-in">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
        <div className="max-w-md mx-auto">
          <div className="glass-card shadow-2xl interactive-hover">
            <div className="p-8 space-y-6">
              
              {status === 'loading' && (
                <div className="text-center">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative animate-spin rounded-full h-24 w-24 border-b-4 border-primary mx-auto"></div>
                  </div>
                  <h1 className="text-4xl font-bold mb-4 text-gradient">
                    Confirmando eliminación...
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Procesando tu solicitud de eliminación de cuenta.
                  </p>
                </div>
              )}

              {status === 'success' && (
                <div className="text-center">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
                    <CheckCircle className="relative w-24 h-24 text-primary mx-auto" />
                  </div>
                  <h1 className="text-4xl font-bold mb-4 text-gradient">
                    Eliminación confirmada
                  </h1>
                  <div className="bg-green-500/10 border border-green-400/30 text-green-300 px-6 py-4 rounded-lg mb-6">
                    <p className="text-muted-foreground">
                      {message}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <button
                      onClick={handleGoHome}
                      className="w-full btn-gradient text-white font-medium py-3 px-6 rounded-lg shadow-lg transition-all duration-300"
                    >
                      Ir al inicio
                    </button>
                    <div className="bg-blue-500/10 border border-blue-400/30 text-blue-300 px-4 py-3 rounded-lg">
                      <p className="text-sm">
                        ¿Cambiaste de opinión? <br />
                        <span className="text-primary font-medium">
                          Inicia sesión antes de 24 horas para cancelar la eliminación
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {status === 'expired' && (
                <div className="text-center">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-yellow-500/30 rounded-full blur-xl animate-pulse"></div>
                    <AlertTriangle className="relative w-24 h-24 text-yellow-400 mx-auto" />
                  </div>
                  <h1 className="text-4xl font-bold mb-4 text-gradient">
                    Enlace expirado
                  </h1>
                  <div className="bg-yellow-500/10 border border-yellow-400/30 text-yellow-300 px-6 py-4 rounded-lg mb-6">
                    <p className="text-muted-foreground">
                      {message}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <button
                      onClick={handleGoToLogin}
                      className="w-full btn-gradient text-white font-medium py-3 px-6 rounded-lg shadow-lg transition-all duration-300"
                    >
                      Iniciar sesión
                    </button>
                    <button
                      onClick={handleGoHome}
                      className="w-full bg-background/50 border border-border text-foreground hover:bg-background/80 font-medium py-3 px-6 rounded-lg transition-all duration-300"
                    >
                      Ir al inicio
                    </button>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="text-center">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl animate-pulse"></div>
                    <XCircle className="relative w-24 h-24 text-red-400 mx-auto" />
                  </div>
                  <h1 className="text-4xl font-bold mb-4 text-gradient">
                    Error de confirmación
                  </h1>
                  <div className="bg-red-500/10 border border-red-400/30 text-red-300 px-6 py-4 rounded-lg mb-6">
                    <p className="text-muted-foreground">
                      {message}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <button
                      onClick={handleGoToLogin}
                      className="w-full btn-gradient text-white font-medium py-3 px-6 rounded-lg shadow-lg transition-all duration-300"
                    >
                      Iniciar sesión
                    </button>
                    <button
                      onClick={handleGoHome}
                      className="w-full bg-background/50 border border-border text-foreground hover:bg-background/80 font-medium py-3 px-6 rounded-lg transition-all duration-300"
                    >
                      Ir al inicio
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmAccountDeletionPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen text-foreground overflow-hidden smooth-transition fade-in">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
          <div className="max-w-md mx-auto">
            <div className="glass-card shadow-2xl p-8 text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
                <div className="relative animate-spin rounded-full h-24 w-24 border-b-4 border-primary mx-auto"></div>
              </div>
              <h1 className="text-4xl font-bold mb-4 text-gradient">
                Cargando...
              </h1>
              <p className="text-muted-foreground">
                Preparando la confirmación de eliminación...
              </p>
            </div>
          </div>
        </div>
      </div>
    }>
      <ConfirmDeletionForm />
    </Suspense>
  );
}
