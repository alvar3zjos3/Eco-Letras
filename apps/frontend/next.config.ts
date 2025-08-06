import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['localhost', '127.0.0.1'], // Para imágenes del backend local
    formats: ['image/webp', 'image/avif']
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  poweredByHeader: false, // Ocultar header "X-Powered-By"
  compress: true
};

export default nextConfig;
