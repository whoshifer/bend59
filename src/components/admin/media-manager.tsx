"use client";

import { useState, useTransition } from "react";
import { Copy, FileText, LoaderCircle, Trash2, Upload } from "lucide-react";

type MediaItem = {
  id: number;
  fileName: string;
  filePath: string;
  mimeType: string;
  altText: string;
};

export function MediaManager({ initialItems }: { initialItems: MediaItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [status, setStatus] = useState("");
  const [isPending, startTransition] = useTransition();

  async function upload(formData: FormData) {
    setStatus("Загружаем файл…");
    const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.message || "Не удалось загрузить файл.");
      return;
    }
    setItems((current) => [payload.media, ...current]);
    setStatus("Файл загружен. Скопируйте его ссылку и вставьте в нужную карточку.");
  }

  function handleUpload(formData: FormData) {
    startTransition(() => void upload(formData));
  }

  async function copyLink(value: string) {
    await navigator.clipboard.writeText(value);
    setStatus("Ссылка скопирована.");
  }

  async function removeItem(item: MediaItem) {
    if (!window.confirm(`Удалить файл «${item.fileName}»?`)) return;
    setStatus("Удаляем файл…");
    const response = await fetch(`/api/admin/media/${item.id}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.message || "Не удалось удалить файл.");
      return;
    }
    setItems((current) => current.filter((candidate) => candidate.id !== item.id));
    setStatus("Файл удалён. Если он был подключён к карточке, сначала замените ссылку в этой карточке.");
  }

  return (
    <div className="media-manager">
      <form action={handleUpload} className="media-upload-form">
        <label htmlFor="upload-file">Файл</label>
        <input id="upload-file" name="file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required />
        <label htmlFor="upload-alt">Описание изображения</label>
        <input id="upload-alt" name="altText" placeholder="Например: S-образная серия, вид спереди" />
        <button type="submit" className="button button-primary" disabled={isPending}>
          {isPending ? <LoaderCircle className="spin" size={18} aria-hidden="true" /> : <Upload size={18} aria-hidden="true" />}
          {isPending ? "Загрузка…" : "Загрузить файл"}
        </button>
        <p className="field-help">JPEG, PNG, WebP или PDF; до 10 МБ.</p>
      </form>
      <p className="admin-success" role="status" aria-live="polite">{status}</p>
      <div className="media-grid">
        {items.length ? items.map((item) => (
          <article className="media-card" key={item.id}>
            {item.mimeType.startsWith("image/") ? <img src={item.filePath} alt={item.altText || ""} /> : <span className="media-file-icon"><FileText aria-hidden="true" size={32} />PDF</span>}
            <strong title={item.fileName}>{item.fileName}</strong>
            <code>{item.filePath}</code>
            <div className="media-actions">
              <button type="button" onClick={() => void copyLink(item.filePath)}><Copy aria-hidden="true" size={16} />Скопировать ссылку</button>
              <button type="button" className="danger-button" onClick={() => void removeItem(item)}><Trash2 aria-hidden="true" size={16} />Удалить</button>
            </div>
          </article>
        )) : <div className="admin-empty"><strong>Медиафайлов пока нет</strong><p>Загрузите первое фото или PDF выше. Файл появится здесь с готовой ссылкой.</p></div>}
      </div>
    </div>
  );
}
