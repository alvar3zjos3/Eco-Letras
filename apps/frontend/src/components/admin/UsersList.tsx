'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Search,
  UserCheck,
  Trash2,
  Shield,
  ShieldCheck
} from 'lucide-react';
import { adminService } from '@/lib/api-service';
import { User } from '@/types';

interface UsersListProps {
  onRefresh?: () => void;
}

export default function UsersList({ onRefresh }: UsersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, verificationFilter]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await adminService.getUsers({
        page: currentPage,
        per_page: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(verificationFilter !== undefined && { is_verified: verificationFilter })
      });

      setUsers(response.users);
      setTotalPages(response.pages);
    } catch (err) {
      setError('Error al cargar la lista de usuarios');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const toggleUserStatus = async (userId: number) => {
    setError(null);
    setSuccess(null);

    try {
      const result = await adminService.verifyUser(userId);
      setSuccess(result.message || 'Usuario verificado exitosamente');
      fetchUsers();
      onRefresh?.();
    } catch (err) {
      setError('Error al verificar el usuario');
      console.error('Error verifying user:', err);
    }
  };

  const deleteUser = async (userId: number) => {
    const confirmDelete = confirm(
      '¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.'
    );

    if (!confirmDelete) return;

    setError(null);
    setSuccess(null);

    try {
      const result = await adminService.deleteUser(userId);
      setSuccess(result.message || 'Usuario eliminado exitosamente');
      fetchUsers();
      onRefresh?.();
    } catch (err) {
      setError('Error al eliminar el usuario');
      console.error('Error deleting user:', err);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 fade-in">
      <Card className="glass-card interactive-hover">
        <CardHeader className="bg-gradient-to-r from-card/95 to-secondary/95 border-b border-border">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-gradient text-xl font-bold flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-primary to-primary/80 rounded-full"></div>
                Gestión de Usuarios
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                Administra los usuarios registrados en la plataforma
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 bg-gradient-to-b from-card to-secondary/50 space-y-6">
          {/* Búsqueda y filtros */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, email o username..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 border-2 border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-input/80 smooth-transition"
              />
            </div>

            <Select
              value={verificationFilter === undefined ? "all" : verificationFilter.toString()}
              onValueChange={(value) => {
                setVerificationFilter(value === "all" ? undefined : value === "true");
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[200px] border-2 border-border bg-input text-foreground focus:border-primary smooth-transition">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground">
                <SelectItem value="all" className="hover:bg-secondary focus:bg-secondary">Todos los usuarios</SelectItem>
                <SelectItem value="true" className="hover:bg-secondary focus:bg-secondary">Verificados</SelectItem>
                <SelectItem value="false" className="hover:bg-secondary focus:bg-secondary">Sin verificar</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={fetchUsers}
              variant="outline"
              className="border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary smooth-transition shine-effect"
            >
              Actualizar
            </Button>
          </div>

          {error && (
            <div className="p-4 text-destructive bg-destructive/20 border border-destructive/30 rounded-lg glass-card">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 text-primary bg-primary/20 border border-primary/30 rounded-lg glass-card">
              {success}
            </div>
          )}

          {/* Lista de usuarios */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron usuarios
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => {
                const displayName = user.full_name || user.username || 'Sin nombre';
                const initials = (user.full_name || user.username || user.email)
                  .charAt(0)
                  .toUpperCase();

                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-6 border border-border rounded-xl hover:bg-secondary/30 smooth-transition glass-card interactive-hover"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/30 border border-primary/30 rounded-full flex items-center justify-center">
                        {user.is_admin ? (
                          <ShieldCheck className="h-6 w-6 text-primary" />
                        ) : (
                          <span className="text-primary font-semibold text-lg">
                            {initials}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground text-lg">{displayName}</h3>
                          {user.is_admin && (
                            <Badge className="bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 smooth-transition">
                              Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-1">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Registro: {formatDate(user.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={user.is_verified
                          ? "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
                          : "bg-muted/20 text-muted-foreground border border-muted/30 hover:bg-muted/30"
                        }
                      >
                        {user.is_verified ? "✓ Verificado" : "Sin verificar"}
                      </Badge>

                      {user.is_musician && (
                        <Badge
                          variant="outline"
                          className="bg-chart-5/20 text-chart-5 border border-chart-5/30 hover:bg-chart-5/30 smooth-transition"
                        >
                          🎵 Músico
                        </Badge>
                      )}

                      <div className="flex gap-2">
                        {!user.is_verified && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleUserStatus(user.id)}
                            className="border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary smooth-transition shine-effect"
                            title="Verificar usuario"
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Verificar
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteUser(user.id)}
                          className="border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:border-destructive smooth-transition"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-6 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-border bg-input text-foreground hover:bg-secondary hover:text-foreground smooth-transition disabled:opacity-50"
              >
                Anterior
              </Button>

              <span className="py-2 px-4 text-sm text-muted-foreground bg-input rounded-lg border border-border">
                Página {currentPage} de {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="border-border bg-input text-foreground hover:bg-secondary hover:text-foreground smooth-transition disabled:opacity-50"
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
