/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // 2h:47
  // here we allow images from google to be used 
  images: {
    domains: ['lh3.googleusercontent.com']
  }
}

module.exports = nextConfig
