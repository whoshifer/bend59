const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "catalog.json"), "utf8"));

const contentBlocks = [
  ["hero", "Первый экран", "Электрические полотенцесушители для комплектации объектов", "Серийные модели BEND для застройщиков и электромонтажных организаций. Подготовим коммерческое предложение по составу поставки.", "Запросить КП", "#request", "Открыть каталог", "#catalog", 10],
  ["workflow", "Для кого работаем", "Практичный процесс для объекта", "Застройщики и генподрядчики\nЭлектромонтажные организации\nКомплектация объектов под заказ", "", "", "", "", 20],
  ["series", "Карточки серий", "Серийные модели", "Фотографии привязаны к серии и не заменяют характеристики отдельных позиций каталога.", "", "", "", "", 30],
  ["catalog", "Заголовок каталога", "Каталог для запроса КП", "Публичные розничные цены не выводятся. Выберите позицию — артикул будет добавлен в форму заявки.", "", "", "", "", 40],
  ["conditions", "Условия поставки", "Производственная поставка без розничной витрины", "Изготовление под заказ\nМинимальная заявка — от 1 позиции\nОриентир по сроку — около 10 рабочих дней\nОплата по счёту; отсрочка согласуется индивидуально", "Получить КП", "#request", "", "", 50],
  ["technology", "Технические параметры", "Базовые параметры изделий", "Нержавеющая труба AISI 304; в переданных материалах указаны диаметр 25 мм и стенка 1 мм.\nНапряжение 220–230 В, частота 50 Гц.\nДиапазон мощности по паспорту: 20–65 Вт.\nНагрев 10–15 минут; температура поверхности 30–60 °C.\nНагрузка до 5 кг.", "", "", "", "", 60],
  ["documents", "Заголовок документов", "Открытые документы для объекта", "До включения в спецификацию можно ознакомиться с декларацией, сертификатом и паспортом изделия.", "", "", "", "", 70],
  ["faq", "Вопросы и ответы", "Важное до включения в спецификацию", "Минимальная партия — от одной позиции.\nТочный срок изготовления зависит от объёма и фиксируется в спецификации.\nМонтаж и подключение выполняет квалифицированный специалист по требованиям паспорта.\nГарантия: 1 год по паспорту; для застройщиков — 3 года по условиям поставки, фиксируется договором или спецификацией.", "", "", "", "", 80],
  ["request", "Форма заявки", "Соберём запрос по вашему объекту", "Оставьте контакты и перечень позиций. Заявка сохраняется в защищённой административной панели BEND.", "", "", "", "", 90],
];

function visualForSeries(title) {
  const first = title.trim().slice(0, 1).toUpperCase();
  if (first === "S") return ["s", "/uploads/series/s.jpg", ["/uploads/series/s-1.jpg", "/uploads/series/s-2.jpg", "/uploads/series/s-3.jpg", "/uploads/series/s-4.jpg"], "Простой и надёжный полотенцесушитель S-образной формы. Нагревательный кабель, нержавеющая сталь, настенный крепёж в комплекте."];
  if (first === "C" || first === "С") return ["c", "/uploads/series/c.jpg", ["/uploads/series/c-1.jpg", "/uploads/series/c-2.jpg", "/uploads/series/c-3.jpg", "/uploads/series/c-4.jpg"], "Компактная С-образная модель для небольших санузлов. Нагревательный кабель, нержавеющая сталь, крепление к стене в комплекте."];
  if (first === "M" || first === "М") return ["m", "/uploads/series/m.jpg", ["/uploads/series/m-1.jpg", "/uploads/series/m-2.jpg", "/uploads/series/m-3.jpg", "/uploads/series/m-4.jpg"], "М-образный полотенцесушитель с увеличенной площадью сушки. Нагревательный кабель, нержавеющая сталь, крепление к стене в комплекте."];
  if (first === "P" || first === "П") return ["p", "/uploads/series/p.jpg", ["/uploads/series/p-1.jpg", "/uploads/series/p-2.jpg", "/uploads/series/p-3.jpg", "/uploads/series/p-4.jpg"], "Классическая П-образная форма. Нагревательный кабель, нержавеющая сталь, настенный крепёж в комплекте."];
  if (first === "E" || first === "Е") return ["e", "", [], "Е-образная серия для комплектации объектов."];
  return ["v", "", [], "В-образная серия для комплектации объектов."];
}

