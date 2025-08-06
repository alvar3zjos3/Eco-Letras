'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Music, User2, HeartOff, Search, Filter, Trash2, Download, Share2, SortAsc, SortDesc, Plus, MoreHorizontal, ThumbsUp, Edit, Eye, EyeOff, Globe, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { favoritesService } from '@/lib/api-service';
import type { Song } from '@/types';

interface Playlist {
  id: number;
  name: string;
  description?: string;
  song_count: number;
  duration: string;
  is_public: boolean;
  created_at: string;
  songs?: Song[];
}

interface LikedSong extends Song {
  liked_at: string;
  likes_count: number;
}

interface PerfilLikesProps {
  userId: string;
  user?: {
    musical_tastes?: string;
    favorite_artists?: string;
  };
}

export default function PerfilLikes({ userId, user }: PerfilLikesProps) {
  const [likes, setLikes] = useState<Song[]>([]);
  const [filteredLikes, setFilteredLikes] = useState<Song[]>([]);
  const [likedSongs, setLikedSongs] = useState<LikedSong[]>([]); // Mantener para compatibilidad
  // Estado para playlists con validación adicional
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Verificación defensiva para asegurar que playlists sea siempre un array
  const safePlaylist = Array.isArray(playlists) ? playlists : [];
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'artist'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'artist'>('all');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [activeTab, setActiveTab] = useState('likes');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  
  // Estados para notificaciones elegantes
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Función para mostrar notificación
  const showNotification = (type: 'success' | 'error' | 'warning', title: string, message: string) => {
    setNotification({ show: true, type, title, message });
    // Auto-hide después de 5 segundos
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Cargar canciones con like del usuario (ahora es el sistema principal)
        try {
          const likedSongs = await favoritesService.getUserFavorites();
          setLikes(likedSongs || []); // Sistema principal de likes
          setFilteredLikes(likedSongs || []);
          // Convertir Song[] a LikedSong[] para compatibilidad
          const likedSongsWithMetadata = (likedSongs || []).map(song => ({
            ...song,
            liked_at: new Date().toISOString(),
            likes_count: 0
          }));
          setLikedSongs(likedSongsWithMetadata);
        } catch (error) {
          console.error('Error fetching liked songs:', error);
          setLikes([]);
          setFilteredLikes([]);
          setLikedSongs([]);
        }

        // Cargar playlists del usuario
        try {
          // const playlistsRes = await playlistsService.getUserPlaylists();
          // setPlaylists(Array.isArray(playlistsRes) ? playlistsRes : []);
          setPlaylists([]); // Temporalmente sin playlists hasta implementar el servicio
        } catch (error) {
          console.error('Error fetching playlists:', error);
          setPlaylists([]);
        }

      } catch (error) {
        console.error('Error loading data:', error);
        setLikes([]);
        setFilteredLikes([]);
        setLikedSongs([]);
        setPlaylists([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Filtrar y ordenar likes
  useEffect(() => {
    let filtered = [...likes];

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(song => 
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'oldest':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'artist':
          return (a.artist?.name || '').localeCompare(b.artist?.name || '');
        default:
          return 0;
      }
    });

    setFilteredLikes(filtered);
  }, [likes, searchTerm, sortBy]);

  // Limpiar todos los me gusta
  const handleClearAllLikes = async () => {
    setIsClearing(true);
    try {
      const result = await favoritesService.clearAllFavorites();
      setLikes([]);
      setFilteredLikes([]);
      setLikedSongs([]);
      setShowConfirmClear(false);
      
      // Mostrar notificación de éxito
      showNotification('success', 'Likes eliminados', 'Se han eliminado todos los me gusta correctamente.');
    } catch (error) {
      console.error('Error clearing likes:', error);
      // Si falla, limpiar localmente como fallback
      setLikes([]);
      setFilteredLikes([]);
      setLikedSongs([]);
      setShowConfirmClear(false);
    } finally {
      setIsClearing(false);
    }
  };

  // Exportar lista de me gusta
  const handleExportLikes = () => {
    const likesData = likes.map(song => ({
      title: song.title,
      artist: song.artist?.name || 'Artista desconocido',
      slug: song.slug
    }));

    const dataStr = JSON.stringify(likesData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `mis-likes-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Quitar like de una canción
  const handleRemoveLike = async (songId: number) => {
    try {
      await favoritesService.removeFavorite(songId);
      setLikedSongs(likedSongs.filter(song => song.id !== songId));
      setLikes(likes.filter(song => song.id !== songId));
      setFilteredLikes(filteredLikes.filter(song => song.id !== songId));
    } catch (error) {
      console.error('Error removing like:', error);
    }
  };

  // Agregar canción a playlist
  const handleAddToPlaylist = (song: LikedSong) => {
    // Por ahora simplemente mostramos el modal de crear playlist
    // En el futuro podríamos mostrar un selector de playlists existentes
    setShowCreatePlaylist(true);
  };

  // Función para recargar playlists
  const reloadPlaylists = async () => {
    try {
      // const playlistsRes = await playlistsService.getUserPlaylists();
      // setPlaylists(Array.isArray(playlistsRes) ? playlistsRes : []);
      setPlaylists([]); // Temporalmente sin playlists
    } catch (error) {
      console.error('Error recargando playlists:', error);
    }
  };

  // Crear playlist
  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    
    try {
      // const newPlaylist = await playlistsService.createPlaylist({
      //   name: newPlaylistName,
      //   description: newPlaylistDescription,
      //   is_public: false // Por defecto privada
      // });
      
      // Recargar playlists desde el servidor en lugar de solo agregar localmente
      await reloadPlaylists();
      
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setShowCreatePlaylist(false);
      
      // Mostrar notificación de éxito
      showNotification('success', 'Función en desarrollo', 'Las playlists estarán disponibles próximamente.');
    } catch (error: any) {
      console.error('Error creating playlist:', error);
      
      // Verificar si es un error de autenticación
      if (error.response?.status === 401) {
        showNotification('error', 'Sesión expirada', 'Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('access_token');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      // Para otros errores, mostrar mensaje al usuario
      const errorMessage = error.response?.data?.detail || error.message || 'Error desconocido';
      showNotification('error', 'Error al crear playlist', errorMessage);
    }
  };

  // Alternar visibilidad de playlist
  const handleTogglePlaylistVisibility = async (playlistId: number, currentVisibility: boolean) => {
    try {
      // await playlistsService.updatePlaylist(playlistId, { is_public: !currentVisibility });
      setPlaylists((prevPlaylists) => Array.isArray(prevPlaylists) ? prevPlaylists.map(p => 
        p.id === playlistId ? { ...p, is_public: !currentVisibility } : p
      ) : []);
    } catch (error) {
      // Actualizar localmente hasta que la API esté disponible
      setPlaylists((prevPlaylists) => Array.isArray(prevPlaylists) ? prevPlaylists.map(p => 
        p.id === playlistId ? { ...p, is_public: !currentVisibility } : p
      ) : []);
    }
  };

  // Eliminar playlist
  const handleDeletePlaylist = async (playlistId: number) => {
    try {
      // await playlistsService.deletePlaylist(playlistId);
      setPlaylists((prevPlaylists) => Array.isArray(prevPlaylists) ? prevPlaylists.filter(p => p.id !== playlistId) : []);
    } catch (error) {
      // Eliminar localmente hasta que la API esté disponible
      setPlaylists((prevPlaylists) => Array.isArray(prevPlaylists) ? prevPlaylists.filter(p => p.id !== playlistId) : []);
    }
  };

  // Compartir playlist
  const handleSharePlaylist = async (playlist: Playlist) => {
    try {
      // Obtener datos de compartir desde el backend
      // const shareData = await playlistsService.getPlaylistShareData(playlist.id);
      
      // const shareText = `🎵 Lista: ${shareData.name}\n${shareData.description ? shareData.description + '\n' : ''}${shareData.song_count} canciones\n\nCreada por: ${shareData.creator_name}\n\n🔗 ${shareData.share_url}`;
      
      // Fallback con URL local hasta que la API esté disponible
      const shareUrl = `${window.location.origin}/playlist/${playlist.id}`;
      const shareText = `🎵 Lista: ${playlist.name}\n${playlist.description ? playlist.description + '\n' : ''}${playlist.song_count} canciones\n\n🔗 ${shareUrl}`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: playlist.name,
            text: shareText,
            url: shareUrl
          });
        } catch (error) {
          // Fallback a clipboard
          await navigator.clipboard.writeText(shareText);
        }
      } else {
        try {
          await navigator.clipboard.writeText(shareText);
          showNotification('success', 'Copiado', 'Lista copiada al portapapeles.');
        } catch (error) {
          console.error('Error copying to clipboard:', error);
          showNotification('error', 'Error', 'No se pudo copiar al portapapeles.');
        }
      }
    } catch (error) {
      // Fallback con URL local hasta que la API esté disponible
      const shareUrl = `${window.location.origin}/playlist/${playlist.id}`;
      const shareText = `🎵 Lista: ${playlist.name}\n${playlist.description ? playlist.description + '\n' : ''}${playlist.song_count} canciones\n\n🔗 ${shareUrl}`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: playlist.name,
            text: shareText,
            url: shareUrl
          });
        } catch (error) {
          console.error('Error sharing:', error);
        }
      } else {
        try {
          await navigator.clipboard.writeText(shareText);
          showNotification('success', 'Copiado', 'Lista copiada al portapapeles.');
        } catch (error) {
          console.error('Error copying to clipboard:', error);
          showNotification('error', 'Error', 'No se pudo copiar al portapapeles.');
        }
      }
    }
  };

  // Compartir lista de me gusta
  const handleShareLikes = async () => {
    const shareText = `👍 Canciones que me gustan:\n\n${likes.slice(0, 5).map(song => 
      `♪ ${song.title} - ${song.artist?.name || 'Artista desconocido'}`
    ).join('\n')}${likes.length > 5 ? `\n\n...y ${likes.length - 5} más` : ''}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Canciones que me gustan',
          text: shareText,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(shareText);
        // Aquí podrías mostrar un toast de éxito
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  // Componente SongCard simple para likes
  const SimpleSongCard = ({ song, onRemove }: { song: Song; onRemove: (id: number) => void }) => {
    const [isRemoving, setIsRemoving] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);

    const handleRemove = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      setIsRemoving(true);
      try {
        await favoritesService.removeFavorite(song.id); // Usar favoritesService
        onRemove(song.id);
      } catch (error) {
        console.error('Error removing like:', error);
      } finally {
        setIsRemoving(false);
      }
    };

    const handleAddToPlaylist = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setShowPlaylistModal(true);
    };

    return (
      <>
        <Link href={`/cancion/${song.slug}`}>
          <Card className="glass-card interactive-hover cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate text-foreground group-hover:text-primary transition-colors">{song.title}</h3>
                  <p className="text-muted-foreground text-sm truncate">{song.artist?.name || 'Artista desconocido'}</p>
                  {song.genre && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-primary/20 text-primary rounded-full">
                      {song.genre}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddToPlaylist}
                    className="hover:bg-muted text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    disabled={isRemoving}
                    className="hover:bg-muted text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {isRemoving ? (
                      <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ThumbsUp className="w-4 h-4 text-primary fill-current" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Modal para agregar a playlist */}
        {showPlaylistModal && (
          <AddToPlaylistModal
            song={song}
            playlists={playlists}
            onClose={() => setShowPlaylistModal(false)}
            onAddToPlaylist={async (playlistId) => {
              try {
                // await playlistsService.addSongToPlaylist(playlistId, song.id);
                console.log('Función de playlists en desarrollo');
              } catch (error) {
                console.error('Error adding song to playlist:', error);
              }
            }}
            onCreateNewPlaylist={() => {
              setShowPlaylistModal(false);
              setShowCreatePlaylist(true);
            }}
          />
        )}
      </>
    );
  };

  return (
    <div className="p-8 smooth-transition fade-in">
      {/* Header con título principal */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gradient mb-2">Me Gusta</h1>
        <p className="text-muted-foreground">Canciones que te gustan y listas de reproducción</p>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="likes" className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <TabsList className="glass-card p-1">
            <TabsTrigger value="likes" className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4" />
              Me Gusta ({likes.length})
            </TabsTrigger>
            <TabsTrigger value="listas" className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              Listas ({safePlaylist.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Contenido de Me Gusta */}
        <TabsContent value="likes" className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-7 h-7 text-primary" />
                <span className="font-bold text-xl text-gradient">Canciones que me gustan</span>
                {likes.length > 0 && (
                  <span className="text-sm text-muted-foreground ml-2">
                    ({filteredLikes.length}/{likes.length} canción{likes.length === 1 ? '' : 'es'})
                  </span>
                )}
              </div>
              
              {likes.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportLikes}
                    className="bg-card/50 border-border text-foreground hover:bg-muted interactive-hover"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareLikes}
                    className="bg-card/50 border-border text-foreground hover:bg-muted interactive-hover"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir Lista
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConfirmClear(true)}
                    className="bg-destructive/20 border-destructive/30 text-destructive hover:bg-destructive/30"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpiar todo
                  </Button>
                </div>
              )}
            </div>

            {likes.length > 0 && (
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Barra de búsqueda */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar canciones que me gustan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
                  />
                </div>
                
                {/* Filtros y ordenamiento */}
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-[140px] bg-card/50 border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-border">
                      <SelectItem value="newest">Fecha agregado</SelectItem>
                      <SelectItem value="title">Por título</SelectItem>
                      <SelectItem value="artist">Por artista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Lista de canciones con me gusta */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg"></div>
                  <div className="relative animate-spin rounded-full h-8 w-8 border-4 border-transparent border-t-primary border-r-primary/60 mx-auto"></div>
                </div>
                <span className="text-muted-foreground">Cargando canciones...</span>
              </div>
            ) : likes.length === 0 ? (
              <div className="text-center py-8">
                <ThumbsUp className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-foreground text-lg mb-2">No tienes canciones que te gusten aún</p>
                <p className="text-muted-foreground text-sm">
                  Explora las canciones y marca las que te gusten con 👍
                </p>
              </div>
            ) : filteredLikes.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-foreground text-lg mb-2">No se encontraron resultados</p>
                <p className="text-muted-foreground text-sm">
                  Intenta con otro término de búsqueda
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLikes.map(song => (
                  <SimpleSongCard
                    key={song.id}
                    song={song}
                    onRemove={(id) => {
                      setLikes(likes.filter(fav => fav.id !== id));
                      setFilteredLikes(filteredLikes.filter(fav => fav.id !== id));
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Contenido de Listas de Reproducción */}
        <TabsContent value="listas" className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Music className="w-7 h-7 text-primary" />
                <span className="font-bold text-xl text-gradient">Mis Listas de Reproducción</span>
              </div>
              
              <Button
                onClick={() => setShowCreatePlaylist(true)}
                className="btn-gradient interactive-hover"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Lista
              </Button>
            </div>

            {safePlaylist.length === 0 ? (
              <div className="text-center py-8">
                <Music className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-foreground text-lg mb-2">No tienes listas de reproducción</p>
                <p className="text-muted-foreground text-sm mb-4">
                  Crea tu primera lista para organizar tus canciones favoritas
                </p>
                <Button
                  onClick={() => setShowCreatePlaylist(true)}
                  className="btn-gradient interactive-hover"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear primera lista
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safePlaylist.map(playlist => (
                  <Card key={playlist.id} className="glass-card interactive-hover group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 cursor-pointer" onClick={() => {
                          // Navegar a vista detallada de la playlist
                          window.open(`/playlist/${playlist.id}`, '_blank');
                        }}>
                          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                            {playlist.name}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-2">
                            {playlist.description || 'Sin descripción'}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>♪ {playlist.song_count} canciones</span>
                            <span>⏱ {playlist.duration}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              playlist.is_public 
                                ? 'bg-primary/20 text-primary' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {playlist.is_public ? 'Pública' : 'Privada'}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => window.open(`/playlist/${playlist.id}`, '_blank')}
                          variant="outline"
                          size="sm"
                          className="bg-card/50 border-border text-foreground hover:bg-muted flex-1"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Lista
                        </Button>
                        <Button
                          onClick={() => handleTogglePlaylistVisibility(playlist.id, playlist.is_public)}
                          variant="outline"
                          size="sm"
                          className="bg-card/50 border-border text-foreground hover:bg-muted"
                        >
                          {playlist.is_public ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Globe className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSharePlaylist(playlist)}
                          className="bg-card/50 border-border text-foreground hover:bg-muted"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePlaylist(playlist.id)}
                          className="bg-destructive/20 border-destructive/30 text-destructive hover:bg-destructive/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de confirmación para limpiar me gusta */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-3">¿Quitar todos los me gusta?</h3>
            <p className="text-muted-foreground mb-4">
              Esta acción quitará el me gusta de todas las {likes.length} canciones y no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleClearAllLikes}
                disabled={isClearing}
                className="bg-destructive hover:bg-destructive/80 text-destructive-foreground"
              >
                {isClearing ? 'Quitando...' : 'Sí, quitar todo'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowConfirmClear(false)}
                className="bg-card/50 border-border text-foreground hover:bg-muted"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear playlist */}
      {showCreatePlaylist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md mx-4 w-full">
            <h3 className="text-lg font-semibold text-foreground mb-4">Crear Nueva Lista</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre de la lista
                </label>
                <Input
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Mi nueva lista..."
                  className="bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descripción (opcional)
                </label>
                <Input
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="Describe tu lista..."
                  className="bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
                className="btn-gradient interactive-hover flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Lista
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreatePlaylist(false);
                  setNewPlaylistName('');
                  setNewPlaylistDescription('');
                }}
                className="bg-card/50 border-border text-foreground hover:bg-muted"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Componente de notificación elegante */}
      {notification.show && (
        <div className="fixed top-6 right-6 z-[9999] max-w-sm w-full">
          <div className={`glass-card border-l-4 smooth-transition interactive-hover slide-up ${
            notification.type === 'success' ? 'border-l-primary bg-primary/5' :
            notification.type === 'error' ? 'border-l-destructive bg-destructive/5' :
            'border-l-accent bg-accent/5'
          }`}>
            <div className="flex items-start gap-3 p-4">
              <div className="flex-shrink-0 mt-0.5">
                {notification.type === 'success' && (
                  <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {notification.type === 'error' && (
                  <div className="w-7 h-7 bg-destructive rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-destructive-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                {notification.type === 'warning' && (
                  <div className="w-7 h-7 bg-accent rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground mb-1 leading-tight">{notification.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground smooth-transition rounded-md hover:bg-muted/50"
                aria-label="Cerrar notificación"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente modal para agregar canción a playlist
const AddToPlaylistModal = ({ 
  song, 
  playlists, 
  onClose, 
  onAddToPlaylist, 
  onCreateNewPlaylist 
}: { 
  song: Song; 
  playlists: Playlist[]; 
  onClose: () => void; 
  onAddToPlaylist: (playlistId: number) => Promise<void>; 
  onCreateNewPlaylist: () => void; 
}) => {
  const [isAdding, setIsAdding] = useState<number | null>(null);

  const handleAddToPlaylist = async (playlistId: number) => {
    setIsAdding(playlistId);
    try {
      await onAddToPlaylist(playlistId);
      onClose();
    } catch (error) {
      console.error('Error adding to playlist:', error);
    } finally {
      setIsAdding(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-card p-6 max-w-md mx-4 w-full">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Agregar "{song.title}" a una lista
        </h3>
        
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {Array.isArray(playlists) && playlists.length > 0 ? (
            playlists.map((playlist: any) => (
              <button
                key={playlist.id}
                onClick={() => handleAddToPlaylist(playlist.id)}
                disabled={isAdding === playlist.id}
                className="w-full p-3 bg-card/50 border border-border rounded-lg hover:bg-muted transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{playlist.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {playlist.song_count} canciones • {playlist.is_public ? 'Pública' : 'Privada'}
                    </p>
                  </div>
                  {isAdding === playlist.id && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-transparent border-t-primary"></div>
                  )}
                </div>
              </button>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No tienes listas de reproducción aún
            </p>
          )}
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button
            onClick={onCreateNewPlaylist}
            className="btn-gradient interactive-hover flex-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Lista
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-card/50 border-border text-foreground hover:bg-muted"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};