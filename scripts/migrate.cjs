const path = require("path");
const { Client } = require("pg");
const { drizzle } = require("drizzle-orm/node-postgres");
const { migrate } = require("drizzle-orm/node-postgres/migrator");

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await migrate(drizzle({ client }), {
      migrationsFolder: process.env.MIGRATIONS_DIR || path.join(__dirname, "..", "drizzle"),
      // Журнал миграций в изолированной схеме (по умолчанию — общая drizzle).
      migrationsSchema: process.env.MIGRATIONS_SCHEMA || undefined,
    });
    console.log("Database migrations are up to date.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Database migration failed:", error);
  process.exit(1);
});
