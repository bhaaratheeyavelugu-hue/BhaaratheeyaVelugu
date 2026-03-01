import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure DATABASE_URL is always set in dev so the app works without manual .env setup
  env: {
    DATABASE_URL:
      process.env.DATABASE_URL ||
      (process.env.NODE_ENV !== "production" ? "file:./prisma/dev.db" : undefined),
  },
};

export default nextConfig;
