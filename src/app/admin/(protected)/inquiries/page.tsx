import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";

import { getInquiries } from "@/lib/site-data";

export default async function InquiriesPage() {
  const inquiryRows = await getInquiries();

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Коммерческие предложения</p>
          <h1>Заявки с сайта</h1>
          <p>Все обращения сохраняются в базе. Перед публикацией настройте SMTP, чтобы дополнительно получать уведомления по e-mail.</p>
        </div>
      </div>
      {inquiryRows.length ? <div className="admin-list">
        {inquiryRows.map((inquiry) => (
          <Link href={`/admin/inquiries/${inquiry.id}`} className="admin-list-row" key={inquiry.id}>
            <Inbox size={20} aria-hidden="true" />
            <span className="admin-list-main"><strong>{inquiry.company}</strong><small>{inquiry.contact} · {inquiry.productArticle} · {inquiry.quantity} шт.</small></span>
            <span className={inquiry.isRead ? "status" : "status status-live"}>{inquiry.isRead ? "Прочитана" : "Новая"}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        ))}
      </div> : <div className="admin-empty"><strong>Заявок пока нет</strong><p>Когда посетитель отправит форму на сайте, обращение появится здесь.</p></div>}
    </section>
  );
}
