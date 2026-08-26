import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

const createdAt = timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  createdAt,
  updatedAt,
});

export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  companyName: varchar("company_name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 80 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  address: text("address").notNull(),
  legalDetails: text("legal_details").notNull().default(""),
  formRecipient: varchar("form_recipient", { length: 255 }).notNull().default(""),
  seoTitle: varchar("seo_title", { length: 255 }).notNull(),
  seoDescription: text("seo_description").notNull(),
  logoMode: varchar("logo_mode", { length: 24 }).notNull().default("mark"),
  logoUrl: varchar("logo_url", { length: 500 }).notNull().default(""),
  logoAlt: varchar("logo_alt", { length: 255 }).notNull().default(""),
  brandText: varchar("brand_text", { length: 160 }).notNull().default("BEND"),
  heroNoteTitle: varchar("hero_note_title", { length: 160 }).notNull().default("От заявки до спецификации"),
  heroNoteText: text("hero_note_text").notNull().default("Работаем с застройщиками и электромонтажными организациями. Подберём состав поставки для объекта."),
  footerDescription: text("footer_description").notNull().default("Электрические полотенцесушители для комплектации объектов."),
  updatedAt,
});

export const cookieSettings = pgTable("cookie_settings", {
  id: integer("id").primaryKey().default(1),
  bannerTitle: varchar("banner_title", { length: 160 }).notNull().default("Настройки cookie"),
  bannerText: text("banner_text").notNull().default("Используем только необходимые cookie. С вашего согласия ведём обезличенную статистику посещений, чтобы улучшать сайт."),
  acceptLabel: varchar("accept_label", { length: 80 }).notNull().default("Разрешить статистику"),
  rejectLabel: varchar("reject_label", { length: 80 }).notNull().default("Только необходимые"),
  policyHref: varchar("policy_href", { length: 500 }).notNull().default("/privacy"),
  analyticsEnabled: boolean("analytics_enabled").notNull().default(true),
  retentionDays: integer("retention_days").notNull().default(180),
  updatedAt,
});

export const consentEvents = pgTable(
  "consent_events",
  {
    id: serial("id").primaryKey(),
    decision: varchar("decision", { length: 20 }).notNull(),
    consentVersion: varchar("consent_version", { length: 40 }).notNull().default("1"),
    receiptHash: varchar("receipt_hash", { length: 128 }).notNull(),
    createdAt,
  },
  (table) => [index("consent_events_created_at_idx").on(table.createdAt)],
);

export const analyticsDaily = pgTable(
  "analytics_daily",
  {
    id: serial("id").primaryKey(),
    day: date("day").notNull(),
    path: varchar("path", { length: 500 }).notNull(),
    visits: integer("visits").notNull().default(0),
  },
  (table) => [uniqueIndex("analytics_daily_day_path_idx").on(table.day, table.path)],
);

export const contentBlocks = pgTable(
  "content_blocks",
  {
    id: serial("id").primaryKey(),
    key: varchar("key", { length: 80 }).notNull(),
    label: varchar("label", { length: 160 }).notNull(),
    heading: text("heading").notNull().default(""),
    body: text("body").notNull().default(""),
    primaryLabel: varchar("primary_label", { length: 120 }).notNull().default(""),
    primaryHref: varchar("primary_href", { length: 500 }).notNull().default(""),
    secondaryLabel: varchar("secondary_label", { length: 120 }).notNull().default(""),
    secondaryHref: varchar("secondary_href", { length: 500 }).notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    isVisible: boolean("is_visible").notNull().default(true),
    updatedAt,
  },
  (table) => [uniqueIndex("content_blocks_key_idx").on(table.key)],
);

export const series = pgTable(
  "series",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 80 }).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    shortDescription: text("short_description").notNull().default(""),
    imageUrl: varchar("image_url", { length: 500 }).notNull().default(""),
    imageAlt: varchar("image_alt", { length: 255 }).notNull().default(""),
    gallery: text("gallery").notNull().default("[]"),
    note: text("note").notNull().default(""),
    cardLayout: varchar("card_layout", { length: 24 }).notNull().default("image-top"),
    imageAspect: varchar("image_aspect", { length: 24 }).notNull().default("landscape"),
    sortOrder: integer("sort_order").notNull().default(0),
    isVisible: boolean("is_visible").notNull().default(true),
    updatedAt,
  },
  (table) => [uniqueIndex("series_slug_idx").on(table.slug)],
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    seriesId: integer("series_id").references(() => series.id, { onDelete: "set null" }),
    article: varchar("article", { length: 120 }).notNull(),
    description: text("description").notNull().default(""),
    size: varchar("size", { length: 120 }).notNull(),
    color: varchar("color", { length: 120 }).notNull(),
    powerRange: varchar("power_range", { length: 80 }).notNull().default("20–65 Вт"),
    availability: varchar("availability", { length: 120 }).notNull().default("Запросить КП"),
    modalTitle: varchar("modal_title", { length: 160 }).notNull().default(""),
    modalDescription: text("modal_description").notNull().default(""),
    modalImageUrl: varchar("modal_image_url", { length: 500 }).notNull().default(""),
    modalImageAlt: varchar("modal_image_alt", { length: 255 }).notNull().default(""),
    gallery: text("gallery").notNull().default("[]"),
    modalLayout: varchar("modal_layout", { length: 24 }).notNull().default("text-only"),
    modalImageAspect: varchar("modal_image_aspect", { length: 24 }).notNull().default("landscape"),
    internalPrice: integer("internal_price"),
    isVisible: boolean("is_visible").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    updatedAt,
  },
  (table) => [uniqueIndex("products_article_idx").on(table.article)],
);

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull().unique(),
  mimeType: varchar("mime_type", { length: 120 }).notNull(),
  altText: varchar("alt_text", { length: 255 }).notNull().default(""),
  createdAt,
});

export const documents = pgTable(
  "documents",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 80 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull().default(""),
    fileUrl: varchar("file_url", { length: 500 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isVisible: boolean("is_visible").notNull().default(true),
    updatedAt,
  },
  (table) => [uniqueIndex("documents_slug_idx").on(table.slug)],
);

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  company: varchar("company", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }).notNull().default(""),
  contact: varchar("contact", { length: 255 }).notNull(),
  objectName: varchar("object_name", { length: 255 }).notNull(),
  productArticle: varchar("product_article", { length: 500 }).notNull().default("Нужен подбор"),
  quantity: integer("quantity").notNull(),
  deadline: varchar("deadline", { length: 255 }).notNull().default(""),
  comment: text("comment").notNull().default(""),
  isRead: boolean("is_read").notNull().default(false),
  createdAt,
});

export type ContentBlock = typeof contentBlocks.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Series = typeof series.$inferSelect;
export type CookieSettings = typeof cookieSettings.$inferSelect;
