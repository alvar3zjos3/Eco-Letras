'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Loader inicial
  const [isSubmitting, setIsSubmitting] = useState(false); // Loader de submit
  const [error, setError] = useState('');
  const [urlMessage, setUrlMessage] = useState('');

  // Loader inicial para UX consistente y obtener mensaje de URL
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 600);
    
    // Obtener mensaje de la URL si existe
    const message = searchParams.get('message');
    if (message) {
      setUrlMessage(decodeURIComponent(message));
    }
    
    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error && e.target.value !== '') {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.username) {
      setError('El nombre de usuario es obligatorio');
      setIsSubmitting(false);
      return;
    }
    if (!formData.password) {
      setError('La contraseña es obligatoria');
      setIsSubmitting(false);
      return;
    }

    try {
      await login(formData.username, formData.password); // <-- usa el login del contexto
      router.push('/');
    } catch (error: any) {
      setError(
        error.response?.data?.detail ||
        'Error al iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loader inicial (recarga simulada)
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center fade-in">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-24 w-24 border-b-4 border-primary mx-auto"></div>
          </div>
          <p className="text-foreground text-xl font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden smooth-transition">
      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-8 fade-in">
          <div className="text-center relative">
            <div className="relative z-10">
              <LogIn className="w-16 h-16 text-primary mx-auto mb-6 drop-shadow-lg" />
              <h2 className="text-4xl font-bold text-gradient mb-4">
                Iniciar Sesión
              </h2>
              <p className="text-xl text-muted-foreground">
                Accede a tu cuenta de Eco Iglesia Letras
              </p>
            </div>
          </div>

        <Card className="glass-card shadow-2xl interactive-hover">
          <CardHeader>
            <CardTitle className="flex items-center justify-center text-primary text-xl">
              <div className="relative mr-3">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg"></div>
                <LogIn className="w-5 h-5 relative z-10 text-primary" />
              </div>
              Bienvenido de vuelta
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Ingresa tus credenciales para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" aria-label="Formulario de inicio de sesión">
              {urlMessage && (
                <div className="bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 px-4 py-3 rounded-lg glass-card flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">Eliminación de cuenta programada</p>
                    <p className="text-sm">{urlMessage}</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg glass-card">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              <div className="form-floating">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder=" "
                  className="bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
                />
                <Label htmlFor="username" className="text-foreground/70">Nombre de usuario</Label>
              </div>

              <div className="form-floating">
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder=" "
                    className="pr-12 bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
                  />
                  <Label htmlFor="password" className="text-foreground/70">Contraseña</Label>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors z-10"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 smooth-transition font-medium">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="btn-gradient w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="w-5 h-5" />
                    Iniciar Sesión
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center border-t border-border/30 pt-6">
              <p className="text-muted-foreground">
                ¿No tienes una cuenta?{' '}
                <Link 
                  href="/register" 
                  className="font-semibold text-primary hover:text-primary/80 smooth-transition inline-flex items-center gap-1 group"
                >
                  Regístrate aquí
                  <span className="group-hover:translate-x-1 smooth-transition">→</span>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 smooth-transition">
        <div className="glass-card w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <LogIn className="w-16 h-16 text-primary animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Cargando...
          </h1>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
