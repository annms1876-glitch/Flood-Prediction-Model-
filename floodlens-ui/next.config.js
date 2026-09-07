/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_ML_URL: process.env.NEXT_PUBLIC_ML_URL || "http://localhost:8000",
    NEXT_PUBLIC_BACKEND_URL:
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000",
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
  webpack: function (config, { isServer }) {
    config.module.rules.push({
      test: /\.[jt]sx?$/,
      exclude: /node_modules/,
      use: {
        loader: "babel-loader",
        options: {
          presets: [
            "@babel/preset-env",
            ["@babel/preset-react", { runtime: "automatic" }],
            "@babel/preset-typescript",
          ],
        },
      },
    });
    return config;
  },
};

module.exports = nextConfig;
