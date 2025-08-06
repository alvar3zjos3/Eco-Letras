import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Confirmar Eliminación de Cuenta - Eco Iglesia Letras',
  description: 'Página de confirmación para la eliminación de cuenta de usuario',
  robots: 'noindex, nofollow', // No indexar esta página
};

export default function ConfirmAccountDeletionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
