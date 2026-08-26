"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { addToKp, useKpArticles } from "@/lib/kp-cart";

type CatalogProduct = {
  id?: number;
  article: string;
  description: string;
  size: string;
  color: string;
  powerRange: string;
  availability: string;
  modalTitle: string;
  modalDescription: string;
  modalImageUrl: string;
  modalImageAlt: string;
  gallery: string;
  modalLayout: string;
  modalImageAspect: string;
  seriesId: number | null;
  seriesTitle: string | null;
};

type SeriesInfo = {
  id: number;
  title: string;
  imageUrl: string;
  imageAlt: string;
  gallery: string;
};

function parseGallery(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((u): u is string => typeof u === "string" && u.length > 0) : [];
  } catch {
    return [];
  }
}

function resolveImages(product: CatalogProduct, seriesMap: Map<number, SeriesInfo>): string[] {
  // 1. Собственная галерея позиции
  const productGallery = parseGallery(product.gallery);
  if (productGallery.length > 0) return productGallery;
  // 2. Одиночное modal-изображение
  if (product.modalImageUrl) return [product.modalImageUrl];
  // 3. Галерея серии
  const series = product.seriesId ? seriesMap.get(product.seriesId) : undefined;
  if (!series) return [];
  const seriesGallery = parseGallery(series.gallery);
  return seriesGallery.length > 0 ? seriesGallery : series.imageUrl ? [series.imageUrl] : [];
}

function resolveAlt(product: CatalogProduct, seriesMap: Map<number, SeriesInfo>, index: number): string {
  if (product.modalImageAlt && index === 0) return product.modalImageAlt;
  const series = product.seriesId ? seriesMap.get(product.seriesId) : undefined;
  return series?.imageAlt || product.modalTitle || product.article;
}

