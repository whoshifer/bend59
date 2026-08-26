import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

// Docker builds do not have production secrets. The fallback never connects during build;
// production startup supplies DATABASE_URL through Docker Compose.
const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://unconfigured:***@127.0.0.1:5432/unconfigured";

// BEND может жить в общей базе внутри схемы bend (Render free: одна БД на аккаунт).
// Если схема не задана явно через PGBEND_SCHEMA, работаем в public как раньше.
const bendSchema = process.env.PGBEND_SCHEMA?.trim() || "";

const globalForDatabase = {
  bendPool?: Pool;
};

const pool =
  globalForDatabase.bendPool ??
  new Pool({
    connectionString,
    max: 10,
    ...(bendSchema
      ? {
          options: `-c search_path=${bendSchema},public`,
        }
      : {}),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.bendPool = pool;
}

export const db = drizzle({ client: pool, schema });
