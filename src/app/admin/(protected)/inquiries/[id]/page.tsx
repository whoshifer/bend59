import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { markInquiryReadAction } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { inquiries } from "@/lib/db/schema";

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, Number(id)));
  if (!inquiry) notFound();

  return (
    <section className="admin-page">
      <div className="admin-page-heading compact">
        <div>
          <Link href="/admin/inquiries" className="text-link">← Все заявки</Link>
          <p className="eyebrow">Заявка №{inquiry.id}</p>
          <h1>{inquiry.company}</h1>
          <p>Получена {new Intl.DateTimeFormat("ru-RU", { dateStyle: "long", timeStyle: "short" }).format(inquiry.createdAt)}</p>
        </div>
        {!inquiry.isRead ? <form action={markInquiryReadAction}><input type="hidden" name="id" value={inquiry.id} /><button className="button button-secondary" type="submit">Отметить прочитанной</button></form> : null}
      </div>
      <dl className="inquiry-details">
        <div><dt>Контактное лицо</dt><dd>{inquiry.contactPerson || "Не указано"}</dd></div>
        <div><dt>Телефон или e-mail</dt><dd><a href={inquiry.contact.includes("@") ? `mailto:${inquiry.contact}` : `tel:${inquiry.contact.replace(/\s/g, "")}`}>{inquiry.contact}</a></dd></div>
        <div><dt>Объект / проект</dt><dd>{inquiry.objectName}</dd></div>
        <div><dt>Позиция</dt><dd>{inquiry.productArticle}</dd></div>
        <div><dt>Количество</dt><dd>{inquiry.quantity} шт.</dd></div>
        <div><dt>Требуемый срок</dt><dd>{inquiry.deadline || "Не указан"}</dd></div>
        <div className="inquiry-comment"><dt>Комментарий</dt><dd>{inquiry.comment || "Нет комментария"}</dd></div>
      </dl>
    </section>
  );
}
