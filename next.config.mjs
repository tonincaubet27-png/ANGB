/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Images envoyées depuis /admin/articles (limite Vercel : 4,5 Mo par requête)
  experimental: { serverActions: { bodySizeLimit: '4mb' } },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
}

export default nextConfig
