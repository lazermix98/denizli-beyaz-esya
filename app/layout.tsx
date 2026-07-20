import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "İşletme AI Otomasyon | Production Ready SaaS",
  description:
    "Her sektöre uyarlanabilen müşteri, talep, randevu, iş takibi ve yapay zekâ içerik üretim sistemi. İlk demo firma: Denizli Beyaz Eşya Servisi.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
