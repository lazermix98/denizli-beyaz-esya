import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Denizli Beyaz Eşya Servisi | AI Destekli Servis Yönetimi",
  description:
    "Denizli ve Pamukkale için beyaz eşya, klima servisi, WhatsApp talep formu, yönetici paneli ve yapay zekâ içerik üretimi.",
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
