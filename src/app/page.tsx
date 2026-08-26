import type { Metadata } from "next";
import Link from "next/link";

import { Catalog } from "@/components/site/catalog";
import { InquiryForm } from "@/components/site/inquiry-form";
import { SiteNavigation } from "@/components/site/site-navigation";
import { getContentBlocks, getDocuments, getProducts, getSeries, getSettings } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteUrl = (process.env.SITE_URL || "http://localhost:3001").replace(/\/$/, "");
  return {
    metadataBase: new URL(siteUrl),
    title: settings.seoTitle,
    description: settings.seoDescription,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: settings.brandText,
      title: settings.seoTitle,
      description: settings.seoDescription,
      url: siteUrl,
      images: [{ url: "/og-bend59.png", width: 1200, height: 630, alt: `${settings.companyName} — электрические полотенцесушители` }],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seoTitle,
      description: settings.seoDescription,
      images: ["/og-bend59.png"],
    },
  };
}

function lines(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

export default async function Home() {
  const [settings, blocks, seriesRows, productRows, documentRows] = await Promise.all([
    getSettings(),
    getContentBlocks(),
    getSeries(),
    getProducts(),
    getDocuments(),
  ]);
  const block = new Map(blocks.map((item) => [item.key, item]));
  const hero = block.get("hero");
  const workflow = block.get("workflow");
  const seriesBlock = block.get("series");
  const catalogBlock = block.get("catalog");
  const conditions = block.get("conditions");
  const technology = block.get("technology");
  const documentsBlock = block.get("documents");
  const faq = block.get("faq");
  const requestBlock = block.get("request");
  const productOptions = productRows.map((item) => ({ article: item.article, label: `${item.article} — ${item.size}, ${item.color}`, size: item.size, color: item.color }));

  const siteUrl = (process.env.SITE_URL || "http://localhost:3001").replace(/\/$/, "");
  const faqItems = faq ? lines(faq.body) : [];
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: settings.companyName,
        url: siteUrl,
        telephone: settings.phone,
        email: settings.email,
        address: { "@type": "PostalAddress", streetAddress: settings.address, addressLocality: "Пермь", addressCountry: "RU" },
      },
      { "@type": "WebSite", name: settings.brandText, url: siteUrl, description: settings.seoDescription, inLanguage: "ru-RU" },
      {
        "@type": "ItemList",
        name: "Каталог электрических полотенцесушителей BEND",
        numberOfItems: productRows.length,
        itemListElement: productRows.slice(0, 36).map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: `Электрический полотенцесушитель ${item.article}`,
            sku: item.article,
            category: "Электрические полотенцесушители",
            brand: { "@type": "Brand", name: settings.brandText },
            description: [item.size, item.color, item.powerRange].filter(Boolean).join(", "),
          },
        })),
      },
    ],
  };
  const faqSchema = faqItems.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((question) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: "Уточняется в коммерческом предложении по вашему объекту. Напишите нам — подготовим расчёт." },
    })),
  } : null;

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-container site-header-inner"><SiteNavigation brandText={settings.brandText} logoMode={settings.logoMode} logoUrl={settings.logoUrl} logoAlt={settings.logoAlt} /></div>
      </header>
      <main id="main-content">
        {hero ? <section className="hero"><div className="site-container hero-inner"><div><p className="eyebrow">Производство в Перми · B2B</p><h1>{hero.heading}</h1><p className="hero-copy">{hero.body}</p><div className="hero-actions">{hero.primaryLabel ? <a href={hero.primaryHref || "#request"} className="button button-primary">{hero.primaryLabel}</a> : null}{hero.secondaryLabel ? <a href={hero.secondaryHref || "#catalog"} className="button button-secondary">{hero.secondaryLabel}</a> : null}</div></div><aside className="hero-note"><strong>{settings.heroNoteTitle}</strong><p>{settings.heroNoteText}</p></aside></div></section> : null}

        {workflow ? <section className="site-section"><div className="site-container"><div className="section-heading"><p className="eyebrow">{workflow.label}</p><h2>{workflow.heading}</h2></div><div className="workflow-grid">{lines(workflow.body).map((item, index) => <article className="info-card" key={item}><span className="card-index">0{index + 1}</span><h3>{item}</h3><p>Согласуем набор позиций и подготовим коммерческое предложение.</p></article>)}</div></div></section> : null}

        <section id="series" className="site-section site-section-soft"><div className="site-container"><div className="section-heading"><p className="eyebrow">{seriesBlock?.label || "Реальные изображения"}</p><h2>{seriesBlock?.heading || "Серийные модели"}</h2><p>{seriesBlock?.body || "Фотографии привязаны к серии и не заменяют характеристики отдельных позиций каталога."}</p></div><div className="series-grid">{seriesRows.map((item) => <article className={`series-card layout-${item.cardLayout} aspect-${item.imageAspect} ${!item.imageUrl || item.cardLayout === "text-only" ? "series-card-no-media" : ""}`} key={item.id}>{item.imageUrl && item.cardLayout !== "text-only" ? <div className="series-card-image"><img src={item.imageUrl} alt={item.imageAlt} /></div> : null}<div className="series-card-body"><h3>{item.title}</h3><p>{item.shortDescription}</p><a className="text-link series-card-link" href="#catalog">Смотреть позиции →</a>{item.note ? <p className="note">{item.note}</p> : null}</div></article>)}</div></div></section>

        <section id="catalog" className="site-section"><div className="site-container"><div className="section-heading"><p className="eyebrow">{catalogBlock?.label || "36 редактируемых SKU"}</p><h2>{catalogBlock?.heading || "Каталог для запроса КП"}</h2><p>{catalogBlock?.body || "Выберите позиции — они сохранятся в форме заявки даже после перезагрузки страницы. Розничные цены не выводятся: стоимость фиксируется в коммерческом предложении."}</p></div><Catalog products={productRows} series={seriesRows.map((s) => ({ id: s.id, title: s.title, imageUrl: s.imageUrl, imageAlt: s.imageAlt, gallery: s.gallery }))} /></div></section>

        {conditions ? <section className="site-section site-section-warm"><div className="site-container split-section"><div className="section-heading"><p className="eyebrow">{conditions.label}</p><h2>{conditions.heading}</h2><p>Условия уточняются в коммерческом предложении и спецификации.</p>{conditions.primaryLabel ? <a href={conditions.primaryHref || "#request"} className="button button-primary">{conditions.primaryLabel}</a> : null}</div><ul className="bullet-list">{lines(conditions.body).map((item) => <li key={item}>{item}</li>)}</ul></div></section> : null}

        {technology ? <section className="site-section"><div className="site-container"><div className="section-heading"><p className="eyebrow">{technology.label}</p><h2>{technology.heading}</h2></div><div className="technology-grid">{lines(technology.body).map((item, index) => <article className="info-card" key={item}><span className="card-index">0{index + 1}</span><p>{item}</p></article>)}</div></div></section> : null}

        <section id="documents" className="site-section site-section-soft"><div className="site-container split-section"><div className="section-heading"><p className="eyebrow">{documentsBlock?.label || "Документация"}</p><h2>{documentsBlock?.heading || "Открытые документы для объекта"}</h2><p>{documentsBlock?.body || "До включения в спецификацию можно ознакомиться с декларацией, сертификатом и паспортом изделия."}</p></div><div className="document-list">{documentRows.map((item) => <a key={item.id} href={item.fileUrl} target="_blank" rel="noreferrer" className="document-card"><span><strong>{item.title}</strong><span>{item.description}</span></span><b>Открыть PDF</b></a>)}</div></div></section>

        {faq ? <section className="site-section"><div className="site-container"><div className="section-heading"><p className="eyebrow">{faq.label}</p><h2>{faq.heading}</h2></div><div className="faq-list">{lines(faq.body).map((item) => <article className="faq-item" key={item}><h3>{item}</h3></article>)}</div></div></section> : null}

        <section id="request" className="site-section request-section"><div className="site-container"><div className="section-heading"><p className="eyebrow">{requestBlock?.label || "Коммерческое предложение"}</p><h2>{requestBlock?.heading || "Соберём запрос по вашему объекту"}</h2><p>{requestBlock?.body || "Проверьте состав КП, заполните контакты — заявка придёт менеджеру в Telegram и на почту."}</p></div><InquiryForm products={productOptions} /></div></section>
      </main>
      <footer className="site-footer"><div className="site-container footer-grid"><div><h2>{settings.companyName}</h2><p>{settings.footerDescription}</p></div><div><h3>Контакты</h3><p><a href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a></p><p><a href={`mailto:${settings.email}`}>{settings.email}</a></p><p>{settings.address}</p></div><div><h3>Реквизиты</h3><p>{settings.legalDetails}</p><p><Link href="/admin/login">Вход в админку</Link></p></div></div></footer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      {faqSchema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} /> : null}
    </div>
  );
}
