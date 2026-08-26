import Link from "next/link";
import { ArrowRight, BarChart3, Inbox, Package, Shapes } from "lucide-react";

import { getDashboardCounts } from "@/lib/site-data";

export default async function AdminDashboardPage() {
  const counts = await getDashboardCounts();
  const cards = [
    { label: "Новых заявок", value: counts.unreadInquiries, href: "/admin/inquiries", icon: Inbox, note: "Проверьте и подготовьте КП" },
    { label: "Позиций каталога", value: counts.products, href: "/admin/products", icon: Package, note: "Артикулы, размеры, цвета" },
    { label: "Серий", value: counts.series, href: "/admin/series", icon: Shapes, note: "Линейки изделий и фото" },
  ];

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">BEND · Администрирование</p>
          <h1>Сайт под вашим управлением</h1>
          <p>Заявки с сайта приходят в раздел «Заявки» и дублируются в Telegram/на почту, если уведомления настроены. Всё остальное меняется без кода и публикуется сразу после сохранения.</p>
        </div>
        <Link href="/" target="_blank" className="button button-secondary">Открыть сайт</Link>
      </div>

      <div className="admin-stats" aria-label="Сводка данных сайта">
        {cards.map(({ label, value, href, icon: Icon, note }) => (
          <Link href={href} key={label} className="admin-stat-card">
            <Icon aria-hidden="true" size={21} />
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{note} <ArrowRight aria-hidden="true" size={14} /></small>
          </Link>
        ))}
      </div>
    </section>
  );
}