async function main() {
  const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!DATABASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
    throw new Error("DATABASE_URL, ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters are required.");
  }
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    await pool.query(
      "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING",
      [ADMIN_EMAIL.toLowerCase(), await bcrypt.hash(ADMIN_PASSWORD, 12), "Администратор BEND"],
    );
    await pool.query(
      "INSERT INTO site_settings (id, company_name, phone, email, address, legal_details, form_recipient, seo_title, seo_description) VALUES (1, $1, $2, $3, $4, $5, '', $6, $7) ON CONFLICT (id) DO NOTHING",
      ["ООО «БЕНД»", "+7 999 125-86-14", "Mixa.mixalkov@mail.ru", "614064, Пермский край, г. Пермь, ул. Г. Хасана, 44", "ООО «БЕНД»\nПроизводственная площадка: г. Пермь, ул. Г. Хасана, 44", "Электрические полотенцесушители оптом для объектов — BEND, Пермь", "Производитель электрических полотенцесушителей из нержавеющей стали в Перми. Каталог серийных моделей, документы и заявка на коммерческое предложение для застройщиков и электромонтажных организаций."],
    );
    await pool.query(
      "INSERT INTO cookie_settings (id, banner_title, banner_text, accept_label, reject_label, policy_href, analytics_enabled, retention_days) VALUES (1, $1, $2, $3, $4, $5, true, 180) ON CONFLICT (id) DO NOTHING",
      ["Настройки cookie", "Используем необходимые cookie для работы сайта. С вашего согласия ведём обезличенную статистику посещений, чтобы улучшать разделы и форму запроса.", "Разрешить статистику", "Только необходимые", "/privacy"],
    );
    for (const block of contentBlocks) {
      await pool.query(
        "INSERT INTO content_blocks (key, label, heading, body, primary_label, primary_href, secondary_label, secondary_href, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (key) DO NOTHING",
        block,
      );
    }

    const uniqueSeries = [...new Set(catalog.map((item) => item.series))];
    for (const [index, title] of uniqueSeries.entries()) {
      const [slug, imageUrl, gallery, shortDescription] = visualForSeries(title);
      const galleryJson = JSON.stringify(gallery.filter(Boolean));
      await pool.query(
        "INSERT INTO series (slug, title, short_description, image_url, image_alt, note, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (slug) DO NOTHING",
        [slug, title, shortDescription, imageUrl, imageUrl ? `Электрический полотенцесушитель ${title}` : "", title.startsWith("С") || title.startsWith("C") ? "Документальное покрытие серии уточняется производителем." : "", (index + 1) * 10],
      );
      // Галерея серии: обновляем только если она ещё пуста, чтобы не затирать правки из админки.
      await pool.query(
        "UPDATE series SET gallery = $1 WHERE slug = $2 AND gallery = '[]'",
        [galleryJson, slug],
      );
    }
    const seriesRows = await pool.query("SELECT id, title FROM series");
    const seriesIds = new Map(seriesRows.rows.map((row) => [row.title, row.id]));
    for (const [index, item] of catalog.entries()) {
      await pool.query(
        "INSERT INTO products (series_id, article, size, color, power_range, availability, internal_price, sort_order) VALUES ($1,$2,$3,$4,'20–65 Вт','Запросить КП',$5,$6) ON CONFLICT (article) DO NOTHING",
        [seriesIds.get(item.series) || null, item.article, item.size, item.color, item.price, index + 1],
      );
    }

    const docs = [
      ["declaration", "Декларация ЕАЭС", "ЕАЭС N RU Д-RU.РА10.В.87493/23, действует до 20.12.2028.", "/documents/declaration.pdf", 10],
      ["certificate", "Сертификат соответствия", "RU C-RU.НЕ06.В.02103/24, действует до 15.01.2028.", "/documents/certificate.pdf", 20],
      ["passport", "Паспорт изделия", "Эксплуатация, монтаж, комплектация и гарантийные условия.", "/documents/pasport.pdf", 30],
    ];
    for (const doc of docs) {
      await pool.query("INSERT INTO documents (slug, title, description, file_url, sort_order) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (slug) DO NOTHING", doc);
    }
    const initialMedia = [
      ["S-образная серия.jpg", "/uploads/series/s-1.jpg", "image/jpeg", "Электрический полотенцесушитель S-образной серии"],
      ["S-образная серия — ракурс 2.jpg", "/uploads/series/s-2.jpg", "image/jpeg", ""],
      ["S-образная серия — упаковка.jpg", "/uploads/series/s-3.jpg", "image/jpeg", ""],
      ["S-образная серия — комплект.jpg", "/uploads/series/s-4.jpg", "image/jpeg", ""],
      ["С-образная серия.jpg", "/uploads/series/c-1.jpg", "image/jpeg", "Электрический полотенцесушитель С-образной серии"],
      ["С-образная серия — ракурс 2.jpg", "/uploads/series/c-2.jpg", "image/jpeg", ""],
      ["С-образная серия — упаковка.jpg", "/uploads/series/c-3.jpg", "image/jpeg", ""],
      ["С-образная серия — комплект.jpg", "/uploads/series/c-4.jpg", "image/jpeg", ""],
      ["М-образная серия.jpg", "/uploads/series/m-1.jpg", "image/jpeg", "Электрический полотенцесушитель М-образной серии"],
      ["М-образная серия — ракурс 2.jpg", "/uploads/series/m-2.jpg", "image/jpeg", ""],
      ["М-образная серия — упаковка.jpg", "/uploads/series/m-3.jpg", "image/jpeg", ""],
      ["М-образная серия — комплект.jpg", "/uploads/series/m-4.jpg", "image/jpeg", ""],
      ["П-образная серия.jpg", "/uploads/series/p-1.jpg", "image/jpeg", "Электрический полотенцесушитель П-образной серии"],
      ["П-образная серия — ракурс 2.jpg", "/uploads/series/p-2.jpg", "image/jpeg", ""],
      ["П-образная серия — упаковка.jpg", "/uploads/series/p-3.jpg", "image/jpeg", ""],
      ["П-образная серия — комплект.jpg", "/uploads/series/p-4.jpg", "image/jpeg", ""],
      ["Декларация ЕАЭС.pdf", "/documents/declaration.pdf", "application/pdf", ""],
      ["Сертификат соответствия.pdf", "/documents/certificate.pdf", "application/pdf", ""],
      ["Паспорт изделия.pdf", "/documents/pasport.pdf", "application/pdf", ""],
    ];
    for (const item of initialMedia) {
      await pool.query("INSERT INTO media (file_name, file_path, mime_type, alt_text) VALUES ($1,$2,$3,$4) ON CONFLICT (file_path) DO NOTHING", item);
    }
    console.log(`Initial BEND data checked: ${catalog.length} SKU.`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => { console.error("Database seed failed:", error); process.exit(1); });
