/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.jackievink.com',
        port: '',
        pathname: '/media/**',
      },
    ],
  },
  experimental: {
    reactCompiler: true,
    ppr: true,
  },
};

export default nextConfig;
