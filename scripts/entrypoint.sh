#!/bin/sh
set -eu

attempt=0
until node -e "const {Client}=require('pg');const client=new Client({connectionString:process.env.DATABASE_URL});client.connect().then(()=>client.end()).catch(()=>process.exit(1));"; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    echo "PostgreSQL is unavailable after 30 attempts." >&2
    exit 1
  fi
  echo "Waiting for PostgreSQL ($attempt/30)…"
  sleep 2
done

node /app/scripts/migrate.cjs
node /app/scripts/seed.cjs

mkdir -p /app/public/uploads
if [ -d /app/seed-media ]; then
  cp -rn /app/seed-media/. /app/public/uploads/ || true
fi
chown -R node:node /app/public/uploads

exec su-exec node node server.js
