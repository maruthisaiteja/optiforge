/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  async headers() {
    return [
      {
        source: "/starter/:path*",
        headers: [
          {
            key: "Content-Type",
            value: "text/x-python; charset=utf-8",
          },
          {
            key: "Content-Disposition",
            value: "attachment",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
