import type { Metadata } from 'next';

// SEO para la página de registro
export const metadata: Metadata = {
    title: 'Crear cuenta | Eco Iglesia Letras',
    description: 'Regístrate gratis en Eco Iglesia Letras y accede a letras, acordes y herramientas para tu comunidad cristiana. Únete a nuestra plataforma.',
  // Puedes agregar openGraph, alternates, etc. cuando tengas dominio:
  // openGraph: {
  //   title: 'Crear cuenta | Eco Iglesia Letras',
  //   description: 'Regístrate gratis en Eco Iglesia Letras y accede a letras, acordes y herramientas para tu comunidad cristiana.',
  //   url: 'https://ecoiglesialetras.com/register',
  //   siteName: 'Eco Iglesia Letras',
  //   images: [
  //     {
  //       url: 'https://ecoiglesialetras.com/og-register.jpg',
  //       width: 1200,
  //       height: 630,
  //       alt: 'Registro Eco Iglesia Letras',
  //     },
  //   ],
  //   locale: 'es_ES',
  //   type: 'website',
  // },
  // alternates: {
  //   canonical: 'https://ecoiglesialetras.com/register',
  // },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
    return children;
}