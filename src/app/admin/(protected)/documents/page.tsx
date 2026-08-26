import Link from "next/link";
import { ArrowRight, FileUp, Plus } from "lucide-react";

import { getDocuments } from "@/lib/site-data";

export default async function DocumentListPage() {
  const documentRows = await getDocuments(true);

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">PDF и файлы</p>
          <h1>Документы</h1>
          <p>Загружайте новый PDF через «Медиа», затем вставьте его ссылку в нужную карточку документа.</p>
        </div>
        <Link href="/admin/documents/new" className="button button-primary"><Plus size={18} aria-hidden="true" />Добавить документ</Link>
      </div>
      <div className="admin-list">
        {documentRows.map((document) => (
          <Link href={`/admin/documents/${document.id}`} className="admin-list-row" key={document.id}>
            <FileUp aria-hidden="true" size={20} />
            <span className="admin-list-main"><strong>{document.title}</strong><small>{document.fileUrl}</small></span>
            <span className={document.isVisible ? "status status-live" : "status"}>{document.isVisible ? "На сайте" : "Скрыт"}</span>
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        ))}
      </div>
    </section>
  );
}
