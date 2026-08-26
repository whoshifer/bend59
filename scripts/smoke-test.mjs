// Временный smoke-тест: проверяет каталог, корзину КП (localStorage), форму и делает скриншоты.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:3001";
const OUT = "../screenshots-new";
mkdirSync(OUT, { recursive: true });

const exe = "C:\\Users\\Yes\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe";
const browser = await chromium.launch({ executablePath: exe, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const results = [];
const check = (name, ok, detail = "") => {
  results.push(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};

await page.goto(BASE, { waitUntil: "networkidle" });

// 1. Главная загрузилась, есть каталог-сетка с фото
const cards = await page.locator(".catalog-card").count();
check("каталог-сетка рендерится", cards === 36, `карточек: ${cards}`);
const cardImgs = await page.locator(".catalog-card img").count();
check("фото в карточках", cardImgs >= 24, `фото: ${cardImgs}`);

await page.screenshot({ path: `${OUT}/01-hero.png` });
await page.locator("#catalog").scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/02-catalog.png` });

// 2. Фильтр по серии
await page.getByRole("button", { name: "S-образная", exact: true }).click();
await page.waitForTimeout(200);
const filtered = await page.locator(".catalog-card").count();
check("фильтр серии S", filtered === 6, `после фильтра: ${filtered}`);
await page.getByRole("button", { name: "Все", exact: true }).click();

// 3. Модалка с галереей
await page.locator(".catalog-card").first().locator(".catalog-card-media").click();
await page.waitForSelector("dialog[open].product-modal");
const modalImg = await page.locator(".product-modal-gallery img").getAttribute("src");
check("модалка открылась с фото", Boolean(modalImg), modalImg || "");
const counter = await page.locator(".gallery-counter").textContent().catch(() => null);
check("счётчик галереи", Boolean(counter && counter.includes("/ 4")), counter || "нет");
await page.screenshot({ path: `${OUT}/03-modal.png` });

// 4. Стрелка галереи
await page.locator(".gallery-arrow").nth(1).click();
const counter2 = await page.locator(".gallery-counter").textContent();
check("листание галереи", counter2?.trim().startsWith("2"), counter2?.trim() || "");
// Esc закрывает
await page.keyboard.press("Escape");
await page.waitForTimeout(200);
const modalOpen = await page.locator("dialog[open].product-modal").count();
check("Esc закрывает модалку", modalOpen === 0);

// 5. Добавление в КП из карточки
await page.locator(".catalog-card").nth(0).getByRole("button", { name: "В КП" }).click();
await page.locator(".catalog-card").nth(1).getByRole("button", { name: "В КП" }).click();
await page.waitForTimeout(300);
const added = await page.locator(".catalog-kp-added").count();
check("кнопки сменились на «В КП ✓»", added === 2, `зелёных: ${added}`);
const badge = await page.locator(".kp-badge").textContent().catch(() => "");
check("бейдж в шапке показывает 2", badge?.trim() === "2", `бейдж: ${badge?.trim()}`);

// 6. localStorage persist + перезагрузка
const stored = await page.evaluate(() => localStorage.getItem("bend_kp_articles"));
check("localStorage записан", Boolean(stored && stored.includes("ЭПС")), stored || "пусто");
await page.reload({ waitUntil: "networkidle" });
const addedAfterReload = await page.locator(".catalog-kp-added").count();
const badgeAfterReload = await page.locator(".kp-badge").textContent().catch(() => "");
check("после перезагрузки КП сохранился", addedAfterReload === 2 && badgeAfterReload?.trim() === "2", `зелёных: ${addedAfterReload}, бейдж: ${badgeAfterReload?.trim()}`);

// 7. Форма показывает состав КП
await page.locator("#request").scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const kpItems = await page.locator(".kp-item").count();
check("форма показывает 2 позиции", kpItems === 2, `позиций: ${kpItems}`);
await page.screenshot({ path: `${OUT}/04-request.png` });

// 8. Удаление позиции из формы
await page.locator(".kp-item").first().getByRole("button").click();
await page.waitForTimeout(200);
const kpItemsAfterRemove = await page.locator(".kp-item").count();
check("удаление из формы работает", kpItemsAfterRemove === 1, `осталось: ${kpItemsAfterRemove}`);

// 9. Сабмит формы (валидация: без полей должна показать ошибки)
await page.getByRole("button", { name: "Отправить заявку на КП" }).click();
await page.waitForTimeout(600);
const errCount = await page.locator(".field-errors p").count();
check("валидация ругается на пустую форму", errCount >= 2, `ошибок: ${errCount}`);

// 10. Заполняем и отправляем реально
await page.fill("#inquiry-company", "Тестовая компания ООО");
await page.fill("#inquiry-contact", "+7 900 000-00-00");
await page.fill("#inquiry-objectName", "ЖК Тестовый");
await page.fill("#inquiry-quantity", "10");
await page.getByRole("button", { name: "Отправить заявку на КП" }).click();
await page.waitForTimeout(1500);
const status = await page.locator(".form-status").textContent();
check("заявка отправилась", Boolean(status && status.includes("отправлена")), status?.trim() || "нет статуса");
const storedAfter = await page.evaluate(() => localStorage.getItem("bend_kp_articles"));
check("корзина очищена после отправки", storedAfter === "[]", storedAfter || "null");

// 11. SEO-проверки
const html = await page.content();
check("title", (await page.title()).includes("BEND"));
check("og:image есть", html.includes("og-bend59.png"));
check("JSON-LD Product", html.includes('"@type":"Product"'));
check("JSON-LD Organization", html.includes('"@type":"Organization"'));

// 12. Мобилка
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(BASE, { waitUntil: "networkidle" });
const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
check("мобилка без горизонтального скролла", !hasHScroll);
await page.screenshot({ path: `${OUT}/05-mobile.png` });
await page.getByRole("button", { name: "Меню" }).click();
await page.waitForTimeout(300);
const mobileKp = await page.locator(".mobile-menu-panel").getByText("Мой КП").count();
check("мобильное меню с кнопкой КП", mobileKp === 1);
await page.screenshot({ path: `${OUT}/06-mobile-menu.png` });

// 13. Админка
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await page.screenshot({ path: `${OUT}/07-admin-login.png` });

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
if (adminEmail && adminPassword) {
  await page.fill("#email", adminEmail);
  await page.fill("#password", adminPassword);
  await page.getByRole("button", { name: /войти/i }).click();
  await page.waitForURL("**/admin", { timeout: 10000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/08-admin-dashboard.png` });
  check("админка: дашборд открылся", page.url().includes("/admin"));

  await page.goto(`${BASE}/admin/products`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${OUT}/09-admin-products.png` });
  const activeLink = await page.locator(".admin-nav-link.is-active").textContent().catch(() => "");
  check("админка: активный раздел подсвечен", Boolean(activeLink && activeLink.includes("Каталог")), activeLink?.trim() || "");
  const hints = await page.locator(".admin-nav-text small").count();
  check("админка: подсказки у разделов", hints >= 9, `подсказок: ${hints}`);
}

await browser.close();
console.log(results.join("\n"));
const failed = results.filter((r) => r.startsWith("FAIL"));
process.exit(failed.length > 0 ? 1 : 0);
