import Link from "next/link";

const customers = [
  ["AY", "Ayşe Yılmaz", "Buzdolabı", "Pamukkale", "Fan motoru", "3", "Bekliyor"],
  ["MK", "Mehmet Kaya", "Çamaşır makinesi", "Merkezefendi", "Pompa", "8", "Randevulu"],
  ["ED", "Elif Demir", "Klima bakımı", "Pamukkale", "Filtre seti", "14", "Tamamlandı"],
  ["HÇ", "Hasan Çelik", "Bulaşık makinesi", "Sarayköy", "Rezistans", "2", "Parça bekliyor"],
  ["ZA", "Zeynep Arslan", "Fırın", "Merkezefendi", "Termostat", "6", "Bekliyor"],
  ["MK", "Murat Koç", "Kombi", "Pamukkale", "Conta seti", "11", "Randevulu"],
  ["SA", "Selin Aydın", "Güzellik merkezi", "Denizli", "Bakım paketi", "21", "Teklif"],
  ["OŞ", "Okan Şahin", "Oto servis", "Merkezefendi", "Sensör", "5", "Tamamlandı"],
  ["DK", "Derya Kurt", "Diş kliniği", "Pamukkale", "Steril bakım", "9", "Görüşme"],
  ["EÖ", "Emre Öz", "Restoran", "Denizli", "Servis paketi", "18", "Kurulum"],
  ["BE", "Burcu Eren", "Emlak ofisi", "Merkezefendi", "İlan paketi", "32", "Teklif"],
  ["AA", "Ali Aksoy", "Elektrik işi", "Pamukkale", "Sigorta", "7", "Randevulu"],
  ["CP", "Cemre Polat", "Kuaför", "Denizli", "Randevu paketi", "16", "Bekliyor"],
  ["FY", "Fatih Yıldız", "Klima montaj", "Merkezefendi", "Bakır boru", "4", "Parça bekliyor"],
  ["NU", "Neslihan Uçar", "Ankastre", "Pamukkale", "Düğme seti", "10", "Tamamlandı"],
  ["SB", "Serkan Bulut", "Kafe", "Denizli", "Menü içerik", "24", "Görüşme"],
];

const appointments = [
  ["09:30", "Ayşe Yılmaz", "Buzdolabı arıza tespiti", "Teknisyen: Kerem"],
  ["10:15", "Mehmet Kaya", "Çamaşır makinesi motor kontrolü", "Teknisyen: Barış"],
  ["11:00", "Ali Aksoy", "Elektrik bağlantı keşfi", "Teknisyen: Selim"],
  ["13:30", "Zeynep Arslan", "Fırın rezistans kontrolü", "Teknisyen: Kerem"],
  ["15:00", "Selin Aydın", "Güzellik merkezi demo görüşmesi", "Satış: Deniz"],
  ["16:20", "Emre Öz", "Restoran kurulum planı", "Satış: Deniz"],
];

const inventory = [
  ["Fan motoru", "3 adet", 22, "Kritik"],
  ["Pompa", "8 adet", 48, "Yeterli"],
  ["Rezistans", "2 adet", 14, "Kritik"],
  ["Termostat", "6 adet", 36, "Sipariş"],
  ["Klima filtre seti", "14 adet", 70, "İyi"],
  ["Bakır boru", "4 adet", 28, "Az"],
];

const technicians = [
  ["Kerem Usta", "7 iş", "₺18.400", 86],
  ["Barış Usta", "5 iş", "₺12.900", 74],
  ["Selim Usta", "4 iş", "₺9.600", 68],
  ["Deniz Satış", "6 görüşme", "₺42.000", 91],
];

const revenue = [42, 58, 51, 74, 68, 88, 79, 96, 84, 112, 124, 138];
const statusMix = [["Bekleyen", 34], ["Randevulu", 28], ["Tamamlandı", 76], ["Parça bekliyor", 11]];

