import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { saveContentAction } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { contentBlocks } from "@/lib/db/schema";

export default async function ContentEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const [block] = await db.select().from(contentBlocks).where(eq(contentBlocks.id, Number(id)));
  if (!block) notFound();

  return (
    <section className="admin-page">
      <div className="admin-page-heading compact">
        <div>
          <Link href="/admin/content" className="text-link">← Все блоки</Link>
          <p className="eyebrow">Редактирование главной</p>
          <h1>{block.label}</h1>
          <p>Изменения сохраняются в базе и сразу обновляют публичную страницу.</p>
        </div>
      </div>
      {saved ? <p className="admin-success" role="status">Блок сохранён.</p> : null}
      <form action={saveContentAction} className="admin-form">
        <input type="hidden" name="id" value={block.id} />
        <fieldset>
          <legend>Содержание</legend>
          <label>Название блока в админке<input name="label" defaultValue={block.label} required /></label>
          <label>Заголовок на сайте<input name="heading" defaultValue={block.heading} /></label>
          <label>Текст или пункты<textarea name="body" rows={8} defaultValue={block.body} /><span className="field-help">Для списков укажите каждый пункт с новой строки.</span></label>
        </fieldset>
        <fieldset>
          <legend>Основная кнопка</legend>
          <div className="form-grid"><label>Подпись<input name="primaryLabel" defaultValue={block.primaryLabel} /></label><label>Ссылка<input name="primaryHref" defaultValue={block.primaryHref} placeholder="#request или https://..." /></label></div>
        </fieldset>
        <fieldset>
          <legend>Дополнительная кнопка</legend>
          <div className="form-grid"><label>Подпись<input name="secondaryLabel" defaultValue={block.secondaryLabel} /></label><label>Ссылка<input name="secondaryHref" defaultValue={block.secondaryHref} placeholder="#catalog или https://..." /></label></div>
        </fieldset>
        <div className="form-grid form-grid-bottom">
          <label>Порядок на странице<input name="sortOrder" type="number" defaultValue={block.sortOrder} /></label>
          <label className="check-label"><input name="isVisible" type="checkbox" defaultChecked={block.isVisible} />Показывать блок на сайте</label>
        </div>
        <button type="submit" className="button button-primary">Сохранить блок</button>
      </form>
    </section>
  );
}
