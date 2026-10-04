import { Anton, Archivo } from "next/font/google";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin", "latin-ext"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
});

export const metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://lakat-web.vercel.app"),
  title: "LAKAT. Šank se otvara 1. 12.",
  description:
    "LAKAT stiže na iPhone 1. 12. u podne. Vidiš tko je vani, tko stiže i tko časti. Javi se i budi prvi za šankom.",
  openGraph: { locale: "hr_HR", type: "website", siteName: "LAKAT" },
  twitter: { card: "summary_large_image" },
};

export const viewport = {
  themeColor: "#09090B",
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="hr" className={`${anton.variable} ${archivo.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
