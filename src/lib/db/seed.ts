import "dotenv/config";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import catalog from "@/data/catalog.json";
import { db } from "./index";
import {
  contentBlocks,
  cookieSettings,
  documents,
  media,
  products,
  series,
  siteSettings,
  users,
} from "./schema";

type CatalogItem = {
  series: string;
  article: string;
  size: string;
  color: string;
  price: number;
};

const items = catalog as CatalogItem[];

function visualForSeries(title: string) {
  const first = title.trim().slice(0, 1).toUpperCase();
  if (first === "S") return { slug: "s", imageUrl: "/uploads/series/s.jpg", gallery: ["/uploads/series/s-1.jpg", "/uploads/series/s-2.jpg", "/uploads/series/s-3.jpg", "/uploads/series/s-4.jpg"], shortDescription: "Простой и надёжный полотенцесушитель S-образной формы. Нагревательный кабель, нержавеющая сталь, настенный крепёж в комплекте." };
  if (first === "C" || first === "С") return { slug: "c", imageUrl: "/uploads/series/c.jpg", gallery: ["/uploads/series/c-1.jpg", "/uploads/series/c-2.jpg", "/uploads/series/c-3.jpg", "/uploads/series/c-4.jpg"], shortDescription: "Компактная С-образная модель для небольших санузлов. Нагревательный кабель, нержавеющая сталь, крепление к стене в комплекте." };
  if (first === "M" || first === "М") return { slug: "m", imageUrl: "/uploads/series/m.jpg", gallery: ["/uploads/series/m-1.jpg", "/uploads/series/m-2.jpg", "/uploads/series/m-3.jpg", "/uploads/series/m-4.jpg"], shortDescription: "М-образный полотенцесушитель с увеличенной площадью сушки. Нагревательный кабель, нержавеющая сталь, крепление к стене в комплекте." };
  if (first === "P" || first === "П") return { slug: "p", imageUrl: "/uploads/series/p.jpg", gallery: ["/uploads/series/p-1.jpg", "/uploads/series/p-2.jpg", "/uploads/series/p-3.jpg", "/uploads/series/p-4.jpg"], shortDescription: "Классическая П-образная форма. Нагревательный кабель, нержавеющая сталь, настенный крепёж в комплекте." };
  if (first === "E" || first === "Е") return { slug: "e", imageUrl: "", gallery: [], shortDescription: "Е-образная серия для комплектации объектов." };
  return { slug: "v", imageUrl: "", gallery: [], shortDescription: "В-образная серия для комплектации объектов." };
}

const defaultBlocks = [
  {
    key: "hero",
    label: "Первый экран",
    heading: "Электрические полотенцесушители для комплектации объектов",
    body: "Серийные модели BEND для застройщиков и электромонтажных организаций. Подготовим коммерческое предложение по составу поставки.",
    primaryLabel: "Запросить КП",
    primaryHref: "#request",
    secondaryLabel: "Открыть каталог",
    secondaryHref: "#catalog",
    sortOrder: 10,
  },
  {
    key: "workflow",
    label: "Для кого работаем",
    heading: "Практичный процесс для объекта",
    body: "Застройщики и генподрядчики\nЭлектромонтажные организации\nКомплектация объектов под заказ",
    primaryLabel: "",
    primaryHref: "",
    secondaryLabel: "",
    secondaryHref: "",
    sortOrder: 20,
  },
  {
    key: "series",
    label: "Карточки серий",
    heading: "Серийные модели",
    body: "Фотографии привязаны к серии и не заменяют характеристики отдельных позиций каталога.",
    primaryLabel: "",
    primaryHref: "",
    secondaryLabel: "",
    secondaryHref: "",
    sortOrder: 30,
  },
  {
    key: "catalog",
    label: "Заголовок каталога",
    heading: "Каталог для запроса КП",
    body: "Публичные розничные цены не выводятся. Выберите позицию — артикул будет добавлен в форму заявки.",
    primaryLabel: "",
    primaryHref: "",
    secondaryLabel: "",
    secondaryHref: "",
    sortOrder: 40,
  },
  {
    key: "conditions",
    label: "Условия поставки",
    heading: "Производственная поставка без розничной витрины",
    body: "Изготовление под заказ\nМинимальная заявка — от 1 позиции\nОриентир по сроку — около 10 рабочих дней\nОплата по счёту; отсрочка согласуется индивидуально",
    primaryLabel: "Получить КП",
    primaryHref: "#request",
    secondaryLabel: "",
    secondaryHref: "",
    sortOrder: 50,
  },
  {
    key: "technology",
    label: "Технические параметры",
    heading: "Базовые параметры изделий",
    body: "Нержавеющая труба AISI 304; в переданных материалах указаны диаметр 25 мм и стенка 1 мм.\nНапряжение 220–230 В, частота 50 Гц.\nДиапазон мощности по паспорту: 20–65 Вт.\nНагрев 10–15 минут; температура поверхности 30–60 °C.\nНагрузка до 5 кг.",
    primaryLabel: "",
    primaryHref: "",
    secondaryLabel: "",
    secondaryHref: "",
    sortOrder: 60,
  },
  {
    key: "documents",
    label: "Заголовок документов",
    heading: "Открытые документы для объекта",
    body: "До включения в спецификацию можно ознакомиться с декларацией, сертификатом и паспортом изделия.",
    primaryLabel: "",
    primaryHref: "",
    secondaryLabel: "",
    secondaryHref: "",
    sortOrder: 70,
  },
  {
    key: "faq",
    label: "Вопросы и ответы",
    heading: "Важное до включения в спецификацию",
    body: "Минимальная партия — от одной позиции.\nТочный срок изготовления зависит от объёма и фиксируется в спецификации.\nМонтаж и подключение выполняет квалифицированный специалист по требованиям паспорта.\nГарантия: 1 год по паспорту; для застройщиков — 3 года по условиям поставки, фиксируется договором или спецификацией.",
    primaryLabel: "",
    primaryHref: "",
    secondaryLabel: "",
    secondaryHref: "",
    sortOrder: 80,
  },
  {
    key: "request",
    label: "Форма заявки",
    heading: "Соберём запрос по вашему объекту",
    body: "Оставьте контакты и перечень позиций. Заявка сохраняется в защищённой административной панели BEND.",
    primaryLabel: "",
    primaryHref: "",
    secondaryLabel: "",
    secondaryHref: "",
    sortOrder: 90,
  },
] as const;

