import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/config';

// SEO para la página de canciones
export const metadata: Metadata = {
  title: 'Canciones - Eco Iglesia Letras',
  description: 'Explora y encuentra letras y acordes de canciones cristianas en Eco Iglesia Letras. Filtra por artista, género o tonalidad y descubre nuevas canciones para tu iglesia o grupo.',
  keywords: [
    'canciones cristianas',
    'letras cristianas',
    'acordes cristianos',
    'música de iglesia',
    'alabanza y adoración',
    'himnos cristianos',
    'música evangélica',
    'letras de adoración',
    'acordes de guitarra',
    'canciones de iglesia',
    'música religiosa',
    'coros cristianos'
  ].join(', '),
  authors: [{ name: 'Equipo Eco Iglesia Letras' }],
  creator: 'Eco Iglesia Letras',
  publisher: 'Eco Iglesia Letras',
  openGraph: {
    title: 'Canciones - Eco Iglesia Letras',
    description: 'Explora y encuentra letras y acordes de canciones cristianas en Eco Iglesia Letras.',
    url: SITE_CONFIG.urls.songs,
    siteName: 'Eco Iglesia Letras',
    images: [
      {
        url: SITE_CONFIG.getUrl('/logo-eco.png'),
        width: 1200,
        height: 630,
        alt: 'Eco Iglesia Letras',
      }
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Canciones - Eco Iglesia Letras',
    description: 'Explora y encuentra letras y acordes de canciones cristianas.',
    images: [SITE_CONFIG.getUrl('/logo-eco.png')],
  },
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
  // Puedes agregar openGraph, alternates, etc. cuando tengas dominio:
  // openGraph: {
  //   title: 'Canciones | Eco Iglesia Letras',
  //   description: 'Explora y encuentra letras y acordes de canciones cristianas en Eco Iglesia Letras.',
  //   url: 'https://ecoiglesialetras.com/canciones',
  //   siteName: 'Eco Iglesia Letras',
  //   images: [
  //     {
  //       url: 'https://ecoiglesialetras.com/og-canciones.jpg',
  //       width: 1200,
  //       height: 630,
  //       alt: 'Canciones en Eco Iglesia Letras',
  //     },
  //   ],
  //   locale: 'es_ES',
  //   type: 'website',
  // },
  // alternates: {
  //   canonical: 'https://ecoiglesialetras.com/canciones',
  // },
};

export default function CancionesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* JSON-LD para SEO estructurado de la página de canciones */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Canciones Cristianas",
            "description": "Explora y encuentra letras y acordes de canciones cristianas, himnos y música de adoración",
            "url": SITE_CONFIG.urls.songs,
            "isPartOf": {
              "@type": "WebSite",
              "name": "Eco Iglesia Letras",
              "url": SITE_CONFIG.baseUrl
            },
            "about": {
              "@type": "Thing",
              "name": "Música Cristiana",
              "description": "Letras y acordes de canciones cristianas, himnos y música de adoración para iglesias"
            },
            "mainEntity": {
              "@type": "ItemList",
              "name": "Lista de Canciones Cristianas",
              "description": "Colección de canciones cristianas con letras, acordes y información musical",
              "numberOfItems": "Variable",
              "itemListElement": [],
              "genre": "Christian Music"
            },
            "audience": {
              "@type": "Audience",
              "audienceType": "Músicos de iglesia, líderes de adoración, cristianos"
            },
            "keywords": "canciones cristianas, letras, acordes, música de iglesia, alabanza, adoración",
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Inicio",
                  "item": SITE_CONFIG.urls.home
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Canciones",
                  "item": SITE_CONFIG.urls.songs
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