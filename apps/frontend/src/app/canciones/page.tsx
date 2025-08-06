'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Music, 
  User, 
  Clock, 
  Filter, 
  X,
  Heart,
  Music2,
  Key
} from 'lucide-react';
import { songsService, artistsService } from '@/lib/api-service';
import { Song, Artist } from '@/types';
import { useAuth } from '@/context/AuthContext';

// Tipos para filtros
interface SongFilters {
  search: string;
  genre: string;
  artist: string;
  key_signature: string;
}

interface SongCardProps {
  song: Song;
  variant?: 'compact' | 'full';
}

function SongsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Estados
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtros
  const [filters, setFilters] = useState<SongFilters>({
    search: searchParams.get('search') || '',
    genre: searchParams.get('genre') || '',
    artist: searchParams.get('artist') || '',
    key_signature: searchParams.get('key') || ''
  });

  // Géneros únicos
  const genres = Array.from(new Set(songs.map(song => song.genre).filter(Boolean)));
  
  // Tonalidades únicas
  const keySignatures = Array.from(new Set(songs.map(song => song.key_signature).filter(Boolean)));

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setError('');
        const [songsData, artistsData] = await Promise.all([
          songsService.getSongs(),
          artistsService.getArtists()
        ]);
        
        setSongs(songsData);
        setArtists(artistsData);
      } catch (error: any) {
        console.error('Error loading data:', error);
        setError('Error al cargar las canciones');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Filtrar canciones
  useEffect(() => {
    let filtered = [...songs];

    // Filtro de búsqueda
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(searchTerm) ||
        song.artist?.name.toLowerCase().includes(searchTerm) ||
        song.lyrics?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro por género
    if (filters.genre) {
      filtered = filtered.filter(song => song.genre === filters.genre);
    }

    // Filtro por artista
    if (filters.artist) {
      filtered = filtered.filter(song => song.artist?.name === filters.artist);
    }

    // Filtro por tonalidad
    if (filters.key_signature) {
      filtered = filtered.filter(song => song.key_signature === filters.key_signature);
    }

    setFilteredSongs(filtered);
  }, [songs, filters]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
      updateURL({ ...filters, search: searchTerm });
    }, 300),
    [filters]
  );

  // Función debounce
  function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Actualizar URL con filtros
  const updateURL = (newFilters: SongFilters) => {
    const params = new URLSearchParams();
    
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.genre) params.set('genre', newFilters.genre);
    if (newFilters.artist) params.set('artist', newFilters.artist);
    if (newFilters.key_signature) params.set('key', newFilters.key_signature);
    
    const query = params.toString();
    router.push(`/canciones${query ? `?${query}` : ''}`, { scroll: false });
  };

  // Manejar cambio de filtro
  const handleFilterChange = (key: keyof SongFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  // Limpiar filtros
  const clearFilters = () => {
    const newFilters = { search: '', genre: '', artist: '', key_signature: '' };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  // Componente SongCard integrado
  const SongCard = ({ song, variant = 'full' }: SongCardProps) => {
    if (variant === 'compact') {
      return (
        <Link href={`/cancion/${song.slug}`}>
          <Card className="glass-card hover:border-primary/50 transition-all shadow-2xl rounded-xl group interactive-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate text-foreground group-hover:text-primary transition-colors mb-1">
                    {song.title}
                  </h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <User className="w-3 h-3" />
                    <span className="truncate">{song.artist?.name || 'Artista desconocido'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  {song.key_signature && (
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md border border-blue-500/30">
                      {song.key_signature}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      );
    }

    return (
      <Link href={`/cancion/${song.slug}`}>
        <Card className="glass-card hover:border-primary/50 transition-all shadow-2xl rounded-xl group interactive-hover">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2 truncate">
                  {song.title}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <User className="w-4 h-4" />
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
                <span className="inline-flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md border border-blue-500/30 font-medium">
                  <Key className="w-3 h-3" />
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
                  {song.lyrics.substring(0, 120)}...
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
                {song.views !== undefined && (
                  <div className="flex items-center gap-1">
                    <Music className="w-3 h-3" />
                    <span>{song.views}</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                Ver canción →
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
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
          <p className="mt-6 text-foreground font-medium">Cargando canciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen text-foreground overflow-hidden smooth-transition">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
          <Card className="glass-card border border-red-500/30 shadow-2xl">
            <CardContent className="text-center py-12">
              <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-6">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-red-500/30 rounded-full blur-lg"></div>
                  <Music className="relative w-16 h-16 text-red-400 mx-auto" />
                </div>
                <h3 className="text-red-400 text-lg font-semibold mb-2">Error al cargar</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-400"
                  variant="outline"
                >
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Filtros activos
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;
  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="w-full min-h-screen text-foreground overflow-hidden smooth-transition">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in slide-up">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-gradient">
            Canciones
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explora nuestra colección de música cristiana con letras y acordes
          </p>
        </div>

        {/* Filtros */}
        <section className="mb-12" aria-label="Filtros de búsqueda">
          <Card className="glass-card shadow-2xl interactive-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg"></div>
                  <Filter className="relative w-5 h-5" />
                </div>
                Filtros de Búsqueda
                {hasActiveFilters && (
                  <span className="ml-2 bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-medium">
                    {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Encuentra canciones específicas usando los filtros disponibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar canciones..."
                    defaultValue={filters.search}
                    onChange={(e) => debouncedSearch(e.target.value)}
                    className="pl-10 bg-background/50 border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary/20"
                  />
                </div>

                {/* Género */}
                <select
                  value={filters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  className="w-full p-2 bg-background/50 border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="" className="bg-card text-foreground">Todos los géneros</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre} className="bg-card text-foreground">{genre}</option>
                  ))}
                </select>

                {/* Artista */}
                <select
                  value={filters.artist}
                  onChange={(e) => handleFilterChange('artist', e.target.value)}
                  className="w-full p-2 bg-background/50 border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="" className="bg-card text-foreground">Todos los artistas</option>
                  {artists.map(artist => (
                    <option key={artist.id} value={artist.name} className="bg-card text-foreground">{artist.name}</option>
                  ))}
                </select>

                {/* Tonalidad */}
                <select
                  value={filters.key_signature}
                  onChange={(e) => handleFilterChange('key_signature', e.target.value)}
                  className="w-full p-2 bg-background/50 border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="" className="bg-card text-foreground">Todas las tonalidades</option>
                  {keySignatures.map(key => (
                    <option key={key} value={key} className="bg-card text-foreground">{key}</option>
                  ))}
                </select>
              </div>

              {/* Filtros activos */}
              {hasActiveFilters && (
                <div className="pt-4 border-t border-border">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {filters.search && (
                      <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md text-xs font-medium border border-blue-500/30">
                        Búsqueda: "{filters.search}"
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-blue-300 transition-colors" 
                          onClick={() => handleFilterChange('search', '')} 
                        />
                      </span>
                    )}
                    {filters.genre && (
                      <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-400 px-2 py-1 rounded-md text-xs font-medium border border-purple-500/30">
                        Género: {filters.genre}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-purple-300 transition-colors" 
                          onClick={() => handleFilterChange('genre', '')} 
                        />
                      </span>
                    )}
                    {filters.artist && (
                      <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-md text-xs font-medium border border-indigo-500/30">
                        Artista: {filters.artist}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-indigo-300 transition-colors" 
                          onClick={() => handleFilterChange('artist', '')} 
                        />
                      </span>
                    )}
                    {filters.key_signature && (
                      <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 px-2 py-1 rounded-md text-xs font-medium border border-green-500/30">
                        Tonalidad: {filters.key_signature}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-green-300 transition-colors" 
                          onClick={() => handleFilterChange('key_signature', '')} 
                        />
                      </span>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearFilters}
                    className="border-border text-muted-foreground hover:bg-background/80"
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Grid de canciones */}
        {filteredSongs.length > 0 ? (
          <section aria-label="Listado de canciones">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSongs.map((song) => (
                <SongCard 
                  key={song.id} 
                  song={song} 
                />
              ))}
            </div>
          </section>
        ) : (
          <Card className="glass-card shadow-2xl">
            <CardContent className="text-center py-12">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                <Music2 className="relative w-16 h-16 text-primary mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-4">
                No se encontraron canciones
              </h3>
              <p className="text-muted-foreground mb-6">
                {hasActiveFilters 
                  ? 'Intenta ajustar los filtros para ver más resultados.'
                  : 'No hay canciones disponibles en este momento.'
                }
              </p>
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="border-border text-muted-foreground hover:bg-background/80"
                >
                  Limpiar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


export default function SongsPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SongsPageContent />
    </Suspense>
  );
}

