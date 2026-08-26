import "server-only";

import { asc, desc, eq, gte } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  analyticsDaily,
  consentEvents,
  contentBlocks,
  cookieSettings,
  documents,
  inquiries,
  products,
  series,
  siteSettings,
} from "@/lib/db/schema";

export async function getSettings() {
  const settings = await db.query.siteSettings.findFirst({ where: eq(siteSettings.id, 1) });
  if (!settings) throw new Error("Site settings are missing. Run the database seed first.");
  return settings;
}

export async function getCookieSettings() {
  const settings = await db.query.cookieSettings.findFirst({ where: eq(cookieSettings.id, 1) });
  if (!settings) throw new Error("Cookie settings are missing. Run the database seed first.");
  return settings;
}

export async function getContentBlocks(includeHidden = false) {
  return db
    .select()
    .from(contentBlocks)
    .where(includeHidden ? undefined : eq(contentBlocks.isVisible, true))
    .orderBy(asc(contentBlocks.sortOrder));
}

export async function getSeries(includeHidden = false) {
  return db
    .select()
    .from(series)
    .where(includeHidden ? undefined : eq(series.isVisible, true))
    .orderBy(asc(series.sortOrder));
}

export async function getProducts(includeHidden = false) {
  return db
    .select({
      id: products.id,
      article: products.article,
      description: products.description,
      size: products.size,
      color: products.color,
      powerRange: products.powerRange,
      availability: products.availability,
      modalTitle: products.modalTitle,
      modalDescription: products.modalDescription,
      modalImageUrl: products.modalImageUrl,
      modalImageAlt: products.modalImageAlt,
      gallery: products.gallery,
      modalLayout: products.modalLayout,
      modalImageAspect: products.modalImageAspect,
      isVisible: products.isVisible,
      sortOrder: products.sortOrder,
      seriesId: products.seriesId,
      seriesTitle: series.title,
    })
    .from(products)
    .leftJoin(series, eq(products.seriesId, series.id))
    .where(includeHidden ? undefined : eq(products.isVisible, true))
    .orderBy(asc(products.sortOrder));
}

export async function getDocuments(includeHidden = false) {
  return db
    .select()
    .from(documents)
    .where(includeHidden ? undefined : eq(documents.isVisible, true))
    .orderBy(asc(documents.sortOrder));
}

export async function getInquiries() {
  return db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
}

export async function getDashboardCounts() {
  const [productRows, seriesRows, inquiryRows] = await Promise.all([
    db.select({ id: products.id }).from(products),
    db.select({ id: series.id }).from(series),
    db.select({ id: inquiries.id, isRead: inquiries.isRead }).from(inquiries),
  ]);
  return {
    products: productRows.length,
    series: seriesRows.length,
    inquiries: inquiryRows.length,
    unreadInquiries: inquiryRows.filter((item) => !item.isRead).length,
  };
}

export async function getAnalyticsSummary(days = 30) {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - Math.max(days - 1, 0));
  const startDay = start.toISOString().slice(0, 10);

  const [dailyRows, consentRows, inquiryRows] = await Promise.all([
    db.select().from(analyticsDaily).where(gte(analyticsDaily.day, startDay)).orderBy(asc(analyticsDaily.day)),
    db.select({ decision: consentEvents.decision, createdAt: consentEvents.createdAt }).from(consentEvents).where(gte(consentEvents.createdAt, start)),
    db.select({ id: inquiries.id, createdAt: inquiries.createdAt }).from(inquiries).where(gte(inquiries.createdAt, start)),
  ]);

  const visits = dailyRows.reduce((sum, item) => sum + item.visits, 0);
  const analyticsConsents = consentRows.filter((item) => item.decision === "accepted").length;
  const necessaryOnly = consentRows.filter((item) => item.decision === "rejected").length;
  const uniqueDays = new Set(dailyRows.map((item) => item.day)).size;
  const topPaths = [...dailyRows]
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5)
    .map((item) => ({ path: item.path, visits: item.visits }));

  return {
    days,
    visits,
    uniqueDays,
    analyticsConsents,
    necessaryOnly,
    inquiries: inquiryRows.length,
    daily: dailyRows.map((item) => ({ day: item.day, path: item.path, visits: item.visits })),
    topPaths,
  };
}
