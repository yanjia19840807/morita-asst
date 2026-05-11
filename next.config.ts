import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@langchain/community',
    'ali-oss',
    'pdf-parse',
    'pdfjs-dist',
    'urllib'
  ]
}

export default nextConfig
