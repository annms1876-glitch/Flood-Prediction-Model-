/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async rewrites() {
    const mlUrl = process.env.NEXT_PUBLIC_ML_URL || "";
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";

    const rewrites = [];

    if (mlUrl) {
      rewrites.push({
        source: "/api/ml/:path*",
        destination: `${mlUrl}/:path*`,
      });
    }

    if (backendUrl) {
      rewrites.push({
        source: "/api/backend/:path*",
        destination: `${backendUrl}/:path*`,
      });
    }

    return rewrites;
  },
};

module.exports = nextConfig;
