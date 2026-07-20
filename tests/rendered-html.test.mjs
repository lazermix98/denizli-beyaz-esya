import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    }
  );
}

test("server-renders the protected production entry", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="tr">/i);
  assert.match(html, /Denizli Beyaz Eşya Servisi/);
  assert.match(html, /paneli hazırlanıyor/);
  assert.doesNotMatch(html, /Günlük servis|Aylık ciro|Bekleyen servis/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps source aligned with real Supabase CRUD", async () => {
  const [page, layout, packageJson, supabase, readme] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/supabase.ts", import.meta.url), "utf8"),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
  ]);

  assert.match(page, /const businessName = "Denizli Beyaz Eşya Servisi"/);
  assert.match(page, /const phoneDisplay = "0532 639 78 98"/);
  assert.match(page, /const phoneTel = "905326397898"/);
  assert.match(page, /Instagram gönderisi/);
  assert.match(page, /Google yorum cevabı/);
  assert.match(page, /Müşteri kartları/);
  assert.match(page, /Cihaz geçmişi/);
  assert.match(page, /Kullanılan parçalar/);
  assert.match(page, /Teknisyen notları/);
  assert.match(page, /Profesyonel PDF indir/);
  assert.match(page, /\/api\/service-reports\/pdf/);
  assert.match(page, /\/api\/admin\/records/);
  assert.match(page, /\/api\/admin\/data/);
  assert.match(page, /QRCode/);
  assert.match(page, /draggable/);
  assert.match(page, /Karanlık tema/);
  assert.match(page, /Yönetici paneli güvenli oturum olmadan açılamaz/);
  assert.match(page, /Talebi Supabase&apos;e kaydet/);
  assert.match(supabase, /NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(supabase, /NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  assert.match(readme, /Supabase Bağlantısı/);
  assert.match(layout, /Denizli Beyaz Eşya Servisi/);
  assert.doesNotMatch(page, /localStorage|const customers = \[|initialAppointments|SkeletonPreview|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
  await assert.rejects(access(new URL("public/_sites-preview", templateRoot)));
});
