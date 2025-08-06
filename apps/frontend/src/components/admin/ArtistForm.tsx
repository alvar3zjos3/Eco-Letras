'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Save, Globe, Youtube, Music, Facebook, Instagram, Twitter } from 'lucide-react';
import { Artist } from '@/types';
import { artistsService } from '@/lib/api-service';

interface ArtistFormProps {
  artist?: Artist | null;
  onClose: () => void;
}

function isValidUrl(url: string) {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default function ArtistForm({ artist, onClose }: ArtistFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    biography: '',
    description: '',
    country: '',
    city: '',
    genre: '',
    foundation_year: '',
    website_url: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    youtube_url: '',
    spotify_url: '',
    verified: false,
    is_active: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Autofocus y bloquear scroll fondo
  useEffect(() => {
    const timer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);

    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      // Restaurar scroll al desmontar
      document.body.style.overflow = '';
    };
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (artist) {
      setFormData({
        name: artist.name || '',
        biography: artist.biography || '',
        description: artist.description || '',
        country: artist.country || '',
        city: artist.city || '',
        genre: artist.genre || '',
        foundation_year: artist.foundation_year?.toString() || '',
        website_url: artist.website_url || '',
        facebook_url: artist.facebook_url || '',
        instagram_url: artist.instagram_url || '',
        twitter_url: artist.twitter_url || '',
        youtube_url: artist.youtube_url || '',
        spotify_url: artist.spotify_url || '',
        verified: artist.verified || false,
        is_active: artist.is_active !== undefined ? artist.is_active : true,
      });
    }
  }, [artist]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de URLs
    if (!isValidUrl(formData.website_url)) {
      setError('El enlace del sitio web no es válido.');
      return;
    }
    if (!isValidUrl(formData.facebook_url)) {
      setError('El enlace de Facebook no es válido.');
      return;
    }
    if (!isValidUrl(formData.instagram_url)) {
      setError('El enlace de Instagram no es válido.');
      return;
    }
    if (!isValidUrl(formData.twitter_url)) {
      setError('El enlace de Twitter no es válido.');
      return;
    }
    if (!isValidUrl(formData.youtube_url)) {
      setError('El enlace de YouTube no es válido.');
      return;
    }
    if (!isValidUrl(formData.spotify_url)) {
      setError('El enlace de Spotify no es válido.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Preparar datos para envío, incluyendo todos los campos
      const dataToSend: any = {
        name: formData.name,
        biography: formData.biography || undefined,
        description: formData.description || undefined,
        country: formData.country || undefined,
        city: formData.city || undefined,
        genre: formData.genre || undefined,
        foundation_year: formData.foundation_year ? parseInt(formData.foundation_year) : undefined,
        website_url: formData.website_url || undefined,
        facebook_url: formData.facebook_url || undefined,
        instagram_url: formData.instagram_url || undefined,
        twitter_url: formData.twitter_url || undefined,
        youtube_url: formData.youtube_url || undefined,
        spotify_url: formData.spotify_url || undefined,
        verified: Boolean(formData.verified),
        is_active: Boolean(formData.is_active),
      };

      // Remover campos undefined para evitar errores de validación
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === undefined) {
          delete dataToSend[key];
        }
      });

      console.log('Datos a enviar:', dataToSend);

      if (artist) {
        await artistsService.updateArtist(artist.id, dataToSend);
      } else {
        await artistsService.createArtist(dataToSend);
      }
      onClose();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setError(
        error.response?.data?.detail ||
        'Error al guardar el artista. Intenta nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-label={artist ? 'Editar artista' : 'Nuevo artista'}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Card className="w-full max-w-2xl max-h-[90vh] bg-black border border-gray-800 relative overflow-hidden">
        {/* Header fijo */}
        <CardHeader className="sticky top-0 z-10 bg-black border-b border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-white">
                {artist ? 'Editar Artista' : 'Nuevo Artista'}
              </CardTitle>
              <CardDescription className="text-sm text-gray-300">
                {artist ? 'Modifica la información del artista' : 'Agrega un nuevo artista a la plataforma'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* Contenido con scroll */}
        <CardContent className="overflow-y-auto max-h-[calc(90vh-140px)] p-4 bg-black">
          <form id="artist-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border-l-4 border-red-500 text-red-300 px-4 py-3 rounded-r-xl">
                <div className="flex items-center">
                  <X className="w-5 h-5 mr-2 text-red-400" />
                  {error}
                </div>
              </div>
            )}

            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">
                Información Básica
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name" className="text-sm font-medium text-white mb-1 block">
                    Nombre del Artista *
                  </Label>
                  <Input
                    id="name"
                    ref={nameInputRef}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Ingresa el nombre del artista"
                    required
                    className="h-10 border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 hover:border-gray-600 focus:border-gray-500"
                    autoFocus
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description" className="text-sm font-medium text-white mb-1 block">
                    Descripción Corta
                  </Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Breve descripción del artista"
                    maxLength={500}
                    className="h-10 border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 hover:border-gray-600 focus:border-gray-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="biography" className="text-sm font-medium text-white mb-1 block">
                    Biografía Completa
                  </Label>
                  <Textarea
                    id="biography"
                    value={formData.biography}
                    onChange={(e) => handleChange('biography', e.target.value)}
                    placeholder="Escribe la biografía completa del artista..."
                    rows={3}
                    className="border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 resize-none hover:border-gray-600 focus:border-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="country" className="text-sm font-medium text-white mb-1 block">
                    País
                  </Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="País de origen"
                    className="h-10 border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 hover:border-gray-600 focus:border-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-white mb-1 block">
                    Ciudad
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Ciudad de origen"
                    className="h-10 border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 hover:border-gray-600 focus:border-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="genre" className="text-sm font-medium text-white mb-1 block">
                    Género Musical
                  </Label>
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => handleChange('genre', e.target.value)}
                    placeholder="Género musical principal"
                    className="h-10 border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 hover:border-gray-600 focus:border-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="foundation_year" className="text-sm font-medium text-white mb-1 block">
                    Año de Fundación
                  </Label>
                  <Input
                    id="foundation_year"
                    type="number"
                    min="1800"
                    max="2025"
                    value={formData.foundation_year}
                    onChange={(e) => handleChange('foundation_year', e.target.value)}
                    placeholder="Año de fundación"
                    className="h-10 border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 hover:border-gray-600 focus:border-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* URLs de redes sociales y plataformas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">
                Enlaces y Redes Sociales
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website_url" className="text-sm font-medium text-white mb-1 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    Sitio Web Oficial
                  </Label>
                  <Input
                    id="website_url"
                    value={formData.website_url}
                    onChange={(e) => handleChange('website_url', e.target.value)}
                    placeholder="https://ejemplo.com"
                    type="url"
                    className="h-10 border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 hover:!border-gray-600 focus:!border-gray-500 focus:!ring-gray-500/20 focus-visible:!ring-gray-500/20"
                  />
                </div>

                <div>
                  <Label htmlFor="facebook_url" className="text-sm font-medium text-white mb-1 flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-blue-400" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook_url"
                    value={formData.facebook_url}
                    onChange={(e) => handleChange('facebook_url', e.target.value)}
                    placeholder="https://facebook.com/artista"
                    type="url"
                    className="h-10 border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 hover:!border-blue-400 focus:!border-blue-500 focus:!ring-blue-500/20 focus-visible:!ring-blue-500/20"
                  />
                </div>

                <div>
                  <Label htmlFor="instagram_url" className="text-sm font-medium text-white mb-1 flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-400" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram_url"
                    value={formData.instagram_url}
                    onChange={(e) => handleChange('instagram_url', e.target.value)}
                    placeholder="https://instagram.com/artista"
                    type="url"
                    className="h-10 border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 hover:!border-pink-400 focus:!border-pink-500 focus:!ring-pink-500/20 focus-visible:!ring-pink-500/20"
                  />
                </div>

                <div>
                  <Label htmlFor="youtube_url" className="text-sm font-medium text-white mb-1 flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-400" />
                    YouTube
                  </Label>
                  <Input
                    id="youtube_url"
                    value={formData.youtube_url}
                    onChange={(e) => handleChange('youtube_url', e.target.value)}
                    placeholder="https://youtube.com/channel/artista"
                    type="url"
                    className="h-10 border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 hover:!border-red-400 focus:!border-red-500 focus:!ring-red-500/20 focus-visible:!ring-red-500/20"
                  />
                </div>

                <div>
                  <Label htmlFor="twitter_url" className="text-sm font-medium text-white mb-1 flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-sky-400" />
                    Twitter
                  </Label>
                  <Input
                    id="twitter_url"
                    value={formData.twitter_url}
                    onChange={(e) => handleChange('twitter_url', e.target.value)}
                    placeholder="https://twitter.com/artista"
                    type="url"
                    className="h-10 border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 hover:!border-sky-400 focus:!border-sky-500 focus:!ring-sky-500/20 focus-visible:!ring-sky-500/20"
                  />
                </div>

                <div>
                  <Label htmlFor="spotify_url" className="text-sm font-medium text-white mb-1 flex items-center gap-2">
                    <Music className="w-4 h-4 text-green-400" />
                    Spotify
                  </Label>
                  <Input
                    id="spotify_url"
                    value={formData.spotify_url}
                    onChange={(e) => handleChange('spotify_url', e.target.value)}
                    placeholder="https://open.spotify.com/artist/artista"
                    type="url"
                    className="h-10 border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 hover:!border-green-400 focus:!border-green-500 focus:!ring-green-500/20 focus-visible:!ring-green-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Configuraciones de estado */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">
                Configuración del Artista
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 border border-gray-700 rounded-lg bg-gray-900">
                  <input
                    id="verified"
                    type="checkbox"
                    checked={formData.verified}
                    onChange={(e) => handleChange('verified', e.target.checked)}
                    className="w-4 h-4 text-primary bg-gray-800 border-gray-600 rounded focus:ring-primary"
                  />
                  <Label htmlFor="verified" className="text-sm font-medium cursor-pointer text-white">
                    Artista Verificado
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 border border-gray-700 rounded-lg bg-gray-900">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleChange('is_active', e.target.checked)}
                    className="w-4 h-4 text-primary bg-gray-800 border-gray-600 rounded focus:ring-primary"
                  />
                  <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer text-white">
                    Artista Activo
                  </Label>
                </div>
              </div>
            </div>
          </form>
        </CardContent>

        {/* Botones fijos en la parte inferior */}
        <div className="sticky bottom-0 bg-black border-t border-gray-800 p-4">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 py-2"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="artist-form"
              disabled={isLoading}
              className="px-6 py-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  <span>{artist ? 'Actualizar' : 'Crear'}</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

