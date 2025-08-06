'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Music, User2, HeartOff } from 'lucide-react';
import { favoritesService } from '@/lib/api-service';
import type { Song } from '@/types';

interface PerfilFavoritosProps {
  userId: string;
  user?: {
    musical_tastes?: string;
    favorite_artists?: string;
  };
}

export default function PerfilFavoritos({ userId, user }: PerfilFavoritosProps) {
  const [favoritos, setFavoritos] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavoritos = async () => {
      setIsLoading(true);
      try {
        const res = await favoritesService.getUserFavorites();
        setFavoritos(res);
      } catch (err) {
        setFavoritos([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFavoritos();
  }, [userId]);

  // Componente SongCard simple para favoritos
  const SimpleSongCard = ({ song, onRemove }: { song: Song; onRemove: (id: number) => void }) => {
    const [isRemoving, setIsRemoving] = useState(false);

    const handleRemove = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      setIsRemoving(true);
      try {
        await favoritesService.removeFavorite(song.id);
        onRemove(song.id);
      } catch (error) {
        console.error('Error removing favorite:', error);
      } finally {
        setIsRemoving(false);
      }
    };

    return (
      <Link href={`/cancion/${song.slug}`}>
        <Card className="backdrop-blur-sm bg-white/10 border border-white/20 hover:bg-white/20 hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate text-white">{song.title}</h3>
                <p className="text-white/70 text-sm truncate">{song.artist?.name || 'Artista desconocido'}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={isRemoving}
                className="ml-2 flex-shrink-0 hover:bg-white/20 text-white"
              >
                {isRemoving ? (
                  <HeartOff className="w-4 h-4 text-white/60" />
                ) : (
                  <Heart className="w-4 h-4 text-red-400 fill-current" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Gustos musicales */}
        <div className="backdrop-blur-sm bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-400/30 rounded-xl p-6 flex flex-col items-start shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Music className="w-8 h-8 text-blue-300" />
            <span className="text-lg font-bold text-white">Gustos musicales</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {(user?.musical_tastes?.split(',').map(g =>
              <span key={g.trim()} className="bg-blue-400/30 border border-blue-300/50 text-blue-200 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                {g.trim()}
              </span>
            )) || <span className="text-white/60">No especificado</span>}
          </div>
        </div>
        {/* Artistas favoritos */}
        <div className="backdrop-blur-sm bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-400/30 rounded-xl p-6 flex flex-col items-start shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <User2 className="w-8 h-8 text-purple-300" />
            <span className="text-lg font-bold text-white">Artistas favoritos</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {(user?.favorite_artists?.split(',').map(a =>
              <span key={a.trim()} className="bg-purple-400/30 border border-purple-300/50 text-purple-200 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                {a.trim()}
              </span>
            )) || <span className="text-white/60">No especificado</span>}
          </div>
        </div>
      </div>

      <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl shadow-2xl p-6 mt-4">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="w-7 h-7 text-pink-400" />
          <span className="font-bold text-xl bg-gradient-to-r from-pink-300 to-red-300 bg-clip-text text-transparent">Tus canciones favoritas</span>
          {favoritos.length > 0 && (
            <span className="text-sm text-white/60 ml-2">
              ({favoritos.length} canción{favoritos.length === 1 ? '' : 'es'})
            </span>
          )}
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-pink-500/30 rounded-full blur-lg"></div>
              <div className="relative animate-spin rounded-full h-8 w-8 border-4 border-transparent border-t-pink-400 border-r-purple-400 mx-auto"></div>
            </div>
            <span className="text-white/80">Cargando favoritos...</span>
          </div>
        ) : favoritos.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/80 text-lg mb-2">No tienes canciones favoritas aún</p>
            <p className="text-white/60 text-sm">
              Explora las canciones y marca tus favoritas con el corazón
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoritos.map(song => (
              <SimpleSongCard
                key={song.id}
                song={song}
                onRemove={(id) => setFavoritos(favoritos.filter(fav => fav.id !== id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}