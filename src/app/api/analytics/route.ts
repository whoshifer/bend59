import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { analyticsDaily, cookieSettings } from "@/lib/db/schema";

const payloadSchema = z.object({
  path: z.string().trim().min(1).max(500).refine((value) => value.startsWith("/"), "Некорректный путь страницы."),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный формат запроса." }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный путь страницы." }, { status: 422 });
  }

  const settings = await db.query.cookieSettings.findFirst({ where: eq(cookieSettings.id, 1) });
  if (!settings?.analyticsEnabled) {
    return NextResponse.json({ ok: true, recorded: false });
  }

  const day = new Date().toISOString().slice(0, 10);
  const path = parsed.data.path.split("?")[0].split("#")[0] || "/";
  await db
    .insert(analyticsDaily)
    .values({ day, path, visits: 1 })
    .onConflictDoUpdate({
      target: [analyticsDaily.day, analyticsDaily.path],
      set: { visits: sql`${analyticsDaily.visits} + 1` },
    });

  return NextResponse.json({ ok: true, recorded: true }, { status: 201 });
}
