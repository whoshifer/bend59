import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

import { getProducts } from "@/lib/site-data";

export default async function ProductListPage() {
  const productRows = await getProducts(true);

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Каталог</p>
          <h1>Позиции изделий</h1>
          <p>Артикулы, размеры, цвет, отображение и внутреннюю цену можно менять отдельно для каждой позиции.</p>
        </div>
        <Link href="/admin/products/new" className="button button-primary"><Plus size={18} aria-hidden="true" />Добавить позицию</Link>
      </div>
      <div className="admin-table-wrap" tabIndex={0} aria-label="Список позиций каталога">
        <table className="admin-table">
          <thead><tr><th>Артикул</th><th>Серия</th><th>Размер</th><th>Цвет</th><th>Статус</th><th><span className="sr-only">Открыть</span></th></tr></thead>
          <tbody>
            {productRows.map((product) => (
              <tr key={product.id}>
                <td><strong>{product.article}</strong></td>
                <td>{product.seriesTitle || "Не назначена"}</td>
                <td>{product.size}</td>
                <td>{product.color}</td>
                <td><span className={product.isVisible ? "status status-live" : "status"}>{product.isVisible ? "На сайте" : "Скрыта"}</span></td>
                <td><Link href={`/admin/products/${product.id}`} aria-label={`Открыть ${product.article}`}><ArrowRight size={18} aria-hidden="true" /></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
