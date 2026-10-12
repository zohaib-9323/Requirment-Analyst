/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  // The repo root has its own lockfile; keep Next anchored to this app.
  outputFileTracingRoot: __dirname,
  // On Vercel, /api/* is routed to the Express service by vercel.json.
  // For plain `npm run dev`, proxy it to the local Express server instead.
  ...(isDev && {
    experimental: {
      // LLM analysis can take 1-2 minutes; the default dev proxy timeout (30s) cuts it off
      proxyTimeout: 180000,
    },
    async rewrites() {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:5001/api/:path*",
        },
      ];
    },
  }),
};

module.exports = nextConfig;
