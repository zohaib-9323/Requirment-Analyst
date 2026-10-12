/** @type {import('next').NextConfig} */
const nextConfig = {
  // The repo root has its own lockfile; keep Next anchored to this app.
  outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;
