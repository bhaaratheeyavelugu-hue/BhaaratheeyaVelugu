import { PrismaClient } from "@prisma/client";

export class EnvNotConfiguredError extends Error {
  constructor(public readonly key: string) {
    super(`${key} is not set. Add it to .env.local and restart the dev server.`);
    this.name = "EnvNotConfiguredError";
  }
}

function createThrowProxy(key: string): PrismaClient {
  return new Proxy({} as PrismaClient, {
    get() {
      throw new EnvNotConfiguredError(key);
    },
  });
}

const DEMO_SQLITE_URL = "file:./prisma/dev.db";

function getDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.NODE_ENV !== "production") return DEMO_SQLITE_URL;
  return undefined;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  const url = getDatabaseUrl();
  if (!url)
    return createThrowProxy("DATABASE_URL");
  return new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production" && getDatabaseUrl())
    globalForPrisma.prisma = client;
  return client;
}

// Lazy proxy: create real client on first use so Next.js has injected env by then
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getPrisma() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
