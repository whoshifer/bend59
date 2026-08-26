"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  addToKp,
  clearKp,
  removeFromKp,
  useKpArticles,
} from "@/lib/kp-cart";

type ProductOption = { article: string; label: string; size?: string; color?: string };

type FormValues = {
  company: string;
  contactPerson: string;
  contact: string;
  objectName: string;
  quantity: string;
  deadline: string;
  comment: string;
  website: string;
};

const initialValues: FormValues = {
  company: "",
  contactPerson: "",
  contact: "",
  objectName: "",
  quantity: "",
  deadline: "",
  comment: "",
  website: "",
};

export function InquiryForm({ products }: { products: ProductOption[] }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const kpArticles = useKpArticles();

  const productMap = useMemo(() => new Map(products.map((item) => [item.article, item])), [products]);

  function update(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("Отправляем заявку…");
    setErrors({});

    const body = {
      ...values,
      productArticle: kpArticles.length > 0 ? kpArticles.join(", ") : "Нужен подбор",
      quantity: Number(values.quantity),
    };

    let response: Response;
    try {
      response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      setIsSubmitting(false);
      setStatus("Не удалось отправить заявку. Проверьте соединение.");
      return;
    }

    let payload: { message?: string; errors?: Record<string, string> };
    try {
      payload = await response.json();
    } catch {
      setIsSubmitting(false);
      setStatus("Заявка сохранена, но ответ сервера некорректен.");
      return;
    }

    setIsSubmitting(false);

    if (!response.ok) {
      const nextErrors = payload.errors ?? {};
      setErrors(nextErrors);
      setStatus(payload.message || "Не удалось отправить заявку. Проверьте заполнение.");
      const firstField = Object.keys(nextErrors)[0];
      if (firstField) document.getElementById(`inquiry-${firstField}`)?.focus();
      return;
    }

    clearKp();
    setValues(initialValues);
    setStatus(payload.message || "Заявка отправлена.");
  }

  const fieldError = (field: string) => errors[field] || undefined;

  return (
    <form className="inquiry-form" onSubmit={onSubmit} noValidate>
      <div className="honeypot" aria-hidden="true"><label htmlFor="inquiry-website">Website</label><input id="inquiry-website" value={values.website} onChange={(event) => update("website", event.target.value)} tabIndex={-1} autoComplete="off" /></div>
      <div className="form-grid">
        <label htmlFor="inquiry-company">Компания<input id="inquiry-company" value={values.company} onChange={(event) => update("company", event.target.value)} aria-invalid={Boolean(fieldError("company"))} aria-describedby={fieldError("company") ? "error-company" : undefined} required /></label>
        <label htmlFor="inquiry-contact-person">Контактное лицо<input id="inquiry-contact-person" value={values.contactPerson} onChange={(event) => update("contactPerson", event.target.value)} /></label>
        <label htmlFor="inquiry-contact">Телефон или e-mail<input id="inquiry-contact" value={values.contact} onChange={(event) => update("contact", event.target.value)} aria-invalid={Boolean(fieldError("contact"))} aria-describedby={fieldError("contact") ? "error-contact" : undefined} required /></label>
        <label htmlFor="inquiry-objectName">Объект / проект<input id="inquiry-objectName" value={values.objectName} onChange={(event) => update("objectName", event.target.value)} aria-invalid={Boolean(fieldError("objectName"))} aria-describedby={fieldError("objectName") ? "error-objectName" : undefined} required /></label>
        <label htmlFor="inquiry-quantity">Общее количество, шт.<input id="inquiry-quantity" value={values.quantity} onChange={(event) => update("quantity", event.target.value)} type="number" min="1" inputMode="numeric" placeholder="1" aria-invalid={Boolean(fieldError("quantity"))} aria-describedby={fieldError("quantity") ? "error-quantity" : undefined} required /></label>
        <label htmlFor="inquiry-deadline">Требуемый срок<input id="inquiry-deadline" value={values.deadline} onChange={(event) => update("deadline", event.target.value)} placeholder="Например: до 15 сентября" /></label>
      </div>

      <fieldset className="inquiry-products-fieldset">
        <legend>Состав КП{kpArticles.length > 0 ? ` · ${kpArticles.length}` : ""}</legend>
        {kpArticles.length > 0 ? (
          <ul className="kp-items">
            {kpArticles.map((article) => {
              const option = productMap.get(article);
              return (
                <li key={article} className="kp-item" role="listitem">
                  <span className="kp-item-main">
                    <strong>{article}</strong>
                    {option?.size || option?.color ? <small>{[option?.size, option?.color].filter(Boolean).join(" · ")}</small> : null}
                  </span>
                  <button type="button" aria-label={`Убрать ${article} из КП`} onClick={() => removeFromKp(article)}>×</button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="field-help kp-empty-help">Позиции не выбраны — подберём состав по вашему описанию объекта.</p>
        )}
        <button type="button" className="button button-small" onClick={() => setShowPicker((v) => !v)} aria-expanded={showPicker}>
          {showPicker ? "Скрыть каталог" : "Добавить позиции из каталога"}
        </button>
        {showPicker ? (
          <div className="inquiry-product-picker" role="group" aria-label="Каталог позиций">
            {products.map((product) => {
              const checked = kpArticles.includes(product.article);
              return (
                <label key={product.article} className={`inquiry-product-option ${checked ? "is-selected" : ""}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => (checked ? removeFromKp(product.article) : addToKp(product.article))}
                  />
                  <span>{product.label}</span>
                </label>
              );
            })}
          </div>
        ) : null}
        <p className="field-help">Выбранные позиции сохраняются в браузере и остаются после перезагрузки страницы.</p>
      </fieldset>

      <label htmlFor="inquiry-comment">Комментарий<textarea id="inquiry-comment" value={values.comment} onChange={(event) => update("comment", event.target.value)} rows={4} placeholder="Укажите детали комплектации, объект или дополнительные требования" /></label>
      <div className="field-errors" aria-live="polite">
        {Object.entries(errors).map(([field, message]) => <p id={`error-${field}`} key={field}>{message}</p>)}
      </div>
      <button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Отправляем…" : "Отправить заявку на КП"}</button>
      <p className="form-status" role="status" aria-live="polite">{status}</p>
    </form>
  );
}
