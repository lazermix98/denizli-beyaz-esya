import Image from "next/image";
import Link from "next/link";
import { companySettings } from "../../features/settings/company";

const products = [
  {
    name: "Ateş Kehribar Tespih",
    material: "Sıkma kehribar görünüm, gümüş püskül",
    price: "₺2.850",
    note: "Koleksiyonluk parlak yüzey",
  },
  {
    name: "Kuka Ağacı Tespih",
    material: "Doğal kuka, elde torna işçilik",
    price: "₺1.650",
    note: "Günlük kullanım için hafif yapı",
  },
  {
    name: "Siyah Oniks Tespih",
    material: "Oniks taş, özel metal ayraç",
    price: "₺2.250",
    note: "Kurumsal hediye seçeneği",
  },
  {
    name: "Oltu Taşı Tespih",
    material: "Siyah parlak taş, klasik püskül",
    price: "₺3.400",
    note: "Usta işi koleksiyon ürünü",
  },
];

const categories = [
  ["Kehribar", "Sıcak renk geçişleri, hafif kullanım ve koleksiyon değeri."],
  ["Kuka", "Doğal ahşap dokusu, günlük kullanımda konforlu tutuş."],
  ["Oltu taşı", "Klasik siyah görünüm, parlak yüzey ve prestijli hediye."],
  ["Oniks", "Minimal, modern ve sade tasarım sevenlere uygun."],
];

const features = [
  "Ürün kataloğu",
  "WhatsApp sipariş akışı",
  "Müşteri talep takibi",
  "Stok ve varyant yönetimi",
  "Sipariş notları",
  "AI sosyal medya içeriği",
];

export function TespihSalesDemoPage() {
  const whatsappText = encodeURIComponent("Merhaba, tespih satış demo sayfasındaki ürünler hakkında bilgi almak istiyorum.");

  return (
    <main className="tespih-page">
      <nav className="tespih-nav">
        <Link href="/" className="tespih-brand">
          <span>TS</span>
          <strong>Tespih Studio</strong>
        </Link>
        <div>
          <a href="#urunler">Ürünler</a>
          <a href="#cesitler">Çeşitler</a>
          <a href="/demo-admin">Demo panel</a>
          <a className="tespih-nav-cta" href={`https://wa.me/${companySettings.phoneTel}?text=${whatsappText}`} target="_blank" rel="noreferrer">WhatsApp sipariş</a>
        </div>
      </nav>

      <section className="tespih-hero">
        <div className="tespih-hero-copy">
          <span className="tespih-kicker">Sektör demo sayfası</span>
          <h1>El işçiliği tespihler için premium satış ve sipariş deneyimi.</h1>
          <p>
            Bu sayfa, mevcut İşletme AI Otomasyon altyapısının tespih satışı yapan bir işletmeye nasıl uyarlanabileceğini gösterir.
            Ürün kataloğu, WhatsApp siparişi, müşteri talebi ve admin panel takibi aynı sistemle çalışır.
          </p>
          <div className="tespih-actions">
            <a href="#urunler">Koleksiyonu incele</a>
            <a href={`https://wa.me/${companySettings.phoneTel}?text=${whatsappText}`} target="_blank" rel="noreferrer">WhatsApp ile sor</a>
          </div>
          <div className="tespih-proof">
            <article><strong>4</strong><span>ana koleksiyon</span></article>
            <article><strong>24s</strong><span>hızlı dönüş</span></article>
            <article><strong>PDF</strong><span>sipariş formu</span></article>
          </div>
        </div>
        <figure className="tespih-hero-image">
          <Image src="/images/tespih-hero.png" alt="Kehribar, kuka ve oniks tespihlerin yer aldığı premium ürün görseli" width={1536} height={1024} priority />
        </figure>
      </section>

      <section className="tespih-system-strip" aria-label="Sistem entegrasyonu">
        {features.map((feature) => <span key={feature}>{feature}</span>)}
      </section>

      <section className="tespih-section" id="urunler">
        <div className="tespih-section-head">
          <span className="tespih-kicker">Satış koleksiyonu</span>
          <h2>Ürünler net, sade ve satın almaya hazır görünür.</h2>
          <p>Her ürün kartı malzeme, fiyat, stok/sipariş notu ve WhatsApp aksiyonuyla hazırlanır.</p>
        </div>
        <div className="tespih-product-showcase">
          <figure>
            <Image src="/images/tespih-products.png" alt="Kehribar, siyah oniks ve kuka tespih ürün fotoğrafları" width={1222} height={1222} />
          </figure>
          <div className="tespih-product-grid">
            {products.map((product) => (
              <article key={product.name}>
                <div>
                  <span>{product.material}</span>
                  <h3>{product.name}</h3>
                  <p>{product.note}</p>
                </div>
                <div className="tespih-card-bottom">
                  <strong>{product.price}</strong>
                  <a href={`https://wa.me/${companySettings.phoneTel}?text=${encodeURIComponent(`${product.name} hakkında bilgi almak istiyorum.`)}`} target="_blank" rel="noreferrer">Sor</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="tespih-section" id="cesitler">
        <div className="tespih-section-head">
          <span className="tespih-kicker">Tespih çeşitleri</span>
          <h2>Müşteri ne aldığını anlar; işletme de talepleri panelden takip eder.</h2>
        </div>
        <div className="tespih-category-grid">
          {categories.map(([title, text]) => (
            <article key={title}>
              <strong>{title}</strong>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tespih-admin-link">
        <div>
          <span className="tespih-kicker">Mevcut yazılımla entegre</span>
          <h2>Satış sayfasından gelen talepler admin panelde takip edilecek şekilde kurgulanır.</h2>
          <p>
            Tespih satıcısı için aynı altyapı ürün kataloğu, sipariş talebi, müşteri kartı, WhatsApp şablonu,
            içerik üretimi ve raporlama akışına uyarlanabilir.
          </p>
        </div>
        <Link href="/demo-admin">Demo admin panelini aç</Link>
      </section>
    </main>
  );
}
