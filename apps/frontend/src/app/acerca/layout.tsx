import type { Metadata } from 'next';

// SEO específico para la página "Acerca"
export const metadata: Metadata = {
  title: 'Acerca de Eco Iglesia Letras',
  description: 'Conoce la misión, visión, valores y equipo detrás de Eco Iglesia Letras, la plataforma de referencia para letras y acordes de música cristiana.',
  keywords: [
    'acerca de eco iglesia letras',
    'misión música cristiana',
    'visión adoración',
    'equipo desarrollo',
    'historia proyecto',
    'valores cristianos',
    'plataforma musical',
    'letras acordes',
    'iglesia adoración'
  ],
  authors: [{ name: 'Equipo Eco Iglesia Letras' }],
  creator: 'Eco Iglesia Letras',
  publisher: 'Eco Iglesia Letras',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Cuando tengas dominio, puedes agregar openGraph, alternates, etc.
  // openGraph: {
  //   title: 'Acerca de Eco Iglesia Letras',
  //   description: 'Conoce la misión, visión, valores y equipo detrás de Eco Iglesia Letras...',
  //   url: 'https://ecoiglesialetras.com/acerca',
  //   siteName: 'Eco Iglesia Letras',
  //   images: [
  //     {
  //       url: 'https://ecoiglesialetras.com/og-image.jpg',
  //       width: 1200,
  //       height: 630,
  //       alt: 'Eco Iglesia Letras',
  //     },
  //   ],
  //   locale: 'es_ES',
  //   type: 'website',
  // },
  // alternates: {
  //   canonical: 'https://ecoiglesialetras.com/acerca',
  // },
};

export default function AcercaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* JSON-LD para SEO estructurado */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Eco Iglesia Letras",
            "description": "Plataforma dedicada a preservar, compartir y celebrar la riqueza musical de la fe cristiana",
            "url": "https://ecoiglesia.com",
            "logo": "https://ecoiglesia.com",
            "foundingDate": "2025",
            "founders": [
              {
                "@type": "Person",
                "name": "Equipo de Desarrollo Eco Iglesia Letras"
              }
            ],
            "mission": "Facilitar el acceso a letras y acordes de música cristiana de calidad, proporcionando una plataforma integral que sirva tanto a músicos profesionales como a adoradores en sus iglesias locales.",
            "serviceType": "Plataforma de música cristiana",
            "areaServed": "Global",
            "sameAs": [
              "https://facebook.com/ecoiglesiaES",
              "https://instagram.com/ecoiglesiaES"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "availableLanguage": ["Spanish", "English"]
            }
          })
        }}
      />
      {children}
    </>
  );
}