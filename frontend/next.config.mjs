/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cho phep HMR qua domain (dev local qua tunnel)
  allowedDevOrigins: ['shop.remoteterminal.online'],

  output: 'standalone',
  compress: true,
  poweredByHeader: false,

  // Toi uu bundle — tach vendor chunks nho hon
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'embla-carousel-react'],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "nextjs.org",
      },
      {
        protocol: "https",
        hostname: "shop.remoteterminal.online",
      },
      {
        protocol: "https",
        hostname: "shop.bhquan.store",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Security headers cho tat ca routes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },

  // Proxy /api/* -> backend (dev + standalone)
  async rewrites() {
    const apiUrl = process.env.INTERNAL_API_URL || 'http://127.0.0.1:4300/api';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
