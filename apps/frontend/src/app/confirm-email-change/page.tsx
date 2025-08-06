'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';

function ConfirmEmailChangeForm() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de confirmación no válido');
      return;
    }

    const confirmEmailChange = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/confirm-email-change?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStatus('success');
          setMessage(data.msg || 'Tu correo electrónico ha sido actualizado correctamente.');
        } else {
          const errorData = await response.json();
          setStatus('error');
          setMessage(errorData.detail || 'No se pudo confirmar el cambio de correo.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Error de conexión. Por favor, intenta más tarde.');
      }
    };

    confirmEmailChange();
  }, [token]);

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
                    Confirmando cambio de correo...
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Por favor espera mientras procesamos tu solicitud.
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
                    ¡Correo confirmado!
                  </h1>
                  <div className="bg-green-500/10 border border-green-400/30 text-green-300 px-6 py-4 rounded-lg mb-6">
                    <p className="text-muted-foreground mb-3">
                      {message}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-primary text-sm">
                      <Mail className="w-4 h-4" />
                      <span>Tu nuevo correo electrónico está ahora activo</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <button
                      onClick={() => router.push('/login')}
                      className="w-full btn-gradient text-white font-medium py-3 px-6 rounded-lg shadow-lg transition-all duration-300"
                    >
                      Iniciar sesión
                    </button>
                    <button
                      onClick={() => router.push('/')}
                      className="w-full bg-background/50 border border-border text-foreground hover:bg-background/80 font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Volver al inicio
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
                    <p className="text-muted-foreground mb-3">
                      {message}
                    </p>
                    <p className="text-red-400 text-sm">
                      El enlace puede haber expirado o ser inválido. Si necesitas cambiar tu correo, 
                      solicita un nuevo cambio desde tu perfil.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <button
                      onClick={() => router.push('/login')}
                      className="w-full btn-gradient text-white font-medium py-3 px-6 rounded-lg shadow-lg transition-all duration-300"
                    >
                      Iniciar sesión
                    </button>
                    <button
                      onClick={() => router.push('/')}
                      className="w-full bg-background/50 border border-border text-foreground hover:bg-background/80 font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Volver al inicio
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

export default function ConfirmEmailChangePage() {
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
                Preparando la confirmación de cambio de correo...
              </p>
            </div>
          </div>
        </div>
      </div>
    }>
      <ConfirmEmailChangeForm />
    </Suspense>
  );
}