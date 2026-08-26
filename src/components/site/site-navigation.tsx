"use client";

import Link from "next/link";
import { Menu, MoveUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useKpArticles } from "@/lib/kp-cart";

type SiteNavigationProps = {
  brandText: string;
  logoMode: string;
  logoUrl: string;
  logoAlt: string;
};

const navigationItems = [
  { href: "#series", label: "Серии" },
  { href: "#catalog", label: "Каталог" },
  { href: "#documents", label: "Документы" },
];

export function SiteNavigation({ brandText, logoMode, logoUrl, logoAlt }: SiteNavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const kpArticles = useKpArticles();
  const kpCount = kpArticles.length;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => setShowTop(window.scrollY > 520);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const scrollTop = () => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });

  const kpBadge = kpCount > 0 ? <span className="kp-badge" aria-hidden="true">{kpCount}</span> : null;

  return (
    <>
      <Link href="/" className={`site-brand site-brand-${logoMode}`} aria-label={`${brandText} — главная страница`}>
        {logoMode === "image" && logoUrl ? <img src={logoUrl} alt={logoAlt || `${brandText} — логотип`} className="brand-image" /> : null}
        {logoMode === "mark" ? <span className="brand-mark" aria-hidden="true">{brandText.slice(0, 1).toUpperCase() || "B"}</span> : null}
        <span>{brandText}</span>
      </Link>

      <nav className="site-nav site-nav-desktop" aria-label="Основная навигация">
        {navigationItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        <a href="#request" className={`button button-primary kp-nav-button ${kpCount > 0 ? "has-items" : ""}`}>
          Мой КП{kpBadge}
        </a>
      </nav>

      <button ref={triggerRef} type="button" className="mobile-menu-trigger" aria-expanded={menuOpen} aria-controls="mobile-site-menu" onClick={() => setMenuOpen(true)}>
        <Menu size={18} aria-hidden="true" /> Меню
      </button>

      {menuOpen ? <div className="mobile-menu-layer" role="presentation" onMouseDown={closeMenu}>
        <aside ref={panelRef} id="mobile-site-menu" className="mobile-menu-panel" role="dialog" aria-modal="true" aria-label="Навигация сайта" onMouseDown={(event) => event.stopPropagation()}>
          <div className="mobile-menu-heading"><span>{brandText}</span><button ref={closeButtonRef} type="button" className="icon-button" aria-label="Закрыть меню" onClick={closeMenu}><X size={20} aria-hidden="true" /></button></div>
          <nav className="mobile-menu-links" aria-label="Мобильная навигация">
            {navigationItems.map((item) => <a key={item.href} href={item.href} onClick={closeMenu}>{item.label}</a>)}
            <a href="#request" className="button button-primary" onClick={closeMenu}>Мой КП{kpCount > 0 ? ` (${kpCount})` : ""}</a>
          </nav>
        </aside>
      </div> : null}

      {showTop ? <button type="button" className="scroll-top-button" onClick={scrollTop} aria-label="Вернуться к началу страницы"><MoveUp size={18} aria-hidden="true" /> Вверх</button> : null}
    </>
  );
}
