'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, LogOut, Trash2, MailCheck, Activity } from 'lucide-react';
import { userService } from '@/lib/api-service';

interface PerfilSeguridadProps {
  userId: string;
}

export default function PerfilSeguridad({ userId }: PerfilSeguridadProps) {
  const [form, setForm] = useState({
    actual: '',
    nueva: '',
    repetir: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(''); // Mensaje específico para contraseña
  const [error, setError] = useState('');
  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [showRepetir, setShowRepetir] = useState(false);

  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState(''); // Mensaje específico para logout
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState(''); // Mensaje específico para eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activity, setActivity] = useState<any[]>([]);
  const [showActivity, setShowActivity] = useState(false);
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [emailChangeMsg, setEmailChangeMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setPasswordMessage('');
  };

  const validateForm = () => {
    if (!form.actual || !form.nueva || !form.repetir) {
      return 'Todos los campos son obligatorios.';
    }
    if (form.nueva.length < 8) {
      return 'La nueva contraseña debe tener al menos 8 caracteres.';
    }
    if (form.nueva !== form.repetir) {
      return 'Las contraseñas nuevas no coinciden.';
    }
    if (form.actual === form.nueva) {
      return 'La nueva contraseña no puede ser igual a la actual.';
    }
    return '';
  };

  // Cambiar contraseña
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setPasswordMessage('');
    const valid = validateForm();
    if (valid) {
      setError(valid);
      setIsSaving(false);
      return;
    }
    setError('');
    try {
      const { actual, nueva } = form;
      await userService.updatePassword(userId, {
        old_password: actual,
        new_password: nueva,
      });
      setPasswordMessage('Contraseña actualizada correctamente.');
      setForm({ actual: '', nueva: '', repetir: '' });
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          'No se pudo actualizar la contraseña. Verifica la contraseña actual.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Cerrar sesión en todos los dispositivos
  const handleLogoutAll = async () => {
    setIsLoggingOutAll(true);
    setLogoutMessage('');
    try {
      await userService.logoutAllSessions(userId);
      setLogoutMessage('Sesiones cerradas en todos los dispositivos.');
    } catch {
      setLogoutMessage('No se pudo cerrar sesión en todos los dispositivos.');
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  // Ver historial de actividad
  const handleShowActivity = async () => {
    setShowActivity(!showActivity);
    if (!showActivity && activity.length === 0) {
      try {
        const data = await userService.getActivity(userId);
        setActivity(data);
      } catch {
        setActivity([]);
      }
    }
  };

  // Eliminar cuenta
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteMessage('');
    try {
      const response = await userService.deleteAccount(userId);
      setShowDeleteConfirm(false);
      
      // Mostrar mensaje de éxito con información sobre el período de gracia
      setDeleteMessage('Solicitud de eliminación enviada. Cerrando sesión...');
      
      // Cerrar sesión automáticamente después de 2 segundos
      setTimeout(() => {
        // Limpiar localStorage/sessionStorage si es necesario
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        
        // Redirigir al login
        window.location.href = '/login?message=Tu cuenta será eliminada en 24 horas. Revisa tu correo para confirmar o inicia sesión para cancelar.';
      }, 2000);
    } catch (err: any) {
      setDeleteMessage(
        err?.response?.data?.detail ||
        'No se pudo procesar la solicitud de eliminación.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Cambiar correo electrónico
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingEmail(true);
    setEmailChangeMsg('');

    try {
      await userService.changeEmail(userId, nuevoCorreo);
      setEmailChangeMsg('Solicitud enviada. Revisa tu nuevo correo para confirmar el cambio.');
      setNuevoCorreo('');
    } catch (err: any) {
      setEmailChangeMsg(
        err?.response?.data?.detail ||
        'No se pudo cambiar el correo.'
      );
    } finally {
      setIsChangingEmail(false);
    }
  };

  return (
    <div className="w-full px-4 md:px-16 py-10 smooth-transition fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Columna izquierda: Cambiar contraseña */}
        <div className="glass-card p-8 flex flex-col justify-between h-fit">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
            autoComplete="off"
          >
            <div>
              <label className="block text-sm font-semibold mb-1 text-foreground">
                Contraseña actual
              </label>
              <div className="relative">
                <Input
                  name="actual"
                  type={showActual ? 'text' : 'password'}
                  value={form.actual}
                  onChange={handleChange}
                  required
                  disabled={isSaving}
                  autoComplete="current-password"
                  className="pr-10 bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-muted-foreground hover:text-primary transition"
                  onClick={() => setShowActual((v) => !v)}
                  tabIndex={-1}
                >
                  {showActual ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-foreground">
                Nueva contraseña
              </label>
              <div className="relative">
                <Input
                  name="nueva"
                  type={showNueva ? 'text' : 'password'}
                  value={form.nueva}
                  onChange={handleChange}
                  required
                  disabled={isSaving}
                  autoComplete="new-password"
                  className="pr-10 bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-muted-foreground hover:text-primary transition"
                  onClick={() => setShowNueva((v) => !v)}
                  tabIndex={-1}
                >
                  {showNueva ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <ul className="text-xs text-muted-foreground mt-1 list-disc ml-5">
                <li>Mínimo 8 caracteres</li>
                <li>Recomendado: mayúsculas, minúsculas, número y símbolo</li>
              </ul>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-foreground">
                Repetir nueva contraseña
              </label>
              <div className="relative">
                <Input
                  name="repetir"
                  type={showRepetir ? 'text' : 'password'}
                  value={form.repetir}
                  onChange={handleChange}
                  required
                  disabled={isSaving}
                  autoComplete="new-password"
                  className="pr-10 bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-muted-foreground hover:text-primary transition"
                  onClick={() => setShowRepetir((v) => !v)}
                  tabIndex={-1}
                >
                  {showRepetir ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <p className="text-destructive text-sm font-medium">{error}</p>}
            {passwordMessage && <p className="text-primary text-sm font-medium">{passwordMessage}</p>}
            <Button
              type="submit"
              disabled={isSaving || !!error}
              className="btn-gradient interactive-hover font-semibold py-2 rounded-lg mt-2 w-full"
            >
              {isSaving ? 'Guardando...' : 'Cambiar contraseña'}
            </Button>
          </form>
        </div>
        {/* Columna derecha: Acciones de seguridad */}
        <div className="glass-card p-8 flex flex-col gap-4 h-fit">
          {/* Cerrar sesión en todos los dispositivos */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <LogOut className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Sesiones</span>
            </div>
            <Button
              variant="outline"
              onClick={handleLogoutAll}
              disabled={isLoggingOutAll}
              className="bg-card/50 border-border text-foreground hover:bg-muted interactive-hover w-full"
            >
              {isLoggingOutAll ? 'Cerrando sesiones...' : 'Cerrar sesión en todos los dispositivos'}
            </Button>
            {logoutMessage && (
              <p className={`text-sm font-medium mt-2 ${
                logoutMessage.includes('No se pudo') || logoutMessage.includes('error') 
                  ? 'text-destructive' 
                  : 'text-primary'
              }`}>
                {logoutMessage}
              </p>
            )}
          </div>
          <hr className="my-2 border-border" />
          {/* Ver historial de actividad */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Actividad</span>
            </div>
            <Button
              variant="outline"
              onClick={handleShowActivity}
              className="bg-card/50 border-border text-foreground hover:bg-muted interactive-hover w-full"
            >
              {showActivity ? 'Ocultar historial de actividad' : 'Ver historial de actividad'}
            </Button>
            {showActivity && (
              <div className="glass-card p-4 mt-2">
                <h4 className="font-semibold mb-2 text-foreground">Últimas actividades</h4>
                {activity.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No tienes actividades registradas aún.</p>
                ) : (
                  <ul className="text-sm text-foreground space-y-2">
                    {activity.map((a, i) => (
                      <li key={i} className="border-l-2 border-primary/30 pl-3">
                        <div className="font-medium text-foreground">{a.action}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{a.date}</span>
                          <span>•</span>
                          <span>IP: {a.ip}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <hr className="my-2 border-border" />
          {/* Cambiar correo electrónico */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MailCheck className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Cambiar correo electrónico</span>
            </div>
            <form
              onSubmit={handleChangeEmail}
              className="flex flex-col gap-2"
              autoComplete="off"
            >
              <Input
                name="nuevoCorreo"
                type="email"
                placeholder="Nuevo correo electrónico"
                value={nuevoCorreo}
                onChange={e => {
                  setNuevoCorreo(e.target.value);
                  setEmailChangeMsg('');
                }}
                required
                className="bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
              />
              <Button
                type="submit"
                disabled={isChangingEmail || !nuevoCorreo}
                className="bg-card/50 border-border text-foreground hover:bg-muted interactive-hover w-full"
                variant="outline"
              >
                {isChangingEmail ? 'Cambiando...' : 'Cambiar correo'}
              </Button>
              {emailChangeMsg && (
                <span className={`text-sm ml-2 font-medium ${emailChangeMsg.startsWith('Solicitud') ? 'text-primary' : 'text-destructive'}`}>
                  {emailChangeMsg}
                </span>
              )}
            </form>
          </div>
          <hr className="my-2 border-border" />
          {/* Eliminar cuenta */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              <span className="font-semibold text-destructive">Eliminar cuenta</span>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="bg-destructive/20 hover:bg-destructive/30 border border-destructive/30 text-destructive font-medium w-full"
            >
              Solicitar eliminación de cuenta
            </Button>
            {deleteMessage && (
              <p className={`text-sm font-medium mt-2 ${
                deleteMessage.includes('No se pudo') || deleteMessage.includes('error') 
                  ? 'text-destructive' 
                  : 'text-primary'
              }`}>
                {deleteMessage}
              </p>
            )}
            {showDeleteConfirm && (
              <div className="glass-card p-4 mt-2 border-destructive/30">
                <p className="text-destructive font-semibold mb-3">
                  ⚠️ Tu cuenta será eliminada en 24 horas
                </p>
                <div className="text-foreground text-sm mb-4 space-y-1">
                  <p>• Se eliminarán todos tus datos permanentemente</p>
                  <p>• Perderás todas tus canciones favoritas y playlists</p>
                  <p>• Esta acción NO se puede deshacer</p>
                  <p className="text-primary mt-2">💡 ¿Cambiaste de opinión? Simplemente inicia sesión antes de 24 horas para cancelar</p>
                </div>
                <div className="flex gap-4">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-destructive hover:bg-destructive/80"
                  >
                    {isDeleting ? 'Procesando...' : 'Sí, programar eliminación'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="bg-card/50 border-border text-foreground hover:bg-muted"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}