import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { saveSeriesAction } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { series } from "@/lib/db/schema";

export default async function SeriesEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const isNew = id === "new";
  const [savedSeries] = isNew ? [] : await db.select().from(series).where(eq(series.id, Number(id)));
  if (!isNew && !savedSeries) notFound();

  const item = savedSeries ?? {
    id: 0,
    slug: "",
    title: "",
    shortDescription: "",
    imageUrl: "",
    imageAlt: "",
    gallery: "[]",
    note: "",
    cardLayout: "image-top",
    imageAspect: "landscape",
    sortOrder: 999,
    isVisible: true,
  };

  return (
    <section className="admin-page">
      <div className="admin-page-heading compact">
        <div>
          <Link href="/admin/series" className="text-link">← Все серии</Link>
          <p className="eyebrow">Визуальные карточки</p>
          <h1>{isNew ? "Новая серия" : item.title}</h1>
          <p>Серия хранит общее описание и фотографию. Она не заменяет характеристики отдельных SKU.</p>
        </div>
      </div>
      {saved ? <p className="admin-success" role="status">Серия сохранена.</p> : null}
      <form action={saveSeriesAction} className="admin-form">
        <input type="hidden" name="id" value={item.id} />
        <fieldset>
          <legend>Карточка серии</legend>
          <div className="form-grid">
            <label>Название<input name="title" defaultValue={item.title} required /></label>
            <label>Системный код<input name="slug" defaultValue={item.slug} placeholder="s, c, m, p, e или v" required /><span className="field-help">Уникальное короткое значение латиницей.</span></label>
            <label>Порядок<input name="sortOrder" type="number" defaultValue={item.sortOrder} /></label>
          </div>
          <label>Краткое описание<textarea name="shortDescription" rows={4} defaultValue={item.shortDescription} /></label>
        </fieldset>
        <fieldset>
          <legend>Изображение</legend>
          <label>URL изображения<input name="imageUrl" type="text" inputMode="url" defaultValue={item.imageUrl} placeholder="/uploads/..." /><span className="field-help">Сначала загрузите файл в разделе «Медиа», затем скопируйте ссылку.</span></label>
          <label>Галерея фото (JSON-массив URL)<textarea name="gallery" rows={3} defaultValue={item.gallery} placeholder='["/uploads/series/s.jpg", "/uploads/series/s2.jpg"]' /><span className="field-help">JSON-массив путей к фото. Первое фото будет основным в модалке каталога.</span></label>
          <label>Описание изображения для посетителей<input name="imageAlt" defaultValue={item.imageAlt} /></label>
          <div className="form-grid">
            <label>Режим карточки<select name="cardLayout" defaultValue={item.cardLayout}><option value="image-top">Фото сверху, текст снизу</option><option value="split-left">Фото слева, текст справа</option><option value="split-right">Текст слева, фото справа</option><option value="text-only">Только текст</option></select><span className="field-help">Если URL фото пустой, карточка автоматически остаётся текстовой.</span></label>
            <label>Пропорции фото<select name="imageAspect" defaultValue={item.imageAspect}><option value="landscape">Широкий прямоугольник</option><option value="square">Квадрат</option><option value="portrait">Вертикальный прямоугольник</option></select><span className="field-help">Выберите ориентацию исходного фото без обрезки важной части.</span></label>
          </div>
          <label>Примечание к серии<textarea name="note" rows={3} defaultValue={item.note} /><span className="field-help">Например: не публикуйте для С-серии утверждение о документальном покрытии до подтверждения производителя.</span></label>
        </fieldset>
        <div className="form-actions">
          <label className="check-label"><input name="isVisible" type="checkbox" defaultChecked={item.isVisible} />Показывать серию на сайте</label>
          <button type="submit" className="button button-primary">Сохранить серию</button>
        </div>
      </form>
    </section>
  );
}
