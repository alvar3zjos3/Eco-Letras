import type { Metadata } from 'next';

// SEO para la página de recuperación de contraseña
export const metadata: Metadata = {
    title: 'Recuperar contraseña | Eco Iglesia Letras',
    description: 'Solicita el restablecimiento de tu contraseña en Eco Iglesia Letras. Recibe un enlace seguro en tu correo para crear una nueva clave de acceso.',
  // Puedes agregar openGraph, alternates, etc. cuando tengas dominio:
  // openGraph: {
  //   title: 'Recuperar contraseña | Eco Iglesia Letras',
  //   description: 'Solicita el restablecimiento de tu contraseña en Eco Iglesia Letras.',
  //   url: 'https://ecoiglesialetras.com/forgot-password',
  //   siteName: 'Eco Iglesia Letras',
  //   images: [
  //     {
  //       url: 'https://ecoiglesialetras.com/og-forgot-password.jpg',
  //       width: 1200,
  //       height: 630,
  //       alt: 'Recuperar contraseña Eco Iglesia Letras',
  //     },
  //   ],
  //   locale: 'es_ES',
  //   type: 'website',
  // },
  // alternates: {
  //   canonical: 'https://ecoiglesialetras.com/forgot-password',
  // },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
    return children;
}