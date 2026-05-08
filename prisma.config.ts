import "dotenv/config";
import dotenv from "dotenv";
import path from "path";

// Carrega .env.local (Next.js convention) para o Prisma CLI
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
