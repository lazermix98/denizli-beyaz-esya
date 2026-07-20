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

## İlk Açılış Kurulumu

Production ortamında terminal veya SQL çalıştırmanız gerekmez.

1. GitHub `main` branch'e push edilir.
2. Vercel otomatik deploy alır.
3. Site ilk kez açıldığında `Kurulumu Başlat` ekranı görünür.
4. Firma adı, telefon, admin e-posta ve şifre girilir.
5. Migration, RLS, firma kaydı ve admin hesabı otomatik oluşturulur.
6. Kurulum bitince admin paneli hazır olur.

Yerel geliştirme veya acil bakım için aynı işlem tek komutla da çalışabilir:

```bash
npm run setup
```

Bu komut SQL çıktısı üretmez; migration ve admin oluşturma işlemini doğrudan Supabase/PostgreSQL üzerinde yapar.

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

- `database: ok`
- `publicSupabaseConfigured: true`
- `openAiConfigured: true`

## V1 Güvenlik Omurgası

- Roller: `owner`, `admin`, `staff`.
- Admin API endpointleri sunucu tarafında oturum kontrolü yapar.
- Güncelleme ve silme işlemleri `company_id` filtresiyle tenant-safe yapılır.
- İstemciden gelen `company_id` değerine güvenilmez.
- Login denemeleri rate limit ile sınırlandırılır.
- Public talep formunda server-side validation, rate limit, honeypot ve maksimum alan uzunluğu vardır.
- `/api/setup` yalnızca ilk kurulumda çalışır; transaction ve advisory lock ile eş zamanlı kurulum riski azaltılır.
- Kurulum tamamlandığı `setup_state` tablosunda tutulur.
- `SUPABASE_SERVICE_ROLE_KEY` yalnızca sunucu tarafında kullanılır.
- Sağlık endpointi secret veya bağlantı detayı döndürmez.

## Modüler Mimari

Yeni geliştirmeler `app/modules/<domain>` altında ilerlemelidir.

Alanlar:

- `auth`
- `companies`
- `staff`
- `customers`
- `service-requests`
- `appointments`
- `work-records`
- `devices`
- `ai-content`
- `whatsapp-templates`
- `pdf`
- `settings`
- `shared`

Her modülde `types`, `validation`, `repository/data-access`, `service/business-logic`, `UI components`, `API/server actions` ve `tests` ayrı tutulmalıdır.
