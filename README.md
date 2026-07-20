# İşletme AI Otomasyon

Her sektöre uyarlanabilen production-ready dijital işletme yönetim ve yapay zekâ otomasyon sistemi.

İlk demo firma: Denizli Beyaz Eşya Servisi  
Telefon: 0532 639 78 98  
WhatsApp: 905326397898

## Teknoloji

- Next.js
- TypeScript
- Tailwind CSS
- Supabase/PostgreSQL
- OpenAI API
- Vercel

Bu proje standart Next.js kullanır. Vinext, Vite veya Cloudflare uyumluluk katmanı yoktur. Vercel varsayılan `.next` çıktısını kullanır.

## Environment Değişkenleri

Local geliştirme için `.env.local`, production için Vercel Environment Variables kullanılmalıdır.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=
AUTH_SECRET=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
DEFAULT_COMPANY_SLUG=denizli-beyaz-esya-servisi
ADMIN_EMAIL=admin@denizlibeyazesya.com
ADMIN_PASSWORD=
```

`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `AUTH_SECRET`, `ADMIN_PASSWORD` ve `OPENAI_API_KEY` kaynak koda veya GitHub'a yazılmamalıdır.

## Tek Komut Kurulum

Migration, RLS, ilk firma kaydı ve admin hesabı tek komutla oluşturulur:

```bash
npm run setup
```

`ADMIN_PASSWORD` boş bırakılırsa komut güvenli geçici bir şifre üretir ve ekranda bir kez gösterir.

## Vercel Ayarları

- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: boş
- Install Command: varsayılan
- Production branch: `main`

## Test ve Build

```bash
npm run lint
npm run test
npm run build
```

## Sağlık Kontrolü

```text
GET /api/health
```

Beklenen production sonucu:

- `databaseConfigured: true`
- `publicSupabaseConfigured: true`
- `openAiConfigured: true`
