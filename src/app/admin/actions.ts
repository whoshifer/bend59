"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { clearSession, createSession, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { clearFailedLogins, isLoginBlocked, registerFailedLogin } from "@/lib/login-rate-limit";
import { purgeExpiredPrivacyData } from "@/lib/privacy-retention";
import {
  contentBlocks,
  cookieSettings,
  documents,
  inquiries,
  products,
  series,
  siteSettings,
  users,
} from "@/lib/db/schema";

const emailSchema = z.email("Укажите корректный e-mail.");

function text(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}

function number(formData: FormData, field: string, fallback = 0) {
  const value = Number.parseInt(text(formData, field), 10);
  return Number.isFinite(value) ? value : fallback;
}

function checked(formData: FormData, field: string) {
  return formData.get(field) === "on";
}

function choice(formData: FormData, field: string, allowed: readonly string[], fallback: string) {
  const value = text(formData, field);
  return allowed.includes(value) ? value : fallback;
}

function safePublicUrl(value: string, kind: "href" | "asset") {
  if (!value) return "";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (kind === "href" && value.startsWith("#")) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:") return url.toString();
    if (kind === "href" && (url.protocol === "mailto:" || url.protocol === "tel:")) return url.toString();
  } catch {
    return "";
  }
  return "";
}

function publicUrl(formData: FormData, field: string, kind: "href" | "asset") {
  return safePublicUrl(text(formData, field), kind);
}

const cardLayouts = ["image-top", "split-left", "split-right", "text-only"] as const;
const imageAspects = ["landscape", "square", "portrait"] as const;
const logoModes = ["mark", "image", "text"] as const;

function refreshPublic() {
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}

export async function loginAction(formData: FormData) {
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!emailSchema.safeParse(email).success || !password) {
    redirect(`/admin/login?error=${encodeURIComponent("Проверьте e-mail и пароль.")}`);
  }

  if (await isLoginBlocked(email)) {
    redirect(`/admin/login?error=${encodeURIComponent("Слишком много неудачных попыток. Повторите вход через 15 минут.")}`);
  }

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    await registerFailedLogin(email);
    redirect(`/admin/login?error=${encodeURIComponent("Неверный e-mail или пароль.")}`);
  }

  await clearFailedLogins(email);
  await createSession({ userId: user.id, email: user.email, name: user.name });
  redirect("/admin");
}

export async function logoutAction() {
  await clearSession();
  redirect("/admin/login");
}

export async function saveSettingsAction(formData: FormData) {
  await requireAdmin();
  await db
    .update(siteSettings)
    .set({
      companyName: text(formData, "companyName"),
      phone: text(formData, "phone"),
      email: text(formData, "email"),
      address: text(formData, "address"),
      legalDetails: text(formData, "legalDetails"),
      formRecipient: text(formData, "formRecipient"),
      seoTitle: text(formData, "seoTitle").slice(0, 255),
      seoDescription: text(formData, "seoDescription").slice(0, 600),
      logoMode: choice(formData, "logoMode", logoModes, "mark"),
      logoUrl: publicUrl(formData, "logoUrl", "asset").slice(0, 500),
      logoAlt: text(formData, "logoAlt").slice(0, 255),
      brandText: text(formData, "brandText").slice(0, 160) || "BEND",
      heroNoteTitle: text(formData, "heroNoteTitle").slice(0, 160),
      heroNoteText: text(formData, "heroNoteText").slice(0, 600),
      footerDescription: text(formData, "footerDescription").slice(0, 600),
      updatedAt: new Date(),
    })
    .where(eq(siteSettings.id, 1));
  refreshPublic();
  redirect("/admin/settings?saved=1");
}

export async function saveCookieSettingsAction(formData: FormData) {
  await requireAdmin();
  const retentionDays = Math.min(Math.max(number(formData, "retentionDays", 180), 30), 730);
  await db
    .update(cookieSettings)
    .set({
      bannerTitle: text(formData, "bannerTitle"),
      bannerText: text(formData, "bannerText"),
      acceptLabel: text(formData, "acceptLabel"),
      rejectLabel: text(formData, "rejectLabel"),
      policyHref: publicUrl(formData, "policyHref", "href") || "/privacy",
      analyticsEnabled: checked(formData, "analyticsEnabled"),
      retentionDays,
      updatedAt: new Date(),
    })
    .where(eq(cookieSettings.id, 1));
  await purgeExpiredPrivacyData(retentionDays);
  refreshPublic();
  redirect("/admin/analytics?saved=1");
}

