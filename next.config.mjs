/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: () => Promise.resolve([
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Permissions-Policy',
          value: 'autoplay=*',
        }
      ],
    }
  ])
};

export default nextConfig;
