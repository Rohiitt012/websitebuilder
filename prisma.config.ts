import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use .env DATABASE_URL when running migrate/studio; placeholder ok for generate
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/admin_dashboard?schema=public",
  },
});
