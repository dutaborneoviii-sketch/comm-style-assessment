/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['lucide-react'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        '81d96d5g-3000.asse.devtunnels.ms',
        '*.devtunnels.ms',
        '*.loca.lt',
        '*.ngrok-free.app',
        'localhost:3000'
      ]
    }
  }
};

export default nextConfig;
