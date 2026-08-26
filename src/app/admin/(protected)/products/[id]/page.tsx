import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { saveProductAction } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { getSeries } from "@/lib/site-data";

export default async function ProductEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const isNew = id === "new";
  const seriesRows = await getSeries(true);
  const [savedProduct] = isNew
    ? []
    : await db.select().from(products).where(eq(products.id, Number(id)));
  if (!isNew && !savedProduct) notFound();

  const product = savedProduct ?? {
    id: 0,
    seriesId: null,
    article: "",
    description: "",
    size: "",
    color: "Металлик",
    powerRange: "20–65 Вт",
    availability: "Запросить КП",
    modalTitle: "",
    modalDescription: "",
    modalImageUrl: "",
    modalImageAlt: "",
    gallery: "[]",
    modalLayout: "text-only",
    modalImageAspect: "landscape",
    internalPrice: null,
    sortOrder: 999,
    isVisible: true,
  };

  return (
    <section className="admin-page">
      <div className="admin-page-heading compact">
        <div>
          <Link href="/admin/products" className="text-link">← Все позиции</Link>
          <p className="eyebrow">Каталог</p>
          <h1>{isNew ? "Новая позиция" : product.article}</h1>
          <p>Внутренняя цена нужна только для работы менеджера и не показывается на публичном сайте.</p>
        </div>
      </div>
      {saved ? <p className="admin-success" role="status">Позиция сохранена.</p> : null}
      <form action={saveProductAction} className="admin-form">
        <input type="hidden" name="id" value={product.id} />
        <fieldset>
          <legend>Основные данные</legend>
          <div className="form-grid">
            <label>Артикул<input name="article" defaultValue={product.article} required /></label>
            <label className="form-span-2">Описание позиции<textarea name="description" rows={3} maxLength={1200} defaultValue={product.description} placeholder="Только подтверждённое описание модели, комплектации или назначения" /><span className="field-help">Не добавляйте неподтверждённые характеристики, сертификаты или преимущества.</span></label>
            <label>Серия<select name="seriesId" defaultValue={product.seriesId ?? ""}><option value="">Не выбрана</option>{seriesRows.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
            <label>Размер<input name="size" defaultValue={product.size} placeholder="500×370" required /></label>
            <label>Цвет<input name="color" defaultValue={product.color} required /></label>
            <label>Мощность<input name="powerRange" defaultValue={product.powerRange} /><span className="field-help">Не назначайте фиксированное значение без модели-спецификации.</span></label>
            <label>Статус для посетителя<input name="availability" defaultValue={product.availability} /></label>
            <label>Внутренняя цена, ₽<input name="internalPrice" type="number" min="0" defaultValue={product.internalPrice ?? ""} /><span className="field-help">На сайте не публикуется.</span></label>
            <label>Порядок<input name="sortOrder" type="number" defaultValue={product.sortOrder} /></label>
          </div>
        </fieldset>
        <fieldset>
          <legend>Карточка позиции при открытии</legend>
          <p className="field-help">Карточка откроется на сайте по кнопке «Подробнее». Внутренняя цена в ней не публикуется.</p>
          <label>Заголовок карточки<input name="modalTitle" maxLength={160} defaultValue={product.modalTitle} placeholder="По умолчанию будет использован артикул" /></label>
          <label>Развернутое описание<textarea name="modalDescription" rows={5} maxLength={1800} defaultValue={product.modalDescription} placeholder="Только подтверждённая информация о конкретной позиции" /></label>
          <div className="form-grid">
            <label>URL фото для карточки<input name="modalImageUrl" type="text" inputMode="url" defaultValue={product.modalImageUrl} placeholder="/uploads/..." /><span className="field-help">Файл загружается в «Медиа», затем сюда вставляется ссылка.</span></label>
            <label>Галерея фото (JSON-массив URL)<textarea name="gallery" rows={3} defaultValue={product.gallery} placeholder='["/uploads/products/epc-06-02b-1.jpg", "/uploads/products/epc-06-02b-2.jpg"]' /><span className="field-help">JSON-массив путей к фото этой позиции. Если пусто — используется фото серии.</span></label>
            <label>Описание фото<input name="modalImageAlt" maxLength={255} defaultValue={product.modalImageAlt} /></label>
            <label>Режим карточки<select name="modalLayout" defaultValue={product.modalLayout}><option value="text-only">Только текст</option><option value="image-top">Фото сверху, текст снизу</option><option value="split-left">Фото слева, текст справа</option><option value="split-right">Текст слева, фото справа</option></select></label>
            <label>Пропорции фото<select name="modalImageAspect" defaultValue={product.modalImageAspect}><option value="landscape">Широкий прямоугольник</option><option value="square">Квадрат</option><option value="portrait">Вертикальный прямоугольник</option></select></label>
          </div>
        </fieldset>
        <div className="form-actions">
          <label className="check-label"><input name="isVisible" type="checkbox" defaultChecked={product.isVisible} />Показывать позицию в публичном каталоге</label>
          <button type="submit" className="button button-primary">Сохранить позицию</button>
        </div>
      </form>
    </section>
  );
}
