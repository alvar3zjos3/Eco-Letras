'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Music, Users, Target, Eye, Lightbulb } from 'lucide-react';

const HERO_TITLE = "Acerca de Eco Iglesia Letras";
const HERO_DESC = "Una plataforma dedicada a preservar, compartir y celebrar la riqueza musical de la fe cristiana, conectando corazones a través de letras y acordes que inspiran y transforman vidas.";

/**
 * Página "Acerca de" - Solo UI, el SEO se maneja en layout.tsx de /acerca.
 */
export default function AcercaPage() {
  // Estado para simular carga inicial
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simula un pequeño retardo de carga para UX consistente
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-32 w-32 border-b-4 border-primary mx-auto"></div>
          </div>
          <p className="mt-6 text-foreground font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen text-foreground smooth-transition overflow-hidden fade-in slide-up px-2 sm:px-6 lg:px-12 py-6">
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="text-center mb-12" aria-label="Introducción">
          <div className="relative">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-gradient leading-tight">
              {HERO_TITLE}
            </h1>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-60"></div>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mt-6">
            {HERO_DESC}
          </p>
        </section>

        {/* Misión, Visión y Valores */}
        <section className="grid md:grid-cols-3 gap-6 mb-12" aria-label="Misión, Visión y Valores">
          <Card className="glass-card shadow-2xl rounded-xl hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 text-center group interactive-hover">
            <CardHeader className="pb-3">
              <div className="relative mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-xl text-foreground font-bold">Nuestra Misión</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Facilitar el acceso a letras y acordes de música cristiana de calidad, 
                proporcionando una plataforma integral que sirva tanto a músicos profesionales 
                como a adoradores en sus iglesias locales, promoviendo la unidad en la adoración.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-2xl rounded-xl hover:border-green-500 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10 text-center group interactive-hover">
            <CardHeader className="pb-3">
              <div className="relative mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-xl text-foreground font-bold">Nuestra Visión</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Ser la plataforma de referencia mundial para la música cristiana, donde cada 
                iglesia, músico y adorador encuentre los recursos necesarios para elevar su 
                experiencia de adoración y fortalecer su conexión espiritual.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-2xl rounded-xl hover:border-red-500 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 text-center group interactive-hover">
            <CardHeader className="pb-3">
              <div className="relative mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-xl text-foreground font-bold">Nuestros Valores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5 justify-center">
                <Badge variant="outline" className="border-blue-400 text-blue-300 hover:bg-blue-500/10 transition-colors text-xs">
                  Excelencia Musical
                </Badge>
                <Badge variant="outline" className="border-green-400 text-green-300 hover:bg-green-500/10 transition-colors text-xs">
                  Accesibilidad Universal
                </Badge>
                <Badge variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-500/10 transition-colors text-xs">
                  Comunidad Cristiana
                </Badge>
                <Badge variant="outline" className="border-yellow-400 text-yellow-300 hover:bg-yellow-500/10 transition-colors text-xs">
                  Innovación Tecnológica
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Historia del Proyecto */}
        <section aria-label="Historia del Proyecto">
          <Card className="mb-12 glass-card shadow-2xl rounded-xl hover:border-indigo-500 transition-all duration-300 interactive-hover">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl lg:text-3xl text-foreground font-bold mb-3">
                Historia del Proyecto
              </CardTitle>
              <div className="w-20 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 mx-auto rounded-full"></div>
            </CardHeader>
            <CardContent className="max-w-none space-y-6">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4 text-muted-foreground">
                  <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 rounded-xl border border-indigo-500/20">
                    <h3 className="text-lg font-semibold text-indigo-300 mb-2">El Origen</h3>
                    <p className="leading-relaxed text-sm">
                      Eco Iglesia Letras nació de una necesidad real observada en iglesias de todo el mundo: 
                      la dificultad para acceder a recursos musicales de calidad, organizados y fáciles de usar 
                      durante los servicios de adoración.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-xl border border-purple-500/20">
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">La Visión 2025</h3>
                    <p className="leading-relaxed text-sm">
                      En 2025, un equipo de desarrolladores cristianos y músicos se unió con la visión de crear 
                      una plataforma que no solo almacenara letras y acordes, sino que también facilitara la 
                      experiencia de adoración tanto para líderes de alabanza como para congregaciones enteras.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 text-muted-foreground">
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-4 rounded-xl border border-blue-500/20">
                    <h3 className="text-lg font-semibold text-blue-300 mb-2">Tecnología Moderna</h3>
                    <p className="leading-relaxed text-sm">
                      Utilizando tecnologías modernas como Next.js, FastAPI y PostgreSQL, el proyecto se desarrolló 
                      con un enfoque en la usabilidad, la accesibilidad y la escalabilidad, asegurando que pueda 
                      servir desde pequeñas iglesias locales hasta grandes denominaciones internacionales.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-4 rounded-xl border border-green-500/20">
                    <h3 className="text-lg font-semibold text-green-300 mb-2">Impacto Actual</h3>
                    <p className="leading-relaxed text-sm">
                      Hoy, Eco Iglesia Letras representa más que una simple base de datos de canciones; es una 
                      herramienta que fortalece la adoración comunitaria y personal, facilitando encuentros 
                      genuinos con lo divino a través de la música.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Equipo */}
        <section aria-label="Nuestro Equipo">
          <Card className="mb-12 glass-card shadow-2xl rounded-xl interactive-hover">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl lg:text-3xl text-foreground font-bold mb-3">
                Nuestro Equipo
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Profesionales apasionados por la tecnología y la música cristiana
              </CardDescription>
              <div className="w-20 h-0.5 bg-gradient-to-r from-blue-400 to-green-400 mx-auto rounded-full mt-3"></div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center group">
                  <div className="relative mb-4">
                    <div 
                      className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg shadow-blue-500/25"
                      role="img"
                      aria-label="Icono del equipo de desarrollo"
                    >
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">Equipo de Desarrollo</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Desarrolladores full-stack especializados en tecnologías modernas
                  </p>
                </div>

                <div className="text-center group">
                  <div className="relative mb-4">
                    <div 
                      className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg shadow-green-500/25"
                      role="img"
                      aria-label="Icono de consultores musicales"
                    >
                      <Music className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">Consultores Musicales</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Músicos y líderes de alabanza con años de experiencia
                  </p>
                </div>

                <div className="text-center group md:col-span-2 lg:col-span-1">
                  <div className="relative mb-4">
                    <div 
                      className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg shadow-purple-500/25"
                      role="img"
                      aria-label="Icono de diseñadores UX/UI"
                    >
                      <Lightbulb className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">Diseñadores UX/UI</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Especialistas en experiencia de usuario y diseño intuitivo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section aria-label="Preguntas Frecuentes">
          <Card className="glass-card shadow-2xl rounded-xl interactive-hover">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl lg:text-3xl text-foreground font-bold mb-3">
                Preguntas Frecuentes
              </CardTitle>
              <div className="w-20 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-4xl mx-auto">
                <details className="group bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-xl border border-gray-600 hover:border-blue-500 transition-all duration-300">
                  <summary className="cursor-pointer font-semibold text-base p-4 list-none flex items-center justify-between text-foreground hover:text-blue-300 transition-colors">
                    ¿Es gratuito usar Eco Iglesia Letras?
                    <span className="transform group-open:rotate-180 transition-transform duration-300 text-blue-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-4 pb-4">
                    <div className="pl-3 border-l-2 border-blue-400 bg-blue-500/5 rounded-r-lg p-3">
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        Sí, nuestra plataforma es completamente gratuita para iglesias y usuarios individuales. 
                        Creemos que la adoración no debe tener barreras económicas.
                      </p>
                    </div>
                  </div>
                </details>

                <details className="group bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-xl border border-gray-600 hover:border-green-500 transition-all duration-300">
                  <summary className="cursor-pointer font-semibold text-base p-4 list-none flex items-center justify-between text-foreground hover:text-green-300 transition-colors">
                    ¿Cómo puedo contribuir con nuevas canciones?
                    <span className="transform group-open:rotate-180 transition-transform duration-300 text-green-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-4 pb-4">
                    <div className="pl-3 border-l-2 border-green-400 bg-green-500/5 rounded-r-lg p-3">
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        Los usuarios registrados pueden sugerir nuevas canciones a través de nuestro formulario 
                        de contacto. Nuestro equipo revisa cada sugerencia para mantener la calidad del contenido.
                      </p>
                    </div>
                  </div>
                </details>

                <details className="group bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-xl border border-gray-600 hover:border-purple-500 transition-all duration-300">
                  <summary className="cursor-pointer font-semibold text-base p-4 list-none flex items-center justify-between text-foreground hover:text-purple-300 transition-colors">
                    ¿Respetan los derechos de autor?
                    <span className="transform group-open:rotate-180 transition-transform duration-300 text-purple-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-4 pb-4">
                    <div className="pl-3 border-l-2 border-purple-400 bg-purple-500/5 rounded-r-lg p-3">
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        Absolutamente. Solo incluimos canciones con permisos apropiados o que están en dominio público. 
                        Trabajamos directamente con editores y compositores para asegurar el cumplimiento legal.
                      </p>
                    </div>
                  </div>
                </details>

                <details className="group bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-xl border border-gray-600 hover:border-yellow-500 transition-all duration-300">
                  <summary className="cursor-pointer font-semibold text-base p-4 list-none flex items-center justify-between text-foreground hover:text-yellow-300 transition-colors">
                    ¿Puedo usar la plataforma sin conexión a internet?
                    <span className="transform group-open:rotate-180 transition-transform duration-300 text-yellow-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-4 pb-4">
                    <div className="pl-3 border-l-2 border-yellow-400 bg-yellow-500/5 rounded-r-lg p-3">
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        Actualmente requerimos conexión a internet, pero estamos desarrollando funcionalidades 
                        offline para permitir el acceso a canciones guardadas previamente.
                      </p>
                    </div>
                  </div>
                </details>

                <details className="group bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-xl border border-gray-600 hover:border-indigo-500 transition-all duration-300">
                  <summary className="cursor-pointer font-semibold text-base p-4 list-none flex items-center justify-between text-foreground hover:text-indigo-300 transition-colors">
                    ¿Ofrecen soporte técnico?
                    <span className="transform group-open:rotate-180 transition-transform duration-300 text-indigo-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-4 pb-4">
                    <div className="pl-3 border-l-2 border-indigo-400 bg-indigo-500/5 rounded-r-lg p-3">
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        Sí, nuestro equipo de soporte está disponible a través del formulario de contacto. 
                        Respondemos todas las consultas en un plazo máximo de 48 horas.
                      </p>
                    </div>
                  </div>
                </details>

                <details className="group bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-xl border border-gray-600 hover:border-rose-500 transition-all duration-300">
                  <summary className="cursor-pointer font-semibold text-base p-4 list-none flex items-center justify-between text-foreground hover:text-rose-300 transition-colors">
                    ¿Planean expandirse a otros idiomas?
                    <span className="transform group-open:rotate-180 transition-transform duration-300 text-rose-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-4 pb-4">
                    <div className="pl-3 border-l-2 border-rose-400 bg-rose-500/5 rounded-r-lg p-3">
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        Definitivamente. Aunque comenzamos en español, tenemos planes de incluir canciones 
                        en inglés, portugués y otros idiomas para servir a la comunidad cristiana global.
                      </p>
                    </div>
                  </div>
                </details>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
