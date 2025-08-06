import type { Metadata } from 'next';

// SEO optimizado para la página de Términos y Condiciones
export const metadata: Metadata = {
  title: 'Términos y Condiciones | Eco Iglesia Letras',
  description: 'Consulta los términos y condiciones de uso de Eco Iglesia Letras. Conoce tus derechos, responsabilidades y el uso permitido de la plataforma.',
  keywords: [
    'términos y condiciones eco iglesia letras',
    'condiciones de uso',
    'derechos de usuario',
    'responsabilidades',
    'política de uso',
    'términos legales',
    'condiciones servicio',
    'uso plataforma música cristiana',
    'normas de uso',
    'acuerdo usuario',
    'términos servicio',
    'condiciones generales'
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
    title: 'Términos y Condiciones | Eco Iglesia Letras',
    description: 'Consulta los términos y condiciones de uso de Eco Iglesia Letras.',
    url: 'https://ecoiglesialetras.com/terminos',
    siteName: 'Eco Iglesia Letras',
    images: [
      {
        url: 'https://ecoiglesialetras.com/og-terminos.jpg',
        width: 1200,
        height: 630,
        alt: 'Términos y Condiciones Eco Iglesia Letras',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  alternates: {
    canonical: 'https://ecoiglesialetras.com/terminos',
  },
};

export default function TerminosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* JSON-LD para SEO estructurado de términos y condiciones */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Términos y Condiciones - Eco Iglesia Letras",
            "description": "Términos y condiciones de uso de la plataforma Eco Iglesia Letras, derechos de usuario y responsabilidades",
            "url": "https://ecoiglesialetras.com/terminos",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Eco Iglesia Letras",
              "url": "https://ecoiglesialetras.com"
            },
            "mainEntity": {
              "@type": "Article",
              "name": "Términos y Condiciones de Uso",
              "description": "Documento legal que establece las condiciones de uso de Eco Iglesia Letras",
              "datePublished": "2025-01-01",
              "dateModified": "2025-01-01",
              "author": {
                "@type": "Organization",
                "name": "Eco Iglesia Letras"
              }
            },
            "about": {
              "@type": "Thing",
              "name": "Términos Legales",
              "description": "Condiciones de uso, derechos y responsabilidades en plataforma de música cristiana"
            },
            "audience": {
              "@type": "Audience",
              "audienceType": "Usuarios de la plataforma, iglesias, músicos"
            },
            "keywords": "términos condiciones, derechos usuario, responsabilidades, uso plataforma música cristiana",
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Inicio",
                  "item": "https://ecoiglesialetras.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Términos y Condiciones",
                  "item": "https://ecoiglesialetras.com/terminos"
                }
              ]
            }
          })
        }}
      />
      {children}
    </>
  );
}