'use client';

import { useAuth } from '@/context/AuthContext';
import PerfilLikes from './sections/PerfilLikes';
import PerfilSeguridad from './sections/PerfilSeguridad';
import PerfilDatos from './sections/PerfilDatos';
import { PencilIcon, CalendarDays, Mail, Music, User2, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function InfoUsuarioPage() {
  const { user: authUser, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState<'likes' | 'seguridad' | 'info'>('info');
  const [showEditModal, setShowEditModal] = useState(false);
  const [user, setUser] = useState(authUser);

  // Sincronizar el usuario local con el del contexto de autenticación
  useEffect(() => {
    setUser(authUser);
  }, [authUser]);

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (showEditModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = '';
    };
  }, [showEditModal]);

  // Manejar tecla Escape para cerrar modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showEditModal) {
        setShowEditModal(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [showEditModal]);

  // Callback para actualizar los datos del usuario después de la edición
  const handleUserUpdate = (updatedUser: any) => {
    setUser(updatedUser);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center fade-in">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
          </div>
          <p className="mt-4 text-foreground">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center glass-card p-8 rounded-xl fade-in">
          <p className="mt-4 text-foreground">No se encontró información del usuario.</p>
        </div>
      </div>
    );
  }

  // Helper to render social username as button
  const renderSocialButton = (
    urlPrefix: string,
    username?: string,
    colorClass = 'text-primary hover:text-primary/80'
  ) =>
    username ? (
      <button
        onClick={() => window.open(`${urlPrefix}${username.replace(/^@/, '')}`, '_blank')}
        className={`${colorClass} hover:underline bg-transparent border-none p-0 m-0 cursor-pointer smooth-transition font-medium`}
        style={{ background: 'none' }}
      >
        {username.replace(/^@/, '')}
      </button>
    ) : (
      <div className="text-muted-foreground">No especificado</div>
    );

  return (
    <div className="w-full min-h-screen relative overflow-hidden smooth-transition">
      <div className="relative z-10 flex flex-col pt-10 fade-in">
        {/* Modal de edición */}
        {showEditModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              // Cerrar modal si se hace clic en el fondo
              if (e.target === e.currentTarget) {
                setShowEditModal(false);
              }
            }}
          >
            <div 
              className="relative glass-card w-full max-w-lg sm:max-w-xl md:max-w-2xl p-0 fade-in max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <PerfilDatos 
                user={user} 
                edit={true} 
                onClose={() => setShowEditModal(false)}
                onUpdate={handleUserUpdate}
              />
            </div>
          </div>
        )}

        {/* Perfil principal */}
        <div className="relative flex flex-col items-center w-full mb-8 px-4 md:px-16">
          {/* Avatar y datos */}
          <div className="flex flex-col items-center">
            <div className="w-36 h-36 rounded-full bg-card/50 backdrop-blur-sm border-4 border-border shadow-2xl ring-4 ring-border/20 overflow-hidden mb-3 flex items-center justify-center">
              <img
                src={user.avatar_url || 'https://i.ibb.co/tM90CMrj/Sin-t-tulo.png'}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-4xl font-extrabold text-gradient">{user.full_name}</h2>
            <span className="text-primary text-lg font-medium flex items-center gap-1">
              <User2 className="w-5 h-5" /> @{user.username}
            </span>
            <span className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
              <CalendarDays className="w-4 h-4" />
              Miembro desde {new Date(user.created_at).toLocaleDateString()}
            </span>
            <button
              className="btn-gradient mt-4 flex items-center gap-2"
              onClick={() => setShowEditModal(true)}
            >
              <PencilIcon className="w-5 h-5" />
              Editar perfil
            </button>
          </div>

          {/* Estadísticas y tabs en una sola fila */}
          <div className="flex flex-col md:flex-row items-center justify-center w-full mt-8 gap-8">
            {/* Tabs */}
            <div className="flex gap-4 mt-6 md:mt-0">
              <button
                className={`px-5 py-2 rounded-lg font-semibold shadow-lg transition-all ${
                  activeSection === 'info'
                    ? 'btn-gradient text-white'
                    : 'glass-card text-foreground border border-border hover:bg-muted'
                }`}
                onClick={() => setActiveSection('info')}
              >
                Información
              </button>
              <button
                className={`px-5 py-2 rounded-lg font-semibold shadow-lg transition-all ${
                  activeSection === 'likes'
                    ? 'btn-gradient text-white'
                    : 'glass-card text-foreground border border-border hover:bg-muted'
                }`}
                onClick={() => setActiveSection('likes')}
              >
                Me Gusta
              </button>
              <button
                className={`px-5 py-2 rounded-lg font-semibold shadow-lg transition-all ${
                  activeSection === 'seguridad'
                    ? 'btn-gradient text-white'
                    : 'glass-card text-foreground border border-border hover:bg-muted'
                }`}
                onClick={() => setActiveSection('seguridad')}
              >
                Seguridad
              </button>
            </div>
          </div>
        </div>

        {/* Secciones */}
        <div className="w-full px-4 md:px-16">
          {activeSection === 'info' && (
            <div className="glass-card p-8 flex flex-col gap-8 mb-8 w-full">
              <h3 className="text-2xl font-bold text-gradient mb-2">Información de contacto</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Correo */}
                <div className="flex items-center gap-3 glass-card border border-border p-4">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold text-foreground">
                    Correo electrónico:
                    <span className="ml-1 font-normal text-muted-foreground">{user.email}</span>
                  </span>
                </div>
                {/* Instagram */}
                <div className="flex items-center gap-3 glass-card border border-border p-4">
                  <Instagram className="w-5 h-5 text-pink-400" />
                  <span className="font-semibold text-foreground">
                    Instagram:
                    {user.instagram ? (
                      <a
                        href={`https://instagram.com/${user.instagram.replace(/^@/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-primary hover:text-primary/80 hover:underline font-normal transition-colors"
                      >
                        {user.instagram.replace(/^@/, '')}
                      </a>
                    ) : (
                      <span className="ml-1 text-muted-foreground font-normal">No especificado</span>
                    )}
                  </span>
                </div>
                {/* Twitter/X */}
                <div className="flex items-center gap-3 glass-card border border-border p-4">
                  <Twitter className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold text-foreground">
                    Twitter/X:
                    {user.twitter ? (
                      <a
                        href={`https://twitter.com/${user.twitter.replace(/^@/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-primary hover:text-primary/80 hover:underline font-normal transition-colors"
                      >
                        {user.twitter.replace(/^@/, '')}
                      </a>
                    ) : (
                      <span className="ml-1 text-muted-foreground font-normal">No especificado</span>
                    )}
                  </span>
                </div>
                {/* Facebook */}
                <div className="flex items-center gap-3 glass-card border border-border p-4">
                  <Facebook className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-foreground">
                    Facebook:
                    {user.facebook ? (
                      <a
                        href={user.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-primary hover:text-primary/80 hover:underline font-normal transition-colors"
                      >
                        {user.facebook.replace(/^https?:\/\/(www\.)?facebook\.com\//, '')}
                      </a>
                    ) : (
                      <span className="ml-1 text-muted-foreground font-normal">No especificado</span>
                    )}
                  </span>
                </div>
                {/* YouTube */}
                <div className="flex items-center gap-3 glass-card border border-border p-4">
                  <Youtube className="w-5 h-5 text-red-500" />
                  <span className="font-semibold text-foreground">
                    YouTube:
                    {user.youtube_url ? (
                      <a
                        href={user.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-primary hover:text-primary/80 hover:underline font-normal transition-colors"
                      >
                        {
                          (() => {
                            const url = user.youtube_url;
                            const handle = url.match(/youtube\.com\/@([^/?]+)/i);
                            if (handle) return `@${handle[1]}`;
                            const userMatch = url.match(/youtube\.com\/user\/([^/?]+)/i);
                            if (userMatch) return userMatch[1];
                            const custom = url.match(/youtube\.com\/c\/([^/?]+)/i);
                            if (custom) return custom[1];
                            const channel = url.match(/youtube\.com\/channel\/([^/?]+)/i);
                            if (channel) return `Canal`;
                            return url.replace(/^https?:\/\/(www\.)?youtube\.com\//, '');
                          })()
                        }
                      </a>
                    ) : (
                      <span className="ml-1 text-muted-foreground font-normal">No especificado</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
          {activeSection === 'likes' && (
            <div className="glass-card p-8 flex flex-col gap-4 mb-8 w-full">
              <h3 className="text-2xl font-bold text-gradient mb-2">Me Gusta</h3>
              <PerfilLikes userId={user.id.toString()} user={user} />
            </div>
          )}
          {activeSection === 'seguridad' && (
            <div className="glass-card p-8 flex flex-col gap-4 mb-8 w-full">
              <h3 className="text-2xl font-bold text-gradient mb-2">Seguridad</h3>
              <PerfilSeguridad userId={user.id.toString()} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
