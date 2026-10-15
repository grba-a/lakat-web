// Svi botovi dobrodošli, i AI (SEO pregled robots-ai): novom brendu više vrijedi da ga modeli znaju.
// Zatvoren je samo /api/. Proxyjane stare rute nisu ovdje: dobivaju noindex zaglavlje, a Google ga mora moći pročitati.
export default function robots() {
  const base = process.env.SITE_URL || "https://lakat-web.vercel.app";
  return { rules: { userAgent: "*", allow: "/", disallow: "/api/" }, sitemap: `${base}/sitemap.xml` };
}
