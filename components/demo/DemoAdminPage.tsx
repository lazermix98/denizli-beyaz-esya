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
  ["09:30", "Ayşe Yılmaz", "Buzdolabı arıza tespiti", "Kerem"],
  ["10:15", "Mehmet Kaya", "Çamaşır makinesi motor kontrolü", "Barış"],
  ["11:00", "Ali Aksoy", "Elektrik bağlantı keşfi", "Selim"],
  ["13:30", "Zeynep Arslan", "Fırın rezistans kontrolü", "Kerem"],
  ["15:00", "Selin Aydın", "Güzellik merkezi demo görüşmesi", "Deniz"],
  ["16:20", "Emre Öz", "Restoran kurulum planı", "Deniz"],
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
const kpis = [
  ["Müşteri", "1.248", "+36 bu ay"],
  ["Bekleyen talep", "34", "12 acil kayıt"],
  ["Bugünkü randevu", "18", "6 tamamlandı"],
  ["Aylık ciro", "₺286.400", "%22 artış"],
  ["Tamamlanan iş", "76", "+9 bu hafta"],
  ["Stok uyarısı", "4", "kritik parça"],
];

export function DemoAdminPage() {
  return (
    <main className="premium-demo-page">
      <aside className="premium-demo-sidebar">
        <div className="premium-demo-brand">
          <span>IA</span>
          <div>
            <strong>İşletme AI</strong>
            <small>Demo operasyon paneli</small>
          </div>
        </div>
        {["Dashboard", "Müşteriler", "Talepler", "Randevular", "İş kayıtları", "Stok", "AI içerik", "Raporlar", "Ayarlar"].map((item, index) => (
          <a className={index === 0 ? "active" : ""} href="#demo-dashboard" key={item}>{item}</a>
        ))}
      </aside>

      <section className="premium-demo-workspace" id="demo-dashboard">
        <nav className="premium-demo-topbar">
          <div>
            <span>Canlı demo</span>
            <strong>Denizli Beyaz Eşya Servisi</strong>
          </div>
          <label>
            <span>Arama</span>
            <input placeholder="Müşteri, talep veya iş ara" />
          </label>
          <div className="premium-demo-actions">
            <button type="button" aria-label="Bildirimler">●</button>
            <button type="button" aria-label="Ayarlar">Ayarlar</button>
            <Link href="/">Ana sayfaya dön</Link>
          </div>
        </nav>

        <header className="premium-dashboard-header">
          <div>
            <span className="premium-eyebrow">Günaydın Denizli Beyaz Eşya</span>
            <h1>Bugünkü özet</h1>
            <p>Müşteri, randevu, iş, stok, ciro ve içerik akışları tek bir sessiz operasyon ekranında toplanır.</p>
          </div>
          <button type="button" className="quiet-button">Demo verileri</button>
        </header>

        <section className="premium-kpi-grid">
          {kpis.map(([label, value, trend], index) => (
            <article className={`premium-kpi ${index === 1 || index === 5 ? "warning" : index === 3 || index === 4 ? "success" : ""}`} key={label}>
              <span className="premium-kpi-icon">{label.slice(0, 1)}</span>
              <span className="premium-kpi-label">{label}</span>
              <strong>{value}</strong>
              <small>{trend}</small>
            </article>
          ))}
        </section>

        <section className="premium-dashboard-main">
          <article className="premium-panel revenue-panel">
            <div className="premium-panel-head">
              <div>
                <span>12 aylık görünüm</span>
                <strong>Gelir ve tamamlanan işler</strong>
              </div>
              <span className="mini-badge success">+22%</span>
            </div>
            <div className="premium-chart">
              {revenue.map((value, index) => (
                <span style={{ height: `${Math.max(34, value * 1.35)}px` }} title={`${index + 1}. ay`} key={index} />
              ))}
            </div>
            <div className="premium-chart-footer">
              <span>Ocak</span>
              <span>Haziran</span>
              <span>Aralık</span>
            </div>
          </article>

          <aside className="premium-panel">
            <div className="premium-panel-head">
              <div>
                <span>Takvim</span>
                <strong>Bugünkü işler</strong>
              </div>
              <span className="mini-badge">6 randevu</span>
            </div>
            <div className="timeline-list">
              {appointments.map(([time, name, job, owner]) => (
                <article key={`${time}-${name}`}>
                  <time>{time}</time>
                  <div>
                    <strong>{name}</strong>
                    <small>{job} · {owner}</small>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </section>

        <section className="premium-split-grid">
          <article className="premium-panel">
            <div className="premium-panel-head">
              <div>
                <span>CRM aktivitesi</span>
                <strong>Müşteri hareketleri</strong>
              </div>
              <span className="mini-badge">16 kayıt</span>
            </div>
            <div className="premium-table">
              {customers.slice(0, 8).map(([initial, name, service, district, part, stock, status]) => (
                <article key={`${name}-${service}`}>
                  <span className="premium-avatar">{initial}</span>
                  <div>
                    <strong>{name}</strong>
                    <small>{district} · {service}</small>
                  </div>
                  <span>{part} · {stock} stok</span>
                  <span className="mini-badge">{status}</span>
                </article>
              ))}
            </div>
          </article>

          <article className="premium-panel">
            <div className="premium-panel-head">
              <div>
                <span>Depo</span>
                <strong>Yedek parça stoku</strong>
              </div>
              <span className="mini-badge warning">4 uyarı</span>
            </div>
            <div className="premium-inventory">
              {inventory.map(([part, count, percent, status]) => (
                <article key={part}>
                  <div>
                    <strong>{part}</strong>
                    <small>{count} · {status}</small>
                  </div>
                  <i><b style={{ width: `${percent}%` }} /></i>
                </article>
              ))}
            </div>
          </article>
        </section>

        <section className="premium-split-grid">
          <article className="premium-panel">
            <div className="premium-panel-head">
              <div>
                <span>Ekip</span>
                <strong>Teknisyen performansı</strong>
              </div>
              <span className="mini-badge success">aktif</span>
            </div>
            <div className="premium-inventory">
              {technicians.map(([name, jobs, amount, percent]) => (
                <article key={name}>
                  <div>
                    <strong>{name}</strong>
                    <small>{jobs} · {amount}</small>
                  </div>
                  <i><b style={{ width: `${percent}%` }} /></i>
                </article>
              ))}
            </div>
          </article>

          <article className="premium-panel">
            <div className="premium-panel-head">
              <div>
                <span>Pazarlama</span>
                <strong>AI içerik akışı</strong>
              </div>
              <span className="mini-badge">hazır</span>
            </div>
            <div className="compact-list">
              {["Instagram klima bakım kampanyası", "Google İşletme gönderisi", "Blog: Buzdolabı neden soğutmaz?", "WhatsApp randevu hatırlatma"].map((item) => (
                <article key={item}>
                  <span className="list-dot" />
                  <div>
                    <strong>{item}</strong>
                    <small>Taslak içerik oluşturuldu</small>
                  </div>
                  <span className="mini-badge success">hazır</span>
                </article>
              ))}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
