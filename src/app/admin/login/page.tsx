import Link from "next/link";

import { loginAction } from "@/app/admin/actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <Link href="/" className="login-brand" aria-label="Открыть сайт BEND">
          <span aria-hidden="true">B</span>
          <strong>BEND</strong>
        </Link>
        <p className="eyebrow">Закрытый раздел</p>
        <h1 id="login-title">Управление сайтом</h1>
        <p className="login-intro">Войдите, чтобы обновить тексты, изображения, каталог, документы и заявки.</p>
        {error ? <p className="form-alert" role="alert">{error}</p> : null}
        <form action={loginAction} className="stack-form">
          <label htmlFor="email">E-mail администратора</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
          <label htmlFor="password">Пароль</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
          <button type="submit" className="button button-primary">Войти в админку</button>
        </form>
      </section>
    </main>
  );
}
