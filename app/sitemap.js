// lastModified = dan zadnje stvarne promjene sadržaja, ne dan builda (SEO pregled sitemap-lastmod).
// Kad mijenjaš tekst stranice, promijeni i datum. 1. 12. početna dobiva datum lansiranja.
import { isLive } from "@/lib/launch";

const IZMJENA = {
  "": "2026-10-15",
  "/sto-je-lakat": "2026-10-15",
  "/press": "2026-10-15",
  "/privatnost": "2026-10-15",
  "/uvjeti": "2026-10-05",
};

export default function sitemap() {
  const base = process.env.SITE_URL || "https://lakat-web.vercel.app";
  return Object.entries(IZMJENA).map(([p, d]) => ({
    url: `${base}${p}`,
    lastModified: p === "" && isLive() ? "2026-12-01" : d,
    changeFrequency: p === "" ? "daily" : "monthly",
    priority: p === "" ? 1 : p === "/sto-je-lakat" ? 0.6 : 0.3,
  }));
}
