'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Users, Settings, LogIn, LogOut, User, Menu, Phone, Info, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, setAuthenticated, user, isLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    window.location.href = '/';
  };

  const navItems = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/canciones', label: 'Canciones', icon: Search },
    { href: '/artistas', label: 'Artistas', icon: Users },
    { href: '/acerca', label: 'Acerca', icon: Info },
    { href: '/contacto', label: 'Contacto', icon: Phone },
  ];

  if (user?.is_admin) {
    navItems.push({ href: '/admin', label: 'Administración', icon: Settings });
  }

  return (
    <nav className="relative text-foreground shadow-2xl border-b border-border backdrop-blur-md fade-in">
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 smooth-transition glass-card">
        <div className="flex justify-between h-16 items-center w-full">
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center group whitespace-nowrap">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl group-hover:bg-primary/50 transition-colors"></div>
                <Music className="relative w-8 h-8 text-primary mr-3 group-hover:text-primary/80 transition-colors" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gradient group-hover:text-gradient smooth-transition">
                Eco Iglesia Letras
              </span>
            </Link>
          </div>

          {/* Menú desktop */}
          <div className="hidden sm:flex sm:space-x-2 flex-1 justify-center mx-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isActive
                      ? 'glass-card text-foreground border border-primary/50 shadow-lg interactive-hover'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20'
                    }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/20 rounded-lg blur-sm"></div>
                  )}
                  <Icon className={`relative w-4 h-4 mr-2 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'
                    }`} />
                  <span className="relative">{item.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Botón menú móvil */}
          <div className="sm:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Abrir menú"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-foreground hover:bg-primary/10 border border-primary/20 hover:border-primary/30 transition-all"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>

          {/* Usuario */}
          <div className="hidden sm:flex items-center space-x-3 flex-shrink-0">
            {!isLoading && user ? (
              <div className="flex items-center gap-3">
                <Link href="/perfil-usuario">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-foreground hover:bg-primary/10 border border-primary/20 hover:border-primary/30 glass-card transition-all group"
                  >
                    <User className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
                    Mi Perfil
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-foreground border-destructive/50 hover:bg-destructive/20 hover:border-destructive glass-card transition-all group"
                >
                  <LogOut className="w-4 h-4 mr-2 group-hover:text-destructive transition-colors" />
                  Cerrar Sesión
                </Button>
              </div>
            ) : !isLoading && (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-foreground border-primary/50 hover:bg-primary/20 hover:border-primary glass-card transition-all group"
                  >
                    <LogIn className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="btn-gradient border-0 shadow-lg glass-card transition-all group"
                  >
                    <User className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Menú móvil */}
        {mobileOpen && (
          <div className="sm:hidden mt-2 pb-4 border-t border-border">
            <div className="glass-card rounded-xl p-4 mt-4">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center px-3 py-2.5 rounded-lg transition-all group ${isActive
                          ? 'bg-primary/20 text-foreground border border-primary/50'
                          : 'text-muted-foreground hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20'
                        }`}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'
                        }`} />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      )}
                    </Link>
                  );
                })}

                <div className="mt-4 pt-4 border-t border-border">
                  {!isLoading && (
                    <>
                      {user ? (
                        <div className="space-y-2">
                          <Link href="/perfil-usuario">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center w-full mb-2 text-foreground hover:bg-primary/10 border border-primary/20 hover:border-primary/30 group"
                              onClick={() => setMobileOpen(false)}
                            >
                              <User className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
                              Mi Perfil
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                            className="flex items-center w-full text-foreground border-destructive/50 hover:bg-destructive/20 hover:border-destructive group"
                          >
                            <LogOut className="w-4 h-4 mr-2 group-hover:text-destructive transition-colors" />
                            Cerrar Sesión
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-2">
                          <Link href="/login">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center w-full text-foreground border-primary/50 hover:bg-primary/20 hover:border-primary group"
                            >
                              <LogIn className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
                              Iniciar Sesión
                            </Button>
                          </Link>
                          <Link href="/register">
                            <Button
                              size="sm"
                              className="flex items-center w-full btn-gradient border-0 group"
                            >
                              <User className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                              Registrarse
                            </Button>
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

