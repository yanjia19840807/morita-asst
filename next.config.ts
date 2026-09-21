import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['docx-preview'],
  serverExternalPackages: [
    '@langchain/community',
    'ali-oss',
    'pdf-parse',
    'pdfjs-dist',
    'urllib'
  ],
  experimental: {
    optimizePackageImports: ['radix-ui', 'lodash', '@hugeicons/core-free-icons'],
    serverActions: {
      bodySizeLimit: '110mb'
    },
    proxyClientMaxBodySize: '110mb'
  }
}

export default nextConfig
