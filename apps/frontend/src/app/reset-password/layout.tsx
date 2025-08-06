import type { Metadata } from 'next';

// SEO para la página de restablecimiento de contraseña
export const metadata: Metadata = {
    title: 'Restablecer contraseña | Eco Iglesia Letras',
    description: 'Crea una nueva contraseña para tu cuenta de Eco Iglesia Letras de forma segura. Restablece tu acceso fácilmente desde aquí.',
  // Puedes agregar openGraph, alternates, etc. cuando tengas dominio:
  // openGraph: {
  //   title: 'Restablecer contraseña | Eco Iglesia Letras',
  //   description: 'Crea una nueva contraseña para tu cuenta de Eco Iglesia Letras de forma segura.',
  //   url: 'https://ecoiglesialetras.com/reset-password',
  //   siteName: 'Eco Iglesia Letras',
  //   images: [
  //     {
  //       url: 'https://ecoiglesialetras.com/og-reset-password.jpg',
  //       width: 1200,
  //       height: 630,
  //       alt: 'Restablecer contraseña Eco Iglesia Letras',
  //     },
  //   ],
  //   locale: 'es_ES',
  //   type: 'website',
  // },
  // alternates: {
  //   canonical: 'https://ecoiglesialetras.com/reset-password',
  // },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
    return children;
}