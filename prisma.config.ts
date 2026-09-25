import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Migrations usam a conexão direta; no Supabase o DATABASE_URL é o pooler (pgbouncer).
  datasource: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL },
});
