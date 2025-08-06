import type { Metadata } from 'next';

// SEO para la página de login
export const metadata: Metadata = {
    title: 'Iniciar sesión | Eco Iglesia Letras',
    description: 'Accede a tu cuenta de Eco Iglesia Letras para gestionar tus canciones, artistas y preferencias. Inicia sesión de forma segura en la plataforma.',
  // Puedes agregar openGraph, alternates, etc. cuando tengas dominio:
  // openGraph: {
  //   title: 'Iniciar sesión | Eco Iglesia Letras',
  //   description: 'Accede a tu cuenta de Eco Iglesia Letras para gestionar tus canciones, artistas y preferencias.',
  //   url: 'https://ecoiglesialetras.com/login',
  //   siteName: 'Eco Iglesia Letras',
  //   images: [
  //     {
  //       url: 'https://ecoiglesialetras.com/og-login.jpg',
  //       width: 1200,
  //       height: 630,
  //       alt: 'Iniciar sesión Eco Iglesia Letras',
  //     },
  //   ],
  //   locale: 'es_ES',
  //   type: 'website',
  // },
  // alternates: {
  //   canonical: 'https://ecoiglesialetras.com/login',
  // },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return children;
}