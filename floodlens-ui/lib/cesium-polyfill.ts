// Polyfill for Cesium - runs in browser context only
if (typeof window !== "undefined") {
  (globalThis as any).process = { env: { NODE_ENV: "production" } };
  (globalThis as any).Buffer = Buffer;
  (globalThis as any).global = globalThis;
}
