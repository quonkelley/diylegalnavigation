/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: isProd ? '/diylegalnavigation' : '',
  assetPrefix: isProd ? '/diylegalnavigation/' : '',
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure proper CSS handling
  webpack: (config, { dev, isServer }) => {
    // Handle CSS in production static export
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups.styles = {
        name: 'styles',
        test: /\.css$/,
        chunks: 'all',
        enforce: true,
      }
    }
    return config
  },
}

module.exports = nextConfig
