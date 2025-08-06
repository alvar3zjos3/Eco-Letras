'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { authService } from '@/lib/api-service';
import { useAuth } from '@/context/AuthContext';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string) {
  // Al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
}

export default function RegisterPage() {
  const router = useRouter();
  const { setAuthenticated } = useAuth();
  // Estado del formulario - Sincronizado exactamente con UserCreate del backend
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    accept_terms: false,
    accept_privacy: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loader inicial
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Loader inicial para UX consistente
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    // Validaciones - Sincronizadas con el backend
    if (!validateEmail(formData.email)) {
      setError('El correo electrónico no es válido');
      setIsLoading(false);
      return;
    }
    if (formData.username.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      setIsLoading(false);
      return;
    }
    if (!validatePassword(formData.password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.');
      setIsLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }
    if (!formData.accept_terms) {
      setError('Debe aceptar los términos y condiciones');
      setIsLoading(false);
      return;
    }
    if (!formData.accept_privacy) {
      setError('Debe aceptar la política de privacidad');
      setIsLoading(false);
      return;
    }

    try {
      // Enviar datos exactos que espera el backend
      const result = await authService.register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        full_name: formData.full_name || '',
        accept_terms: formData.accept_terms,
        accept_privacy: formData.accept_privacy,
      });

      setSuccess(true); // Mostrar mensaje de éxito
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(
        error.response?.data?.detail ||
        'Error al crear la cuenta. Intenta con otros datos.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Loader inicial (recargando)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen particles-bg relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="text-center relative z-10 fade-in">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-32 w-32 border-4 border-transparent border-t-purple-400 border-r-blue-400 mx-auto"></div>
          </div>
          <p className="text-foreground text-xl font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen particles-bg relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute -bottom-40 right-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-8 fade-in">
          <div className="text-center relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <UserPlus className="w-16 h-16 text-purple-400 mx-auto mb-6 drop-shadow-lg" />
              <h2 className="text-4xl font-bold text-gradient mb-4">
                Crear Cuenta
              </h2>
              <p className="text-xl text-foreground/80">
                Únete a la comunidad de Eco Iglesia Letras
              </p>
            </div>
          </div>

        <Card className="glass-card shadow-2xl hover:shadow-purple-500/25 smooth-transition">
          <CardHeader>
            <CardTitle className="flex items-center justify-center text-foreground text-xl">
              <div className="relative mr-3">
                <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-lg"></div>
                <UserPlus className="w-5 h-5 relative z-10 text-purple-300" />
              </div>
              Registro de Usuario
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Completa los datos para crear tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="bg-green-500/20 border border-green-400/30 text-green-300 px-4 py-3 rounded-lg text-center glass-card">
                ¡Cuenta creada correctamente!<br />
                Revisa tu correo y haz clic en el enlace de verificación para activar tu cuenta.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" aria-label="Formulario de registro">
                {error && (
                  <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg glass-card">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                  </div>
                )}

                <div>
                  <Label htmlFor="email" className="text-foreground/90">Correo electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    className="mt-1 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50 smooth-transition"
                  />
                </div>

                <div>
                  <Label htmlFor="username" className="text-foreground/90">Nombre de usuario</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Elige un nombre de usuario único"
                    className="mt-1 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50 smooth-transition"
                  />
                </div>

                <div>
                  <Label htmlFor="full_name" className="text-foreground/90">Nombre completo (opcional)</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    autoComplete="name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                    className="mt-1 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50 smooth-transition"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-foreground/90">Contraseña</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Crea una contraseña segura"
                      className="pr-10 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50 smooth-transition"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground smooth-transition"
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-foreground/90">Confirmar contraseña</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repite tu contraseña"
                      className="pr-10 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50 smooth-transition"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground smooth-transition"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <input
                      id="accept_terms"
                      name="accept_terms"
                      type="checkbox"
                      checked={formData.accept_terms}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 text-primary bg-input border-border rounded focus:ring-primary/50 focus:ring-2"
                      required
                    />
                    <Label htmlFor="accept_terms" className="text-sm leading-5 text-foreground/80">
                      Acepto los{" "}
                      <Link href="/terminos" className="text-primary hover:text-primary/80 underline smooth-transition">
                        términos y condiciones
                      </Link>
                      {" "}(requerido)
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      id="accept_privacy"
                      name="accept_privacy"
                      type="checkbox"
                      checked={formData.accept_privacy}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 text-primary bg-input border-border rounded focus:ring-primary/50 focus:ring-2"
                      required
                    />
                    <Label htmlFor="accept_privacy" className="text-sm leading-5 text-foreground/80">
                      Acepto la{" "}
                      <Link href="/privacidad" className="text-primary hover:text-primary/80 underline smooth-transition">
                        política de privacidad
                      </Link>
                      {" "}(requerido)
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full btn-gradient text-primary-foreground font-medium py-3 px-6 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/login" className="font-medium text-primary hover:text-primary/80 smooth-transition">
                  Inicia sesión aquí
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

