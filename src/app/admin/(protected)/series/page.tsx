import Link from "next/link";
import { ArrowRight, ImageOff, Plus } from "lucide-react";

import { getSeries } from "@/lib/site-data";

function galleryCount(raw: string): number {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export default async function SeriesListPage() {
  const seriesRows = await getSeries(true);

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Визуальные карточки</p>
          <h1>Серии изделий</h1>
          <p>Здесь меняются изображения, описание и служебные примечания к каждой серии.</p>
        </div>
        <Link href="/admin/series/new" className="button button-primary"><Plus size={18} aria-hidden="true" />Добавить серию</Link>
      </div>
      <div className="series-admin-grid">
        {seriesRows.map((item) => {
          const count = galleryCount(item.gallery);
          return (
            <Link href={`/admin/series/${item.id}`} key={item.id} className="series-admin-card">
              {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <span className="series-image-placeholder"><ImageOff size={24} aria-hidden="true" />Нет фото</span>}
              <span><strong>{item.title}</strong><small>{item.isVisible ? "Показывается на сайте" : "Скрыта"}</small>{count > 0 ? <small>{count} фото в галерее</small> : null}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
