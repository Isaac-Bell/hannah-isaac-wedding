import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseUrl } from "@/lib/config/env";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | undefined;

export function getDatabase() {
  client ??= postgres(getDatabaseUrl(), { max: 10, prepare: false });
  return drizzle(client, { schema });
}
