import { defineConfig } from "drizzle-kit";
import { loadEnvConfig } from "@next/env";
import { getDatabaseUrl } from "./src/lib/config/env";

loadEnvConfig(process.cwd());

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: getDatabaseUrl() },
  strict: true,
  verbose: true,
});
