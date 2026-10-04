export default function sitemap() {
  const base = process.env.SITE_URL || "https://lakat-web.vercel.app";
  return [{ url: base, changeFrequency: "daily", priority: 1 }];
}
