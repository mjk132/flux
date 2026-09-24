import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // Fallback keeps `prisma generate` working during first builds
    // (before cloud env vars are set). Generate never connects anyway.
    url: process.env["DATABASE_URL"] || "file:./dev.db",
  },
});
