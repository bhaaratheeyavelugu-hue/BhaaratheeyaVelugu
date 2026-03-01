import "dotenv/config";
import { defineConfig } from "prisma/config";

// Optional DATABASE_URL so `prisma generate` works without a DB (e.g. Vercel build).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
