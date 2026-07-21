const customers = [
  ["Ayşe Yılmaz", "Buzdolabı", "Pamukkale", "Bekliyor"],
  ["Mehmet Kaya", "Çamaşır makinesi", "Merkezefendi", "Randevulu"],
  ["Elif Demir", "Klima bakımı", "Pamukkale", "Tamamlandı"],
  ["Hasan Çelik", "Bulaşık makinesi", "Sarayköy", "Parça bekliyor"],
  ["Zeynep Arslan", "Fırın", "Merkezefendi", "Bekliyor"],
  ["Murat Koç", "Kombi", "Pamukkale", "Randevulu"],
  ["Selin Aydın", "Güzellik merkezi", "Denizli", "Teklif"],
  ["Okan Şahin", "Oto servis", "Merkezefendi", "Tamamlandı"],
  ["Derya Kurt", "Diş kliniği", "Pamukkale", "Görüşme"],
  ["Emre Öz", "Restoran", "Denizli", "Kurulum"],
  ["Burcu Eren", "Emlak ofisi", "Merkezefendi", "Teklif"],
  ["Ali Aksoy", "Elektrik işi", "Pamukkale", "Randevulu"],
  ["Cemre Polat", "Kuaför", "Denizli", "Bekliyor"],
  ["Fatih Yıldız", "Klima montaj", "Merkezefendi", "Parça bekliyor"],
  ["Neslihan Uçar", "Ankastre", "Pamukkale", "Tamamlandı"],
  ["Serkan Bulut", "Kafe", "Denizli", "Görüşme"],
];

const appointments = [
  ["09:30", "Ayşe Yılmaz", "Buzdolabı arıza tespiti"],
  ["10:15", "Mehmet Kaya", "Çamaşır makinesi motor kontrolü"],
  ["11:00", "Ali Aksoy", "Elektrik bağlantı keşfi"],
  ["13:30", "Zeynep Arslan", "Fırın rezistans kontrolü"],
  ["15:00", "Selin Aydın", "Güzellik merkezi demo görüşmesi"],
  ["16:20", "Emre Öz", "Restoran kurulum planı"],
];

const requests = [
  "WhatsApp üzerinden klima bakım talebi",
  "Web formundan buzdolabı soğutmuyor kaydı",
  "Google İşletme yorumu için cevap bekliyor",
  "TikTok içerik takvimi isteği",
  "PDF servis fişi indirme kontrolü",
  "Yeni müşteri kartı oluşturuldu",
];

const contents = [
  "Instagram: Yaz gelmeden klima bakım kampanyası",
  "Google İşletme: Aynı gün servis duyurusu",
  "Blog: Buzdolabı neden soğutmaz?",
  "TikTok: 30 saniyelik servis öncesi kontrol videosu",
  "WhatsApp: Randevu hatırlatma mesajı",
];

export function DemoAdminPage() {
  return (
    <main className="demo-admin-page">
      <aside className="demo-sidebar">
        <div className="demo-brand">
          <span>IA</span>
          <div>
            <strong>İşletme AI Otomasyon</strong>
            <small>Demo operasyon paneli</small>
          </div>
        </div>
        {["Dashboard", "Müşteriler", "Talepler", "Randevular", "İş kayıtları", "AI içerik", "PDF rapor", "Ayarlar"].map((item, index) => (
          <a className={index === 0 ? "active" : ""} href="#demo-dashboard" key={item}>{item}</a>
        ))}
      </aside>

      <section className="demo-workspace" id="demo-dashboard">
        <nav className="demo-topbar">
          <div>
            <span>Canlı demo</span>
            <strong>Denizli Beyaz Eşya Servisi</strong>
          </div>
          <Link href="/">Ana sayfaya dön</Link>
        </nav>

        <header className="demo-hero-card">
          <div>
            <span>Bugünün operasyon özeti</span>
            <h1>Dolu veriyle çalışan profesyonel SaaS paneli</h1>
            <p>Müşteri, talep, randevu, servis kaydı ve içerik üretimi aynı ekranda yönetilir.</p>
          </div>
          <div className="demo-score">
            <strong>94%</strong>
            <span>Günlük iş tamamlama</span>
          </div>
        </header>

        <section className="demo-kpis">
          <article><span>Toplam müşteri</span><strong>1.248</strong><small>+36 bu ay</small></article>
          <article><span>Bekleyen talep</span><strong>34</strong><small>12 acil kayıt</small></article>
          <article><span>Bugünkü randevu</span><strong>18</strong><small>6 tamamlandı</small></article>
          <article><span>Aylık ciro</span><strong>₺286.400</strong><small>%22 artış</small></article>
          <article><span>AI içerik</span><strong>74</strong><small>Bu ay üretildi</small></article>
        </section>

        <section className="demo-grid">
          <article className="demo-card demo-span-2">
            <div className="demo-card-head">
              <strong>Müşteri ve servis kayıtları</strong>
              <span>16 örnek kayıt</span>
            </div>
            <div className="demo-table">
              {customers.map(([name, service, district, status]) => (
                <div className="demo-row" key={`${name}-${service}`}>
                  <span>{name}</span>
                  <span>{service}</span>
                  <span>{district}</span>
                  <mark>{status}</mark>
                </div>
              ))}
            </div>
          </article>

          <article className="demo-card">
            <div className="demo-card-head">
              <strong>Bugünkü randevular</strong>
              <span>Takvim</span>
            </div>
            <div className="demo-timeline">
              {appointments.map(([time, name, job]) => (
                <div key={`${time}-${name}`}>
                  <strong>{time}</strong>
                  <span>{name}</span>
                  <small>{job}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="demo-card">
            <div className="demo-card-head">
              <strong>Son talepler</strong>
              <span>Yeni akış</span>
            </div>
            <div className="demo-list">
              {requests.map((request) => <p key={request}>{request}</p>)}
            </div>
          </article>

          <article className="demo-card demo-span-2">
            <div className="demo-card-head">
              <strong>AI içerik ve pazarlama akışı</strong>
              <span>Hazır içerikler</span>
            </div>
            <div className="demo-content-grid">
              {contents.map((content) => <p key={content}>{content}</p>)}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
import Link from "next/link";
