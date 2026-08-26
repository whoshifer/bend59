import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

// Docker builds do not have production secrets. The fallback never connects during build;
// production startup supplies DATABASE_URL through Docker Compose.
const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://unconfigured:unconfigured@127.0.0.1:5432/unconfigured";

const globalForDatabase = globalThis as unknown as {
  bendPool?: Pool;
};

const pool =
  globalForDatabase.bendPool ??
  new Pool({
    connectionString,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.bendPool = pool;
}

export const db = drizzle({ client: pool, schema });
