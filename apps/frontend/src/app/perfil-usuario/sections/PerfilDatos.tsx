'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { userService, artistsService } from '@/lib/api-service';
import { Artist } from '@/types';

export interface PerfilDatosProps {
  user: {
    id: string | number;
    full_name?: string;
    username: string;
    avatar_url?: string;
    musical_tastes?: string;
    favorite_artists?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube_url?: string;
  };
  edit?: boolean;
  onClose?: () => void;
  onUpdate?: (updatedUser: any) => void; // Callback para actualizar los datos en el componente padre
}

export default function PerfilDatos({ user, edit: editProp = false, onClose, onUpdate }: PerfilDatosProps) {
  const [form, setForm] = useState({
    full_name: user.full_name || '',
    username: user.username,
    avatar_url: user.avatar_url || '',
    musical_tastes: user.musical_tastes || '',
    favorite_artists: user.favorite_artists || '',
    instagram: user.instagram || '',
    twitter: user.twitter || '',
    facebook: user.facebook || '',
    youtube_url: user.youtube_url || '',
  });
  const [edit, setEdit] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Estados para el selector de artistas
  const [artists, setArtists] = useState<Artist[]>([]);
  const [showArtistSelector, setShowArtistSelector] = useState(false);
  const [artistSearch, setArtistSearch] = useState('');
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);

  // Cargar artistas al montar el componente
  useEffect(() => {
    loadArtists();
    // Inicializar artistas seleccionados desde el campo favorite_artists
    if (form.favorite_artists) {
      setSelectedArtists(form.favorite_artists.split(',').map(a => a.trim()).filter(a => a));
    }
  }, []);

  // Cerrar selector al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showArtistSelector && !target.closest('.artist-selector-container')) {
        setShowArtistSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showArtistSelector]);

  const loadArtists = async () => {
    try {
      const artistsData = await artistsService.getArtists({ limit: 100 });
      setArtists(artistsData);
    } catch (error) {
      console.error('Error cargando artistas:', error);
    }
  };

  // Maneja cambios en campos de texto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setMessage('');
  };

  // Función para agregar/quitar artistas favoritos
  const toggleArtist = (artistName: string) => {
    const newSelected = selectedArtists.includes(artistName)
      ? selectedArtists.filter(a => a !== artistName)
      : [...selectedArtists, artistName];
    
    setSelectedArtists(newSelected);
    setForm({ ...form, favorite_artists: newSelected.join(', ') });
  };

  // Filtrar artistas por búsqueda
  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(artistSearch.toLowerCase())
  );

  // Guardar cambios
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    setError('');
    try {
      // Actualizar usuario
      const updatedUser = await userService.updateUser(user.id, { ...form });
      setMessage('Datos actualizados correctamente.');
      setEdit(false);
      
      // Llamar al callback para actualizar los datos en el componente padre
      if (onUpdate) {
        onUpdate(updatedUser);
      }
      
      if (onClose) onClose();
    } catch (err: any) {
      setError('Ocurrió un error al guardar los datos.' + (err?.message ? ` (${err.message})` : ''));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSave}
        className="glass-card px-8 py-8 max-w-2xl mx-auto relative"
        style={{ minWidth: 350 }}
      >
        <h2 className="text-3xl font-extrabold text-center text-gradient mb-8 tracking-tight">
          Datos personales
        </h2>
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-card/50 backdrop-blur-sm border-4 border-border shadow-lg flex items-center justify-center overflow-hidden mb-2">
            <img
              src={form.avatar_url || 'https://i.ibb.co/tM90CMrj/Sin-t-tulo.png'}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-base text-foreground font-medium">Avatar</span>
          <Input
            name="avatar_url"
            type="url"
            value={form.avatar_url}
            onChange={handleChange}
            placeholder="URL de tu avatar"
            className="mt-2 bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Nombre completo</label>
            <Input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
              className="bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Usuario</label>
            <Input
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Gustos musicales</label>
            <textarea
              name="musical_tastes"
              value={form.musical_tastes}
              onChange={handleChange}
              className="w-full bg-card/50 border border-border text-foreground placeholder:text-muted-foreground rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              rows={2}
              placeholder="Ej: pop, rock, góspel..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Artistas favoritos</label>
            <div className="relative artist-selector-container">
              <div className="w-full bg-card/50 border border-border text-foreground placeholder:text-muted-foreground rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[40px] cursor-pointer"
                   onClick={() => setShowArtistSelector(!showArtistSelector)}>
                {selectedArtists.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedArtists.map((artist, index) => (
                      <span key={index} className="bg-primary/30 text-primary-foreground px-2 py-1 rounded text-xs border border-primary/50">
                        {artist}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleArtist(artist);
                          }}
                          className="ml-1 text-primary-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Selecciona tus artistas favoritos...</span>
                )}
              </div>
              
              {showArtistSelector && (
                <div className="absolute top-full left-0 right-0 mt-1 glass-card border border-border shadow-xl z-50 max-h-60 overflow-hidden">
                  <div className="p-3 border-b border-border">
                    <Input
                      type="text"
                      placeholder="Buscar artistas..."
                      value={artistSearch}
                      onChange={(e) => setArtistSearch(e.target.value)}
                      className="bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {filteredArtists.map((artist) => (
                      <div
                        key={artist.id}
                        className={`px-3 py-2 hover:bg-muted cursor-pointer flex items-center justify-between ${
                          selectedArtists.includes(artist.name) ? 'bg-primary/20 text-primary' : 'text-foreground'
                        }`}
                        onClick={() => toggleArtist(artist.name)}
                      >
                        <div className="flex items-center gap-2">
                          <span>{artist.name}</span>
                          {artist.verified && (
                            <span className="text-primary text-xs">✓</span>
                          )}
                        </div>
                        {selectedArtists.includes(artist.name) && (
                          <span className="text-primary">✓</span>
                        )}
                      </div>
                    ))}
                    {filteredArtists.length === 0 && (
                      <div className="px-3 py-2 text-muted-foreground text-sm">
                        No se encontraron artistas
                      </div>
                    )}
                  </div>
                  <div className="p-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setShowArtistSelector(false)}
                      className="w-full text-sm text-primary hover:text-primary/80"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Instagram</label>
            <Input
              name="instagram"
              value={form.instagram}
              onChange={handleChange}
              placeholder="@usuario"
              className="bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Twitter/X</label>
            <Input
              name="twitter"
              value={form.twitter}
              onChange={handleChange}
              placeholder="@usuario"
              className="bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Facebook</label>
            <Input
              name="facebook"
              value={form.facebook || ''}
              onChange={handleChange}
              placeholder="Perfil o enlace de Facebook"
              className="bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">YouTube</label>
            <Input
              name="youtube_url"
              value={form.youtube_url || ''}
              onChange={handleChange}
              placeholder="Enlace de YouTube"
              className="bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-8">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="bg-card/50 border-border text-foreground hover:bg-muted interactive-hover font-bold px-6 py-2 rounded-lg border transition-all"
            >
              Cerrar
            </button>
          )}
          <Button
            type="submit"
            disabled={isSaving}
            className="btn-gradient interactive-hover font-bold px-6 py-2 rounded-lg"
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
        {message && <p className="text-primary mt-4 text-center font-medium">{message}</p>}
        {error && <p className="text-destructive mt-4 text-center font-medium">{error}</p>}
      </form>
    </div>
  );
}