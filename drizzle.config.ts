import { defineConfig } from "drizzle-kit";
import { getDatabaseUrl } from "./src/lib/config/env";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: getDatabaseUrl() },
  strict: true,
  verbose: true,
});
