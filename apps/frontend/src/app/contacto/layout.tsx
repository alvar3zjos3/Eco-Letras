import type { Metadata } from 'next';

// SEO optimizado para la página de contacto
export const metadata: Metadata = {
  title: 'Contacto | Eco Iglesia Letras',
  description: 'Ponte en contacto con el equipo de Eco Iglesia Letras para soporte, sugerencias, reportes de errores o consultas generales. Respuesta en menos de 48 horas.',
  keywords: [
    'contacto eco iglesia letras',
    'soporte música cristiana',
    'ayuda canciones cristianas',
    'reportar error',
    'sugerencias',
    'consultas música iglesia',
    'atención al usuario',
    'feedback',
    'comunicación',
    'asistencia técnica',
    'formulario contacto',
    'equipo soporte'
  ],
  authors: [{ name: 'Eco Iglesia Letras' }],
  creator: 'Eco Iglesia Letras',
  publisher: 'Eco Iglesia Letras',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Contacto | Eco Iglesia Letras',
    description: 'Ponte en contacto con el equipo de Eco Iglesia Letras para soporte, sugerencias, reportes de errores o consultas generales.',
    url: 'https://ecoiglesialetras.com/contacto',
    siteName: 'Eco Iglesia Letras',
    images: [
      {
        url: 'https://ecoiglesialetras.com/og-contacto.jpg',
        width: 1200,
        height: 630,
        alt: 'Contacto Eco Iglesia Letras',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  alternates: {
    canonical: 'https://ecoiglesialetras.com/contacto',
  },
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* JSON-LD para SEO estructurado de la página de contacto */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contacto - Eco Iglesia Letras",
            "description": "Página de contacto para soporte, sugerencias y consultas sobre música cristiana y funcionalidades del sitio",
            "url": "https://ecoiglesialetras.com/contacto",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Eco Iglesia Letras",
              "url": "https://ecoiglesialetras.com"
            },
            "mainEntity": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "description": "Soporte técnico y atención al usuario para Eco Iglesia Letras",
              "availableLanguage": "Spanish",
              "areaServed": "Global",
              "serviceType": [
                "Soporte técnico",
                "Sugerencias de contenido",
                "Reporte de errores",
                "Consultas generales",
                "Feedback de usuario"
              ]
            },
            "about": {
              "@type": "Organization",
              "name": "Eco Iglesia Letras",
              "description": "Plataforma digital de música cristiana con letras, acordes y recursos para iglesias"
            },
            "audience": {
              "@type": "Audience",
              "audienceType": "Usuarios del sitio, músicos de iglesia, administradores"
            },
            "keywords": "contacto, soporte, ayuda, música cristiana, reporte errores, sugerencias",
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Inicio",
                  "item": "https://ecoiglesialetras.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Contacto",
                  "item": "https://ecoiglesialetras.com/contacto"
                }
              ]
            },
            "potentialAction": {
              "@type": "CommunicateAction",
              "name": "Enviar mensaje de contacto",
              "description": "Formulario para enviar consultas, sugerencias o reportes"
            }
          })
        }}
      />
      {children}
    </>
  );
}