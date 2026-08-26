import "server-only";

import { headers } from "next/headers";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;

type Attempt = {
  count: number;
  windowStartedAt: number;
  blockedUntil: number;
};

type AttemptStore = Map<string, Attempt>;

const globalStore = globalThis as typeof globalThis & { bendLoginAttempts?: AttemptStore };
const attempts = globalStore.bendLoginAttempts ?? new Map<string, Attempt>();
globalStore.bendLoginAttempts = attempts;

async function keyFor(email: string) {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return `${forwardedFor}:${email}`;
}

function prune(now: number) {
  for (const [key, attempt] of attempts) {
    if (attempt.blockedUntil <= now && attempt.windowStartedAt + WINDOW_MS <= now) attempts.delete(key);
  }
}

export async function isLoginBlocked(email: string) {
  const now = Date.now();
  prune(now);
  const attempt = attempts.get(await keyFor(email));
  return Boolean(attempt && attempt.blockedUntil > now);
}

export async function registerFailedLogin(email: string) {
  const now = Date.now();
  prune(now);
  const key = await keyFor(email);
  const current = attempts.get(key);
  const attempt = !current || current.windowStartedAt + WINDOW_MS <= now
    ? { count: 1, windowStartedAt: now, blockedUntil: 0 }
    : { ...current, count: current.count + 1 };

  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.blockedUntil = now + BLOCK_MS;
    attempt.count = 0;
    attempt.windowStartedAt = now;
  }
  attempts.set(key, attempt);
}

export async function clearFailedLogins(email: string) {
  attempts.delete(await keyFor(email));
}
