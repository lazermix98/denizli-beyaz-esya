# Denizli Beyaz Eşya Servisi SaaS

Next.js, TypeScript, Tailwind CSS, Supabase/PostgreSQL ve OpenAI API ile hazırlanmış servis yönetim uygulaması.

## Supabase Bağlantısı

1. Supabase projesinde SQL Editor açın.
2. Production için sadece `db/supabase-schema.sql` dosyasını çalıştırın.
3. `db/seed.sql` dosyasını production ortamında çalıştırmayın.
4. Hosting veya lokal `.env` alanına gerçek Supabase değerlerini girin.

Gerekli Supabase environment değişkenleri:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=gercek-anon-key
SUPABASE_SERVICE_ROLE_KEY=gercek-service-role-key
```

`NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` public client yapılandırması içindir. Admin CRUD, admin login ve güvenli server işlemleri için ayrıca `SUPABASE_SERVICE_ROLE_KEY` gerekir. Service role key asla tarayıcıya gönderilmemeli ve kaynak koda yazılmamalıdır.

## Kalıcı Veri Tabloları

Uygulama şu tabloları gerçek Supabase/PostgreSQL üzerinde kullanır:

- `admins`
- `customers`
- `devices`
- `service_records`
- `appointments`
- `used_parts`
- `payments`
- `ai_content_items`
- `service_report_files`

Servis talep formu `customers`, `devices` ve `service_records` tablolarına yazar. Yönetici paneli müşteri, cihaz, servis kaydı ve randevu oluşturma işlemlerini `/api/admin/records` üzerinden Supabase'e kaydeder. AI içerikleri `/api/ai/content` üzerinden üretildikten sonra `ai_content_items` tablosuna yazılır.

## Production Environment Değişkenleri

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AUTH_SECRET=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
ALLOW_DEMO_MODE=false
```

`.env.example` içindeki `PROJECT_ID`, boş key alanları ve `change-this...` değerleri örnektir. Gerçek değerler Git deposuna, README içine veya client-side olmayan gizli alanlara yazılmamalıdır.

## Production Admin Oluşturma

Şifre düz metin saklanmaz. PBKDF2-SHA256 hash üreten script:

```bash
node scripts/create-admin.mjs admin@denizlibeyazesya.com "CokGuclu-Sifre-123"
```

Komutun ürettiği SQL çıktısını Supabase SQL Editor içinde çalıştırın. Production admin kaydında `is_demo=false` kalmalıdır.

## Güvenlik Kontrolleri

- Admin API endpointleri httpOnly imzalı session cookie ister.
- `/api/admin/data`, `/api/admin/records`, `/api/ai/content` ve `/api/service-reports/pdf` yetkisiz kullanıcıya `401` döner.
- OpenAI API anahtarı sadece server endpointinde okunur.
- Servis talep formu doğrulama ve 30 saniye spam sınırı uygular.
- Demo/localStorage veri kaynağı kullanılmaz.

## Hosting ve Yayın

Önerilen hosting: Vercel.

Vercel ayarları:

- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: boş bırakılmalı
- Install Command: varsayılan `npm install` veya `npm ci`

`package.json` içindeki production build komutu `next build` çalıştırır ve Vercel'in beklediği `.next` klasörünü üretir.

Beklenen URL'ler:

- Ana sayfa: `https://denizlibeyazesya.com/`
- Servis talep formu: `https://denizlibeyazesya.com/`
- Yönetici giriş sayfası: `https://denizlibeyazesya.com/`
- Yönetici paneli: `https://denizlibeyazesya.com/` giriş sonrası
- AI içerik ekranı: `https://denizlibeyazesya.com/` giriş sonrası AI Modülü
- Sağlık kontrolü: `https://denizlibeyazesya.com/api/health`

## Domain ve HTTPS

Alan adı: `denizlibeyazesya.com`

Hosting platformunun verdiği hedefe göre:

- Apex domain: `denizlibeyazesya.com` için platformun verdiği `A/AAAA`, `ALIAS` veya `CNAME`.
- WWW: `www.denizlibeyazesya.com` için platformun verdiği canonical host'a `CNAME`.
- `www.denizlibeyazesya.com` ana domaine 301 yönlendirilmelidir.
- HTTPS zorunlu olmalı; HTTP istekleri HTTPS'e yönlendirilmelidir.

## Test Komutları

```bash
npm run lint
npm test
npm run build
npm audit --audit-level=high
```

## Sağlık Kontrolü

```text
GET /api/health
```

Production yayından önce `databaseConfigured:true`, `publicSupabaseConfigured:true` ve `openAiConfigured:true` olmalıdır.
