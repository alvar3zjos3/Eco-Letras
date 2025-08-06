// Componente de formulario para crear y editar canciones
// Maneja tanto la creación de nuevas canciones como la edición de existentes
// Soporta secciones dinámicas con diferentes tipos (intro, verso, coro, etc.)

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save } from 'lucide-react';
import { Song, Artist } from '@/types';
import { songsService } from '@/lib/api-service';

// Importar constantes centralizadas
import {
  MUSICAL_KEYS,
  SONG_GENRES,
  SECTION_TYPES,
  SUPPORTED_LANGUAGES,
  SECTION_COLORS,
  type SectionType
} from '@/constants/music';

interface SongFormProps {
  song?: Song | null;
  artists: Artist[];
  onClose: (shouldRefresh?: boolean) => void;
}

interface SectionFormData {
  type: SectionType;
  text: string;
  chords_lyrics?: string;
}

type SectionFieldError = {
  sectionIdx: number;
  field: string;
  msg: string;
} | null;

// Validar formato de URL para campos opcionales de URL
function isValidUrl(url: string) {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default function SongForm({ song, artists, onClose }: SongFormProps) {
  // Estado del formulario con valores por defecto para canciones nuevas
  const [formData, setFormData] = useState({
    title: '',
    artist_id: '',
    sections: [
      { type: 'intro' as SectionType, text: '', chords_lyrics: '' },
    ] as SectionFormData[],
    key_signature: '',
    tempo: '',
    genre: '',
    language: 'es',
    youtube_url: '',
    spotify_url: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | { msg: string }[] | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [sectionFieldError, setSectionFieldError] = useState<SectionFieldError>(null);
  const prevSongId = useRef<number | null>(null);
  const emergencyFixExecuted = useRef<boolean>(false);

  // Bloquear scroll del fondo y permitir cerrar con Escape
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleEsc);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (song && song.id !== prevSongId.current) {
      // Resetear flag de corrección de emergencia para nueva canción
      emergencyFixExecuted.current = false;

      // Validación y mapeo más robusto para edición
      const sections = song.sections && Array.isArray(song.sections) && song.sections.length > 0
        ? song.sections.map(s => ({
          type: (s.type as SectionType) || 'verso',
          text: s.text || '',
          chords_lyrics: s.chords_lyrics || '',
        }))
        : [{ type: 'intro' as SectionType, text: '', chords_lyrics: '' }];

      // Usar siempre el artist_id de la canción directamente - sin validación aún
      const artistIdToUse = song.artist_id.toString();

      setFormData({
        title: song.title || '',
        artist_id: artistIdToUse,
        sections,
        key_signature: song.key_signature || '',
        tempo: song.tempo || '',
        genre: song.genre || '',
        language: song.language || 'es',
        youtube_url: song.youtube_url || '',
        spotify_url: song.spotify_url || '',
      });

      prevSongId.current = song.id;
    } else if (!song && prevSongId.current !== null) {
      setFormData({
        title: '',
        artist_id: '',
        sections: [
          { type: 'intro' as SectionType, text: '', chords_lyrics: '' },
        ],
        key_signature: '',
        tempo: '',
        genre: '',
        language: 'es',
        youtube_url: '',
        spotify_url: '',
      });
      prevSongId.current = null;
    }
  }, [song]); // Solo depender de song, no de artists!

  // Validar selección de artista cuando se cargan los datos de artistas
  useEffect(() => {
    if (song && artists.length > 0 && formData.artist_id) {
      const artistExists = artists.some(artist => artist.id.toString() === formData.artist_id);
      if (!artistExists) {
        // Artista seleccionado no encontrado en la lista de artistas disponibles
      }
    }
  }, [artists, formData.artist_id, song]);

  // Asegurar que artist_id esté correctamente configurado al editar canciones existentes
  useEffect(() => {
    if (song && song.artist_id && !formData.artist_id && artists.length > 0 && !emergencyFixExecuted.current) {
      emergencyFixExecuted.current = true;
      setFormData(prev => ({
        ...prev,
        artist_id: song.artist_id.toString()
      }));
    }
  }, [formData.artist_id, song?.artist_id, artists.length, song]);

  const handleSectionChange = (idx: number, field: string, value: string) => {
    setFormData(prev => {
      const newSections = [...prev.sections];
      const currentSection = newSections[idx];
      if (currentSection) {
        newSections[idx] = { ...currentSection, [field]: value };
      }
      return { ...prev, sections: newSections };
    });

    // Limpiar errores específicos de sección cuando el usuario hace correcciones
    if (sectionFieldError && sectionFieldError.sectionIdx === idx && sectionFieldError.field === field) {
      setSectionFieldError(null);
      setError('');
    }
  };

  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, { type: 'verso' as SectionType, text: '', chords_lyrics: '' }],
    }));
  };

  const removeSection = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== idx),
    }));
    setSectionFieldError(null);
  };

  // Mover sección hacia arriba o abajo en la lista
  const moveSection = (fromIdx: number, toIdx: number) => {
    setFormData(prev => {
      const newSections = [...prev.sections];
      const [moved] = newSections.splice(fromIdx, 1);
      if (moved) {
        newSections.splice(toIdx, 0, moved);
      }
      return { ...prev, sections: newSections };
    });
    setSectionFieldError(null);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'El título es obligatorio.';
    if (!formData.artist_id) errors.artist_id = 'Debes seleccionar un artista.';
    if (isNaN(Number(formData.artist_id))) errors.artist_id = 'Debes seleccionar un artista válido.';
    if (!formData.sections.length || formData.sections.some(s => !s.text.trim())) errors.sections = 'Todas las secciones deben tener texto.';
    if (!formData.key_signature) errors.key_signature = 'Debes seleccionar la tonalidad.';
    if (!formData.genre) errors.genre = 'Debes seleccionar el género.';
    // Validar formato de URLs si se proporcionan (campos opcionales)
    if (formData.youtube_url && !isValidUrl(formData.youtube_url)) errors.youtube_url = 'La URL de YouTube no es válida.';
    if (formData.spotify_url && !isValidUrl(formData.spotify_url)) errors.spotify_url = 'La URL de Spotify no es válida.';
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSectionFieldError(null);
    setFieldErrors({});
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }
    setIsLoading(true);

    try {
      const songData: any = {
        ...formData,
        artist_id: parseInt(formData.artist_id),
        sections: formData.sections.map(s => ({
          ...s,
          chords_lyrics: s.chords_lyrics ?? "",
        })),
        lyrics: formData.sections.map(s => s.text).join('\n\n'),
      };

      // Eliminar campos URL vacíos para prevenir errores de validación del backend
      if (!formData.youtube_url || !formData.youtube_url.trim()) {
        delete songData.youtube_url;
      } else {
        songData.youtube_url = formData.youtube_url.trim();
      }

      if (!formData.spotify_url || !formData.spotify_url.trim()) {
        delete songData.spotify_url;
      } else {
        songData.spotify_url = formData.spotify_url.trim();
      }

      if (song) {
        await songsService.updateSong(song.id, songData);
      } else {
        await songsService.createSong(songData);
      }

      onClose(true);
    } catch (error: any) {
      // Manejar errores de validación de FastAPI
      const detail = error?.response?.data?.detail;
      setFieldErrors({});
      if (Array.isArray(detail)) {
        const first = detail[0];

        if (first?.loc && first?.msg) {
          let field = first.loc.join(' > ').replace('body > ', '');
          setError(`Error en el campo "${field}": ${first.msg}`);
          // Manejar errores específicos de sección
          if (first.loc[1] === "sections" && typeof first.loc[2] === "number") {
            setSectionFieldError({ sectionIdx: first.loc[2], field: first.loc[3], msg: first.msg });
          }
        } else {
          setError('Error de validación en el formulario. Revisa los campos.');
        }
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Error al guardar la canción. Intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      artist_id: '',
      sections: [
        { type: 'intro' as SectionType, text: '', chords_lyrics: '' },
      ],
      key_signature: '',
      tempo: '',
      genre: '',
      language: 'es',
      youtube_url: '',
      spotify_url: '',
    });
    setError('');
    setFieldErrors({});
    setSectionFieldError(null);
    onClose(false);
  };

  // Mostrar pantalla de carga mientras se esperan los datos de artistas (solo canciones nuevas)
  if (artists.length === 0 && !song) {
    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 z-50"
        role="dialog"
        aria-modal="true"
      >
        <Card className="w-96 h-64 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-300">Cargando artistas...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Permitir editar canciones existentes incluso si los artistas no se han cargado aún
  const shouldShowForm = artists.length > 0 || song;

  if (!shouldShowForm) {
    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 z-50"
        role="dialog"
        aria-modal="true"
      >
        <Card className="w-96 h-64 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-300">Cargando datos...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={song ? 'Editar canción' : 'Nueva canción'}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <Card className="w-full max-w-6xl max-h-[95vh] glass-card border border-gray-800 relative overflow-hidden smooth-transition">
        {/* Encabezado fijo con logo y título del formulario */}
        <CardHeader className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Save className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-white">
                {song ? 'Editar Canción' : 'Nueva Canción'}
              </CardTitle>
              <CardDescription className="text-sm text-gray-300">
                {song ? 'Modifica los datos de la canción' : 'Agrega una nueva canción a la plataforma'}
              </CardDescription>
            </div>
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-gray-400 hover:text-white hover:bg-gray-800 smooth-transition"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[calc(95vh-140px)] p-6 bg-black">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mostrar errores generales (excluyendo errores específicos de sección) */}
            {error && !sectionFieldError && (
              <div className="glass-card border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3 rounded-xl slide-up">
                <div className="flex items-center">
                  <X className="w-5 h-5 mr-2 text-red-400" />
                  {typeof error === 'string'
                    ? error
                    : Array.isArray(error)
                      ? (error as { msg: string; loc?: string[] }[]).map((e, i) => (
                        <div key={i}>
                          {e.loc ? <b>{e.loc.join('.')}:</b> : null} {e.msg}
                        </div>
                      ))
                      : (error as { detail?: string; msg?: string })?.msg ||
                      (error as { detail?: string; msg?: string })?.detail ||
                      JSON.stringify(error)}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-white mb-1 block">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Título de la canción"
                  required
                  autoFocus
                  className="h-10 border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 hover:border-gray-600 focus:border-gray-500 smooth-transition"
                />
                {fieldErrors.title && (
                  <div className="text-xs text-red-400 mt-1">{fieldErrors.title}</div>
                )}
              </div>

              <div>
                <Label htmlFor="artist_id" className="text-sm font-medium text-white mb-1 block">Artista *</Label>
                <Select
                  value={formData.artist_id}
                  onValueChange={(value) => {
                    // Prevenir limpiar selección de artista existente
                    if (!value && formData.artist_id) {
                      return;
                    }
                    handleChange('artist_id', value);
                  }}
                >
                  <SelectTrigger className="h-10 border-gray-700 bg-gray-900 text-white hover:border-gray-600 focus:border-gray-500 smooth-transition">
                    <SelectValue placeholder="Selecciona un artista" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-700 bg-gray-900 text-white">
                    {artists.length > 0 ? artists.map((artist) => {
                      const artistValue = artist.id.toString();
                      const isSelected = artistValue === formData.artist_id;
                      return (
                        <SelectItem key={artist.id} value={artistValue} className="hover:bg-gray-800 focus:bg-gray-800">
                          {artist.name}
                        </SelectItem>
                      );
                    }) : (
                      <SelectItem value="" disabled>No hay artistas disponibles</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {fieldErrors.artist_id && (
                  <div className="text-xs text-red-400 mt-1">{fieldErrors.artist_id}</div>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-white mb-2 block">Letra y acordes por secciones *</Label>
              <div className="space-y-4">
                {formData.sections.map((section, idx) => (
                  <div
                    key={idx}
                    className={`glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4 smooth-transition interactive-hover ${sectionFieldError && sectionFieldError.sectionIdx === idx ? 'border-red-400 bg-red-500/10' : SECTION_COLORS[section.type] || 'border-gray-700 bg-gray-800/30'}`}
                  >
                    {/* Lado izquierdo: tipo de sección y letra */}
                    <div className="flex-1">
                      <div className="flex gap-2 items-center mb-3">
                        <Select
                          value={section.type}
                          onValueChange={value => {
                            // Prevenir limpiar valores existentes con selecciones vacías
                            if (!value && section.type) {
                              return;
                            }
                            handleSectionChange(idx, 'type', value);
                          }}
                        >
                          <SelectTrigger className={`w-36 h-9 border-gray-700 bg-gray-900 text-white hover:border-gray-600 focus:border-gray-500 smooth-transition ${sectionFieldError && sectionFieldError.sectionIdx === idx && sectionFieldError.field === "type" ? "border-red-500 ring-2 ring-red-300" : ""}`}>
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent className="border-gray-700 bg-gray-900 text-white">
                            {SECTION_TYPES.map(opt => (
                              <SelectItem key={opt.value} value={opt.value} className="hover:bg-gray-800 focus:bg-gray-800">
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {/* Botones de control de sección */}
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSection(idx, idx - 1)}
                            disabled={idx === 0}
                            title="Subir sección"
                            className="h-9 w-9 border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white smooth-transition disabled:opacity-50"
                          >
                            ↑
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSection(idx, idx + 1)}
                            disabled={idx === formData.sections.length - 1}
                            title="Bajar sección"
                            className="h-9 w-9 border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white smooth-transition disabled:opacity-50"
                          >
                            ↓
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSection(idx)}
                            disabled={formData.sections.length === 1}
                            title="Eliminar sección"
                            className="h-9 w-9 border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-400 smooth-transition disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={section.text}
                        onChange={e => handleSectionChange(idx, 'text', e.target.value)}
                        placeholder={`Texto del ${SECTION_TYPES.find(t => t.value === section.type)?.label?.toLowerCase()}`}
                        rows={4}
                        required
                        className="border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 hover:border-gray-600 focus:border-gray-500 smooth-transition resize-none"
                      />
                    </div>
                    {/* Lado derecho: acordes y letra alternados */}
                    <div className="flex-1">
                      <Label className="text-sm font-medium text-white mb-2 block">Acordes y letra (alternados)</Label>
                      <Textarea
                        value={section.chords_lyrics || ''}
                        onChange={e => handleSectionChange(idx, 'chords_lyrics', e.target.value)}
                        placeholder="A&#10;Letra&#10;F#m&#10;Letra..."
                        rows={4}
                        className="border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 hover:border-gray-600 focus:border-gray-500 smooth-transition resize-none"
                      />
                      <div className="text-xs text-gray-400 mt-2">
                        Escribe los acordes y la letra alternando cada línea: primero el acorde, luego la línea de letra, y así sucesivamente.
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSection}
                  className="border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary smooth-transition"
                >
                  + Agregar sección
                </Button>
                {fieldErrors.sections && (
                  <div className="text-xs text-red-400 mt-1">{fieldErrors.sections}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="key_signature" className="text-sm font-medium text-white mb-1 block">Tonalidad *</Label>
                <Select value={formData.key_signature} onValueChange={(value) => {
                  // Prevenir limpiar tonalidad existente
                  if (!value && formData.key_signature) {
                    return;
                  }
                  handleChange('key_signature', value);
                }}>
                  <SelectTrigger className="h-10 border-gray-700 bg-gray-900 text-white hover:border-gray-600 focus:border-gray-500 smooth-transition">
                    <SelectValue placeholder="Selecciona tonalidad" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-700 bg-gray-900 text-white">
                    {MUSICAL_KEYS.map((key) => (
                      <SelectItem key={key} value={key} className="hover:bg-gray-800 focus:bg-gray-800">
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.key_signature && (
                  <div className="text-xs text-red-400 mt-1">{fieldErrors.key_signature}</div>
                )}
              </div>

              <div>
                <Label htmlFor="tempo" className="text-sm font-medium text-white mb-1 block">Tiempo</Label>
                <Input
                  id="tempo"
                  value={formData.tempo}
                  onChange={(e) => handleChange('tempo', e.target.value)}
                  placeholder="ej: 120 BPM"
                  className="h-10 border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 hover:border-gray-600 focus:border-gray-500 smooth-transition"
                />
              </div>

              <div>
                <Label htmlFor="language" className="text-sm font-medium text-white mb-1 block">Idioma</Label>
                <Select value={formData.language} onValueChange={(value) => handleChange('language', value)}>
                  <SelectTrigger className="h-10 border-gray-700 bg-gray-900 text-white hover:border-gray-600 focus:border-gray-500 smooth-transition">
                    <SelectValue placeholder="Selecciona idioma" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-700 bg-gray-900 text-white">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value} className="hover:bg-gray-800 focus:bg-gray-800">
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label htmlFor="genre" className="text-sm font-medium text-white mb-1 block">Género *</Label>
                <Select value={formData.genre} onValueChange={(value) => {
                  // Prevenir limpiar selección de género existente
                  if (!value && formData.genre) {
                    return;
                  }
                  handleChange('genre', value);
                }}>
                  <SelectTrigger className="h-10 border-gray-700 bg-gray-900 text-white hover:border-gray-600 focus:border-gray-500 smooth-transition">
                    <SelectValue placeholder="Selecciona género" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-700 bg-gray-900 text-white">
                    {SONG_GENRES.map((genre) => (
                      <SelectItem key={genre} value={genre} className="hover:bg-gray-800 focus:bg-gray-800">
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.genre && (
                  <div className="text-xs text-red-400 mt-1">{fieldErrors.genre}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="youtube_url" className="text-sm font-medium text-white mb-1 flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  URL de YouTube
                </Label>
                <Input
                  id="youtube_url"
                  value={formData.youtube_url}
                  onChange={(e) => handleChange('youtube_url', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  type="url"
                  className="h-10 border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 hover:border-red-400 focus:border-red-500 smooth-transition"
                />
                {fieldErrors.youtube_url && (
                  <div className="text-xs text-red-400 mt-1">{fieldErrors.youtube_url}</div>
                )}
              </div>

              <div>
                <Label htmlFor="spotify_url" className="text-sm font-medium text-white mb-1 flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  URL de Spotify
                </Label>
                <Input
                  id="spotify_url"
                  value={formData.spotify_url}
                  onChange={(e) => handleChange('spotify_url', e.target.value)}
                  placeholder="https://open.spotify.com/track/..."
                  type="url"
                  className="h-10 border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 hover:border-green-400 focus:border-green-500 smooth-transition"
                />
                {fieldErrors.spotify_url && (
                  <div className="text-xs text-red-400 mt-1">{fieldErrors.spotify_url}</div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="btn-gradient bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-medium px-6 py-2 smooth-transition"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="btn-gradient bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-8 py-2 smooth-transition interactive-hover disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


