// Стартовый скрипт для Render: миграции → сид → production-сервер Next.js.
// BEND живёт в общей darra-db (free-тариф Render даёт одну БД на аккаунт).
// Пересечений таблиц нет: darra (Prisma) — SiteConfig/Order/MediaAsset/…,
// bend (Drizzle) — products/series/inquiries/… Журнал drizzle — в схеме drizzle_bend.
// Сид идемпотентный (ON CONFLICT DO NOTHING), повторные деплои контент не затирают.
const { spawn } = require("node:child_process");
const path = require("node:path");

function run(command, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", shell: process.platform === "win32", env });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`))));
    child.on("error", reject);
  });
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");

  // Журнал миграций drizzle изолируем в отдельной схеме, чтобы не пересечься,
  // если darra когда-нибудь тоже переедет на drizzle.
  const { Client } = require("pg");
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query("CREATE SCHEMA IF NOT EXISTS drizzle_bend");
  await client.query("GRANT ALL ON SCHEMA drizzle_bend TO current_user");
  await client.end();

  const env = { ...process.env, MIGRATIONS_SCHEMA: "drizzle_bend" };

  await run("node", [path.join(__dirname, "migrate.cjs")], env);
  await run("node", [path.join(__dirname, "seed.cjs")], env);

  const port = process.env.PORT || "3000";
  const server = spawn("npx", ["next", "start", "-p", port, "-H", "0.0.0.0"], {
    stdio: "inherit",
    shell: true,
    env,
  });
  server.on("exit", (code) => process.exit(code ?? 0));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
