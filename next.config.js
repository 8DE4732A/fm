/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/fm',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
