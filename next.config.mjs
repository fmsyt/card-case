/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => ([
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
