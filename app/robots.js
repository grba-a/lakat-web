export default function robots() {
  const base = process.env.SITE_URL || "https://lakat-web.vercel.app";
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${base}/sitemap.xml` };
}
