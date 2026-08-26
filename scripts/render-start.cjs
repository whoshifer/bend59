// Стартовый скрипт для Render: схема → миграции → сид → production-сервер Next.js.
// BEND живёт в общей базе (darra-db) внутри отдельной схемы `bend`, поэтому таблицы
// двух проектов не пересекаются. Сид идемпотентный (ON CONFLICT DO NOTHING).
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
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) throw new Error("DATABASE_URL is not configured.");

  // 1. Создаём схему bend, если её ещё нет.
  const { Client } = require("pg");
  const client = new Client({ connectionString: baseUrl });
  await client.connect();
  await client.query("CREATE SCHEMA IF NOT EXISTS bend");
  await client.end();
  console.log("Schema 'bend' is ready.");

  // 2. Все дальнейшие подключения работают внутри схемы bend.
  const url = new URL(baseUrl);
  url.searchParams.set("options", "-csearch_path=bend,public");
  const env = { ...process.env, DATABASE_URL: url.toString() };

  // 3. Миграции и сид (идемпотентно).
  await run("node", [path.join(__dirname, "migrate.cjs")], env);
  await run("node", [path.join(__dirname, "seed.cjs")], env);

  // 4. Production-сервер.
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
