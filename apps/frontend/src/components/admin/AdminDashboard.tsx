'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Music,
  Users,
  Plus,
  Eye,
  TrendingUp,
  UserPlus,
  Activity
} from 'lucide-react';
import { adminService, songsService, artistsService } from '@/lib/api-service';
import { AdminStats, Song, Artist } from '@/types';
import SongsList from '@/components/admin/SongsList';
import ArtistsList from '@/components/admin/ArtistsList';
import UsersList from '@/components/admin/UsersList';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, songsData, artistsData] = await Promise.all([
        adminService.getStats(),
        songsService.getSongs({ limit: 100 }),
        artistsService.getArtists({ limit: 100 })
      ]);

      setStats(statsData);
      setSongs(songsData);
      setArtists(artistsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('No se pudieron cargar los datos del panel. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    fetchData();
  };

  return (
    <div className="w-full min-h-screen px-4 sm:px-6 lg:px-8 py-8 smooth-transition fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-3">
            Panel de Administración
          </h1>
          <p className="text-muted-foreground text-lg">Gestiona el contenido y usuarios de Eco Iglesia Letras</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center fade-in">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
                <div className="relative animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
              </div>
              <p className="text-foreground text-lg">Cargando panel de administración...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] glass-card shadow-xl">
            <div className="text-center p-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-500/30 rounded-full blur-lg"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Error al cargar datos</h3>
              <p className="text-red-300 mb-6">{error}</p>
              <Button
                onClick={refreshData}
                className="btn-gradient"
              >
                Reintentar
              </Button>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 glass-card rounded-2xl p-1">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 text-muted-foreground data-[state=active]:btn-gradient data-[state=active]:text-white rounded-xl smooth-transition"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Resumen</span>
              </TabsTrigger>
              <TabsTrigger
                value="songs"
                className="flex items-center gap-2 text-muted-foreground data-[state=active]:btn-gradient data-[state=active]:text-white rounded-xl smooth-transition"
              >
                <Music className="w-4 h-4" />
                <span className="hidden sm:inline">Canciones</span>
              </TabsTrigger>
              <TabsTrigger
                value="artists"
                className="flex items-center gap-2 text-muted-foreground data-[state=active]:btn-gradient data-[state=active]:text-white rounded-xl smooth-transition"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Artistas</span>
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="flex items-center gap-2 text-muted-foreground data-[state=active]:btn-gradient data-[state=active]:text-white rounded-xl smooth-transition"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Usuarios</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2 text-muted-foreground data-[state=active]:btn-gradient data-[state=active]:text-white rounded-xl smooth-transition"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Analíticas</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass-card border-primary/30 hover:border-primary smooth-transition interactive-hover">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-primary">Total Canciones</CardTitle>
                    <div className="h-10 w-10 btn-gradient rounded-xl flex items-center justify-center shadow-lg">
                      <Music className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats?.total_songs?.toLocaleString() || 0}</div>
                    <p className="text-xs text-primary mt-1">
                      +{stats?.new_songs_last_30_days || 0} en los últimos 30 días
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card border-green-500/30 hover:border-green-400 smooth-transition interactive-hover">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-300">Total Artistas</CardTitle>
                    <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats?.total_artists?.toLocaleString() || 0}</div>
                    <p className="text-xs text-green-300 mt-1">
                      Artistas registrados
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card border-purple-500/30 hover:border-purple-400 smooth-transition interactive-hover">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-300">Total Usuarios</CardTitle>
                    <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <UserPlus className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats?.total_users?.toLocaleString() || 0}</div>
                    <p className="text-xs text-purple-300 mt-1">
                      +{stats?.new_users_last_30_days || 0} en los últimos 30 días
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card border-orange-500/30 hover:border-orange-400 smooth-transition interactive-hover">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-300">Total Visualizaciones</CardTitle>
                    <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats?.total_views?.toLocaleString() || 0}</div>
                    <p className="text-xs text-orange-300 mt-1">
                      Visualizaciones totales
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card interactive-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Activity className="h-5 w-5 text-primary" />
                      Acciones Rápidas
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">Gestiona el contenido de forma eficiente</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => setActiveTab('songs')}
                      className="w-full justify-start btn-gradient"
                      size="lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Nueva Canción
                    </Button>
                    <Button
                      onClick={() => setActiveTab('artists')}
                      variant="outline"
                      className="w-full justify-start border-green-500/30 text-green-300 hover:bg-green-500/10 hover:border-green-400 bg-transparent rounded-xl smooth-transition"
                      size="lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Nuevo Artista
                    </Button>
                    <Button
                      onClick={() => setActiveTab('users')}
                      variant="outline"
                      className="w-full justify-start border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 bg-transparent rounded-xl smooth-transition"
                      size="lg"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Gestionar Usuarios
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass-card interactive-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <TrendingUp className="h-5 w-5 text-green-400" />
                      Actividad Reciente
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">Últimas canciones agregadas al sistema</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {songs.slice(0, 4).map((song, index) => (
                        <div key={song.id} className="flex items-center justify-between p-4 glass-card hover:border-primary/50 smooth-transition">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 btn-gradient rounded-xl flex items-center justify-center shadow-lg">
                              <Music className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground truncate max-w-[200px]">{song.title}</p>
                              <p className="text-sm text-muted-foreground">{song.artist?.name || 'Artista desconocido'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 smooth-transition"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              {song.views || 0}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {songs.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Music className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                          <p>No hay canciones registradas aún</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="songs">
              <SongsList
                songs={songs}
                artists={artists}
                onRefresh={refreshData}
              />
            </TabsContent>

            <TabsContent value="artists">
              <ArtistsList
                artists={artists}
                onRefresh={refreshData}
              />
            </TabsContent>

            <TabsContent value="users">
              <UsersList onRefresh={refreshData} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card interactive-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Canciones Más Populares
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">Top 5 canciones por visualizaciones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats?.top_songs?.length ? stats.top_songs.map((song, index) => (
                        <div key={song.id} className="flex items-center justify-between p-4 glass-card border-primary/30 hover:border-primary smooth-transition">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 btn-gradient text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{song.title}</p>
                              <p className="text-sm text-muted-foreground">{song.artist || 'Artista desconocido'}</p>
                            </div>
                          </div>
                          <Badge className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 smooth-transition">
                            <Eye className="w-3 h-3 mr-1" />
                            {song.views?.toLocaleString()}
                          </Badge>
                        </div>
                      )) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                          <p>No hay datos de canciones disponibles</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card interactive-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Users className="h-5 w-5 text-green-400" />
                      Artistas Más Activos
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">Top 5 artistas por número de canciones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats?.top_artists?.length ? stats.top_artists.map((artist, index) => (
                        <div key={artist.name} className="flex items-center justify-between p-4 glass-card border-green-500/30 hover:border-green-400 smooth-transition">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg">
                              {index + 1}
                            </div>
                            <p className="font-semibold text-foreground">{artist.name}</p>
                          </div>
                          <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30 smooth-transition">
                            <Music className="w-3 h-3 mr-1" />
                            {artist.song_count} {artist.song_count === 1 ? 'canción' : 'canciones'}
                          </Badge>
                        </div>
                      )) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                          <p>No hay datos de artistas disponibles</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card interactive-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Activity className="h-5 w-5 text-purple-400" />
                      Crecimiento del Contenido
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">Estadísticas de crecimiento en los últimos 30 días</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-4 glass-card border-primary/30 hover:border-primary smooth-transition">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 btn-gradient rounded-lg flex items-center justify-center shadow-lg">
                          <Music className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-foreground">Nuevas Canciones</span>
                      </div>
                      <Badge className="bg-primary text-white text-base px-3 py-1 shadow-lg">+{stats?.new_songs_last_30_days || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-4 glass-card border-green-500/30 hover:border-green-400 smooth-transition">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                          <UserPlus className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-foreground">Nuevos Usuarios</span>
                      </div>
                      <Badge className="bg-green-500 text-white text-base px-3 py-1 shadow-lg">+{stats?.new_users_last_30_days || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-4 glass-card border-purple-500/30 hover:border-purple-400 smooth-transition">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                          <Eye className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-foreground">Total de Vistas</span>
                      </div>
                      <Badge className="bg-purple-500 text-white text-base px-3 py-1 shadow-lg">{(stats?.total_views || 0).toLocaleString()}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card interactive-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <BarChart3 className="h-5 w-5 text-orange-400" />
                      Métricas Generales
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">Indicadores clave de la plataforma</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 glass-card smooth-transition">
                        <span className="text-sm font-medium text-muted-foreground">Promedio de vistas por canción</span>
                        <span className="font-bold text-foreground">
                          {stats?.total_songs && stats?.total_views
                            ? Math.round(stats.total_views / stats.total_songs).toLocaleString()
                            : '0'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 glass-card smooth-transition">
                        <span className="text-sm font-medium text-muted-foreground">Canciones por artista</span>
                        <span className="font-bold text-foreground">
                          {stats?.total_artists && stats?.total_songs
                            ? Math.round(stats.total_songs / stats.total_artists * 10) / 10
                            : '0'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 glass-card border-green-500/30 hover:border-green-400 smooth-transition">
                        <span className="text-sm font-medium text-green-300">Crecimiento mensual usuarios</span>
                        <span className="font-bold text-green-400">
                          +{((stats?.new_users_last_30_days || 0) / Math.max(stats?.total_users || 1, 1) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

