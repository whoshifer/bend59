import { desc } from "drizzle-orm";

import { MediaManager } from "@/components/admin/media-manager";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";

export default async function MediaPage() {
  const items = await db.select().from(media).orderBy(desc(media.createdAt));

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Фотографии и PDF</p>
          <h1>Медиафайлы</h1>
          <p>Загрузите изображение или PDF, скопируйте готовую ссылку и вставьте её в карточку серии или документа.</p>
        </div>
      </div>
      <MediaManager initialItems={items} />
    </section>
  );
}
