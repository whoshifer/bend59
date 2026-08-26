import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

import { getContentBlocks } from "@/lib/site-data";

export default async function ContentListPage() {
  const blocks = await getContentBlocks(true);

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Главная страница</p>
          <h1>Блоки и кнопки</h1>
          <p>Откройте блок, чтобы изменить текст, ссылки, подписи кнопок, порядок или видимость.</p>
        </div>
      </div>
      <div className="admin-list">
        {blocks.map((block) => (
          <Link href={`/admin/content/${block.id}`} className="admin-list-row" key={block.id}>
            <span className="admin-list-order">{block.sortOrder}</span>
            <span className="admin-list-main"><strong>{block.label}</strong><small>{block.heading || "Без заголовка"}</small></span>
            <span className="admin-list-state" aria-label={block.isVisible ? "Отображается" : "Скрыт"}>{block.isVisible ? <Eye size={17} aria-hidden="true" /> : <EyeOff size={17} aria-hidden="true" />}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
