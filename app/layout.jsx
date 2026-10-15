import { Anton, Archivo } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { TabTitle } from "@/components/tab-title";
import { APP_STORE_ID, isLive } from "@/lib/launch";
import { NASLOV, OPIS } from "@/lib/opis";
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

// Računa se pri svakom renderu (početna se osvježava svaku minutu), ne pri učitavanju modula:
// u podne 1. 12. naslov, opis i Smart App Banner prelaze sami (lansiranje-seo, metapodaci-lansiranje).
// Banner traži App Store link u envu, a NEXT_PUBLIC_ varijabla stiže tek s novim deployem.
export function generateMetadata() {
  const live = isLive();
  const kad = live ? "poslije" : "prije";
  return {
    ...(APP_STORE_ID && live ? { itunes: { appId: APP_STORE_ID } } : {}),
    metadataBase: new URL(process.env.SITE_URL || "https://lakat-web.vercel.app"),
    title: NASLOV[kad],
    description: OPIS[kad],
    alternates: { canonical: "/" },
    openGraph: { locale: "hr_HR", type: "website", siteName: "LAKAT", title: NASLOV[kad], description: OPIS[kad], url: "/" },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport = {
  themeColor: "#09090B",
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="hr" className={`${anton.variable} ${archivo.variable} antialiased`}>
      <body className="min-h-dvh">
        {children}
        <TabTitle />
        <Analytics />
      </body>
    </html>
  );
}
