'use client';

import { useState, useEffect } from 'react';
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
import { Plus, Edit, Trash2, Search, ExternalLink, CheckCircle, Filter } from 'lucide-react';
import { Artist } from '@/types';
import { artistsService } from '@/lib/api-service';
import ArtistForm from './ArtistForm';

interface ArtistsListProps {
  artists: Artist[];
  onRefresh: () => void;
}

export default function ArtistsList({ artists, onRefresh }: ArtistsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'verified'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados para notificaciones
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
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

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

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && artist.is_active) ||
      (statusFilter === 'inactive' && !artist.is_active) ||
      (statusFilter === 'verified' && artist.verified);

    return matchesSearch && matchesStatus;
  });

  const handleEdit = (artist: Artist) => {
    setEditingArtist(artist);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingArtist(null);
    setShowForm(true);
  };

  const handleDelete = async (artistId: number) => {
    setIsDeleting(true);
    try {
      await artistsService.deleteArtist(artistId);
      onRefresh();
      showNotification('success', 'Artista eliminado', 'El artista ha sido eliminado correctamente.');
    } catch (error: any) {
      console.error('Error deleting artist:', error);
      const message = error.response?.data?.detail || 'Error al eliminar el artista';
      showNotification('error', 'Error al eliminar', message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingArtist(null);
    onRefresh();
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Gestión de Artistas</h1>
            <p className="text-muted-foreground">
              Administra todos los artistas de la plataforma
            </p>
          </div>
          <Button
            onClick={handleNew}
            className="btn-gradient interactive-hover"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Artista
          </Button>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar artistas por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
                aria-label="Buscar artistas por nombre"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-border bg-card/50 text-foreground rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary smooth-transition"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Solo activos</option>
                <option value="inactive">Solo inactivos</option>
                <option value="verified">Solo verificados</option>
              </select>
              <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30">
                {filteredArtists.length} artista{filteredArtists.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <Table aria-label="Lista de artistas registrados">
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead className="text-foreground font-semibold">Artista</TableHead>
                  <TableHead className="text-foreground font-semibold">Biografía</TableHead>
                  <TableHead className="text-foreground font-semibold">Enlaces</TableHead>
                  <TableHead className="text-foreground font-semibold">Estado</TableHead>
                  <TableHead className="text-foreground font-semibold">Fecha</TableHead>
                  <TableHead className="text-foreground font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArtists.map((artist) => (
                  <TableRow key={artist.id} className="border-border hover:bg-muted/50 smooth-transition">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-foreground">{artist.name}</span>
                            {artist.verified && (
                              <CheckCircle className="w-4 h-4 text-primary" aria-label="Artista verificado" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">ID: {artist.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate text-sm text-muted-foreground">
                        {artist.biography || 'Sin biografía'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {artist.website_url && (
                          <a
                            href={artist.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/20 text-primary border border-primary/30 rounded-md hover:bg-primary/30 smooth-transition"
                            aria-label={`Sitio web de ${artist.name}`}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Web
                          </a>
                        )}
                        {artist.facebook_url && (
                          <a
                            href={artist.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent/20 text-accent border border-accent/30 rounded-md hover:bg-accent/30 smooth-transition"
                            aria-label={`Facebook de ${artist.name}`}
                          >
                            <ExternalLink className="w-3 h-3" />
                            FB
                          </a>
                        )}
                        {artist.instagram_url && (
                          <a
                            href={artist.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-chart-4/20 text-chart-4 border border-chart-4/30 rounded-md hover:bg-chart-4/30 smooth-transition"
                            aria-label={`Instagram de ${artist.name}`}
                          >
                            <ExternalLink className="w-3 h-3" />
                            IG
                          </a>
                        )}
                        {artist.youtube_url && (
                          <a
                            href={artist.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-destructive/20 text-destructive border border-destructive/30 rounded-md hover:bg-destructive/30 smooth-transition"
                            aria-label={`YouTube de ${artist.name}`}
                          >
                            <ExternalLink className="w-3 h-3" />
                            YT
                          </a>
                        )}
                        {artist.spotify_url && (
                          <a
                            href={artist.spotify_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/20 text-primary border border-primary/30 rounded-md hover:bg-primary/30 smooth-transition"
                            aria-label={`Spotify de ${artist.name}`}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Spotify
                          </a>
                        )}
                        {!artist.website_url && !artist.facebook_url && !artist.instagram_url && !artist.youtube_url && !artist.spotify_url && (
                          <span className="text-xs text-muted-foreground">Sin enlaces</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={artist.verified ? "default" : "outline"}
                          className={`text-xs w-fit ${artist.verified
                              ? 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
                              : 'text-muted-foreground border-border bg-muted/50 hover:bg-muted'
                            }`}
                        >
                          {artist.verified ? "✓ Verificado" : "Sin verificar"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs w-fit ${artist.is_active
                              ? 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
                              : 'bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30'
                            }`}
                        >
                          {artist.is_active ? "🟢 Activo" : "🔴 Inactivo"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(artist.created_at).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(artist)}
                          aria-label={`Editar artista ${artist.name}`}
                          className="border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary smooth-transition"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label={`Eliminar artista ${artist.name}`}
                              className="border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:border-destructive smooth-transition"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-card border border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-foreground">¿Eliminar artista?</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                Esta acción no se puede deshacer. El artista "{artist.name}"
                                será eliminado permanentemente. No se puede eliminar si tiene canciones asociadas.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-border bg-card/50 text-foreground hover:bg-muted hover:text-foreground smooth-transition">
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(artist.id)}
                                disabled={isDeleting}
                                className="bg-destructive hover:bg-destructive/80 text-destructive-foreground interactive-hover"
                              >
                                {isDeleting ? 'Eliminando...' : 'Eliminar'}
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

          {filteredArtists.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No se encontraron artistas que coincidan con la búsqueda.' : 'No hay artistas registrados.'}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <ArtistForm
          artist={editingArtist}
          onClose={handleFormClose}
        />
      )}

      {/* Componente de notificación */}
      {notification.show && (
        <div className="fixed top-6 right-6 z-[9999] max-w-sm w-full">
          <div className={`glass-card border-l-4 smooth-transition interactive-hover slide-up ${notification.type === 'success' ? 'border-l-primary bg-primary/5' :
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

