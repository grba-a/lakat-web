// Instagram @lakat_app za /admin: profil i zadnje objave preko Graph API-ja (token Facebook stranice „LAKAT.").
// Env (Vercel Sensitive + .env.local, nikad u repo): META_PAGE_TOKEN, IG_USER_ID. Dozvole samo za čitanje
// (instagram_basic, pages_show_list, pages_read_engagement); doseg i pregledi traže instagram_manage_insights (nije uključeno).
const BASE = "https://graph.facebook.com/v23.0";

export function igReady() {
  return Boolean(process.env.META_PAGE_TOKEN && process.env.IG_USER_ID);
}

async function get(path, polja) {
  const q = new URLSearchParams({ fields: polja, access_token: process.env.META_PAGE_TOKEN });
  const res = await fetch(`${BASE}/${path}?${q}`, { cache: "no-store" });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(`Instagram ${res.status}: ${(j.error?.message ?? "").slice(0, 120)}`);
  }
  return res.json();
}

export async function instagram() {
  if (!igReady()) return null;
  try {
    const id = process.env.IG_USER_ID;
    const [profil, mediji] = await Promise.all([
      get(id, "username,followers_count,follows_count,media_count"),
      get(`${id}/media`, "caption,media_type,media_product_type,timestamp,like_count,comments_count,permalink").then((r) => r.data ?? []),
    ]);
    return {
      profil: { korisnik: profil.username, pratitelji: profil.followers_count, prati: profil.follows_count, objave: profil.media_count },
      objave: mediji.slice(0, 25).map((m) => ({
        id: m.id,
        dan: m.timestamp?.slice(0, 10),
        vrsta: m.media_product_type === "REELS" ? "Reel" : m.media_type === "CAROUSEL_ALBUM" ? "Karusel" : m.media_type === "VIDEO" ? "Video" : "Slika",
        opis: (m.caption ?? "").replace(/\s+/g, " ").slice(0, 70),
        lajkovi: m.like_count ?? 0,
        komentari: m.comments_count ?? 0,
        link: m.permalink,
      })),
    };
  } catch (e) {
    return { greska: String(e.message || e).slice(0, 160) };
  }
}
