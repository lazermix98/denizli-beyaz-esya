import type { AdminSection } from "../shared/types";

export type SectorKey = "technical_service" | "barber" | "car_rental" | "market";

export type SectorMetric = {
  key: string;
  label: string;
  description: string;
  tone?: "neutral" | "success" | "warning" | "danger";
};

export type SectorConfig = {
  key: SectorKey;
  name: string;
  description: string;
  dictionary: {
    customer: string;
    record: string;
    job: string;
    asset: string;
    staff: string;
    appointment: string;
    payment: string;
  };
  modules: AdminSection[];
  dashboard: {
    greeting: string;
    title: string;
    description: string;
    metrics: SectorMetric[];
  };
  workflows: {
    recordStatuses: string[];
    jobStatuses: string[];
  };
  roleTemplates: string[];
  emptyStates: Partial<Record<AdminSection, string>>;
  formLabels: Partial<Record<AdminSection, string>>;
};

export const sectorConfigs: Record<SectorKey, SectorConfig> = {
  technical_service: {
    key: "technical_service",
    name: "Teknik servis",
    description: "Cihaz, servis talebi, randevu, iş emri, parça ve tahsilat akışı.",
    dictionary: {
      customer: "Müşteri",
      record: "Servis talebi",
      job: "İş emri",
      asset: "Cihaz",
      staff: "Teknisyen",
      appointment: "Randevu",
      payment: "Tahsilat",
    },
    modules: ["dashboard", "customers", "devices", "requests", "appointments", "work-records", "whatsapp", "pdf", "ai-content", "settings"],
    dashboard: {
      greeting: "Teknik servis operasyonu",
      title: "Servis kontrol merkezi",
      description: "Açık talepler, randevular, iş emirleri, parça bekleyen işler ve servis cirosunu takip edin.",
      metrics: [
        { key: "customers", label: "Toplam müşteri", description: "Kayıtlı servis müşterisi" },
        { key: "requests", label: "Açık servis talepleri", description: "Dönüş bekleyen kayıt", tone: "warning" },
        { key: "appointments", label: "Bugünkü randevular", description: "Planlanan servis akışı" },
        { key: "jobs", label: "Devam eden işler", description: "Açık iş emirleri" },
        { key: "revenue", label: "Aylık servis cirosu", description: "İş kayıtlarından hesaplanır", tone: "success" },
        { key: "stock", label: "Parça bekleyen işler", description: "Stok ve parça kontrolü", tone: "danger" },
        { key: "completed", label: "Tamamlanan işler", description: "Kapalı servis kayıtları", tone: "success" },
        { key: "payments", label: "Tahsilat durumu", description: "Gelir özeti" },
      ],
    },
    workflows: {
      recordStatuses: ["Yeni", "Randevu verildi", "İnceleniyor", "Parça bekliyor", "Tamamlandı", "Teslim edildi"],
      jobStatuses: ["Açık", "Sahada", "Parça bekliyor", "Tamamlandı", "İptal"],
    },
    roleTemplates: ["İşletme sahibi", "Yönetici", "Teknisyen", "Saha personeli", "Muhasebe"],
    emptyStates: { devices: "Henüz cihaz kaydı yok.", requests: "Yeni servis talebi bulunmuyor." },
    formLabels: { requests: "Yeni servis talebi oluştur", "work-records": "Yeni iş emri oluştur", devices: "Cihaz ekle" },
  },
  barber: {
    key: "barber",
    name: "Berber / kuaför",
    description: "Randevu, hizmet, personel doluluğu, paket ve sadakat odaklı işletme yönetimi.",
    dictionary: {
      customer: "Müşteri",
      record: "Randevu",
      job: "Hizmet",
      asset: "Koltuk / oda",
      staff: "Uzman",
      appointment: "Takvim",
      payment: "Tahsilat",
    },
    modules: ["dashboard", "customers", "appointments", "requests", "work-records", "whatsapp", "ai-content", "settings"],
    dashboard: {
      greeting: "Salon operasyonu",
      title: "Randevu ve hizmet kontrol paneli",
      description: "Bugünkü randevular, boş saatler, personel doluluğu ve günlük ciroyu takip edin.",
      metrics: [
        { key: "appointments", label: "Bugünkü randevular", description: "Planlı salon akışı" },
        { key: "requests", label: "Boş saatler", description: "Doldurulabilir zamanlar", tone: "success" },
        { key: "jobs", label: "Aktif hizmetler", description: "Bugünkü hizmet kayıtları" },
        { key: "customers", label: "Yeni müşteriler", description: "CRM büyümesi" },
        { key: "revenue", label: "Günlük ciro", description: "Hizmet gelirleri", tone: "success" },
        { key: "stock", label: "Paket takibi", description: "Satılabilir paketler" },
        { key: "completed", label: "Tamamlanan hizmetler", description: "Günlük kapanış", tone: "success" },
        { key: "payments", label: "Tahsilatlar", description: "Ödeme özeti" },
      ],
    },
    workflows: {
      recordStatuses: ["Bekliyor", "Onaylandı", "Geldi", "İşlemde", "Tamamlandı", "İptal", "Gelmedi"],
      jobStatuses: ["Planlandı", "İşlemde", "Tamamlandı", "İptal"],
    },
    roleTemplates: ["İşletme sahibi", "Salon yöneticisi", "Berber", "Kuaför", "Kasa"],
    emptyStates: { appointments: "Bugün için randevu görünmüyor.", requests: "Yeni randevu talebi yok." },
    formLabels: { requests: "Yeni randevu talebi oluştur", "work-records": "Yeni hizmet oluştur" },
  },
  car_rental: {
    key: "car_rental",
    name: "Araç kiralama",
    description: "Araç, rezervasyon, teslimat, hasar ve depozito operasyonu.",
    dictionary: {
      customer: "Müşteri",
      record: "Rezervasyon",
      job: "Kiralama",
      asset: "Araç",
      staff: "Operasyon personeli",
      appointment: "Teslimat",
      payment: "Depozito / tahsilat",
    },
    modules: ["dashboard", "customers", "devices", "requests", "appointments", "work-records", "pdf", "whatsapp", "settings"],
    dashboard: {
      greeting: "Kiralama operasyonu",
      title: "Araç ve rezervasyon kontrol paneli",
      description: "Kiradaki araçlar, teslimatlar, müsaitlik, gecikmeler ve aylık geliri takip edin.",
      metrics: [
        { key: "jobs", label: "Kiradaki araçlar", description: "Aktif kiralama kayıtları" },
        { key: "appointments", label: "Bugünkü teslimatlar", description: "Teslim alma / teslim etme" },
        { key: "devices", label: "Müsait araçlar", description: "Araç envanteri", tone: "success" },
        { key: "requests", label: "Bekleyen rezervasyon", description: "Onay bekleyen talepler", tone: "warning" },
        { key: "revenue", label: "Aylık kiralama geliri", description: "Kiralama cirosu", tone: "success" },
        { key: "stock", label: "Hasar bekleyen", description: "Kontrol edilecek araçlar", tone: "danger" },
        { key: "completed", label: "İade edilenler", description: "Kapanan kiralamalar" },
        { key: "payments", label: "Depozito durumu", description: "Tahsilat özeti" },
      ],
    },
    workflows: {
      recordStatuses: ["Teklif", "Rezerve", "Teslim edildi", "Kirada", "Gecikmiş", "İade edildi", "Hasar kontrolünde", "Kapandı"],
      jobStatuses: ["Rezerve", "Kirada", "Gecikti", "İade edildi", "Kapandı"],
    },
    roleTemplates: ["İşletme sahibi", "Operasyon yöneticisi", "Araç teslim görevlisi", "Muhasebe"],
    emptyStates: { devices: "Araç kaydı yok.", requests: "Rezervasyon talebi bulunmuyor." },
    formLabels: { requests: "Yeni rezervasyon oluştur", devices: "Araç ekle", "work-records": "Yeni kiralama oluştur" },
  },
  market: {
    key: "market",
    name: "Market / mağaza",
    description: "Ürün, stok, kasa, satış, tedarikçi ve kampanya yönetimi.",
    dictionary: {
      customer: "Müşteri",
      record: "Satış",
      job: "Sipariş",
      asset: "Ürün",
      staff: "Kasiyer",
      appointment: "Vardiya",
      payment: "Kasa",
    },
    modules: ["dashboard", "customers", "devices", "requests", "work-records", "whatsapp", "ai-content", "settings"],
    dashboard: {
      greeting: "Mağaza operasyonu",
      title: "Satış ve stok kontrol paneli",
      description: "Günlük satış, kritik stok, kasa hareketleri ve en çok satan ürünleri takip edin.",
      metrics: [
        { key: "revenue", label: "Günlük satış", description: "Kasa ve satış geliri", tone: "success" },
        { key: "payments", label: "Sepet ortalaması", description: "İşlem başı gelir" },
        { key: "stock", label: "Kritik stok", description: "Azalan ürünler", tone: "danger" },
        { key: "devices", label: "Ürünler", description: "Aktif ürün kaydı" },
        { key: "jobs", label: "Günlük işlem", description: "Sipariş / satış kaydı" },
        { key: "requests", label: "İade / talep", description: "İşlem bekleyen kayıtlar", tone: "warning" },
        { key: "customers", label: "Müşteri", description: "Kayıtlı müşteri" },
        { key: "completed", label: "Tamamlanan satış", description: "Kapanan işlemler", tone: "success" },
      ],
    },
    workflows: {
      recordStatuses: ["Yeni", "Hazırlanıyor", "Satıldı", "İade", "İptal"],
      jobStatuses: ["Açık", "Hazırlanıyor", "Tamamlandı", "İade"],
    },
    roleTemplates: ["İşletme sahibi", "Mağaza yöneticisi", "Kasiyer", "Depo sorumlusu", "Muhasebe"],
    emptyStates: { devices: "Ürün kaydı yok.", requests: "Satış veya iade kaydı bulunmuyor." },
    formLabels: { requests: "Yeni satış oluştur", devices: "Ürün ekle", "work-records": "Yeni sipariş oluştur" },
  },
};

export const defaultSectorKey: SectorKey = "technical_service";

export const sectorOptions = Object.values(sectorConfigs).map((sector) => ({
  value: sector.key,
  label: sector.name,
  description: sector.description,
}));

export function getSectorConfig(key?: string | null) {
  return sectorConfigs[(key as SectorKey) || defaultSectorKey] || sectorConfigs[defaultSectorKey];
}

