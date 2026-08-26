import { unlink } from "fs/promises";
import path from "path";

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";

export const runtime = "nodejs";

function uploadDirectory() {
  return process.env.MEDIA_ROOT ?? path.join(process.cwd(), "public", "uploads");
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Требуется вход в админку." }, { status: 401 });

  const { id } = await params;
  const mediaId = Number.parseInt(id, 10);
  if (!Number.isInteger(mediaId)) return NextResponse.json({ message: "Некорректный идентификатор файла." }, { status: 400 });

  const [record] = await db.select().from(media).where(eq(media.id, mediaId));
  if (!record) return NextResponse.json({ message: "Файл не найден." }, { status: 404 });

  const fileName = path.basename(record.filePath);
  try {
    await unlink(path.join(/* turbopackIgnore: true */ uploadDirectory(), fileName));
  } catch (error: unknown) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") {
      return NextResponse.json({ message: "Не удалось удалить файл из хранилища." }, { status: 500 });
    }
  }

  await db.delete(media).where(eq(media.id, mediaId));
  return NextResponse.json({ ok: true });
}
