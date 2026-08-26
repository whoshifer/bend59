import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";

export const runtime = "nodejs";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
const maxSize = 10 * 1024 * 1024;

function uploadDirectory() {
  return process.env.MEDIA_ROOT ?? path.join(process.cwd(), "public", "uploads");
}

function hasExpectedSignature(mimeType: string, bytes: Buffer) {
  if (mimeType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === "image/webp") return bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  if (mimeType === "application/pdf") return bytes.length >= 5 && bytes.subarray(0, 5).toString("ascii") === "%PDF-";
  return false;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Требуется вход в админку." }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  const altText = String(formData.get("altText") ?? "").trim().slice(0, 255);
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Выберите файл для загрузки." }, { status: 400 });
  }
  if (!allowedMimeTypes.has(file.type)) {
    return NextResponse.json({ message: "Допустимы JPEG, PNG, WebP и PDF." }, { status: 415 });
  }
  if (file.size === 0 || file.size > maxSize) {
    return NextResponse.json({ message: "Размер файла должен быть не больше 10 МБ." }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!hasExpectedSignature(file.type, bytes)) {
    return NextResponse.json({ message: "Содержимое файла не соответствует заявленному формату." }, { status: 415 });
  }

  const extension = file.type === "application/pdf" ? ".pdf" : `.${file.type.split("/")[1].replace("jpeg", "jpg")}`;
  const baseName = path.basename(file.name, path.extname(file.name)).replace(/[^a-zA-Z0-9а-яА-ЯёЁ_-]/g, "-").slice(0, 60) || "file";
  const storedName = `${baseName}-${randomUUID()}${extension}`;
  const directory = uploadDirectory();
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, storedName), bytes);

  const publicPath = `/uploads/${storedName}`;
  const [record] = await db
    .insert(media)
    .values({ fileName: file.name.slice(0, 255), filePath: publicPath, mimeType: file.type, altText })
    .returning();

  return NextResponse.json({ media: record }, { status: 201 });
}
