import type { Metadata } from 'next';
import { SITE_CONFIG, DEFAULT_METADATA } from '@/lib/config';

// URL del backend - adaptable para desarrollo local
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    // En Next.js 15, params es una promesa
    const params = await props.params;

    try {
        // Intentar obtener la canción del backend
        let res = await fetch(`${API_URL}/songs/${params.slug}`, { cache: 'no-store' });

        if (!res.ok) {
            res = await fetch(`${API_URL}/api/songs/${params.slug}`, { cache: 'no-store' });
        }

        if (!res.ok) throw new Error('No encontrado');
        const song = await res.json();

        if (!song?.title) throw new Error('No encontrado');

        const songUrl = SITE_CONFIG.urls.song(params.slug);
        const logoUrl = SITE_CONFIG.getUrl('/logo-eco.png');

        return {
            title: `${song.title} - ${song.artist?.name || 'Artista desconocido'} - Eco Iglesia Letras`,
            description: song.lyrics
                ? song.lyrics.slice(0, 160)
                : `Letra y acordes de "${song.title}" de ${song.artist?.name || 'Artista desconocido'}`,
            keywords: [
                song.title,
                song.artist?.name || '',
                'letra',
                'acordes',
                'música cristiana',
                'adoración',
                'alabanza',
                song.genre || 'cristiana'
            ].filter(Boolean).join(', '),
            authors: [{ name: song.artist?.name || 'Artista Cristiano' }],
            creator: 'Eco Iglesia Letras',
            publisher: 'Eco Iglesia Letras',
            openGraph: {
                title: `${song.title} - ${song.artist?.name || 'Artista desconocido'}`,
                description: `Letra y acordes de "${song.title}" de ${song.artist?.name || 'Artista desconocido'}`,
                url: songUrl,
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
                type: 'article',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${song.title} - ${song.artist?.name || 'Artista desconocido'}`,
                description: `Letra y acordes de "${song.title}" de ${song.artist?.name || 'Artista desconocido'}`,
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
            title: 'Canción no encontrada - Eco Iglesia Letras',
            description: 'La canción que buscas no existe o ha sido eliminada.',
            keywords: DEFAULT_METADATA.keywords.join(', '),
            robots: {
                index: false,
                follow: true,
            },
        };
    }
}

export default async function CancionLayout({ 
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
            {/* JSON-LD para SEO estructurado de la canción */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "MusicRecording",
                        "@id": SITE_CONFIG.urls.song(slug),
                        "name": "Canción Cristiana",
                        "description": "Letra y acordes de música cristiana",
                        "url": SITE_CONFIG.urls.song(slug),
                        "genre": "Christian Music",
                        "inLanguage": "es-ES",
                        "recordingOf": {
                            "@type": "MusicComposition",
                            "name": "Composición Musical Cristiana",
                            "musicCompositionForm": "Canción",
                            "musicalKey": "Variable",
                            "lyricist": {
                                "@type": "Person",
                                "name": "Compositor Cristiano"
                            }
                        },
                        "byArtist": {
                            "@type": "Person",
                            "name": "Artista Cristiano",
                            "genre": "Christian Music"
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
                                    "name": "Canciones",
                                    "item": SITE_CONFIG.urls.songs
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 3,
                                    "name": "Canción",
                                    "item": SITE_CONFIG.urls.song(slug)
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