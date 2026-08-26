import "server-only";

// Уведомления о заявках: Telegram и/или e-mail (SMTP).
// Всё опционально: заявка всегда сохраняется в БД, уведомление — бонус.
// Переменные окружения:
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID  — уведомления в Telegram
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
//   NOTIFY_EMAIL_FROM, NOTIFY_EMAIL_TO    — уведомления на e-mail

type InquiryNotification = {
  id: number;
  company: string;
  contactPerson: string;
  contact: string;
  objectName: string;
  productArticle: string;
  quantity: number;
  deadline: string;
  comment: string;
};

export function buildInquiryMessage(inquiry: InquiryNotification): string {
  const lines = [
    `Заявка №${inquiry.id} с сайта BEND`,
    "",
    `Компания: ${inquiry.company}`,
    inquiry.contactPerson ? `Контактное лицо: ${inquiry.contactPerson}` : null,
    `Связь: ${inquiry.contact}`,
    `Объект / проект: ${inquiry.objectName}`,
    "",
    `Состав КП: ${inquiry.productArticle}`,
    `Количество: ${inquiry.quantity} шт.`,
    inquiry.deadline ? `Срок: ${inquiry.deadline}` : null,
    inquiry.comment ? `\nКомментарий: ${inquiry.comment}` : null,
    "",
    "Дальше — подготовить КП и связаться с клиентом.",
  ];
  return lines.filter((line): line is string => line !== null).join("\n");
}

async function sendTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      // HTML-режим не используем — plain text безопаснее и без экранирования.
      disable_web_page_preview: true,
    }),
  });
  if (!response.ok) {
    console.error("Telegram notify failed:", response.status, await response.text().catch(() => ""));
  }
}

async function sendEmail(subject: string, text: string): Promise<void> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.NOTIFY_EMAIL_TO || user;
  if (!host || !user || !pass || !to) return;

  const port = Number(process.env.SMTP_PORT || 465);
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: process.env.NOTIFY_EMAIL_FROM || user,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error("Email notify failed:", error);
  }
}

/** Шлёт уведомления во все настроенные каналы; никогда не бросает исключение. */
export async function notifyNewInquiry(inquiry: InquiryNotification) {
  const text = buildInquiryMessage(inquiry);
  const tasks: Promise<void>[] = [];
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    tasks.push(sendTelegram(text));
  }
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    tasks.push(sendEmail(`BEND: заявка №${inquiry.id} — ${inquiry.company}`, text));
  }
  await Promise.allSettled(tasks);
}
