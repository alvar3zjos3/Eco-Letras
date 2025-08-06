'use client';

import { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertTriangle } from 'lucide-react';
import { authService } from '@/lib/api-service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'invalidEmail'>('idle');
  const [error, setError] = useState<string | null>(null);
  // Estado para simular carga inicial
  const [isLoading, setIsLoading] = useState(true);

  // Simula un pequeño retardo de carga para UX consistente
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Validación simple de email
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Maneja el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setStatus('invalidEmail');
      setError('Introduce un correo válido.');
      return;
    }

    setStatus('loading');

    try {
      await authService.requestPasswordReset(email);
      setStatus('success');
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        'No se pudo enviar el correo. Intenta de nuevo.'
      );
      setStatus('error');
    }
  };

  // Loader inicial (recarga simulada)
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

  return (
    <div className="w-full min-h-screen text-foreground overflow-hidden smooth-transition fade-in">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg"></div>
            <Mail className="relative w-16 h-16 text-primary mx-auto" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-gradient">
            Recuperar contraseña
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Te ayudamos a recuperar el acceso a tu cuenta
          </p>
        </div>

        {/* Formulario */}
        <div className="max-w-md mx-auto">
          <div className="glass-card shadow-2xl interactive-hover">
            <div className="p-8 space-y-6">
              
              {status === 'success' ? (
                <div className="text-center space-y-6">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
                    <CheckCircle2 className="relative w-24 h-24 text-primary mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold text-gradient">
                    ¡Revisa tu correo!
                  </h3>
                  <div className="bg-green-500/10 border border-green-400/30 text-green-300 px-6 py-4 rounded-lg">
                    <p className="text-muted-foreground">
                      Si el correo existe en nuestra base de datos, recibirás un enlace para restablecer tu contraseña.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6" aria-label="Formulario de recuperación de contraseña">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                      Correo electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="tucorreo@ejemplo.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all duration-300 outline-none"
                    />
                  </div>
                  
                  {(error || status === 'invalidEmail') && (
                    <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-red-300">
                        <div className="relative">
                          <div className="absolute inset-0 bg-red-500/30 rounded-full blur-sm"></div>
                          <AlertTriangle className="relative w-5 h-5" />
                        </div>
                        <span className="text-sm">{error || 'Introduce un correo válido.'}</span>
                      </div>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full btn-gradient text-white font-medium py-3 px-6 rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Enviando...
                      </span>
                    ) : (
                      'Enviar instrucciones'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}