import { saveSettingsAction } from "@/app/admin/actions";
import { getSettings } from "@/lib/site-data";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const settings = await getSettings();
  const { saved } = await searchParams;

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Контакты и поисковая выдача</p>
          <h1>Настройки сайта</h1>
          <p>Эти данные отображаются в шапке, подвале, форме заявки и поисковых системах.</p>
        </div>
      </div>
      {saved ? <p className="admin-success" role="status">Настройки сохранены.</p> : null}
      <form action={saveSettingsAction} className="admin-form">
        <fieldset>
          <legend>Контакты</legend>
          <div className="form-grid">
            <label>Название компании<input name="companyName" defaultValue={settings.companyName} required /></label>
            <label>Телефон<input name="phone" defaultValue={settings.phone} required /></label>
            <label>Публичный e-mail<input name="email" type="email" defaultValue={settings.email} required /></label>
            <label>E-mail для заявок<input name="formRecipient" type="email" defaultValue={settings.formRecipient} placeholder="Настройте SMTP перед запуском" /></label>
          </div>
          <label>Адрес<textarea name="address" rows={2} defaultValue={settings.address} required /></label>
          <label>Реквизиты в подвале<textarea name="legalDetails" rows={4} defaultValue={settings.legalDetails} /></label>
        </fieldset>
        <fieldset>
          <legend>Бренд и интерфейс</legend>
          <div className="form-grid">
            <label>Вид логотипа<select name="logoMode" defaultValue={settings.logoMode}><option value="mark">Марка + название</option><option value="image">Изображение логотипа</option><option value="text">Только текст</option></select><span className="field-help">Для изображения сначала загрузите файл в «Медиа» и вставьте его ссылку.</span></label>
            <label>Текст бренда<input name="brandText" maxLength={160} defaultValue={settings.brandText} required /></label>
          </div>
          <label>URL логотипа<input name="logoUrl" type="text" inputMode="url" defaultValue={settings.logoUrl} placeholder="/uploads/..." /><span className="field-help">Используется только при выборе режима «Изображение логотипа».</span></label>
          <label>Описание логотипа<input name="logoAlt" maxLength={255} defaultValue={settings.logoAlt} placeholder="Например: логотип BEND" /></label>
          <div className="form-grid">
            <label>Заголовок карточки на первом экране<input name="heroNoteTitle" maxLength={160} defaultValue={settings.heroNoteTitle} /></label>
            <label>Текст подвала<textarea name="footerDescription" rows={3} defaultValue={settings.footerDescription} /></label>
          </div>
          <label>Текст карточки на первом экране<textarea name="heroNoteText" rows={3} defaultValue={settings.heroNoteText} /></label>
        </fieldset>
        <fieldset>
          <legend>SEO главной страницы</legend>
          <label>Title<input name="seoTitle" maxLength={255} defaultValue={settings.seoTitle} required /></label>
          <label>Description<textarea name="seoDescription" rows={4} defaultValue={settings.seoDescription} required /></label>
        </fieldset>
        <button type="submit" className="button button-primary">Сохранить настройки</button>
      </form>
    </section>
  );
}
