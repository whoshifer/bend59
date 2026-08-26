// Стартовый скрипт для Render: миграции → сид → production-сервер Next.js.
// Сид идемпотентный (ON CONFLICT DO NOTHING), повторные деплои не затирают контент.
const { spawn } = require("node:child_process");
const path = require("node:path");

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", shell: process.platform === "win32" });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`))));
    child.on("error", reject);
  });
}

async function main() {
  await run("node", [path.join(__dirname, "migrate.cjs")]);
  await run("node", [path.join(__dirname, "seed.cjs")]);
  // next start поднимаем как дочерний процесс и пробрасываем его код выхода.
  const server = spawn("npx", ["next", "start", "-p", process.env.PORT || "3000", "-H", "0.0.0.0"], {
    stdio: "inherit",
    shell: true,
  });
  server.on("exit", (code) => process.exit(code ?? 0));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
