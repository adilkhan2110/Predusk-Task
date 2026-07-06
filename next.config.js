/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const mockApiBase = process.env.MOCK_API_BASE || 'http://localhost:4000';

    return [
      {
        source: '/api/:path*',
        destination: `${mockApiBase}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
