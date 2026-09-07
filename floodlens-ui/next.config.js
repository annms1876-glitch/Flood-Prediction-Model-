/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_ML_URL: process.env.NEXT_PUBLIC_ML_URL || "http://flood-prediction-model.railway.internal",
    NEXT_PUBLIC_BACKEND_URL:
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://umeedai.railway.internal",
  },
  async rewrites() {
    return [
      {
        source: "/api/ml/:path*",
        destination: `${process.env.NEXT_PUBLIC_ML_URL || "http://localhost:8000"}/:path*`,
      },
      {
        source: "/api/backend/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
