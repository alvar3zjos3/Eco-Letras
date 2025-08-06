import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Confirmar Cambio de Email - Eco Iglesia Letras',
  description: 'Página de confirmación para el cambio de dirección de correo electrónico',
  robots: 'noindex, nofollow', // No indexar esta página
};

export default function ConfirmEmailChangeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
