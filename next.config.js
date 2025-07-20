/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/diylegalnavigation',
  assetPrefix: '/diylegalnavigation/',
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
