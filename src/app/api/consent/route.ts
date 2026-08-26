import { createHash, randomUUID } from "crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { consentEvents } from "@/lib/db/schema";

const payloadSchema = z.object({
  decision: z.enum(["accepted", "rejected"]),
  consentVersion: z.string().trim().min(1).max(40).default("1"),
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
    return NextResponse.json({ error: "Не удалось сохранить выбор cookie." }, { status: 422 });
  }

  const receiptHash = createHash("sha256")
    .update(`${randomUUID()}:${parsed.data.decision}:${parsed.data.consentVersion}`)
    .digest("hex");

  await db.insert(consentEvents).values({
    decision: parsed.data.decision,
    consentVersion: parsed.data.consentVersion,
    receiptHash,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
