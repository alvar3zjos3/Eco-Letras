'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Share2, Download, ThumbsUp, Globe, User2 } from 'lucide-react';
import { playlistsService } from '@/lib/api-service';
import type { Song } from '@/types';

interface PublicPlaylist {
  id: number;
  name: string;
  description?: string;
  slug: string;
  is_public: boolean;
  song_count: number;
  created_at: string;
  creator_name: string;
  songs: Song[];
}

interface PublicPlaylistPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function PublicPlaylistPage({ params }: PublicPlaylistPageProps) {
  const [playlist, setPlaylist] = useState<PublicPlaylist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicPlaylist = async () => {
      setIsLoading(true);
      try {
        // Unwrap params promise
        const resolvedParams = await params;
        const slugParam = resolvedParams.slug;
        
        // Detectar si el slug es realmente un ID (número)
        const isNumericId = /^\d+$/.test(slugParam);
        
        if (isNumericId) {
          // Si es un ID, obtener la redirección al slug
          const redirectData = await playlistsService.getPublicPlaylistByIdRedirect(parseInt(slugParam));
          
          // Redirigir a la URL correcta con el slug
          window.location.replace(`/playlist/${redirectData.slug}`);
          return;
        }
        
        // Si es un slug válido, usar el endpoint normal
        const playlistData = await playlistsService.getPublicPlaylistBySlug(slugParam);
        
        setPlaylist({
          ...playlistData,
          creator_name: playlistData.creator_name || 'Usuario desconocido'
        });
        
      } catch (error) {
        console.error('Error fetching public playlist:', error);
        setError('No se pudo cargar la playlist pública');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicPlaylist();
  }, [params]);

  const handleSharePlaylist = async () => {
    if (!playlist) return;
    
    const shareUrl = window.location.href;
    const shareText = `🎵 Lista: ${playlist.name}\n${playlist.description ? playlist.description + '\n' : ''}${playlist.song_count} canciones\n\nCreada por: ${playlist.creator_name}\n\n🔗 ${shareUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: playlist.name,
          text: shareText,
          url: shareUrl
        });
      } catch (error) {
        await navigator.clipboard.writeText(shareText);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  };

  const handleExportPlaylist = () => {
    if (!playlist) return;
    
    const playlistData = {
      name: playlist.name,
      description: playlist.description,
      creator: playlist.creator_name,
      songs: playlist.songs.map(song => ({
        title: song.title,
        artist: song.artist?.name || 'Artista desconocido',
        slug: song.slug
      }))
    };

    const dataStr = JSON.stringify(playlistData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `playlist-${playlist.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (isLoading) {
    return (
      <div className="p-8 smooth-transition fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg"></div>
              <div className="relative animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-primary border-r-primary/60 mx-auto"></div>
            </div>
            <span className="text-muted-foreground text-lg">Cargando playlist...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="p-8 smooth-transition fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <Music className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Playlist no encontrada</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'La playlist que buscas no existe o no es pública.'}
            </p>
            <Link href="/">
              <Button className="btn-gradient interactive-hover">
                Explorar Eco Iglesia Letras
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 smooth-transition fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header público */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-full text-sm mb-4">
            <Globe className="w-4 h-4" />
            Playlist Pública
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-2">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-lg text-muted-foreground mb-4">{playlist.description}</p>
          )}
          <div className="flex items-center justify-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <User2 className="w-4 h-4" />
              <span>Creada por {playlist.creator_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              <span>{playlist.song_count} canciones</span>
            </div>
          </div>
        </div>

        {/* Acciones públicas */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={handleSharePlaylist}
            className="btn-gradient interactive-hover"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPlaylist}
            className="bg-card/50 border-border text-foreground hover:bg-muted"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Lista de canciones */}
        <Card className="glass-card">
          <CardContent className="p-6">
            {playlist.songs.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-foreground text-lg mb-2">Esta playlist está vacía</p>
                <p className="text-muted-foreground">
                  El creador aún no ha agregado canciones a esta lista
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {playlist.songs.map((song, index) => (
                  <Link
                    key={song.id}
                    href={`/cancion/${song.slug}`}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    {/* Número de track */}
                    <div className="w-8 text-center text-muted-foreground">
                      <span className="text-sm">{index + 1}</span>
                    </div>

                    {/* Información de la canción */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {song.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {song.artist?.name || 'Artista desconocido'}
                      </p>
                    </div>

                    {/* Género */}
                    {song.genre && (
                      <span className="hidden md:inline-block px-2 py-1 text-xs bg-primary/20 text-primary rounded-full">
                        {song.genre}
                      </span>
                    )}

                    {/* Vistas */}
                    <div className="text-sm text-muted-foreground hidden sm:block">
                      {song.views} vistas
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer con link a la aplicación */}
        <div className="text-center mt-12 p-6 bg-card/50 rounded-lg border border-border">
          <p className="text-muted-foreground mb-4">
            Descubre más canciones cristianas y crea tus propias playlists.
          </p>
          <Link href="/">
            <Button className="btn-gradient interactive-hover">
              Explora artistas y canciones
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
