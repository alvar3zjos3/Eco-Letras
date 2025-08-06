import type { Metadata } from 'next';
import { SITE_CONFIG, DEFAULT_METADATA } from '@/lib/config';

// URL del backend - adaptable para desarrollo local
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  // En Next.js 15, params es una promesa
  const params = await props.params;

  try {
    // Intentar obtener el artista del backend
    let res = await fetch(`${API_URL}/artists/${params.slug}`, { cache: 'no-store' });

    if (!res.ok) {
      res = await fetch(`${API_URL}/api/artists/${params.slug}`, { cache: 'no-store' });
    }

    if (!res.ok) throw new Error('No encontrado');
    const artist = await res.json();

    if (!artist?.name) throw new Error('No encontrado');

    const artistUrl = SITE_CONFIG.urls.artist(params.slug);
    const logoUrl = SITE_CONFIG.getUrl('/logo-eco.png');

    return {
      title: `${artist.name} - Artista - Eco Iglesia Letras`,
      description: artist.biography
        ? artist.biography.slice(0, 160)
        : `Canciones, acordes y biografía de ${artist.name} en Eco Iglesia Letras.`,
      keywords: [
        artist.name,
        `${artist.name} canciones`,
        `${artist.name} acordes`,
        `${artist.name} letras`,
        'música cristiana',
        'artista cristiano',
        'alabanza y adoración',
        'canciones cristianas',
        'acordes cristianos'
      ].join(', '),
      authors: [{ name: 'Equipo Eco Iglesia Letras' }],
      creator: 'Eco Iglesia Letras',
      publisher: 'Eco Iglesia Letras',
      openGraph: {
        title: `${artist.name} - Artista`,
        description: artist.biography
          ? artist.biography.slice(0, 160)
          : `Canciones, acordes y biografía de ${artist.name}`,
        url: artistUrl,
        siteName: 'Eco Iglesia Letras',
        images: [
          {
            url: logoUrl,
            width: 1200,
            height: 630,
            alt: 'Eco Iglesia Letras',
          }
        ],
        locale: 'es_ES',
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${artist.name} - Artista`,
        description: artist.biography
          ? artist.biography.slice(0, 160)
          : `Canciones, acordes y biografía de ${artist.name}`,
        images: [logoUrl],
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
    };
  } catch (e) {
    return {
      title: 'Artista no encontrado - Eco Iglesia Letras',
      description: 'El artista que buscas no existe o ha sido eliminado.',
      keywords: DEFAULT_METADATA.keywords.join(', '),
      robots: {
        index: false,
        follow: true,
      },
    };
  }
}

export default async function ArtistLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  // En Next.js 15, params es una promesa
  const { slug } = await params;
  
  return (
    <>
      {/* JSON-LD para SEO estructurado del artista */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            "mainEntity": {
              "@type": "Person",
              "@id": SITE_CONFIG.urls.artist(slug),
              "name": "Artista de Música Cristiana",
              "description": "Página del artista con biografía, canciones y acordes",
              "url": SITE_CONFIG.urls.artist(slug),
              "genre": "Christian Music",
              "musicGroupMember": {
                "@type": "Organization",
                "name": "Eco Iglesia Letras"
              }
            },
            "isPartOf": {
              "@type": "WebSite",
              "name": "Eco Iglesia Letras",
              "url": SITE_CONFIG.baseUrl
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
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "Artista",
                  "item": SITE_CONFIG.urls.artist(slug)
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