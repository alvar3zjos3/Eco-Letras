'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MapPin, Send, MessageCircle, HelpCircle, Bug, Globe, Instagram, Facebook } from 'lucide-react';
import { contactService } from '@/lib/api-service';

// Página de contacto - Solo UI y lógica de cliente. El SEO se maneja en layout.tsx de /contacto.
export default function ContactoPage() {
  // Estado del formulario - Sincronizado exactamente con ContactForm del backend
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    tipo: '',
    mensaje: '',
    telefono: '' // Campo opcional del backend
  });

  // Estado para envío y feedback al usuario
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'invalidEmail'>('idle');
  // Estado para simular carga inicial
  const [isLoading, setIsLoading] = useState(true);
  // Estado para tipos de contacto del backend
  const [contactTypes, setContactTypes] = useState<Record<string, string>>({});

  // Simula un pequeño retardo de carga para UX consistente y carga tipos de contacto
  useEffect(() => {
    const initializeData = async () => {
      try {
        const types = await contactService.getContactTypes();
        setContactTypes(types.types);
      } catch (error) {
        console.error('Error loading contact types:', error);
        // Fallback a tipos estáticos si falla la carga
        setContactTypes({
          consulta: "Consulta General",
          sugerencia: "Sugerencia",
          reporte: "Reporte de Error",
          colaboracion: "Colaboración",
          soporte: "Soporte Técnico",
          otro: "Otro"
        });
      } finally {
        setTimeout(() => setIsLoading(false), 600);
      }
    };
    
    initializeData();
  }, []);

  // Maneja cambios en los campos del formulario
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validación simple de email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('idle');

    // Validación de campos requeridos - Solo campos requeridos en el backend
    if (!formData.nombre.trim() || !formData.email.trim() || !formData.asunto.trim() || !formData.tipo || !formData.mensaje.trim()) {
      setSubmitStatus('error');
      return;
    }

    // Validación de email antes de enviar
    if (!isValidEmail(formData.email)) {
      setSubmitStatus('invalidEmail');
      return;
    }

    setIsSubmitting(true);

    try {
      // Usa el servicio de contacto del backend
      const response = await contactService.submitContactForm(formData);
      if (response.success) {
        setSubmitStatus('success');
        setFormData({
          nombre: '',
          email: '',
          asunto: '',
          tipo: '',
          mensaje: '',
          telefono: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error sending contact form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loader inicial
  if (isLoading) {
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
    <div className="w-full min-h-screen text-foreground overflow-hidden smooth-transition px-2 sm:px-6 lg:px-12 py-8 fade-in">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl mx-auto w-16 h-16"></div>
            <Mail className="relative w-16 h-16 text-primary mx-auto" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-gradient">
            Contáctanos
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Estamos aquí para ayudarte. Si tienes preguntas, sugerencias o necesitas soporte, 
            no dudes en ponerte en contacto con nosotros.
          </p>
        </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Información de Contacto */}
        <section className="lg:col-span-1" aria-label="Información de contacto">
          <Card className="mb-6 glass-card shadow-2xl interactive-hover">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg"></div>
                  <Mail className="relative w-5 h-5 text-primary" />
                </div>
                Información de Contacto
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Múltiples formas de comunicarte con nuestro equipo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dirección */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/30 rounded-full blur-sm"></div>
                  <MapPin className="relative w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Dirección</p>
                  <a
                    href="https://maps.app.goo.gl/LJbcSzRmVCLTRuPD8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Calle Estacion De Lorca S/N<br />
                    Alcantarilla, 30820
                  </a>
                </div>
              </div>
              {/* Redes sociales */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-pink-500/30 rounded-full blur-sm"></div>
                  <Instagram className="relative w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Instagram</p>
                  <a
                    href="https://www.instagram.com/ecoiglesiaes/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    @ecoiglesiaes
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600/30 rounded-full blur-sm"></div>
                  <Facebook className="relative w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Facebook</p>
                  <a
                    href="https://www.facebook.com/ecoiglesiaES/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    facebook.com/ecoiglesiaES
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/30 rounded-full blur-sm"></div>
                  <Globe className="relative w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Sitio Web</p>
                  <a
                    href="https://www.ecoiglesia.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    ecoiglesia.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Tipos de Consulta */}
          <Card className="glass-card shadow-2xl interactive-hover">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-lg"></div>
                  <HelpCircle className="relative w-5 h-5 text-purple-400" />
                </div>
                Tipos de Consulta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-sm"></div>
                  <HelpCircle className="relative w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Soporte Técnico</p>
                  <p className="text-sm text-muted-foreground">Problemas con la plataforma</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/30 rounded-full blur-sm"></div>
                  <MessageCircle className="relative w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Sugerencias</p>
                  <p className="text-sm text-muted-foreground">Ideas para mejorar el servicio</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/30 rounded-full blur-sm"></div>
                  <Bug className="relative w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Reporte de Error</p>
                  <p className="text-sm text-muted-foreground">Problemas o bugs encontrados</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-sm"></div>
                  <Mail className="relative w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Consulta General</p>
                  <p className="text-sm text-muted-foreground">Preguntas sobre el servicio</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500/30 rounded-full blur-sm"></div>
                  <MessageCircle className="relative w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Colaboración</p>
                  <p className="text-sm text-muted-foreground">Propuestas de colaboración</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Formulario de Contacto */}
        <section className="lg:col-span-2 space-y-8" aria-label="Formulario de contacto">
          <Card className="glass-card shadow-2xl interactive-hover">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2 text-base">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-lg"></div>
                  <Send className="relative w-4 h-4 text-blue-400" />
                </div>
                Envíanos un Mensaje
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Completa el formulario y te responderemos lo antes posible
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mensajes de feedback según el estado del envío */}
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-400/30 rounded-lg backdrop-blur-sm">
                  <p className="text-green-300 font-medium">
                    ¡Mensaje enviado exitosamente!
                  </p>
                  <p className="text-green-400 text-sm">
                    Te responderemos dentro de 24-48 horas.
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg backdrop-blur-sm">
                  <p className="text-red-300 font-medium">
                    Error al enviar el mensaje
                  </p>
                  <p className="text-red-400 text-sm">
                    Por favor, inténtalo de nuevo o contáctanos directamente por correo.
                  </p>
                </div>
              )}

              {submitStatus === 'invalidEmail' && (
                <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg backdrop-blur-sm">
                  <p className="text-yellow-300 font-medium">
                    El correo electrónico no es válido.
                  </p>
                  <p className="text-yellow-400 text-sm">
                    Por favor, revisa el formato de tu correo antes de enviar.
                  </p>
                </div>
              )}

              {/* Formulario principal */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre" className="text-foreground">Nombre Completo *</Label>
                    <Input
                      id="nombre"
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      placeholder="Tu nombre completo"
                      required
                      aria-describedby="nombre-error"
                      className="bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-foreground">Correo Electrónico *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="tu@email.com"
                      required
                      aria-describedby="email-error"
                      className="bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo" className="text-foreground">Tipo de Consulta *</Label>
                    <Select value={formData.tipo} onValueChange={(value) => handleInputChange('tipo', value)} required>
                      <SelectTrigger aria-describedby="tipo-error" className="bg-card/50 border-border text-foreground focus:border-primary focus:ring-primary/50">
                        <SelectValue placeholder="Selecciona el tipo"/>
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {Object.entries(contactTypes).map(([key, label]) => (
                          <SelectItem key={key} value={key} className="text-foreground hover:bg-muted">
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="telefono" className="text-foreground">Teléfono (Opcional)</Label>
                    <Input
                      id="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange('telefono', e.target.value)}
                      placeholder="+34 612 345 678"
                      className="bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="asunto" className="text-foreground">Asunto *</Label>
                    <Input
                      id="asunto"
                      type="text"
                      value={formData.asunto}
                      onChange={(e) => handleInputChange('asunto', e.target.value)}
                      placeholder="Resumen breve del tema"
                      required
                      aria-describedby="asunto-error"
                      className="bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="mensaje" className="text-foreground">Mensaje *</Label>
                  <Textarea
                    id="mensaje"
                    value={formData.mensaje}
                    onChange={(e) => handleInputChange('mensaje', e.target.value)}
                    placeholder="Describe tu consulta o mensaje en detalle..."
                    rows={6}
                    required
                    aria-describedby="mensaje-error"
                    className="bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="btn-gradient w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" style={{ animation: 'spin 1s linear infinite' }}></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensaje
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* FAQ Rápido */}
          <Card className="glass-card shadow-2xl interactive-hover">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-lg"></div>
                  <HelpCircle className="relative w-5 h-5 text-purple-400" />
                </div>
                Preguntas Frecuentes
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Respuestas rápidas a las consultas más comunes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">¿Cuánto tiempo tardan en responder?</h3>
                  <p className="text-muted-foreground text-sm">
                    Respondemos a todas las consultas dentro de 24-48 horas durante días laborables.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">¿Puedo sugerir nuevas canciones?</h3>
                  <p className="text-muted-foreground text-sm">
                    ¡Por supuesto! Usa el formulario con tipo "Sugerencia" para proponer nuevas canciones.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">¿Ofrecen soporte telefónico?</h3>
                  <p className="text-muted-foreground text-sm">
                    Actualmente ofrecemos soporte principalmente por correo, pero puedes llamarnos para urgencias.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">¿Cómo reporto un problema técnico?</h3>
                  <p className="text-muted-foreground text-sm">
                    Usa el tipo "Reporte de Error" e incluye detalles como navegador, dispositivo y pasos para reproducir el problema.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      </div>
    </div>
  );
}