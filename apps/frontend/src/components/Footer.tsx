'use client';

import Link from 'next/link';
import { Heart, Music, Mail, Instagram, Facebook, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      className="relative text-foreground overflow-hidden fade-in"
      aria-label="Pie de página"
    >
      {/* Línea divisoria superior */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 smooth-transition">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 slide-up">
          {/* Logo y Descripción */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl"></div>
                <Music className="relative w-10 h-10 text-primary mr-4" />
              </div>
              <h3 className="text-3xl font-bold text-gradient">
                Eco Iglesia Letras
              </h3>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md text-lg leading-relaxed">
              Una plataforma dedicada a preservar, compartir y celebrar la riqueza musical
              de la fe cristiana, conectando corazones a través de letras y acordes.
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div className="glass-card rounded-xl p-6 interactive-hover">
            <h4 className="text-xl font-semibold mb-6 text-primary flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse"></div>
              Enlaces Rápidos
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center group"
                >
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/canciones"
                  className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center group"
                >
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Canciones
                </Link>
              </li>
              <li>
                <Link
                  href="/artistas"
                  className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center group"
                >
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Artistas
                </Link>
              </li>
              <li>
                <Link
                  href="/acerca"
                  className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center group"
                >
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Acerca de Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center group"
                >
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Información Legal y Redes Sociales */}
          <div className="glass-card rounded-xl p-6 interactive-hover">
            <h4 className="text-xl font-semibold mb-6 text-primary flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse"></div>
              Información Legal
            </h4>
            <ul className="space-y-3 mb-8">
              <li>
                <Link
                  href="/terminos"
                  className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center group"
                >
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidad"
                  className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center group"
                >
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center group"
                >
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Soporte
                </Link>
              </li>
            </ul>

            {/* Redes Sociales */}
            <div>
              <h5 className="text-lg font-semibold mb-4 text-primary flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse"></div>
                Redes Sociales
              </h5>
              <div className="space-y-3">
                <a
                  href="https://instagram.com/ecoiglesiaes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-muted-foreground hover:text-pink-500 transition-all duration-300 group"
                  title="Instagram"
                >
                  <div className="relative mr-3">
                    <div className="absolute inset-0 bg-pink-500/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Instagram className="relative w-5 h-5" />
                  </div>
                  <span className="group-hover:translate-x-1 transition-transform">@ecoiglesiaes</span>
                </a>
                <a
                  href="https://facebook.com/ecoiglesiaEs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-muted-foreground hover:text-blue-500 transition-all duration-300 group"
                  title="Facebook"
                >
                  <div className="relative mr-3">
                    <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Facebook className="relative w-5 h-5" />
                  </div>
                  <span className="group-hover:translate-x-1 transition-transform">facebook.com/ecoiglesiaEs</span>
                </a>
                <a
                  href="https://ecoiglesia.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-muted-foreground hover:text-green-500 transition-all duration-300 group"
                  title="Sitio web"
                >
                  <div className="relative mr-3">
                    <div className="absolute inset-0 bg-green-500/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Globe className="relative w-5 h-5" />
                  </div>
                  <span className="group-hover:translate-x-1 transition-transform">ecoiglesia.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria y copyright */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex justify-center items-center">
            <p className="text-muted-foreground text-sm glass-card px-6 py-3 rounded-full text-center">
              © {new Date().getFullYear()} Eco Iglesia Letras. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

