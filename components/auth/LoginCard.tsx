"use client";

import type { AdminController } from "../../features/admin/hooks/useAdminController";

export function LoginCard({ controller }: { controller: AdminController }) {
  const { login, setLogin, submitLogin, loading } = controller;

  return (
    <main className="app">
      <section className="admin-shell">
        <form className="login-card" onSubmit={submitLogin}>
          <h2>Güvenli admin girişi</h2>
          <p>Admin paneli oturum olmadan açılmaz. Supabase yoksa uygulama çökmek yerine anlaşılır hata verir.</p>
          <label>E-posta<input type="email" required value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} /></label>
          <label>Şifre<input type="password" required value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} /></label>
          <button disabled={loading} type="submit">Giriş yap</button>
        </form>
      </section>
    </main>
  );
}
