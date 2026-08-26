import { BarChart3, CheckCircle2, Eye, MessageSquare, ShieldCheck } from "lucide-react";

import { saveCookieSettingsAction } from "@/app/admin/actions";
import { getAnalyticsSummary, getCookieSettings } from "@/lib/site-data";

function formatDay(day: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short" }).format(new Date(`${day}T00:00:00Z`));
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [summary, settings] = await Promise.all([getAnalyticsSummary(30), getCookieSettings()]);
  const { saved } = await searchParams;
  const maximum = Math.max(...summary.daily.map((item) => item.visits), 1);

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Контрольный центр</p>
          <h1>Статистика и cookie</h1>
          <p>Показатели за последние 30 дней. Статистика агрегирована по дате и странице: без IP-адресов, User-Agent и сторонних трекеров.</p>
        </div>
      </div>

      {saved ? <p className="admin-success" role="status">Настройки cookie сохранены.</p> : null}

      <div className="admin-stats admin-stats-four">
        <article className="admin-stat-card"><Eye aria-hidden="true" size={24} /><span>Посещений с согласием</span><strong>{summary.visits}</strong><small>За 30 дней</small></article>
        <article className="admin-stat-card"><ShieldCheck aria-hidden="true" size={24} /><span>Согласий на статистику</span><strong>{summary.analyticsConsents}</strong><small>Решения посетителей</small></article>
        <article className="admin-stat-card"><CheckCircle2 aria-hidden="true" size={24} /><span>Только необходимые</span><strong>{summary.necessaryOnly}</strong><small>Без учёта посещений</small></article>
        <article className="admin-stat-card"><MessageSquare aria-hidden="true" size={24} /><span>Заявок за период</span><strong>{summary.inquiries}</strong><small>Новые обращения</small></article>
      </div>

      <div className="analytics-layout">
        <article className="analytics-card">
          <div className="analytics-card-heading"><div><h2>Динамика посещений</h2><p>Учитываются только просмотры после добровольного согласия.</p></div><BarChart3 aria-hidden="true" size={22} /></div>
          {summary.daily.length ? (
            <div className="analytics-bars" aria-label="График посещений за последние 30 дней">
              {summary.daily.map((item) => (
                <div className="analytics-bar-item" key={`${item.day}-${item.path}`}>
                  <span className="analytics-bar-value">{item.visits}</span>
                  <span className="analytics-bar" style={{ height: `${Math.max((item.visits / maximum) * 100, 8)}%` }} title={`${formatDay(item.day)}: ${item.visits}`} />
                  <span className="analytics-bar-label">{formatDay(item.day)}</span>
                </div>
              ))}
            </div>
          ) : <div className="admin-empty"><strong>Данных пока нет</strong><p>После согласия первого посетителя здесь появятся обезличенные счётчики страниц.</p></div>}
        </article>

        <article className="analytics-card">
          <div className="analytics-card-heading"><div><h2>Популярные страницы</h2><p>Суммарно за выбранный период.</p></div></div>
          {summary.topPaths.length ? (
            <ol className="analytics-path-list">
              {summary.topPaths.map((item) => <li key={item.path}><code>{item.path}</code><strong>{item.visits}</strong></li>)}
            </ol>
          ) : <div className="admin-empty"><strong>Нет согласованных просмотров</strong><p>Выберите «Разрешить статистику» на публичной странице для тестирования.</p></div>}
        </article>
      </div>

      <form action={saveCookieSettingsAction} className="admin-form analytics-settings-form">
        <fieldset>
          <legend>Уведомление о cookie</legend>
          <p className="field-help">Этот текст видит посетитель до выбора. Изменения публикуются сразу после сохранения.</p>
          <label>Заголовок уведомления<input name="bannerTitle" maxLength={160} defaultValue={settings.bannerTitle} required /></label>
          <label>Текст уведомления<textarea name="bannerText" rows={4} defaultValue={settings.bannerText} required /></label>
          <div className="form-grid">
            <label>Кнопка согласия<input name="acceptLabel" maxLength={80} defaultValue={settings.acceptLabel} required /></label>
            <label>Кнопка отказа<input name="rejectLabel" maxLength={80} defaultValue={settings.rejectLabel} required /></label>
          </div>
          <label>Ссылка на информацию о cookie<input name="policyHref" defaultValue={settings.policyHref} placeholder="/privacy" /></label>
          <div className="form-grid form-grid-bottom">
            <label>Срок хранения агрегированных данных, дней<input name="retentionDays" type="number" min="30" max="730" defaultValue={settings.retentionDays} required /></label>
            <label className="check-label"><input name="analyticsEnabled" type="checkbox" defaultChecked={settings.analyticsEnabled} />Вести статистику после согласия</label>
          </div>
        </fieldset>
        <button type="submit" className="button button-primary">Сохранить настройки cookie</button>
      </form>
    </section>
  );
}
