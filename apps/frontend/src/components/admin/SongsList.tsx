'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import { Song, Artist } from '@/types';
import { songsService } from '@/lib/api-service';
import SongForm from './SongForm';

interface SongsListProps {
  songs: Song[];
  artists: Artist[];
  onRefresh: () => void;
}

export default function SongsList({ songs, artists, onRefresh }: SongsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingSongId, setDeletingSongId] = useState<number | null>(null);
  const [isLoadingSong, setIsLoadingSong] = useState(false);
  const [genreFilter, setGenreFilter] = useState('');
  const [keyFilter, setKeyFilter] = useState('');
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [availableKeys, setAvailableKeys] = useState<string[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>(songs); // Todas las canciones del servidor
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [filterNotification, setFilterNotification] = useState<string | null>(null);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSongs, setTotalSongs] = useState(0);
  const [itemsPerPage] = useState(10);

  // Bloquear scroll cuando el formulario está abierto
  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = '';
    };
  }, [showForm]);

  const filteredSongs = allSongs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.genre?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGenre = !genreFilter || song.genre === genreFilter;
    const matchesKey = !keyFilter || song.key_signature === keyFilter;

    return matchesSearch && matchesGenre && matchesKey;
  });

  // Calcular datos para paginación
  const totalPages = Math.ceil(filteredSongs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSongs = filteredSongs.slice(startIndex, endIndex);

  // Actualizar canciones cuando cambie la prop songs
  useEffect(() => {
    setAllSongs(songs);
    setTotalSongs(songs.length);
  }, [songs]);

  // Bloquear/desbloquear scroll cuando se abre/cierra el formulario
  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    // Cleanup
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [showForm]);

  // Función para recargar canciones con filtros desde el servidor
  const loadSongsWithFilters = async () => {
    setIsLoadingSongs(true);
    try {
      const params: any = {};

      if (searchTerm) params.search = searchTerm;
      if (genreFilter) params.genre = genreFilter;
      if (keyFilter) params.key_signature = keyFilter;

      const songsData = await songsService.getSongs(params);
      setAllSongs(songsData);
      setTotalSongs(songsData.length);
    } catch (error) {
      console.error('Error loading songs with filters:', error);
      // En caso de error, usar la lógica de filtrado local
    } finally {
      setIsLoadingSongs(false);
    }
  };

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, genreFilter, keyFilter]);

  // Debounce para búsqueda - recargar desde servidor después de 500ms de inactividad
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchTerm || genreFilter || keyFilter) {
        loadSongsWithFilters();
      } else {
        // Si no hay filtros, usar las canciones originales
        setAllSongs(songs);
        setTotalSongs(songs.length);
      }
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, genreFilter, keyFilter]); // Dependencias para el debounce

  // Cargar géneros y tonalidades disponibles
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const genres = await songsService.getGenres();
        const keys = await songsService.getKeySignatures();

        setAvailableGenres(genres);
        setAvailableKeys(keys);
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };
    loadFilters();
  }, []);

  const handleEdit = async (song: Song) => {
    setIsLoadingSong(true);
    try {
      const fullSong = await songsService.getSongById(song.id);
      setEditingSong(fullSong);
      setShowForm(true);
    } catch (error) {
      console.error('Error loading full song data:', error);
      setEditingSong(song);
      setShowForm(true);
    } finally {
      setIsLoadingSong(false);
    }
  };

  const handleNew = () => {
    setEditingSong(null);
    setShowForm(true);
  };

  const handleDelete = async (songId: number) => {
    setIsDeleting(true);
    setDeletingSongId(songId);
    try {
      console.log('Iniciando eliminación de canción:', songId);
      await songsService.deleteSong(songId);
      console.log('Canción eliminada exitosamente:', songId);

      // Actualizar la lista local inmediatamente
      setAllSongs(prevSongs => prevSongs.filter(song => song.id !== songId));
      // También refrescar desde el servidor
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting song:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Error al eliminar la canción';
      alert(`Error al eliminar la canción: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
      setDeletingSongId(null);
    }
  };

  const handleFormClose = (shouldRefresh: boolean = false) => {
    setShowForm(false);
    setEditingSong(null);

    if (shouldRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <Card className="glass-card interactive-hover">
        <CardHeader className="bg-gradient-to-r from-card/95 to-secondary/95 border-b border-border">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-gradient text-xl font-bold flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-primary to-primary/80 rounded-full"></div>
                Gestión de Canciones
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                Administra todas las canciones de la plataforma
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={handleNew} className="btn-gradient text-primary-foreground border-0 shadow-lg shine-effect">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Canción
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 bg-gradient-to-b from-card to-secondary/50">
          <div className="space-y-4 mb-6">
            {/* Búsqueda principal */}
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar canciones por título, artista o género..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm border-2 border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-input/80 smooth-transition"
                aria-label="Buscar canciones por título, artista o género"
              />
            </div>

            {/* Filtros avanzados */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="genre-filter" className="text-sm font-medium text-foreground">
                  Género:
                </label>
                <select
                  id="genre-filter"
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  className="border-2 border-border bg-input text-foreground rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary smooth-transition"
                >
                  <option value="">Todos</option>
                  {availableGenres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <label htmlFor="key-filter" className="text-sm font-medium text-foreground">
                  Tonalidad:
                </label>
                <select
                  id="key-filter"
                  value={keyFilter}
                  onChange={(e) => setKeyFilter(e.target.value)}
                  className="border-2 border-border bg-input text-foreground rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary smooth-transition"
                >
                  <option value="">Todas</option>
                  {availableKeys.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>

              {(genreFilter || keyFilter) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setGenreFilter('');
                    setKeyFilter('');
                  }}
                  className="border-border bg-input text-foreground hover:bg-secondary hover:text-foreground smooth-transition"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>

            {/* Contador de resultados - Solo mostrar cuando hay filtros activos */}
            {(searchTerm || genreFilter || keyFilter) && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                {isLoadingSongs && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-primary" />
                )}
                {filteredSongs.length === allSongs.length
                  ? `${allSongs.length} canciones encontradas`
                  : `${filteredSongs.length} de ${allSongs.length} canciones`
                }
                {!isLoadingSongs && (
                  <span className="text-primary">(filtrado)</span>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border overflow-hidden glass-card">
            <Table aria-label="Lista de canciones registradas">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-secondary to-card border-border hover:bg-secondary/80">
                  <TableHead className="text-foreground font-semibold">Título</TableHead>
                  <TableHead className="text-foreground font-semibold">Artista</TableHead>
                  <TableHead className="text-foreground font-semibold">Género</TableHead>
                  <TableHead className="text-foreground font-semibold">Tonalidad</TableHead>
                  <TableHead className="text-foreground font-semibold">Vistas</TableHead>
                  <TableHead className="text-foreground font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSongs.map((song) => (
                  <TableRow key={song.id} className="border-border hover:bg-secondary/50 smooth-transition interactive-hover">
                    <TableCell className="font-medium text-foreground">{song.title}</TableCell>
                    <TableCell className="text-muted-foreground">{song.artist?.name}</TableCell>
                    <TableCell>
                      {song.genre && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 smooth-transition">{song.genre}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {song.key_signature && (
                        <Badge variant="outline" className="text-muted-foreground border-border bg-input hover:bg-secondary">{song.key_signature}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="w-3 h-3 text-accent" />
                        {song.views}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(song)}
                          disabled={isLoadingSong}
                          aria-label={`Editar canción ${song.title}`}
                          className="border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary smooth-transition shine-effect"
                        >
                          {isLoadingSong ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-primary" />
                          ) : (
                            <Edit className="w-3 h-3" />
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label={`Eliminar canción ${song.title}`}
                              className="border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:border-destructive smooth-transition"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-card border border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-foreground">¿Eliminar canción?</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                Esta acción no se puede deshacer. La canción "{song.title}"
                                será eliminada permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-border bg-input text-foreground hover:bg-secondary hover:text-foreground smooth-transition">
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDelete(song.id);
                                }}
                                disabled={isDeleting && deletingSongId === song.id}
                                className="bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/80 hover:to-destructive text-destructive-foreground shadow-lg hover:shadow-xl smooth-transition disabled:opacity-50"
                              >
                                {(isDeleting && deletingSongId === song.id) ? (
                                  <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b border-destructive-foreground" />
                                    Eliminando...
                                  </div>
                                ) : (
                                  'Eliminar'
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredSongs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {(searchTerm || genreFilter || keyFilter) ? (
                <div className="space-y-2">
                  <p className="text-lg">🔍 No se encontraron canciones que coincidan con los filtros aplicados.</p>
                  <p className="text-sm">
                    Intenta ajustar los filtros o
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setGenreFilter('');
                        setKeyFilter('');
                      }}
                      className="text-primary hover:text-primary/80 underline ml-1 smooth-transition"
                    >
                      limpiar todos los filtros
                    </button>
                  </p>
                </div>
              ) : (
                'No hay canciones registradas.'
              )}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredSongs.length)} de {filteredSongs.length} resultados
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-border bg-input text-foreground hover:bg-secondary hover:text-foreground smooth-transition disabled:opacity-50"
                >
                  Anterior
                </Button>

                {/* Números de página */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (pageNum > totalPages) return null;

                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`whitespace-nowrap smooth-transition ${pageNum === currentPage
                            ? 'btn-gradient text-primary-foreground shadow-lg'
                            : 'border-border bg-input text-foreground hover:bg-secondary hover:text-foreground'
                          }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-border bg-input text-foreground hover:bg-secondary hover:text-foreground smooth-transition disabled:opacity-50"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulario de canción - Edición o creación */}
      {showForm && (
        <SongForm
          song={editingSong}
          artists={artists}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}

