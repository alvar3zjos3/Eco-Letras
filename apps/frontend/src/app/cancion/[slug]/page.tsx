'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Music, 
  User, 
  Clock, 
  Key, 
  Youtube, 
  Music2,
  CheckCircle,
  Heart,
  HeartOff,
  Eye,
  EyeOff,
  Type,
  Download,
  Share2,
  ThumbsUp,
  Calendar,
  Languages,
  Gauge,
  Guitar,
  Globe,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { songsService } from '@/lib/api-service';
import { Song, SongSection } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { likesService } from '@/lib/api-service';

export default function SongPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [chordsVisible, setChordsVisible] = useState(false);
  const [showChordsOnly, setShowChordsOnly] = useState(true); // Se actualizará cuando se cargue la canción
  const [currentKey, setCurrentKey] = useState<string>('');
  const [transposedContent, setTransposedContent] = useState<string>('');
  const [availableKeys, setAvailableKeys] = useState<{value: string, label: string}[]>([]);

  useEffect(() => {
    if (slug) {
      fetchSong();
    }
    // eslint-disable-next-line
  }, [slug]);

  useEffect(() => {
    if (user && song) {
      checkLikeStatus();
    }
    // eslint-disable-next-line
  }, [user, song]);

  useEffect(() => {
    // Cargar tonalidades disponibles
    fetchAvailableKeys();
  }, []);

  useEffect(() => {
    // Inicializar tono actual
    if (song?.key_signature) {
      setCurrentKey(song.key_signature);
    }
  }, [song]);

  useEffect(() => {
    // Determinar el modo por defecto basado en si la canción tiene acordes
    if (song) {
      const hasChords = Boolean(
        song.chords_lyrics?.trim() || 
        (song.sections && song.sections.some((section: any) => section.chords_lyrics?.trim()))
      );
      
      // Si tiene acordes, mostrar acordes por defecto
      // Si no tiene acordes, mostrar solo letras por defecto
      setShowChordsOnly(hasChords);
    }
  }, [song]);

  const fetchSong = async () => {
    try {
      setError('');
      const songData = await songsService.getSongBySlug(slug);
      setSong(songData);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError('Canción no encontrada');
      } else if (error.response?.status >= 500) {
        setError('Error del servidor. Inténtalo más tarde.');
      } else {
        setError('Error al cargar la canción');
      }
      console.error('Error fetching song:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableKeys = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/songs/keys/available');
      const data = await response.json();
      setAvailableKeys(data.keys);
    } catch (error) {
      console.error('Error fetching available keys:', error);
    }
  };

  const checkLikeStatus = async () => {
    if (!song || !isAuthenticated) {
      console.log('No se puede verificar like status: song =', !!song, 'isAuthenticated =', isAuthenticated);
      return;
    }
    
    try {
      console.log('Verificando estado de like para canción:', song.id);
      const token = localStorage.getItem('access_token');
      console.log('Token para verificación existe:', !!token);
      
      const response = await fetch(`http://localhost:8000/api/likes/check/${song.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Check like response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Check like response data:', data);
        setIsLiked(data.is_liked);
      } else {
        console.error('Error checking like status:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated || !song) {
      console.log('No se puede hacer like: isAuthenticated =', isAuthenticated, 'song =', !!song);
      return;
    }
    
    console.log('Iniciando toggle de like para canción:', song.id);
    setLikeLoading(true);
    
    try {
      const token = localStorage.getItem('access_token');
      console.log('Token existe:', !!token);
      
      const response = await fetch(`http://localhost:8000/api/likes/song/${song.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        setIsLiked(data.is_liked);
        // Actualizar contador de likes en la canción
        setSong(prev => prev ? { 
          ...prev, 
          likes: data.likes_count
        } : null);
      } else {
        console.error('Error response:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error data:', errorData);
      }
    } catch (error) {
      console.error('Error handling like:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleKeyChange = async (newKey: string) => {
    if (!song || newKey === currentKey) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/songs/${song.id}/transpose?target_key=${newKey}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransposedContent(data.chords_lyrics);
        setCurrentKey(newKey);
      }
    } catch (error) {
      console.error('Error transposing song:', error);
    }
  };

  const transposeUp = () => {
    if (availableKeys.length === 0) return;
    const currentIndex = availableKeys.findIndex(k => k.value === currentKey);
    const nextIndex = (currentIndex + 1) % availableKeys.length;
    const nextKey = availableKeys[nextIndex];
    if (nextKey) {
      handleKeyChange(nextKey.value);
    }
  };

  const transposeDown = () => {
    if (availableKeys.length === 0) return;
    const currentIndex = availableKeys.findIndex(k => k.value === currentKey);
    const prevIndex = currentIndex === 0 ? availableKeys.length - 1 : currentIndex - 1;
    const prevKey = availableKeys[prevIndex];
    if (prevKey) {
      handleKeyChange(prevKey.value);
    }
  };

  const getLyricsOnly = async () => {
    if (!song) return '';
    
    try {
      const response = await fetch(`http://localhost:8000/api/songs/${song.id}/lyrics-only`);
      if (response.ok) {
        const data = await response.json();
        return data.lyrics_only;
      }
    } catch (error) {
      console.error('Error getting lyrics only:', error);
    }
    
    return song.lyrics || '';
  };

  // Tipo para secciones procesadas
  interface ProcessedSection {
    type: string;
    title: string;
    text: string;
    chords_lyrics?: string;
    hasChords: boolean;
  }

  // Procesar secciones para mostrar
  const getProcessedSections = (): ProcessedSection[] => {
    const processedSections: ProcessedSection[] = [];

    if (song?.sections && Array.isArray(song.sections) && song.sections.length > 0) {
      // Usar secciones estructuradas
      song.sections.forEach((section: SongSection, index: number) => {
        const hasChords = Boolean(section.chords_lyrics && section.chords_lyrics.trim());
        processedSections.push({
          type: section.type || 'verso',
          title: getSectionTitle(section.type || 'verso', index),
          text: section.text || '',
          chords_lyrics: section.chords_lyrics || '',
          hasChords
        });
      });
    } else if (song?.lyrics) {
      // Fallback a letra simple sin secciones
      const hasChords = Boolean(song.chords_lyrics && song.chords_lyrics.trim());
      processedSections.push({
        type: 'letra',
        title: 'Letra',
        text: song.lyrics,
        chords_lyrics: song.chords_lyrics || '',
        hasChords
      });
    }

    return processedSections;
  };

  // Función para obtener el título de la sección
  const getSectionTitle = (type: string, index: number): string => {
    const sectionTitles: Record<string, string> = {
      intro: 'Intro',
      verso: `Verso ${Math.floor(index / 2) + 1}`,
      precoro: 'Pre-Coro',
      coro: 'Coro',
      puente: 'Puente',
      repetir: 'Repetir',
      refrain: 'Refrain',
      final: 'Final',
      instrumental: 'Instrumental',
      solo: 'Solo'
    };
    return sectionTitles[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Función para obtener el color de la sección
  const getSectionColor = (type: string): string => {
    const colors: Record<string, string> = {
      intro: 'border-yellow-400 bg-yellow-500/10',
      verso: 'border-blue-400 bg-blue-500/10',
      precoro: 'border-orange-400 bg-orange-500/10',
      coro: 'border-red-400 bg-red-500/10',
      puente: 'border-green-400 bg-green-500/10',
      repetir: 'border-purple-400 bg-purple-500/10',
      refrain: 'border-pink-400 bg-pink-500/10',
      final: 'border-gray-400 bg-gray-500/10',
      instrumental: 'border-indigo-400 bg-indigo-500/10',
      solo: 'border-teal-400 bg-teal-500/10',
      letra: 'border-gray-300 bg-gray-500/10'
    };
    return colors[type] || 'border-gray-300 bg-gray-500/10';
  };

  // Renderizar letra con acordes alternados
  const renderChordsLyrics = (chordsLyrics: string): React.ReactElement => {
    const lines = chordsLyrics.split('\n');
    const result: React.ReactElement[] = [];

    for (let i = 0; i < lines.length; i += 2) {
      const chordLine = lines[i] || '';
      const lyricLine = lines[i + 1] || '';

      result.push(
        <div key={i} className="mb-3">
          {/* Línea de acordes */}
          {chordLine.trim() && (
            <div className="text-primary font-mono text-sm font-bold mb-1">
              {chordLine}
            </div>
          )}
          {/* Línea de letra */}
          {lyricLine.trim() && (
            <div className="text-foreground leading-relaxed">
              {lyricLine}
            </div>
          )}
        </div>
      );
    }

    return <div>{result}</div>;
  };

  // Renderizar letra simple (sin acordes)
  const renderSimpleLyrics = (text: string): React.ReactElement => {
    return (
      <div className="whitespace-pre-line text-foreground leading-relaxed">
        {text}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-24 w-24 border-b-4 border-primary mx-auto"></div>
          </div>
          <p className="mt-6 text-foreground font-medium">Cargando canción...</p>
        </div>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="w-full min-h-screen text-foreground overflow-hidden smooth-transition fade-in">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
          <Card className="glass-card shadow-2xl">
            <CardContent className="text-center py-12">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
                <Music className="relative w-16 h-16 text-red-400 mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-4">
                {error || 'Canción no encontrada'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {error === 'Canción no encontrada' 
                  ? 'La canción que buscas no existe o ha sido eliminada.'
                  : 'Ha ocurrido un error al cargar la canción.'
                }
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/canciones">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 shadow-lg">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a Canciones
                  </Button>
                </Link>
                {error && error !== 'Canción no encontrada' && (
                  <Button 
                    variant="outline" 
                    onClick={fetchSong}
                    className="border-border text-foreground hover:bg-muted interactive-hover"
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

  return (
    <div className="w-full min-h-screen text-foreground overflow-hidden smooth-transition fade-in">
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
        {/* Navegación */}
        <div className="mb-8">
          <Link href="/canciones">
            <Button 
              variant="outline" 
              className="mb-4 border-primary/50 text-foreground hover:bg-primary/20 hover:border-primary interactive-hover"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Canciones
            </Button>
          </Link>
        </div>

        {/* Información principal de la canción */}
        <section aria-label="Información de la canción">
          <Card className="mb-6 glass-card shadow-2xl">
            <CardHeader>
              {/* Título y artista */}
              <div className="mb-4">
                <CardTitle className="text-3xl mb-2 text-gradient">
                  {song?.title}
                </CardTitle>
                <CardDescription className="text-lg">
                  por{' '}
                  <Link 
                    href={`/artista/${song?.artist?.slug}`}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    {song?.artist?.name}
                  </Link>
                </CardDescription>
              </div>

              {/* Metadatos principales */}
              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
                {song?.genre && (
                  <span className="flex items-center gap-1">
                    <Music className="w-4 h-4" />
                    {song.genre}
                  </span>
                )}
                {song?.tempo && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {song.tempo}
                  </span>
                )}
                {song?.views !== undefined && song.views > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {song.views.toLocaleString()} vistas
                  </span>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-3 mb-6">
                {isAuthenticated ? (
                  <>
                    <Button
                      variant={isLiked ? "secondary" : "outline"}
                      size="sm"
                      onClick={handleLike}
                      disabled={likeLoading}
                      className={isLiked 
                        ? "bg-pink-500/20 border-pink-400/50 text-pink-300 hover:bg-pink-500/30" 
                        : "border-border text-foreground hover:bg-muted interactive-hover"
                      }
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      {isLiked ? "Me Gusta" : "Dar Me Gusta"}
                    </Button>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    <Link href="/login" className="text-primary hover:underline">
                      Inicia sesión
                    </Link> para dar me gusta
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.share?.({ title: song?.title, url: window.location.href })}
                  className="border-border text-foreground hover:bg-muted interactive-hover"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir
                </Button>
                {song?.youtube_url && (
                  <a 
                    href={song.youtube_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-400/50 text-red-400 hover:bg-red-500/20 hover:border-red-400"
                    >
                      <Youtube className="w-4 h-4 mr-2" />
                      YouTube
                    </Button>
                  </a>
                )}
              </div>

              {/* Selector de tono y modo de visualización */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  {/* Controles de tono - solo mostrar si hay acordes */}
                  {(() => {
                    const hasChords = Boolean(
                      song?.chords_lyrics?.trim() || 
                      (song?.sections && song.sections.some((section: any) => section.chords_lyrics?.trim()))
                    );
                    
                    return hasChords ? (
                      <>
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium">Tono:</label>
                          <select 
                            value={currentKey} 
                            onChange={(e) => handleKeyChange(e.target.value)}
                            className="bg-background border border-border rounded px-2 py-1 text-sm"
                          >
                            {availableKeys.map(key => (
                              <option key={key.value} value={key.value}>
                                {key.value}
                              </option>
                            ))}
                          </select>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1"
                            onClick={transposeUp}
                            title="Subir medio tono"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1"
                            onClick={transposeDown}
                            title="Bajar medio tono"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Tono actual: {currentKey || song?.key_signature || 'C'}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Esta canción solo contiene letras (sin acordes)
                      </div>
                    );
                  })()}
                </div>
                
                <div className="flex gap-2">
                  {/* Determinar si la canción tiene acordes */}
                  {(() => {
                    const hasChords = Boolean(
                      song?.chords_lyrics?.trim() || 
                      (song?.sections && song.sections.some((section: any) => section.chords_lyrics?.trim()))
                    );
                    
                    return (
                      <>
                        <Button 
                          variant={showChordsOnly ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowChordsOnly(true)}
                          disabled={!hasChords}
                          className={
                            showChordsOnly 
                              ? "bg-primary text-primary-foreground" 
                              : hasChords 
                                ? "border-border text-foreground hover:bg-muted" 
                                : "border-border text-muted-foreground cursor-not-allowed opacity-50"
                          }
                          title={!hasChords ? "Esta canción no tiene acordes disponibles" : "Ver acordes y letras"}
                        >
                          <Music className="w-4 h-4 mr-1" />
                          Acordes
                        </Button>
                        <Button 
                          variant={!showChordsOnly ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowChordsOnly(false)}
                          className={!showChordsOnly ? "bg-primary text-primary-foreground" : "border-border text-foreground hover:bg-muted"}
                        >
                          <Type className="w-4 h-4 mr-1" />
                          Solo Letras
                        </Button>
                      </>
                    );
                  })()}
                </div>
              </div>
            </CardHeader>
          </Card>
        </section>

        {/* Contenido de letras y acordes */}
        <section aria-label="Letras y Acordes">
          <Card className="mb-6 glass-card shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Music className="w-5 h-5" />
                {showChordsOnly ? 'Letras y Acordes' : 'Solo Letras'}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Tono actual: {currentKey || song?.key_signature || 'C'}
              </div>
            </CardHeader>
            <CardContent>
              {getProcessedSections().map((section, index) => (
                <div 
                  key={index} 
                  className={`mb-6 p-4 rounded-lg border-l-4 ${getSectionColor(section.type)}`}
                >
                  <h3 className="text-lg font-semibold mb-3 text-foreground capitalize">
                    {section.title}
                  </h3>
                  <div className="font-mono text-sm leading-relaxed">
                    {showChordsOnly ? (
                      // Mostrar acordes y letras
                      section.hasChords ? (
                        renderChordsLyrics(
                          currentKey !== (song?.key_signature || 'C') && transposedContent 
                            ? transposedContent 
                            : section.chords_lyrics || ''
                        )
                      ) : (
                        renderSimpleLyrics(section.text)
                      )
                    ) : (
                      // Mostrar solo letras
                      <div className="whitespace-pre-line text-foreground leading-relaxed">
                        {section.text}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Información del artista */}
        <section aria-label="Sobre el artista">
          <Card className="mb-6 glass-card shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary text-lg">
                Sobre el Artista
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-lg mb-2 flex items-center gap-2 text-foreground">
                    {song.artist?.name}
                    {song.artist?.verified && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {song.artist?.biography || 'Banda de música cristiana contemporánea originaria de Australia, parte de Hillsong Church.'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {song.artist?.website_url && (
                      <a
                        href={song.artist.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-md border border-emerald-500/30"
                      >
                        <Globe className="w-3 h-3" />
                        Sitio Web
                      </a>
                    )}
                    {song.artist?.facebook_url && (
                      <a
                        href={song.artist.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded-md border border-blue-500/30"
                      >
                        Facebook
                      </a>
                    )}
                    {song.artist?.instagram_url && (
                      <a
                        href={song.artist.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-300 text-xs font-medium transition-colors bg-pink-500/10 hover:bg-pink-500/20 px-2 py-1 rounded-md border border-pink-500/30"
                      >
                        Instagram
                      </a>
                    )}
                    {song.artist?.youtube_url && (
                      <a
                        href={song.artist.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 text-xs font-medium transition-colors bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded-md border border-red-500/30"
                      >
                        YouTube
                      </a>
                    )}
                    {song.artist?.spotify_url && (
                      <a
                        href={song.artist.spotify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-green-400 hover:text-green-300 text-xs font-medium transition-colors bg-green-500/10 hover:bg-green-500/20 px-2 py-1 rounded-md border border-green-500/30"
                      >
                        Spotify
                      </a>
                    )}
                  </div>
                </div>
                <Link href={`/artista/${song.artist?.slug}`}>
                  <Button 
                    variant="outline"
                    className="border-primary/50 text-foreground hover:bg-primary/20 hover:border-primary"
                  >
                    Ver más canciones
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

