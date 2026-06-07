import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Matikan header X-Powered-By untuk keamanan
  poweredByHeader: false,
  
  // Aktifkan React Strict Mode
  reactStrictMode: true,
  
  // Compile standalone untuk Docker production
  output: "standalone",
  
  // Konfigurasi Image, memblokir domain external tidak dikenal
  images: {
    remotePatterns: [],
  },
  
  // Custom Security Headers
  async headers() {
    return [
      {
        // Terapkan ke semua rute
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            // CSP yang ketat: 
            // - default-src 'self'
            // - style-src allow 'unsafe-inline' (dibutuhkan TailwindCSS)
            value: "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval';",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
