import type { Metadata } from 'next';

// SEO optimizado para la página de privacidad
export const metadata: Metadata = {
  title: 'Política de Privacidad | Eco Iglesia Letras',
  description: 'Lee la política de privacidad de Eco Iglesia Letras. Descubre cómo protegemos y gestionamos tus datos personales al usar nuestra plataforma.',
  keywords: [
    'política de privacidad eco iglesia letras',
    'protección de datos',
    'privacidad usuario',
    'gestión datos personales',
    'RGPD',
    'cookies',
    'información personal',
    'seguridad datos',
    'confidencialidad',
    'tratamiento datos',
    'derechos usuario',
    'política privacidad música cristiana'
  ],
  authors: [{ name: 'Eco Iglesia Letras' }],
  creator: 'Eco Iglesia Letras',
  publisher: 'Eco Iglesia Letras',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Política de Privacidad | Eco Iglesia Letras',
    description: 'Lee la política de privacidad de Eco Iglesia Letras.',
    url: 'https://ecoiglesialetras.com/privacidad',
    siteName: 'Eco Iglesia Letras',
    images: [
      {
        url: 'https://ecoiglesialetras.com/og-privacidad.jpg',
        width: 1200,
        height: 630,
        alt: 'Política de Privacidad Eco Iglesia Letras',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  alternates: {
    canonical: 'https://ecoiglesialetras.com/privacidad',
  },
};

export default function PrivacidadLayout({ children }: { children: React.ReactNode }) {
    return children;
}