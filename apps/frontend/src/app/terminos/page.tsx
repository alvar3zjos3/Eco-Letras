'use client';

import { useMemo, useState, useEffect } from 'react';
import { AlertTriangle, Shield, Users, FileText } from 'lucide-react';

export default function TerminosPage() {
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-24 w-24 border-b-4 border-primary mx-auto"></div>
          </div>
          <p className="mt-6 text-foreground font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen text-foreground overflow-hidden smooth-transition">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in slide-up">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg"></div>
            <FileText className="relative w-16 h-16 text-primary mx-auto" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-gradient">
            Términos y Condiciones de Uso
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Última actualización: {lastUpdate}
          </p>
        </div>

        {/* Contenido */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Introducción */}
          <div className="glass-card shadow-2xl interactive-hover" aria-label="Introducción">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg"></div>
                  <FileText className="w-6 h-6 relative z-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Introducción</h2>
              </div>
              <div className="prose max-w-none">
                <p className="text-muted-foreground mb-4">
                  Bienvenido a Eco Iglesia Letras. Estos términos y condiciones ("Términos") rigen su uso
                  de nuestro sitio web y servicios (el "Servicio") operado por Eco Iglesia Letras ("nosotros",
                  "nuestro" o "nos").
                </p>
                <p className="text-muted-foreground">
                  Al acceder o usar nuestro Servicio, usted acepta estar sujeto a estos Términos. Si no está
                  de acuerdo con alguna parte de estos términos, entonces no puede acceder al Servicio.
                </p>
              </div>
            </div>
          </div>

          {/* Aceptación de Términos */}
          <div className="glass-card shadow-2xl interactive-hover" aria-label="Aceptación de Términos">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">1. Aceptación de Términos</h2>
              <p className="text-muted-foreground mb-4">
                Al crear una cuenta o utilizar cualquier parte de nuestro servicio, usted confirma que:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Tiene al menos 13 años de edad</li>
                <li>Tiene la capacidad legal para celebrar estos términos</li>
                <li>Proporcionará información precisa y completa durante el registro</li>
                <li>Mantendrá la seguridad de su cuenta y contraseña</li>
              </ul>
            </div>
          </div>

          {/* Uso del Servicio */}
          <div className="glass-card shadow-2xl interactive-hover" aria-label="Uso del Servicio">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg"></div>
                  <Users className="w-6 h-6 relative z-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">2. Uso del Servicio</h2>
              </div>

              <h3 className="font-semibold text-lg mb-3 text-foreground">2.1 Uso Permitido</h3>
              <p className="text-muted-foreground mb-4">
                Nuestro servicio está destinado exclusivamente para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                <li>Adoración y actividades religiosas en iglesias y organizaciones cristianas</li>
                <li>Uso personal para estudio y práctica musical cristiana</li>
                <li>Actividades educativas relacionadas con música cristiana</li>
                <li>Ministerios y eventos cristianos sin fines de lucro</li>
              </ul>

              <h3 className="font-semibold text-lg mb-3 text-foreground">2.2 Uso Prohibido</h3>
              <p className="text-muted-foreground mb-4">
                Usted se compromete a NO usar el servicio para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Actividades comerciales sin autorización previa por escrito</li>
                <li>Redistribuir o revender el contenido sin permiso</li>
                <li>Crear obras derivadas del contenido protegido</li>
                <li>Usar el contenido en contextos que contradigan valores cristianos</li>
                <li>Violar derechos de propiedad intelectual de terceros</li>
                <li>Transmitir virus, malware o código malicioso</li>
                <li>Intentar acceder a áreas restringidas del sistema</li>
              </ul>
            </div>
          </div>

          {/* Derechos de Propiedad Intelectual */}
          <div className="glass-card shadow-2xl interactive-hover" aria-label="Derechos de Propiedad Intelectual">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg"></div>
                  <Shield className="w-6 h-6 relative z-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">3. Derechos de Propiedad Intelectual</h2>
              </div>

              <h3 className="font-semibold text-lg mb-3 text-foreground">3.1 Contenido de Terceros</h3>
              <p className="text-muted-foreground mb-4">
                Las letras, acordes y composiciones musicales disponibles en nuestro servicio son propiedad
                de sus respectivos autores, compositores y editores. Respetamos y protegemos estos derechos.
              </p>

              <h3 className="font-semibold text-lg mb-3 text-foreground">3.2 Nuestro Contenido</h3>
              <p className="text-muted-foreground mb-4">
                El diseño, código, estructura y funcionalidad de la plataforma son propiedad de
                Eco Iglesia Letras y están protegidos por derechos de autor y otras leyes de propiedad intelectual.
              </p>

              <h3 className="font-semibold text-lg mb-3 text-foreground">3.3 Licencia de Uso</h3>
              <p className="text-muted-foreground">
                Le otorgamos una licencia limitada, no exclusiva, no transferible y revocable para usar
                nuestro servicio de acuerdo con estos términos únicamente para los propósitos permitidos.
              </p>
            </div>
          </div>

          {/* Cuentas de Usuario */}
          <div className="glass-card shadow-2xl interactive-hover" aria-label="Cuentas de Usuario">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">4. Cuentas de Usuario</h2>

              <h3 className="font-semibold text-lg mb-3 text-foreground">4.1 Responsabilidad de la Cuenta</h3>
              <p className="text-muted-foreground mb-4">
                Usted es responsable de mantener la confidencialidad de su cuenta y contraseña,
                y de todas las actividades que ocurran bajo su cuenta.
              </p>

              <h3 className="font-semibold text-lg mb-3 text-foreground">4.2 Información Precisa</h3>
              <p className="text-muted-foreground mb-4">
                Debe proporcionar información precisa, actual y completa durante el proceso de registro
                y mantener actualizada dicha información.
              </p>

              <h3 className="font-semibold text-lg mb-3 text-foreground">4.3 Terminación de Cuenta</h3>
              <p className="text-muted-foreground">
                Nos reservamos el derecho de suspender o terminar su cuenta si viola estos términos
                o si determinamos que su uso del servicio es perjudicial para otros usuarios o para nosotros.
              </p>
            </div>
          </div>

          {/* Limitación de Responsabilidad */}
          <div className="glass-card shadow-2xl interactive-hover" aria-label="Limitación de Responsabilidad">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/30 rounded-full blur-lg"></div>
                  <AlertTriangle className="w-6 h-6 relative z-10 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">5. Limitación de Responsabilidad</h2>
              </div>

              <p className="text-muted-foreground mb-4">
                El servicio se proporciona "tal como está" y "según disponibilidad". No garantizamos
                que el servicio será ininterrumpido, libre de errores o completamente seguro.
              </p>
              <p className="text-muted-foreground mb-4">
                En ningún caso seremos responsables por daños indirectos, incidentales, especiales,
                consecuentes o punitivos, incluyendo pero no limitado a pérdida de beneficios, datos o uso.
              </p>
              <p className="text-muted-foreground">
                Nuestra responsabilidad total hacia usted por cualquier reclamo relacionado con el
                servicio no excederá el monto que haya pagado por el servicio en los 12 meses anteriores.
              </p>
            </div>
          </div>

          {/* Modificaciones */}
          <div className="glass-card shadow-2xl interactive-hover" aria-label="Modificaciones a los Términos">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">6. Modificaciones a los Términos</h2>
              <p className="text-muted-foreground mb-4">
                Nos reservamos el derecho de modificar estos términos en cualquier momento.
                Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web.
              </p>
              <p className="text-muted-foreground">
                Su uso continuado del servicio después de cualquier modificación constituye su
                aceptación de los nuevos términos. Si no está de acuerdo con las modificaciones,
                debe dejar de usar el servicio.
              </p>
            </div>
          </div>

          {/* Ley Aplicable */}
          <div className="glass-card shadow-2xl interactive-hover" aria-label="Ley Aplicable y Jurisdicción">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">7. Ley Aplicable y Jurisdicción</h2>
              <p className="text-muted-foreground mb-4">
                Estos términos se regirán e interpretarán de acuerdo con las leyes del país donde
                opera Eco Iglesia Letras, sin tener en cuenta sus principios de conflicto de leyes.
              </p>
              <p className="text-muted-foreground">
                Cualquier disputa que surja de o en relación con estos términos será resuelta
                mediante arbitraje vinculante o en los tribunales competentes de nuestra jurisdicción.
              </p>
            </div>
          </div>

          {/* Contacto */}
          <div className="glass-card shadow-2xl interactive-hover" aria-label="Información de Contacto">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">8. Información de Contacto</h2>
              <p className="text-muted-foreground mb-4">
                Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos a través de:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Formulario de contacto en nuestro sitio web</li>
                <li>Correo electrónico: legal@ecoiglesialetras.com</li>
                <li>Dirección postal: [Dirección a completar]</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

