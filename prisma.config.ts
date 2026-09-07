// Prisma CLI configuration (replaces the deprecated "prisma" block in package.json).
// NOTE: when this file exists the Prisma CLI no longer auto-loads .env, hence dotenv.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
