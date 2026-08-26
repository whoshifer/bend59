"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  FolderOpen,
  ImageIcon,
  Inbox,
  LayoutPanelTop,
  Package,
  Settings,
  Shapes,
} from "lucide-react";

import { logoutAction } from "@/app/admin/actions";

const navigation = [
  { href: "/admin", label: "Обзор", hint: "Сводка по сайту и заявкам", icon: LayoutPanelTop },
  { href: "/admin/inquiries", label: "Заявки", hint: "Что пришло с сайта — готовим КП", icon: Inbox },
  { href: "/admin/products", label: "Каталог", hint: "Позиции: артикул, размер, цвет, фото", icon: Package },
  { href: "/admin/series", label: "Серии", hint: "Линейки и их фото/описания", icon: Shapes },
  { href: "/admin/content", label: "Блоки страницы", hint: "Тексты и кнопки на главной", icon: FileText },
  { href: "/admin/documents", label: "Документы", hint: "PDF: сертификаты, паспорт", icon: FolderOpen },
  { href: "/admin/media", label: "Медиа", hint: "Загрузка фото и файлов", icon: ImageIcon },
  { href: "/admin/analytics", label: "Статистика", hint: "Просмотры и решения по cookie", icon: BarChart3 },
  { href: "/admin/settings", label: "Настройки и SEO", hint: "Контакты, получатель заявок, meta", icon: Settings },
];

export function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <span className="admin-brand-mark" aria-hidden="true">B</span>
        <span>
          <strong>BEND</strong>
          <small>Управление сайтом</small>
        </span>
      </div>
      <nav aria-label="Административная навигация" className="admin-nav">
        {navigation.map(({ href, label, hint, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={active ? "admin-nav-link is-active" : "admin-nav-link"}
              aria-current={active ? "page" : undefined}
              title={hint}
            >
              <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
              <span className="admin-nav-text">
                <span>{label}</span>
                <small>{hint}</small>
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="admin-sidebar-footer">
        <p>Вы вошли как<br /><strong>{name}</strong></p>
        <a href="/" target="_blank" rel="noreferrer">Открыть сайт</a>
        <form action={logoutAction}>
          <button type="submit" className="admin-signout">Выйти</button>
        </form>
      </div>
    </aside>
  );
}
