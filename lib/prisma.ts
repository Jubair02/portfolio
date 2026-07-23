import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient across hot-reloads in dev and across the
// serverless function lifetime in prod, to avoid exhausting DB connections.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
