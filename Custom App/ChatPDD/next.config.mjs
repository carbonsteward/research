/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['jsonwebtoken'],
  output: 'standalone',
  experimental: {
    staticGenerationRetry: 0,
  },
}

export default nextConfig
