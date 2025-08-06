import type { Metadata } from 'next';

// SEO para la página de verificación de correo
export const metadata: Metadata = {
    title: 'Verificar correo | Eco Iglesia Letras',
    description: 'Verifica tu dirección de correo electrónico para activar tu cuenta en Eco Iglesia Letras y acceder a todas las funciones de la plataforma.',
  // Puedes agregar openGraph, alternates, etc. cuando tengas dominio:
  // openGraph: {
  //   title: 'Verificar correo | Eco Iglesia Letras',
  //   description: 'Verifica tu dirección de correo electrónico para activar tu cuenta en Eco Iglesia Letras.',
  //   url: 'https://ecoiglesialetras.com/verify-email',
  //   siteName: 'Eco Iglesia Letras',
  //   images: [
  //     {
  //       url: 'https://ecoiglesialetras.com/og-verify-email.jpg',
  //       width: 1200,
  //       height: 630,
  //       alt: 'Verificar correo Eco Iglesia Letras',
  //     },
  //   ],
  //   locale: 'es_ES',
  //   type: 'website',
  // },
  // alternates: {
  //   canonical: 'https://ecoiglesialetras.com/verify-email',
  // },
};

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
    return children;
}