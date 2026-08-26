import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { saveDocumentAction } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";

export default async function DocumentEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const isNew = id === "new";
  const [savedDocument] = isNew ? [] : await db.select().from(documents).where(eq(documents.id, Number(id)));
  if (!isNew && !savedDocument) notFound();

  const document = savedDocument ?? {
    id: 0,
    slug: "",
    title: "",
    description: "",
    fileUrl: "",
    sortOrder: 999,
    isVisible: true,
  };

  return (
    <section className="admin-page">
      <div className="admin-page-heading compact">
        <div>
          <Link href="/admin/documents" className="text-link">← Все документы</Link>
          <p className="eyebrow">PDF и файлы</p>
          <h1>{isNew ? "Новый документ" : document.title}</h1>
          <p>Файл должен быть загружен в разделе «Медиа» или находиться по доверенной HTTPS-ссылке.</p>
        </div>
      </div>
      {saved ? <p className="admin-success" role="status">Документ сохранён.</p> : null}
      <form action={saveDocumentAction} className="admin-form">
        <input type="hidden" name="id" value={document.id} />
        <fieldset>
          <legend>Данные документа</legend>
          <div className="form-grid">
            <label>Системный код<input name="slug" defaultValue={document.slug} required placeholder="certificate" /></label>
            <label>Порядок<input name="sortOrder" type="number" defaultValue={document.sortOrder} /></label>
          </div>
          <label>Название<input name="title" defaultValue={document.title} required /></label>
          <label>Пояснение<textarea name="description" rows={3} defaultValue={document.description} /></label>
          <label>Ссылка на файл<input name="fileUrl" type="text" defaultValue={document.fileUrl} required placeholder="/uploads/имя-файла.pdf" /></label>
        </fieldset>
        <div className="form-actions">
          <label className="check-label"><input name="isVisible" type="checkbox" defaultChecked={document.isVisible} />Показывать документ на сайте</label>
          <button type="submit" className="button button-primary">Сохранить документ</button>
        </div>
      </form>
    </section>
  );
}
