'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Users, ExternalLink, Music, CheckCircle, Eye, Globe, Calendar, MapPin, Music2 } from 'lucide-react';
import { artistsService } from '@/lib/api-service';
import { Artist } from '@/types';

/**
 * Página de artistas - Componente cliente.
 * El SEO se maneja en layout.tsx de /artistas.
 */
function ArtistsContent() {
  const searchParams = useSearchParams();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Inicializar búsqueda desde URL params
  useEffect(() => {
    const initialSearch = searchParams.get('search') || '';
    setSearchInput(initialSearch);
    setSearchQuery(initialSearch);
  }, [searchParams]);

  useEffect(() => {
    fetchArtists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  /**
   * Obtiene la lista de artistas, opcionalmente filtrando por búsqueda.
   */
  const fetchArtists = async () => {
    setIsLoading(true);
    setError('');
    try {
      const searchParams = searchQuery ? { search: searchQuery, limit: 50 } : { limit: 50 };
      const artistsData = await artistsService.getArtists(searchParams);
      setArtists(artistsData);
    } catch (error: any) {
      console.error('Error fetching artists:', error);
      setError('Error al cargar los artistas. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-24 w-24 border-b-4 border-primary mx-auto"></div>
          </div>
          <p className="mt-6 text-foreground font-medium">Cargando artistas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen text-foreground overflow-hidden smooth-transition">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in slide-up">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-gradient">
            Artistas
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Descubre los artistas de música cristiana en nuestra plataforma
          </p>
        </div>

        {/* Búsqueda */}
        <section className="flex justify-center mb-12 w-full" aria-label="Búsqueda de artistas">
          <Card className="w-full glass-card shadow-2xl interactive-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg"></div>
                  <Search className="relative w-5 h-5" />
                </div>
                Buscar Artistas
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Encuentra artistas específicos por nombre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative flex gap-3 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre del artista..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setSearchQuery(searchInput);
                      }
                    }}
                    className="pl-10 w-full bg-background/50 border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary/20"
                    aria-label="Buscar por nombre del artista"
                  />
                </div>
                <Button 
                  onClick={() => setSearchQuery(searchInput)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0 shadow-lg"
                >
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Resultados - Solo mostrar cuando hay búsqueda */}
        {searchQuery && (
          <section className="mb-8" aria-label="Resultados de artistas">
            <div className="glass-card rounded-lg p-4 border border-primary/30">
              <p className="text-muted-foreground text-center font-medium">
                {artists.length} artista{artists.length !== 1 ? 's' : ''} encontrado{artists.length !== 1 ? 's' : ''} para "{searchQuery}"
              </p>
            </div>
          </section>
        )}

        {/* Manejo de errores */}
        {error && (
          <Card className="mb-8 glass-card border border-red-500/30 shadow-2xl">
            <CardContent className="text-center py-8">
              <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-6">
                <h3 className="text-red-400 text-lg font-semibold mb-2">Error al cargar</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={fetchArtists}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-400"
                >
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {artists.length === 0 && !error ? (
          <Card className="glass-card shadow-2xl">
            <CardContent className="text-center py-12">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                <Users className="relative w-16 h-16 text-primary mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-4">No se encontraron artistas</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? 'Intenta ajustar tu búsqueda para encontrar más resultados.'
                  : 'No hay artistas registrados en la plataforma.'
                }
              </p>
              {searchQuery && (
                <Button 
                  onClick={() => {
                    setSearchInput('');
                    setSearchQuery('');
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0"
                >
                  Limpiar búsqueda
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <section aria-label="Listado de artistas">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artists.map((artist) => (
                <Card key={artist.id} className="glass-card hover:border-primary/50 transition-all shadow-2xl rounded-xl group interactive-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Link
                        href={`/artista/${artist.slug}`}
                        className="hover:underline flex items-center gap-2 text-xl font-semibold text-foreground group-hover:text-primary transition-colors"
                      >
                        {artist.name}
                        {artist.verified && (
                          <span title="Artista verificado">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          </span>
                        )}
                      </Link>
                      {/* Visualizaciones */}
                      {artist.views !== undefined && artist.views > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <Eye className="w-4 h-4" />
                          <span>{artist.views.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Información adicional */}
                    <div className="space-y-3 mb-4">
                      {/* Ubicación y año */}
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {(artist.country || artist.city) && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>
                              {[artist.city, artist.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                        {artist.foundation_year && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{artist.foundation_year}</span>
                          </div>
                        )}
                        {artist.genre && (
                          <div className="flex items-center gap-1">
                            <Music2 className="w-3 h-3" />
                            <span>{artist.genre}</span>
                          </div>
                        )}
                      </div>

                      <p 
                        className="text-muted-foreground overflow-hidden leading-relaxed"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical' as any,
                          lineHeight: '1.4em',
                          maxHeight: '4.2em'
                        }}
                      >
                        {artist.biography || 'Información del artista no disponible.'}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Enlaces a redes sociales y plataformas */}
                      <div className="flex flex-wrap gap-2">
                        {artist.website_url && (
                          <a
                            href={artist.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-md border border-emerald-500/30"
                          >
                            <Globe className="w-3 h-3" />
                            Sitio Web
                          </a>
                        )}
                        {artist.facebook_url && (
                          <a
                            href={artist.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded-md border border-blue-500/30"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Facebook
                          </a>
                        )}
                        {artist.instagram_url && (
                          <a
                            href={artist.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-300 text-xs font-medium transition-colors bg-pink-500/10 hover:bg-pink-500/20 px-2 py-1 rounded-md border border-pink-500/30"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Instagram
                          </a>
                        )}
                        {artist.twitter_url && (
                          <a
                            href={artist.twitter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 text-xs font-medium transition-colors bg-sky-500/10 hover:bg-sky-500/20 px-2 py-1 rounded-md border border-sky-500/30"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Twitter
                          </a>
                        )}
                        {artist.youtube_url && (
                          <a
                            href={artist.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 text-xs font-medium transition-colors bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded-md border border-red-500/30"
                          >
                            <ExternalLink className="w-3 h-3" />
                            YouTube
                          </a>
                        )}
                        {artist.spotify_url && (
                          <a
                            href={artist.spotify_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-green-400 hover:text-green-300 text-xs font-medium transition-colors bg-green-500/10 hover:bg-green-500/20 px-2 py-1 rounded-md border border-green-500/30"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Spotify
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Link href={`/artista/${artist.slug}`} className="flex-1">
                          <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 shadow-lg transition-all group-hover:scale-[1.02]">
                            Ver Perfil
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function ArtistsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-24 w-24 border-b-4 border-primary mx-auto"></div>
          </div>
          <p className="mt-6 text-foreground font-medium">Cargando artistas...</p>
        </div>
      </div>
    }>
      <ArtistsContent />
    </Suspense>
  );
}
