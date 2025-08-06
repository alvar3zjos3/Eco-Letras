import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Eco Iglesia Letras',
  description: 'Plataforma de letras y acordes de música cristiana',
  keywords: [
    'letras cristianas',
    'acordes cristianos',
    'música cristiana',
    'adoración',
    'iglesia',
    'eco iglesia letras'
  ],
  authors: [{ name: 'Eco Iglesia Letras', url: 'https://ecoiglesia.com' }]
  // openGraph: {
  //   title: 'Eco Iglesia Letras',
  //   description: 'Plataforma de letras y acordes de música cristiana',
  //   url: 'https://ecoiglesialetras.com',
  //   siteName: 'Eco Iglesia Letras',
  //   images: [
  //     {
  //       url: 'https://ecoiglesialetras.com/og-image.jpg',
  //       width: 1200,
  //       height: 630,
  //       alt: 'Eco Iglesia Letras',
  //     },
  //   ],
  //   locale: 'es_ES',
  //   type: 'website',
  // },
  // alternates: {
  //   canonical: 'https://ecoiglesia.com',
  // },
  // robots: {
  //   index: true,
  //   follow: true,
  //   googleBot: {
  //     index: true,
  //     follow: true,
  //     maxSnippet: -1,
  //     maxImagePreview: 'large',
  //     maxVideoPreview: -1,
  //   },
  // },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col particles-bg">
            <Navigation />
            <main id="main-content" className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