export async function saveContentAction(formData: FormData) {
  await requireAdmin();
  const id = number(formData, "id");
  await db
    .update(contentBlocks)
    .set({
      label: text(formData, "label"),
      heading: text(formData, "heading"),
      body: text(formData, "body"),
      primaryLabel: text(formData, "primaryLabel"),
      primaryHref: publicUrl(formData, "primaryHref", "href"),
      secondaryLabel: text(formData, "secondaryLabel"),
      secondaryHref: publicUrl(formData, "secondaryHref", "href"),
      sortOrder: number(formData, "sortOrder"),
      isVisible: checked(formData, "isVisible"),
      updatedAt: new Date(),
    })
    .where(eq(contentBlocks.id, id));
  refreshPublic();
  redirect(`/admin/content/${id}?saved=1`);
}

export async function saveSeriesAction(formData: FormData) {
  await requireAdmin();
  const id = number(formData, "id");
  const rawGallery = text(formData, "gallery");
  let gallery = "[]";
  try {
    const parsed = JSON.parse(rawGallery);
    if (Array.isArray(parsed)) {
      gallery = JSON.stringify(parsed.filter((u): u is string => typeof u === "string" && u.length > 0));
    }
  } catch { /* keep default */ }
  const payload = {
    title: text(formData, "title"),
    slug: text(formData, "slug"),
    shortDescription: text(formData, "shortDescription"),
    imageUrl: publicUrl(formData, "imageUrl", "asset"),
    imageAlt: text(formData, "imageAlt"),
    gallery,
    note: text(formData, "note"),
    cardLayout: choice(formData, "cardLayout", cardLayouts, "image-top"),
    imageAspect: choice(formData, "imageAspect", imageAspects, "landscape"),
    sortOrder: number(formData, "sortOrder"),
    isVisible: checked(formData, "isVisible"),
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(series).set(payload).where(eq(series.id, id));
    refreshPublic();
    redirect(`/admin/series/${id}?saved=1`);
  }

  const [created] = await db.insert(series).values(payload).returning({ id: series.id });
  refreshPublic();
  redirect(`/admin/series/${created.id}?saved=1`);
}

export async function saveProductAction(formData: FormData) {
  await requireAdmin();
  const id = number(formData, "id");
  const seriesId = number(formData, "seriesId");
  const rawInternalPrice = text(formData, "internalPrice");
  const rawGallery = text(formData, "gallery");
  let gallery = "[]";
  try {
    const parsed = JSON.parse(rawGallery);
    if (Array.isArray(parsed)) {
      gallery = JSON.stringify(parsed.filter((u): u is string => typeof u === "string" && u.length > 0));
    }
  } catch { /* keep default */ }
  const payload = {
    seriesId: seriesId || null,
    article: text(formData, "article"),
    description: text(formData, "description").slice(0, 1200),
    size: text(formData, "size"),
    color: text(formData, "color"),
    powerRange: text(formData, "powerRange") || "20–65 Вт",
    availability: text(formData, "availability") || "Запросить КП",
    modalTitle: text(formData, "modalTitle").slice(0, 160),
    modalDescription: text(formData, "modalDescription").slice(0, 1800),
    modalImageUrl: publicUrl(formData, "modalImageUrl", "asset").slice(0, 500),
    modalImageAlt: text(formData, "modalImageAlt").slice(0, 255),
    gallery,
    modalLayout: choice(formData, "modalLayout", cardLayouts, "text-only"),
    modalImageAspect: choice(formData, "modalImageAspect", imageAspects, "landscape"),
    internalPrice: rawInternalPrice ? Math.max(0, number(formData, "internalPrice")) : null,
    sortOrder: number(formData, "sortOrder"),
    isVisible: checked(formData, "isVisible"),
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(products).set(payload).where(eq(products.id, id));
    refreshPublic();
    redirect(`/admin/products/${id}?saved=1`);
  }

  const [created] = await db.insert(products).values(payload).returning({ id: products.id });
  refreshPublic();
  redirect(`/admin/products/${created.id}?saved=1`);
}

export async function saveDocumentAction(formData: FormData) {
  await requireAdmin();
  const id = number(formData, "id");
  const payload = {
    slug: text(formData, "slug"),
    title: text(formData, "title"),
    description: text(formData, "description"),
    fileUrl: publicUrl(formData, "fileUrl", "asset"),
    sortOrder: number(formData, "sortOrder"),
    isVisible: checked(formData, "isVisible"),
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(documents).set(payload).where(eq(documents.id, id));
    refreshPublic();
    redirect(`/admin/documents/${id}?saved=1`);
  }

  const [created] = await db.insert(documents).values(payload).returning({ id: documents.id });
  refreshPublic();
  redirect(`/admin/documents/${created.id}?saved=1`);
}

export async function markInquiryReadAction(formData: FormData) {
  await requireAdmin();
  const id = number(formData, "id");
  await db.update(inquiries).set({ isRead: true }).where(eq(inquiries.id, id));
  revalidatePath("/admin/inquiries");
  redirect(`/admin/inquiries/${id}`);
}
