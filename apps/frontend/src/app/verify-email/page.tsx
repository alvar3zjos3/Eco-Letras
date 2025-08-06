'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Loader inicial

  // Loader inicial para UX consistente
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!token) {
      setStatus('error');
      setMessage('No se encontró el token de verificación.');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const verifyUrl = `${apiUrl}/api/auth/verify-email?token=${token}`;

    fetch(verifyUrl)
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          setStatus('success');
          setMessage('¡Tu correo ha sido verificado correctamente! Ya puedes iniciar sesión.');
        } else {
          const data = await res.json();
          setStatus('error');
          setMessage(data.detail || 'El enlace no es válido o ha expirado.');
        }
      })
      .catch((error) => {
        setStatus('error');
        setMessage('Ocurrió un error al verificar tu correo. Verifica tu conexión a internet.');
      });
  }, [token, isLoading]);

  // Loader inicial (recargando)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-foreground overflow-hidden">
        <div className="text-center relative z-10 fade-in">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-32 w-32 border-4 border-transparent border-t-primary border-r-primary mx-auto"></div>
          </div>
          <p className="text-muted-foreground text-xl font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground overflow-hidden smooth-transition fade-in">
      <div className="flex items-center justify-center min-h-screen px-4 relative z-10">
        <div
          className="glass-card shadow-2xl interactive-hover p-8 rounded-lg w-full max-w-md text-center fade-in"
          aria-live="polite"
        >
          {status === 'loading' && (
            <>
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg"></div>
                <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto relative z-10 drop-shadow-lg" />
              </div>
              <h2 className="text-2xl font-bold text-gradient mb-4">
                Verificando correo...
              </h2>
              <p className="text-muted-foreground">Por favor espera un momento.</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-green-500/30 rounded-full blur-lg"></div>
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto relative z-10 drop-shadow-lg" />
              </div>
              <h2 className="text-2xl font-bold text-gradient mb-4">
                ¡Correo verificado!
              </h2>
              <p className="text-muted-foreground mb-6">{message}</p>
              <Link
                href="/login"
                className="btn-gradient inline-block text-white font-medium px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
              >
                Iniciar sesión
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-500/30 rounded-full blur-lg"></div>
                <AlertTriangle className="w-16 h-16 text-red-400 mx-auto relative z-10 drop-shadow-lg" />
              </div>
              <h2 className="text-2xl font-bold text-gradient mb-4">
                Error al verificar
              </h2>
              <p className="text-muted-foreground mb-6">{message}</p>
              <Link
                href="/"
                className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
              >
                Ir al inicio
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen text-foreground flex items-center justify-center p-4 overflow-hidden smooth-transition fade-in">
        <div className="glass-card shadow-2xl p-8 w-full max-w-md text-center fade-in">
          <div className="flex justify-center mb-6">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gradient mb-4">
            Cargando...
          </h1>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}