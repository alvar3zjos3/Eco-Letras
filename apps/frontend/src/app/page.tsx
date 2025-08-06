'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Users, TrendingUp, CheckCircle, Clock, Heart, Globe, ExternalLink } from 'lucide-react';
import { songsService, artistsService } from '@/lib/api-service';
import { Song, Artist } from '@/types';

/**
 * Devuelve un resumen truncado de un texto sin cortar palabras.
 */
function getSummary(text: string, maxLength: number) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  const trimmed = text.substring(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');
  return trimmed.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...';
}

/**
 * Formatea el número para mostrar rangos cuando hay suficientes elementos.
 * - Menos de 10: muestra el número exacto
 * - 10 o más: muestra la decena redondeada hacia abajo + "+"
 */
function formatCount(count: number): string {
  if (count < 10) {
    return count.toString();
  }

  const roundedDown = Math.floor(count / 10) * 10;
  return `${roundedDown}+`;
}

/**
 * Página principal (Home) - Componente cliente.
 * El SEO se maneja en layout.tsx (no usar <Head> aquí).
 */
export default function HomePage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [totalSongs, setTotalSongs] = useState<number>(0);
  const [totalArtists, setTotalArtists] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Loader inicial para UX consistente
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Carga inicial de canciones y artistas destacados
  useEffect(() => {
    if (isInitialLoading) return;
    const fetchData = async () => {
      try {
        const [songsData, artistsData, songsCount, artistsStats] = await Promise.all([
          songsService.getSongs({ limit: 6 }),
          artistsService.getArtists({ limit: 6 }),
          songsService.getSongCount(),
          artistsService.getArtistStats()
        ]);
        setSongs(songsData || []);
        setArtists(artistsData || []);
        setTotalSongs(songsCount || 0);
        setTotalArtists(artistsStats?.total_artists || 0);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
        setError('No se pudieron cargar los datos. Intenta de nuevo más tarde.');
        setSongs([]);
        setArtists([]);
        setTotalSongs(0);
        setTotalArtists(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isInitialLoading]);

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-32 w-32 border-b-4 border-primary mx-auto" style={{ animation: 'spin 1s linear infinite' }}></div>
          </div>
          <p className="mt-6 text-foreground font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-32 w-32 border-b-4 border-primary mx-auto" style={{ animation: 'spin 1s linear infinite' }}></div>
          </div>
          <p className="mt-6 text-foreground font-medium">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center glass-card p-8 rounded-xl fade-in">
          <p className="text-destructive font-semibold text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen text-foreground smooth-transition overflow-hidden fade-in">
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 pt-16 px-4 slide-up">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-gradient">
            Bienvenido a Eco Iglesia Letras
          </h1>
          <p className="text-xl lg:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Encuentra letras, acordes y tablaturas de tus canciones cristianas favoritas
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16 px-4 md:px-12 lg:px-32">
          <Card className="glass-card shadow-2xl rounded-xl w-full interactive-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Total Canciones</CardTitle>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 smooth-transition"></div>
                <Music className="relative h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">{formatCount(totalSongs)}</div>
              <p className="text-sm text-muted-foreground">
                Canciones disponibles
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-2xl rounded-xl w-full interactive-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Artistas</CardTitle>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 smooth-transition"></div>
                <Users className="relative h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">{formatCount(totalArtists)}</div>
              <p className="text-sm text-muted-foreground">
                Artistas registrados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Songs */}
        <section className="mb-16 px-4 md:px-12 lg:px-32" aria-label="Canciones recientes">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-foreground flex items-center">
              <div className="w-3 h-3 bg-primary rounded-full mr-3 animate-pulse"></div>
              Canciones Recientes
            </h2>
            <Link href="/canciones">
              <Button variant="outline" className="border-primary/50 text-foreground hover:bg-primary/20 hover:border-primary glass-card">
                Ver todas
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {songs.map((song) => (
              <div
                key={song.id}
                className="glass-card hover:border-primary/50 transition-all shadow-2xl rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground mb-2 truncate">
                      {song.title}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Music className="w-4 h-4" />
                      <span>{song.artist?.name || 'Artista desconocido'}</span>
                    </div>
                  </div>
                </div>

                {/* Badges informativos */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {song.genre && (
                    <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded-md border border-purple-500/30 font-medium">
                      {song.genre}
                    </span>
                  )}
                  {song.key_signature && (
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md border border-blue-500/30 font-medium">
                      {song.key_signature}
                    </span>
                  )}
                  {song.tempo && (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-md border border-green-500/30 font-medium">
                      <Clock className="w-3 h-3" />
                      {song.tempo} BPM
                    </span>
                  )}
                </div>

                {/* Preview de letras */}
                {song.lyrics && (
                  <div className="mb-4">
                    <p
                      className="text-muted-foreground text-sm leading-relaxed overflow-hidden"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical' as any,
                        lineHeight: '1.4em',
                        maxHeight: '4.2em'
                      }}
                    >
                      {getSummary(song.lyrics, 100)}
                    </p>
                  </div>
                )}

                {/* Información adicional */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {song.likes_count !== undefined && (
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{song.likes_count}</span>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/cancion/${song.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-primary/10 cursor-pointer"
                  >
                    Ver canción →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Artists */}
        <section className="pb-16 px-4 md:px-12 lg:px-32" aria-label="Artistas destacados">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-foreground flex items-center">
              <div className="w-3 h-3 bg-primary rounded-full mr-3 animate-pulse"></div>
              Artistas Destacados
            </h2>
            <Link href="/artistas">
              <Button variant="outline" className="border-primary/50 text-foreground hover:bg-primary/20 hover:border-primary glass-card">
                Ver todos
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="glass-card hover:border-primary/50 transition-all shadow-2xl rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    {artist.name}
                    {artist.verified && (
                      <span title="Artista verificado">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Biografía */}
                <div className="mb-4">
                  <p
                    className="text-muted-foreground overflow-hidden leading-relaxed text-sm"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical' as any,
                      lineHeight: '1.4em',
                      maxHeight: '4.2em'
                    }}
                  >
                    {getSummary(artist.biography || 'Información del artista no disponible.', 100)}
                  </p>
                </div>

                {/* Enlaces a redes sociales */}
                <div className="flex gap-3 mb-4">
                  {artist.website_url && (
                    <a
                      href={artist.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-300 text-xs font-medium transition-colors"
                    >
                      <Globe className="w-3 h-3" />
                      Web
                    </a>
                  )}
                  {artist.facebook_url && (
                    <a
                      href={artist.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-400 text-xs font-medium transition-colors"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Facebook
                    </a>
                  )}
                  {artist.instagram_url && (
                    <a
                      href={artist.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-pink-500 hover:text-pink-400 text-xs font-medium transition-colors"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Instagram
                    </a>
                  )}
                  {artist.youtube_url && (
                    <a
                      href={artist.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-red-500 hover:text-red-400 text-xs font-medium transition-colors"
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
                      className="inline-flex items-center gap-1 text-green-500 hover:text-green-400 text-xs font-medium transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Spotify
                    </a>
                  )}
                </div>

                {/* Información adicional */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {artist.genre && (
                      <div className="flex items-center gap-1">
                        <Music className="w-3 h-3" />
                        <span>{artist.genre}</span>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/artista/${artist.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer px-3 py-2 rounded-md hover:bg-primary/10"
                  >
                    Ver artista →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

