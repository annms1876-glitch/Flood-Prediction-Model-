/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      http: false,
      https: false,
      zlib: false,
      crypto: false,
      stream: false,
      events: false,
      buffer: false,
      process: false,
      path: false,
      url: false,
      querystring: false,
      util: false,
      string_decoder: false,
      assert: false,
      os: false,
      punycode: false,
      domain: false,
      timers: false,
      tty: false,
      dgram: false,
      cluster: false,
      module: false,
      vm: false,
      child_process: false,
      worker_threads: false,
      async_hooks: false,
      perf_hooks: false,
    };
    config.externals = [...(config.externals || []), "pako"];
    return config;
  },
  serverExternalPackages: ["pako"],
  images: { unoptimized: true },
};

module.exports = nextConfig;
