'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { authService } from '@/lib/api-service';

function validatePassword(password: string) {
  // Al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Loader inicial

  // Loader inicial para UX consistente
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validatePassword(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.');
      return;
    }

    setStatus('loading');
    try {
      if (!token) {
        throw new Error('Token de restablecimiento no válido');
      }

      await authService.resetPassword(token, password);
      setStatus('success');
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        'No se pudo restablecer la contraseña.'
      );
      setStatus('error');
    }
  };

  // Loader inicial (recargando)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-24 w-24 border-b-4 border-primary mx-auto"></div>
          </div>
          <p className="mt-6 text-foreground font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="w-full min-h-screen text-foreground overflow-hidden smooth-transition fade-in">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
          <div className="glass-card border border-red-500/30 shadow-2xl max-w-md mx-auto">
            <div className="text-center py-12 px-6">
              <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-6">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-red-500/30 rounded-full blur-lg"></div>
                  <AlertTriangle className="relative w-16 h-16 text-red-400 mx-auto" />
                </div>
                <h3 className="text-red-400 text-lg font-semibold mb-2">Token inválido</h3>
                <p className="text-muted-foreground">El enlace de recuperación no es válido o ha expirado.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen text-foreground overflow-hidden smooth-transition fade-in">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg"></div>
            <Lock className="relative w-16 h-16 text-primary mx-auto" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-gradient">
            Restablecer contraseña
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Ingresa tu nueva contraseña segura para recuperar el acceso a tu cuenta
          </p>
        </div>

        {/* Formulario */}
        <div className="max-w-md mx-auto">
          <div className="glass-card shadow-2xl interactive-hover">
            <form
              onSubmit={handleSubmit}
              className="p-8 space-y-6"
              autoComplete="off"
              aria-label="Formulario de restablecimiento de contraseña"
            >
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground" htmlFor="password">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={show ? 'text' : 'password'}
                    placeholder="Nueva contraseña"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 pr-10 bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all duration-300 outline-none"
                    autoFocus
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    onClick={() => setShow(v => !v)}
                    aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-300">
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500/30 rounded-full blur-sm"></div>
                      <AlertTriangle className="relative w-5 h-5" />
                    </div>
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full btn-gradient text-white font-medium py-3 px-6 rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Restableciendo...
                  </span>
                ) : (
                  'Restablecer contraseña'
                )}
              </button>

              {status === 'success' && (
                <div className="text-center space-y-4">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
                    <CheckCircle2 className="relative w-16 h-16 text-primary mx-auto" />
                  </div>
                  <div className="bg-green-500/10 border border-green-400/30 text-green-300 px-6 py-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-primary">
                      ¡Contraseña restablecida!
                    </h3>
                    <p className="text-muted-foreground">
                      Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}