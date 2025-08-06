'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, Database, UserCheck, AlertCircle } from 'lucide-react';

export default function PrivacidadPage() {
  // Loader inicial para UX consistente
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Fecha de última actualización automática (formato: "Mes Año")
  const lastUpdate = useMemo(() => {
    const date = new Date();
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${meses[date.getMonth()]} ${date.getFullYear()}`;
  }, []);

  // Loader inicial (recargando)
  if (isLoading) {
    return (
      <div className="p-8 smooth-transition fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg"></div>
              <div className="relative animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-primary border-r-primary/60 mx-auto"></div>
            </div>
            <span className="text-muted-foreground text-lg">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 smooth-transition fade-in slide-up">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gradient mb-4">
            Política de Privacidad
          </h1>
          <p className="text-xl text-muted-foreground">
            Última actualización: {lastUpdate}
          </p>
        </div>

        {/* Introducción */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-foreground text-xl">
              <Shield className="w-6 h-6 text-primary" />
              Compromiso con su Privacidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              En Eco Iglesia Letras, respetamos y protegemos la privacidad de nuestros usuarios. 
              Esta Política de Privacidad explica cómo recopilamos, usamos, compartimos y protegemos 
              su información personal cuando utiliza nuestro servicio.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Al usar nuestro servicio, usted acepta las prácticas descritas en esta política. 
              Si no está de acuerdo con nuestras prácticas, por favor no use nuestro servicio.
            </p>
          </CardContent>
        </Card>

        {/* Información que Recopilamos */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-foreground text-xl">
              <Database className="w-6 h-6 text-primary" />
              1. Información que Recopilamos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-lg mb-3 text-primary">1.1 Información que Usted Proporciona</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li><strong className="text-primary">Información de Cuenta:</strong> Nombre de usuario, dirección de correo electrónico, contraseña</li>
              <li><strong className="text-primary">Información de Perfil:</strong> Nombre, iglesia o organización (opcional)</li>
              <li><strong className="text-primary">Comunicaciones:</strong> Mensajes que nos envía a través de formularios de contacto</li>
              <li><strong className="text-primary">Preferencias:</strong> Configuraciones de cuenta y preferencias de uso</li>
            </ul>

            <h3 className="font-semibold text-lg mb-3 text-primary">1.2 Información Recopilada Automáticamente</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li><strong className="text-primary">Información de Uso:</strong> Páginas visitadas, canciones consultadas, tiempo de uso</li>
              <li><strong className="text-primary">Información del Dispositivo:</strong> Tipo de dispositivo, sistema operativo, navegador</li>
              <li><strong className="text-primary">Información de Red:</strong> Dirección IP, ubicación aproximada</li>
              <li><strong className="text-primary">Cookies y Tecnologías Similares:</strong> Para mejorar la funcionalidad del sitio</li>
            </ul>

            <h3 className="font-semibold text-lg mb-3 text-primary">1.3 Información de Terceros</h3>
            <p className="text-muted-foreground">
              No recopilamos información personal sobre usted de fuentes de terceros sin su consentimiento explícito.
            </p>
          </CardContent>
        </Card>

        {/* Cómo Usamos la Información */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-foreground text-xl">
              <Eye className="w-6 h-6 text-primary" />
              2. Cómo Usamos su Información
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-lg mb-3 text-primary">2.1 Propósitos Principales</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li>Proporcionar y mantener nuestro servicio</li>
              <li>Crear y gestionar su cuenta de usuario</li>
              <li>Personalizar su experiencia en la plataforma</li>
              <li>Responder a sus consultas y solicitudes de soporte</li>
              <li>Enviar notificaciones importantes sobre el servicio</li>
            </ul>

            <h3 className="font-semibold text-lg mb-3 text-primary">2.2 Mejora del Servicio</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li>Analizar patrones de uso para mejorar la funcionalidad</li>
              <li>Desarrollar nuevas características y servicios</li>
              <li>Realizar investigación y análisis estadístico</li>
              <li>Detectar y prevenir fraude o uso indebido</li>
            </ul>

            <h3 className="font-semibold text-lg mb-3 text-primary">2.3 Comunicaciones</h3>
            <p className="text-muted-foreground">
              Podemos usar su información de contacto para enviarle actualizaciones importantes 
              sobre el servicio, cambios en nuestras políticas, o información relevante sobre 
              música cristiana (solo si ha optado por recibirla).
            </p>
          </CardContent>
        </Card>

        {/* Compartir Información */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-foreground text-xl">
              <UserCheck className="w-6 h-6 text-primary" />
              3. Compartir su Información
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-lg mb-3 text-primary">3.1 No Vendemos su Información</h3>
            <p className="text-muted-foreground mb-4">
              Nunca vendemos, alquilamos o comercializamos su información personal a terceros.
            </p>

            <h3 className="font-semibold text-lg mb-3 text-primary">3.2 Compartir Limitado</h3>
            <p className="text-muted-foreground mb-4">
              Solo compartimos su información en las siguientes circunstancias limitadas:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li><strong className="text-primary">Proveedores de Servicios:</strong> Empresas que nos ayudan a operar nuestro servicio (hosting, análisis)</li>
              <li><strong className="text-primary">Cumplimiento Legal:</strong> Cuando sea requerido por ley o para proteger derechos legales</li>
              <li><strong className="text-primary">Protección de Seguridad:</strong> Para prevenir fraude o proteger la seguridad de usuarios</li>
              <li><strong className="text-primary">Transferencia de Negocio:</strong> En caso de fusión, adquisición o venta de activos</li>
            </ul>

            <h3 className="font-semibold text-lg mb-3 text-primary">3.3 Información Agregada</h3>
            <p className="text-muted-foreground">
              Podemos compartir información estadística agregada y anónima que no identifica 
              a usuarios individuales para propósitos de investigación o marketing.
            </p>
          </CardContent>
        </Card>

        {/* Seguridad de Datos */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-foreground text-xl">
              <Lock className="w-6 h-6 text-primary" />
              4. Seguridad de sus Datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-lg mb-3 text-primary">4.1 Medidas de Seguridad</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li>Encriptación SSL/TLS para todas las transmisiones de datos</li>
              <li>Almacenamiento seguro en servidores protegidos</li>
              <li>Acceso restringido a información personal por parte del personal</li>
              <li>Monitoreo regular de seguridad y actualizaciones del sistema</li>
              <li>Copias de seguridad regulares y planes de recuperación</li>
            </ul>

            <h3 className="font-semibold text-lg mb-3 text-primary">4.2 Su Responsabilidad</h3>
            <p className="text-muted-foreground mb-4">
              Usted también tiene un papel importante en proteger su información:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use una contraseña fuerte y única</li>
              <li>No comparta sus credenciales de acceso</li>
              <li>Cierre sesión en dispositivos compartidos</li>
              <li>Notifíquenos inmediatamente sobre actividad sospechosa</li>
            </ul>
          </CardContent>
        </Card>

        {/* Sus Derechos */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="text-foreground text-xl">5. Sus Derechos de Privacidad</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Usted tiene los siguientes derechos respecto a su información personal:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li><strong className="text-primary">Acceso:</strong> Solicitar una copia de la información que tenemos sobre usted</li>
              <li><strong className="text-primary">Corrección:</strong> Solicitar la corrección de información inexacta</li>
              <li><strong className="text-primary">Eliminación:</strong> Solicitar la eliminación de su información personal</li>
              <li><strong className="text-primary">Portabilidad:</strong> Solicitar una copia de sus datos en formato portable</li>
              <li><strong className="text-primary">Restricción:</strong> Solicitar la limitación del procesamiento de sus datos</li>
              <li><strong className="text-primary">Objeción:</strong> Oponerse al procesamiento de sus datos para ciertos propósitos</li>
            </ul>
            <p className="text-muted-foreground">
              Para ejercer estos derechos, contáctenos a través de nuestro formulario de contacto 
              o envíe un correo a privacidad@ecoiglesialetras.com.
            </p>
          </CardContent>
        </Card>

        {/* Retención de Datos */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="text-foreground text-xl">6. Retención de Datos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Conservamos su información personal solo durante el tiempo necesario para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li>Proporcionar nuestros servicios</li>
              <li>Cumplir con obligaciones legales</li>
              <li>Resolver disputas</li>
              <li>Hacer cumplir nuestros acuerdos</li>
            </ul>
            <p className="text-muted-foreground">
              Cuando elimine su cuenta, eliminaremos su información personal dentro de 30 días, 
              excepto la información que debamos conservar por razones legales.
            </p>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="text-foreground text-xl">7. Cookies y Tecnologías de Seguimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-lg mb-3 text-primary">7.1 Tipos de Cookies</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li><strong className="text-primary">Cookies Esenciales:</strong> Necesarias para el funcionamiento básico del sitio</li>
              <li><strong className="text-primary">Cookies de Funcionalidad:</strong> Recuerdan sus preferencias y configuraciones</li>
              <li><strong className="text-primary">Cookies Analíticas:</strong> Nos ayudan a entender cómo usa el sitio</li>
            </ul>

            <h3 className="font-semibold text-lg mb-3 text-primary">7.2 Control de Cookies</h3>
            <p className="text-muted-foreground">
              Puede controlar las cookies a través de la configuración de su navegador. 
              Sin embargo, deshabilitar ciertas cookies puede afectar la funcionalidad del sitio.
            </p>
          </CardContent>
        </Card>

        {/* Cambios en la Política */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-foreground text-xl">
              <AlertCircle className="w-6 h-6 text-primary" />
              8. Cambios en esta Política
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Podemos actualizar esta Política de Privacidad ocasionalmente para reflejar 
              cambios en nuestras prácticas o por otras razones operativas, legales o regulatorias.
            </p>
            <p className="text-muted-foreground">
              Le notificaremos sobre cambios significativos publicando la nueva política en 
              nuestro sitio web y, cuando sea apropiado, enviándole una notificación por correo electrónico.
            </p>
          </CardContent>
        </Card>

        {/* Contacto */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground text-xl">9. Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Si tiene preguntas sobre esta Política de Privacidad o sobre cómo manejamos 
              su información personal, puede contactarnos:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>A través de nuestro formulario de contacto</li>
              <li>Por correo electrónico: privacidad@ecoiglesialetras.com</li>
              <li>Por correo postal: [Dirección a completar]</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Nos comprometemos a responder a sus consultas dentro de 30 días.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

