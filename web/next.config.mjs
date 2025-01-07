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
};

export default nextConfig;
