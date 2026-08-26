import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { inquiries } from "@/lib/db/schema";
import { notifyNewInquiry } from "@/lib/notify";

const inquirySchema = z.object({
  company: z.string().trim().min(1, "Укажите название компании.").max(255),
  contactPerson: z.string().trim().max(255).optional().default(""),
  contact: z.string().trim().min(1, "Укажите телефон или e-mail для связи.").max(255),
  objectName: z.string().trim().min(1, "Укажите объект или проект.").max(255),
  productArticle: z.string().trim().max(2000).optional().default("Нужен подбор"),
  quantity: z.coerce.number().int().min(1, "Укажите количество от 1 штуки.").max(100000),
  deadline: z.string().trim().max(255).optional().default(""),
  comment: z.string().trim().max(5000).optional().default(""),
  website: z.string().optional().default(""),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Не удалось прочитать форму." }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(payload);
  if (!parsed.success) {
    const errors = Object.fromEntries(
      parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
    );
    return NextResponse.json({ message: "Проверьте заполнение формы.", errors }, { status: 422 });
  }
  if (parsed.data.website) {
    return NextResponse.json({ message: "Заявка принята." }, { status: 201 });
  }

  const { website: _, ...inquiry } = parsed.data;
  const [inserted] = await db.insert(inquiries).values(inquiry).returning({ id: inquiries.id });
  // Уведомления (Telegram/e-mail) шлём после сохранения; сбой канала не ломает заявку.
  void notifyNewInquiry({ id: inserted.id, ...inquiry });
  return NextResponse.json(
    { message: "Заявка отправлена. Мы свяжемся с вами после обработки запроса." },
    { status: 201 },
  );
}