const requests = [
  "WhatsApp üzerinden klima bakım talebi alındı",
  "Web formundan buzdolabı soğutmuyor kaydı geldi",
  "Google İşletme yorumu için cevap taslağı hazırlandı",
  "TikTok içerik takvimi için yeni konu önerildi",
  "PDF servis fişi müşteri kartına bağlandı",
  "Yeni müşteri kartı ve cihaz geçmişi oluşturuldu",
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
        {["Dashboard", "Müşteriler", "Talepler", "Randevular", "İş kayıtları", "Stok", "AI içerik", "Raporlar", "Ayarlar"].map((item, index) => (
          <a className={index === 0 ? "active" : ""} href="#demo-dashboard" key={item}>{item}</a>
        ))}
      </aside>

      <section className="demo-workspace" id="demo-dashboard">
        <nav className="demo-topbar">
          <div>
            <span>Canlı demo</span>
            <strong>Denizli Beyaz Eşya Servisi</strong>
          </div>
          <div className="demo-topbar-actions">
            <strong>21 Temmuz 2026</strong>
            <Link href="/">Ana sayfaya dön</Link>
          </div>
        </nav>

        <header className="demo-hero-card">
          <div>
            <span>Bugünün operasyon özeti</span>
            <h1>Dolu veriyle çalışan profesyonel SaaS paneli</h1>
            <p>Müşteri resmi, cihaz geçmişi, stok, kullanılan parça, randevu, ciro ve içerik üretimi aynı yönetim ekranında görünür.</p>
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
          <article><span>Stok uyarısı</span><strong>4</strong><small>Kritik parça</small></article>
        </section>

        <section className="demo-grid">
          <article className="demo-card demo-span-2">
            <div className="demo-card-head">
              <strong>Gelir ve tamamlanan işler</strong>
              <span>12 aylık görünüm</span>
            </div>
            <div className="demo-chart">
              {revenue.map((value, index) => (
                <span style={{ height: `${value}px` }} title={`${index + 1}. ay`} key={index} />
              ))}
            </div>
          </article>

          <article className="demo-card">
            <div className="demo-card-head">
              <strong>Servis durumu</strong>
              <span>Anlık dağılım</span>
            </div>
            <div className="demo-status-mix">
              {statusMix.map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="demo-card demo-span-2">
            <div className="demo-card-head">
              <strong>Müşteri, cihaz ve parça kayıtları</strong>
              <span>16 örnek kayıt</span>
            </div>
            <div className="demo-table">
              {customers.map(([initials, name, service, district, part, stock, status]) => (
                <div className="demo-row rich" key={`${name}-${service}`}>
                  <span className="demo-avatar">{initials}</span>
                  <span><strong>{name}</strong><small>{district}</small></span>
                  <span><strong>{service}</strong><small>Kullanılan: {part}</small></span>
                  <span><strong>{stock}</strong><small>stok</small></span>
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
              {appointments.map(([time, name, job, owner]) => (
                <div key={`${time}-${name}`}>
                  <strong>{time}</strong>
                  <span>{name}</span>
                  <small>{job}</small>
                  <em>{owner}</em>
                </div>
              ))}
            </div>
          </article>

          <article className="demo-card">
            <div className="demo-card-head">
              <strong>Yedek parça stoku</strong>
              <span>Depo takibi</span>
            </div>
            <div className="demo-inventory">
              {inventory.map(([part, count, percent, status]) => (
                <div key={part}>
                  <span><strong>{part}</strong><small>{count} - {status}</small></span>
                  <i><b style={{ width: `${percent}%` }} /></i>
                </div>
              ))}
            </div>
          </article>

          <article className="demo-card">
            <div className="demo-card-head">
              <strong>Teknisyen performansı</strong>
              <span>Günlük ekip</span>
            </div>
            <div className="demo-technicians">
              {technicians.map(([name, jobs, revenueText, percent]) => (
                <div key={name}>
                  <span className="demo-avatar small">{String(name).slice(0, 2)}</span>
                  <span><strong>{name}</strong><small>{jobs} - {revenueText}</small></span>
                  <i><b style={{ width: `${percent}%` }} /></i>
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
