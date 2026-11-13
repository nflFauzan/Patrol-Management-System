/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@patrol/types'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'exceljs'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:3000/api/:path*',
      },
      {
        source: '/socket.io/:path*',
        destination: 'http://127.0.0.1:3000/socket.io/:path*',
      },
      {
        source: '/login.php',
        destination: '/login',
      },
      {
        source: '/validasi-patroli/index.php',
        destination: '/validasi-patroli',
      },
      {
        source: '/xxxxx_:slug.php',
        destination: '/validasi-patroli/xxxxx_:slug.php',
      },
    ];
  },
};

export default nextConfig;
