import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Production optimizations for 1GB VPS */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    // Optimize images for smaller memory footprint
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Enable compression
  compress: true,
  // Optimize build for memory constraints
  swcMinify: true,
  // Increase build timeout for slower VPS
  staticPageGenerationTimeout: 300,
  // Experimental optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