export function Catalog({ products, series }: { products: CatalogProduct[]; series: SeriesInfo[] }) {
  const seriesMap = useMemo(() => new Map(series.map((s) => [s.id, s])), [series]);
  const filters = useMemo(
    () => ["Все", ...Array.from(new Set(products.map((item) => item.seriesTitle).filter((title): title is string => Boolean(title))))],
    [products],
  );
  const [selectedFilter, setSelectedFilter] = useState("Все");
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const kpArticles = useKpArticles();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const visible = selectedFilter === "Все" ? products : products.filter((item) => item.seriesTitle === selectedFilter);

  const images = useMemo(
    () => (selectedProduct ? resolveImages(selectedProduct, seriesMap) : []),
    [selectedProduct, seriesMap],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selectedProduct && !dialog.open) {
      setSlideIndex(0);
      dialog.showModal();
      window.setTimeout(() => closeRef.current?.focus(), 0);
    }
    if (!selectedProduct && dialog.open) dialog.close();
  }, [selectedProduct]);

  const goSlide = useCallback(
    (delta: number) => {
      setSlideIndex((prev) => {
        const next = prev + delta;
        if (next < 0) return images.length - 1;
        if (next >= images.length) return images.length;
        return next;
      });
    },
    [images.length],
  );

  useEffect(() => {
    if (!selectedProduct) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") { event.preventDefault(); goSlide(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); goSlide(1); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedProduct, goSlide]);

  function goToRequest(article: string) {
    addToKp(article);
    document.querySelector("#request")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  function closeModal() {
    setSelectedProduct(null);
  }

  const hasImages = images.length > 0;
  const hasMultiple = images.length > 1;

  return (
    <div className="catalog-component">
      <div className="catalog-filters" role="group" aria-label="Фильтр серий">
        {filters.map((filter) => <button key={filter} type="button" className={filter === selectedFilter ? "catalog-filter is-active" : "catalog-filter"} aria-pressed={filter === selectedFilter} onClick={() => setSelectedFilter(filter)}>{filter}</button>)}
      </div>
      <p className="catalog-status" role="status" aria-live="polite">{selectedFilter === "Все" ? `Показаны все позиции: ${visible.length}.` : `Показаны позиции серии «${selectedFilter}»: ${visible.length}.`}</p>
      <div className="catalog-grid">
        {visible.map((product) => {
          const cardImages = resolveImages(product, seriesMap);
          const inKp = kpArticles.includes(product.article);
          return (
            <article key={product.id ?? product.article} className="catalog-card" data-article={product.article}>
              <button
                type="button"
                className="catalog-card-media"
                onClick={() => setSelectedProduct(product)}
                aria-label={`Открыть карточку ${product.article}`}
              >
                {cardImages[0] ? <img src={cardImages[0]} alt={`Электрический полотенцесушитель ${product.article}, ${product.size}, цвет ${product.color}`} loading="lazy" /> : <span className="catalog-card-placeholder">{product.article}</span>}
                {cardImages.length > 1 ? <span className="catalog-card-count">{cardImages.length} фото</span> : null}
              </button>
              <div className="catalog-card-body">
                <p className="eyebrow">{product.seriesTitle || "Каталог"}</p>
                <h3>{product.modalTitle || product.article}</h3>
                {product.description ? <p className="catalog-card-description">{product.description}</p> : null}
                <dl className="catalog-card-specs">
                  <div><dt>Артикул</dt><dd>{product.article}</dd></div>
                  <div><dt>Размер</dt><dd>{product.size}</dd></div>
                  <div><dt>Цвет</dt><dd>{product.color}</dd></div>
                  <div><dt>Мощность</dt><dd>{product.powerRange}</dd></div>
                </dl>
                <div className="catalog-card-actions">
                  <button type="button" className="catalog-details-button" onClick={() => setSelectedProduct(product)}>Подробнее</button>
                  <button type="button" className={inKp ? "button button-small catalog-kp-added" : "button button-small"} onClick={() => goToRequest(product.article)}>
                    {inKp ? "✓ В КП" : "В КП"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <p className="catalog-kp-hint">Выбранные позиции сохраняются в браузере и не пропадут при перезагрузке страницы.</p>

      <dialog ref={dialogRef} className="product-modal" aria-labelledby="product-modal-title" onCancel={(event) => { event.preventDefault(); closeModal(); }} onClose={() => setSelectedProduct(null)}>
        {selectedProduct ? (
          <div className="product-modal-inner">
            <button ref={closeRef} type="button" className="icon-button product-modal-close" aria-label="Закрыть карточку" onClick={closeModal}><X size={20} aria-hidden="true" /></button>
            {hasImages ? (
              <div className="product-modal-gallery">
                <img src={images[slideIndex]} alt={resolveAlt(selectedProduct, seriesMap, slideIndex)} />
                {hasMultiple ? (
                  <div className="gallery-controls">
                    <button type="button" className="gallery-arrow" aria-label="Предыдущее фото" onClick={() => goSlide(-1)}><ChevronLeft size={18} /></button>
                    <span className="gallery-counter">{slideIndex + 1} / {images.length}</span>
                    <button type="button" className="gallery-arrow" aria-label="Следующее фото" onClick={() => goSlide(1)}><ChevronRight size={18} /></button>
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="product-modal-body">
              <p className="eyebrow">{selectedProduct.seriesTitle || "Позиция каталога"}</p>
              <h3 id="product-modal-title">{selectedProduct.modalTitle || selectedProduct.article}</h3>
              <p className="product-modal-meta">{selectedProduct.article} · {selectedProduct.size} · {selectedProduct.color} · {selectedProduct.powerRange}</p>
              {selectedProduct.modalDescription || selectedProduct.description ? <p className="product-modal-description">{selectedProduct.modalDescription || selectedProduct.description}</p> : null}
              <p className="product-modal-availability">{selectedProduct.availability}</p>
              <button type="button" className="button button-primary" onClick={() => { closeModal(); goToRequest(selectedProduct.article); }}>Добавить в КП и перейти к заявке</button>
            </div>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
