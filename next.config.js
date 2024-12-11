/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xyhqystoebgvqjqgmqng.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'xyhqystoebgvqjqgmqng.supabase.co',
        pathname: '/storage/v1/object/sign/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: 'images.squarespace-cdn.com',
        pathname: '/content/**',
      }
    ],
    domains: [
      'xyhqystoebgvqjqgmqng.supabase.co',
      'images.squarespace-cdn.com'
    ]
  },
}

module.exports = nextConfig 