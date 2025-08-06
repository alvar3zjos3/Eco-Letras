import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/config';

// SEO para la página de artistas
export const metadata: Metadata = {
  title: 'Artistas - Eco Iglesia Letras',
  description: 'Descubre y explora artistas de música cristiana en Eco Iglesia Letras. Encuentra biografías, canciones y más de tus artistas favoritos.',
  keywords: [
    'artistas música cristiana',
    'cantantes cristianos',
    'músicos adoración',
    'biografías artistas',
    'letras canciones cristianas',
    'acordes música cristiana',
    'alabanza y adoración',
    'artistas evangélicos',
    'música religiosa',
    'cantautores cristianos'
  ].join(', '),
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
  // Puedes agregar openGraph, alternates, etc. cuando tengas dominio:
  // openGraph: {
  //   title: 'Artistas | Eco Iglesia Letras',
  //   description: 'Descubre y explora artistas de música cristiana en Eco Iglesia Letras.',
  //   url: 'https://ecoiglesialetras.com/artistas',
  //   siteName: 'Eco Iglesia Letras',
  //   images: [
  //     {
  //       url: 'https://ecoiglesialetras.com/og-artistas.jpg',
  //       width: 1200,
  //       height: 630,
  //       alt: 'Artistas en Eco Iglesia Letras',
  //     },
  //   ],
  //   locale: 'es_ES',
  //   type: 'website',
  // },
  // alternates: {
  //   canonical: 'https://ecoiglesialetras.com/artistas',
  // },
};

export default function ArtistasLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* JSON-LD para SEO estructurado de la página de artistas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Artistas de Música Cristiana",
            "description": "Descubre y explora artistas de música cristiana, sus biografías, canciones y más",
            "url": SITE_CONFIG.urls.artists,
            "isPartOf": {
              "@type": "WebSite",
              "name": "Eco Iglesia Letras",
              "url": SITE_CONFIG.baseUrl
            },
            "about": {
              "@type": "Thing",
              "name": "Música Cristiana",
              "description": "Artistas y músicos de música cristiana, alabanza y adoración"
            },
            "mainEntity": {
              "@type": "ItemList",
              "name": "Lista de Artistas Cristianos",
              "description": "Colección de artistas de música cristiana con sus biografías y canciones",
              "numberOfItems": "Variable",
              "itemListElement": []
            },
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
                  "name": "Artistas",
                  "item": SITE_CONFIG.urls.artists
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