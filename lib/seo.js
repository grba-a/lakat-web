// Metapodaci po stranici (SEO pregled: opisi-podstranica). Next openGraph objekt stranice zamijeni onaj iz
// layouta, pa ga gradimo ovdje cijelog: svaka stranica dobije svoj opis, og:url i isti siteName.
export function stranica({ naslov, opis, put, indeks = true }) {
  return {
    title: naslov,
    description: opis,
    alternates: { canonical: put },
    openGraph: { locale: "hr_HR", type: "website", siteName: "LAKAT", title: naslov, description: opis, url: put },
    ...(indeks ? {} : { robots: { index: false, follow: false } }),
  };
}

// JSON-LD kao <script>, s „<“ pretvorenim da tekst ne može zatvoriti tag (Next 16 json-ld.md).
export function jsonLd(data) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
