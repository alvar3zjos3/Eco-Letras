'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Facebook,
  Instagram,
  Twitter,
  Music, 
  Eye,
  Key,
  Clock,
  CheckCircle,
  MapPin,
  Globe,
  Music2,
  Calendar,
  Youtube,
  Heart,
  AlertCircle,
  GitBranch
} from 'lucide-react';
import { artistsService } from '@/lib/api-service';
import { Artist, Song } from '@/types';

/**
 * Trunca un texto sin cortar palabras.
 */
function truncateByWords(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  // ✅ CORREGIDO - Usar substring en lugar de substr (deprecado)
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  // ✅ CORREGIDO - Manejar caso donde no hay espacios
  if (lastSpaceIndex === -1) {
    return text.substring(0, maxLength) + '...';
  }
  
  return truncated.substring(0, lastSpaceIndex) + '...';
}

/**
 * Página de detalle de artista.
 * El SEO dinámico debe manejarse en layout.tsx o generateMetadata (componente de servidor).
 */
export default function ArtistPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [artist, setArtist] = useState<(Artist & { songs: Song[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const hasLoadedRef = useRef<string | null>(null);
  const isLoadingRef = useRef<boolean>(false);

  // Carga el artista al montar o cambiar el slug
  useEffect(() => {
    if (slug && hasLoadedRef.current !== slug && !isLoadingRef.current) {
      hasLoadedRef.current = slug;
      fetchArtist();
    }
  }, [slug]);

  /**
   * Obtiene los datos del artista por slug.
   */
  const fetchArtist = async () => {
    if (isLoadingRef.current) return; // Evitar llamadas duplicadas
    
    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      setError('');
      
      // Verificar si ya se contó la vista en esta sesión
      const viewedKey = `artist_viewed_${slug}`;
      const alreadyViewed = sessionStorage.getItem(viewedKey);
      
      const artistData = await artistsService.getArtistBySlug(slug);
      setArtist(artistData);
      
      // Marcar como visto en esta sesión para evitar conteos adicionales
      if (!alreadyViewed) {
        sessionStorage.setItem(viewedKey, 'true');
      }
    } catch (error: any) {
      // ✅ MEJORADO - Manejo de errores más específico
      if (error.response?.status === 404) {
        setError('Artista no encontrado');
      } else if (error.response?.status >= 500) {
        setError('Error del servidor. Inténtalo más tarde.');
      } else {
        setError('Error al cargar el artista');
      }
      console.error('Error fetching artist:', error);
      // Resetear el ref para permitir reintento
      hasLoadedRef.current = null;
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
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
          <p className="mt-6 text-foreground font-medium">Cargando artista...</p>
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="w-full min-h-screen text-foreground overflow-hidden smooth-transition fade-in">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
          <Card className="glass-card border border-red-500/30 shadow-2xl">
            <CardContent className="text-center py-12">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
                <Music className="relative w-16 h-16 text-red-400 mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-4">
                {error || 'Artista no encontrado'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {error === 'Artista no encontrado' 
                  ? 'El artista que buscas no existe o ha sido eliminado.'
                  : 'Ha ocurrido un error al cargar la información del artista.'
                }
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/artistas">
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a Artistas
                  </Button>
                </Link>
                {error && error !== 'Artista no encontrado' && (
                  <Button 
                    variant="outline" 
                    onClick={fetchArtist}
                    className="border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50"
                  >
                    Reintentar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalLikes = artist?.songs?.reduce((total, song) => total + (song.likes_count || 0), 0) || 0;

  return (
    <div className="w-full min-h-screen text-foreground overflow-hidden smooth-transition fade-in">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
        {/* Navegación */}
        <div className="mb-8">
          <Link href="/artistas">
            <Button 
              variant="outline" 
              className="mb-4 border-primary/50 text-foreground hover:bg-primary/20 hover:border-primary/70 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Artistas
            </Button>
          </Link>
        </div>

        {/* Información del artista */}
        <section aria-label="Información del artista">
          <Card className="mb-8 glass-card shadow-2xl interactive-hover">
            <CardHeader>
              <CardTitle className="text-3xl sm:text-4xl mb-4 flex items-center gap-2 text-gradient leading-tight">
                {artist?.name}
                {artist?.verified && (
                  <span title="Artista verificado">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </span>
                )}
                {artist?.is_active === false && (
                  <span title="Artista inactivo">
                    <AlertCircle className="w-6 h-6 text-orange-400" />
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-base">
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  {/* Estadísticas */}
                  <div className="flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-full border border-purple-400/30">
                    <Music className="w-4 h-4 text-purple-400" />
                    <span className="font-medium text-sm">
                      {artist?.songs?.length || 0} canción{(artist?.songs?.length || 0) !== 1 ? 'es' : ''}
                    </span>
                  </div>
                  {(artist?.views || 0) > 0 && (
                    <div className="flex items-center gap-2 bg-cyan-500/20 px-4 py-2 rounded-full border border-cyan-400/30">
                      <Eye className="w-4 h-4 text-cyan-400" />
                      <span className="font-medium">
                        {(artist.views || 0).toLocaleString()} visitas al perfil
                      </span>
                    </div>
                  )}
                  {totalLikes > 0 && (
                    <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full border border-red-400/30">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="font-medium">
                        {totalLikes?.toLocaleString()} likes totales
                      </span>
                    </div>
                  )}
                  {/* Información adicional */}
                  {artist?.genre && (
                    <div className="flex items-center gap-2 bg-indigo-500/20 px-4 py-2 rounded-full border border-indigo-400/30">
                      <Music2 className="w-5 h-5 text-indigo-400" />
                      <span className="font-medium">{artist.genre}</span>
                    </div>
                  )}
                  {(artist?.city || artist?.country) && (
                    <div className="flex items-center gap-2 bg-pink-500/20 px-4 py-2 rounded-full border border-pink-400/30">
                      <MapPin className="w-5 h-5 text-pink-400" />
                      <span className="font-medium">{[artist.city, artist.country].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                  {artist?.foundation_year && (
                    <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-400/30">
                      <Calendar className="w-5 h-5 text-green-400" />
                      <span className="font-medium">Desde {artist.foundation_year}</span>
                    </div>
                  )}
                  {artist?.created_at && (
                    <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-full border border-yellow-400/30">
                      <Calendar className="w-5 h-5 text-yellow-400" />
                      <span className="font-medium">
                        En la plataforma desde {new Date(artist.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {artist?.description && (
                  <div>
                    <h3 className="font-medium text-xl mb-3 text-primary">Descripción</h3>
                    <p className="text-muted-foreground leading-relaxed text-base">
                      {artist.description}
                    </p>
                  </div>
                )}
                {artist?.biography && (
                  <div>
                    <h3 className="font-medium text-xl mb-3 text-primary">Biografía</h3>
                    <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-line">
                      {artist.biography}
                    </p>
                  </div>
                )}
                {/* Enlaces a redes sociales */}
                {(artist?.website_url || artist?.facebook_url || artist?.instagram_url || artist?.twitter_url || artist?.youtube_url || artist?.spotify_url) && (
                  <div>
                    <h4 className="font-medium mb-4 text-xl text-primary">Enlaces</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {artist?.website_url && (
                        <a
                          href={artist.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 glass-card hover:border-primary/50 transition-all duration-300 p-3 rounded-lg text-foreground hover:text-primary interactive-hover"
                        >
                          <Globe className="w-5 h-5" />
                          Sitio Web Oficial
                        </a>
                      )}
                      {artist?.facebook_url && (
                        <a
                          href={artist.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 p-3 rounded-lg text-blue-400 hover:text-blue-300"
                        >
                          <Facebook className="w-5 h-5" />
                          Facebook
                        </a>
                      )}
                      {artist?.instagram_url && (
                        <a
                          href={artist.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-400/30 hover:border-pink-400/50 transition-all duration-300 p-3 rounded-lg text-pink-400 hover:text-pink-300"
                        >
                          <Instagram className="w-5 h-5" />
                          Instagram
                        </a>
                      )}
                      {artist?.twitter_url && (
                        <a
                          href={artist.twitter_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/30 hover:border-sky-400/50 transition-all duration-300 p-3 rounded-lg text-sky-400 hover:text-sky-300"
                        >
                          <Twitter className="w-5 h-5" />
                          Twitter
                        </a>
                      )}
                      {artist?.youtube_url && (
                        <a
                          href={artist.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 hover:border-red-400/50 transition-all duration-300 p-3 rounded-lg text-red-400 hover:text-red-300"
                        >
                          <Youtube className="w-5 h-5" />
                          YouTube
                        </a>
                      )}
                      {artist?.spotify_url && (
                        <a
                          href={artist.spotify_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 hover:border-green-400/50 transition-all duration-300 p-3 rounded-lg text-green-400 hover:text-green-300"
                        >
                          <Music2 className="w-5 h-5" />
                          Spotify
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Canciones del artista */}
        <section aria-label={`Canciones de ${artist.name}`}>
          <Card className="glass-card shadow-2xl interactive-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg"></div>
                  <Music className="relative w-5 h-5" />
                </div>
                Canciones de {artist?.name}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                {artist?.songs?.length || 0} canción{(artist?.songs?.length || 0) !== 1 ? 'es' : ''} disponible{(artist?.songs?.length || 0) !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!artist?.songs?.length ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                    <Music className="relative w-12 h-12 mx-auto text-primary" />
                  </div>
                  <p className="text-lg">Este artista aún no tiene canciones registradas.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {artist.songs.map((song) => (
                    <Card key={song.id} className="glass-card hover:border-primary/50 transition-all duration-300 shadow-xl rounded-xl group interactive-hover">
                      <CardHeader>
                        <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                          {song?.title}
                        </CardTitle>
                        <CardDescription>
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 text-muted-foreground bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-400/30">
                              <Eye className="w-3 h-3 text-blue-400" />
                              <span className="font-medium">
                                {song.views?.toLocaleString() || '0'} vistas
                              </span>
                            </div>
                            {(song.likes_count || 0) > 0 && (
                              <div className="flex items-center gap-2 text-muted-foreground bg-red-500/10 px-3 py-1.5 rounded-full border border-red-400/30">
                                <Heart className="w-3 h-3 text-red-400" />
                                <span className="font-medium">
                                  {song.likes_count?.toLocaleString()} likes
                                </span>
                              </div>
                            )}
                            {song.chords_lyrics && (
                              <div className="flex items-center gap-2 text-muted-foreground bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-400/30">
                                <GitBranch className="w-3 h-3 text-purple-400" />
                                <span className="font-medium text-xs">
                                  Acordes disponibles
                                </span>
                              </div>
                            )}
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-3">
                            {song?.key_signature && (
                              <div className="flex items-center gap-1 bg-blue-500/20 px-3 py-1.5 rounded-full border border-blue-400/30">
                                <Key className="w-3 h-3 text-blue-400" />
                                <Badge variant="outline" className="text-xs border-blue-400/50 text-blue-300 bg-transparent">
                                  {song.key_signature}
                                </Badge>
                              </div>
                            )}
                            {song?.genre && (
                              <Badge variant="secondary" className="text-xs bg-purple-500/30 text-purple-300 border-0 px-3 py-1.5">
                                {song.genre}
                              </Badge>
                            )}
                            {song?.tempo && (
                              <div className="flex items-center gap-1 bg-green-500/20 px-3 py-1.5 rounded-full border border-green-400/30">
                                <Clock className="w-3 h-3 text-green-400" />
                                <Badge variant="outline" className="text-xs border-green-400/50 text-green-300 bg-transparent">
                                  {song.tempo}
                                </Badge>
                              </div>
                            )}
                            {song?.created_at && (
                              <div className="flex items-center gap-1 bg-orange-500/20 px-3 py-1.5 rounded-full border border-orange-400/30">
                                <Calendar className="w-3 h-3 text-orange-400" />
                                <Badge variant="outline" className="text-xs border-orange-400/50 text-orange-300 bg-transparent">
                                  {new Date(song.created_at).toLocaleDateString()}
                                </Badge>
                              </div>
                            )}
                          </div>
                          <p 
                            className="text-sm text-muted-foreground overflow-hidden leading-relaxed"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical' as any,
                              lineHeight: '1.4em',
                              maxHeight: '4.2em'
                            }}
                          >
                            {truncateByWords(song.lyrics || '', 120)}
                          </p>
                          <Link href={`/cancion/${song?.slug}`}>
                            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 shadow-lg transition-all group-hover:scale-105">
                              Ver Canción
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

