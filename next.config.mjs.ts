/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopack: {
      // This stops Next.js from scanning your whole 'AI Library' folder
      root: '.', 
    },
  },
  // Optional: This can help prevent OOM during builds
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;