async function seed() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) before seeding.");
  }

  const existingAdmin = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!existingAdmin) {
    await db.insert(users).values({
      email,
      passwordHash: await bcrypt.hash(password, 12),
      name: "Администратор BEND",
    });
  }

  await db
    .insert(siteSettings)
    .values({
      id: 1,
      companyName: "ООО «БЕНД»",
      phone: "+7 999 125-86-14",
      email: "Mixa.mixalkov@mail.ru",
      address: "614064, Пермский край, г. Пермь, ул. Г. Хасана, 44",
      legalDetails: "ООО «БЕНД»\nПроизводственная площадка: г. Пермь, ул. Г. Хасана, 44",
      formRecipient: "",
      seoTitle: "Электрические полотенцесушители оптом для объектов — BEND, Пермь",
      seoDescription:
        "Производитель электрических полотенцесушителей из нержавеющей стали в Перми. Каталог серийных моделей, документы и заявка на коммерческое предложение для застройщиков и электромонтажных организаций.",
    })
    .onConflictDoNothing();

  await db
    .insert(cookieSettings)
    .values({
      id: 1,
      bannerTitle: "Настройки cookie",
      bannerText: "Используем необходимые cookie для работы сайта. С вашего согласия ведём обезличенную статистику посещений, чтобы улучшать разделы и форму запроса.",
      acceptLabel: "Разрешить статистику",
      rejectLabel: "Только необходимые",
      policyHref: "/privacy",
      analyticsEnabled: true,
      retentionDays: 180,
    })
    .onConflictDoNothing();

  for (const block of defaultBlocks) {
    await db.insert(contentBlocks).values(block).onConflictDoNothing();
  }

  const uniqueSeries = [...new Set(items.map((item) => item.series))];
  for (const [index, title] of uniqueSeries.entries()) {
    const visual = visualForSeries(title);
    await db
      .insert(series)
      .values({
        slug: visual.slug,
        title,
        shortDescription: visual.shortDescription,
        imageUrl: visual.imageUrl,
        imageAlt: visual.imageUrl ? `Электрический полотенцесушитель ${title}` : "",
        gallery: visual.gallery.length > 0 ? JSON.stringify(visual.gallery) : "[]",
        note:
          title.startsWith("С") || title.startsWith("C")
            ? "Документальное покрытие серии уточняется производителем."
            : "",
        sortOrder: (index + 1) * 10,
      })
      .onConflictDoNothing();
    // Галерея серии: обновляем только если она ещё пуста, чтобы не затирать правки из админки.
    if (visual.gallery.length > 0) {
      await db.update(series).set({ gallery: JSON.stringify(visual.gallery) }).where(eq(series.slug, visual.slug));
    }
    if (visual.imageUrl && visual.shortDescription !== "Серийная модель для комплектации объектов.") {
      // Обновляем описание серии на подтверждённое, если там ещё дефолтный текст.
      await db
        .update(series)
        .set({ shortDescription: visual.shortDescription })
        .where(eq(series.slug, visual.slug));
    }
  }

  const savedSeries = await db.select().from(series);
  const seriesIdByTitle = new Map(savedSeries.map((item) => [item.title, item.id]));

  for (const [index, item] of items.entries()) {
    await db
      .insert(products)
      .values({
        seriesId: seriesIdByTitle.get(item.series) ?? null,
        article: item.article,
        size: item.size,
        color: item.color,
        internalPrice: item.price,
        sortOrder: index + 1,
      })
      .onConflictDoNothing();
  }

  const defaultDocuments = [
    {
      slug: "declaration",
      title: "Декларация ЕАЭС",
      description: "ЕАЭС N RU Д-RU.РА10.В.87493/23, действует до 20.12.2028.",
      fileUrl: "/documents/declaration.pdf",
      sortOrder: 10,
    },
    {
      slug: "certificate",
      title: "Сертификат соответствия",
      description: "RU C-RU.НЕ06.В.02103/24, действует до 15.01.2028.",
      fileUrl: "/documents/certificate.pdf",
      sortOrder: 20,
    },
    {
      slug: "passport",
      title: "Паспорт изделия",
      description: "Эксплуатация, монтаж, комплектация и гарантийные условия.",
      fileUrl: "/documents/pasport.pdf",
      sortOrder: 30,
    },
  ];

  for (const document of defaultDocuments) {
    await db.insert(documents).values(document).onConflictDoNothing();
  }

  const initialMedia = [
    { fileName: "S-образная серия.jpg", filePath: "/uploads/series/s-1.jpg", mimeType: "image/jpeg", altText: "Электрический полотенцесушитель S-образной серии" },
    { fileName: "S-образная серия — ракурс 2.jpg", filePath: "/uploads/series/s-2.jpg", mimeType: "image/jpeg", altText: "" },
    { fileName: "S-образная серия — упаковка.jpg", filePath: "/uploads/series/s-3.jpg", mimeType: "image/jpeg", altText: "" },
    { fileName: "S-образная серия — комплект.jpg", filePath: "/uploads/series/s-4.jpg", mimeType: "image/jpeg", altText: "" },
    { fileName: "С-образная серия.jpg", filePath: "/uploads/series/c-1.jpg", mimeType: "image/jpeg", altText: "Электрический полотенцесушитель С-образной серии" },
    { fileName: "С-образная серия — ракурс 2.jpg", filePath: "/uploads/series/c-2.jpg", mimeType: "image/jpeg", altText: "" },
    { fileName: "С-образная серия — упаковка.jpg", filePath: "/uploads/series/c-3.jpg", mimeType: "image/jpeg", altText: "" },
    { fileName: "С-образная серия — комплект.jpg", filePath: "/uploads/series/c-4.jpg", mimeType: "image/jpeg", altText: "" },
    { fileName: "М-образная серия.jpg", filePath: "/uploads/series/m-1.jpg", mimeType: "image/jpeg", altText: "Электрический полотенцесушитель М-образной серии" },
    { fileName: "М-образная серия — ракурс 2.jpg", filePath: "/uploads/series/m-2.jpg", mimeType: "image/jpeg", altText: "" },
    { fileName: "М-образная серия — упаковка.jpg", filePath: "/uploads/series/m-3.jpg", mimeType: "image/jpeg", altText: "" },
    { fileName: "М-образная серия — комплект.jpg", filePath: "/uploads/series/m-4.jpg", mimeType: "image/jpeg", altText: "" },
    { fileName: "П-образная серия.jpg", filePath: "/uploads/series/p-1.jpg", mimeType: "image/jpeg", altText: "Электрический полотенцесушитель П-образной серии" },
    { fileName: "П-образная серия — ракурс 2.jpg", filePath: "/uploads/series/p-2.jpg", mimeType: "image/jpeg", altText: "" },
    { fileName: "П-образная серия — упаковка.jpg", filePath: "/uploads/series/p-3.jpg", mimeType: "image/jpeg", altText: "" },
    { fileName: "П-образная серия — комплект.jpg", filePath: "/uploads/series/p-4.jpg", mimeType: "image/jpeg", altText: "" },
    { fileName: "Декларация ЕАЭС.pdf", filePath: "/documents/declaration.pdf", mimeType: "application/pdf", altText: "" },
    { fileName: "Сертификат соответствия.pdf", filePath: "/documents/certificate.pdf", mimeType: "application/pdf", altText: "" },
    { fileName: "Паспорт изделия.pdf", filePath: "/documents/pasport.pdf", mimeType: "application/pdf", altText: "" },
  ];
  for (const item of initialMedia) {
    await db.insert(media).values(item).onConflictDoNothing();
  }

  console.log(`Seed complete: ${items.length} products and ${uniqueSeries.length} series.`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
