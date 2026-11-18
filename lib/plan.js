// /admin/plan (Petar 18. 11.): kartice plana rada iz tablice admin_plan (docs/supabase-admin15.sql), samo service_role.
// Čitanje za stranicu, pisanje samo kroz akcije koje prvo provjere admin prijavu (app/admin/plan/actions.js).
export const REDOVI = [
  ["app", "Aplikacija"],
  ["web", "Web i server"],
  ["ig", "Instagram i TikTok"],
  ["ti", "Ti"],
];
export const STANJA = [
  ["todo", "Treba napraviti"],
  ["radim", "Radim"],
  ["spremno", "Spremno · čeka tebe"],
  ["gotovo", "Gotovo"],
  ["ne", "Ne / propušteno"],
];

function cfg() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("supabase nije spojen");
  return { url, headers: { apikey: key, Authorization: `Bearer ${key}`, "content-type": "application/json" } };
}

export async function planKartice() {
  try {
    const { url, headers } = cfg();
    const res = await fetch(`${url}/rest/v1/admin_plan?select=*&order=redoslijed.asc,azurirano.asc&limit=1000`, { headers, cache: "no-store" });
    if (res.status === 404) return { greska: "Čeka SQL docs/supabase-admin15.sql." };
    if (!res.ok) return { greska: `Baza ${res.status}` };
    return { kartice: await res.json() };
  } catch (e) {
    return { greska: String(e.message || e).slice(0, 120) };
  }
}

const DAN = /^\d{4}-\d{2}-\d{2}$/;
const praviDan = (v) => typeof v === "string" && DAN.test(v) && new Date(`${v}T12:00:00Z`).toISOString().slice(0, 10) === v;
const tekst = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : null);
// Samo poznata polja, provjerena; ništa drugo ne ide u bazu. Predugo se odbija (ne reže tiho).
export function ocisti(ulaz, nova = false) {
  const o = {};
  if ("naslov" in ulaz || nova) {
    if (typeof ulaz.naslov !== "string" || !ulaz.naslov.trim()) throw new Error("Prazan tekst.");
    if (ulaz.naslov.trim().length > 200) throw new Error("Najviše 200 znakova.");
    o.naslov = ulaz.naslov.trim();
  }
  if ("red" in ulaz) {
    if (!REDOVI.some(([k]) => k === ulaz.red)) throw new Error("Krivi red.");
    o.red = ulaz.red;
  }
  if ("dan" in ulaz) {
    if (ulaz.dan !== null && !praviDan(ulaz.dan)) throw new Error("Krivi dan.");
    o.dan = ulaz.dan;
  }
  if ("stanje" in ulaz) {
    if (!STANJA.some(([k]) => k === ulaz.stanje)) throw new Error("Krivo stanje.");
    o.stanje = ulaz.stanje;
    // Kad je završeno: samo pri prelasku u „gotovo“ (akcija šalje stanje samo kad ga Petar promijeni).
    o.zavrseno = ulaz.stanje === "gotovo" ? new Date().toISOString() : null;
  }
  if ("biljeska" in ulaz) {
    if (ulaz.biljeska !== null && typeof ulaz.biljeska !== "string") throw new Error("Kriva bilješka.");
    if ((ulaz.biljeska ?? "").trim().length > 600) throw new Error("Najviše 600 znakova.");
    o.biljeska = tekst(ulaz.biljeska, 600) || null;
  }
  if (nova) o.moja = true;
  o.azurirano = new Date().toISOString();
  return o;
}

export async function planPisi(metoda, id, tijelo, samoMoje = false) {
  const { url, headers } = cfg();
  const put = id ? `${url}/rest/v1/admin_plan?id=eq.${encodeURIComponent(id)}${samoMoje ? "&moja=is.true" : ""}` : `${url}/rest/v1/admin_plan`;
  const res = await fetch(put, { method: metoda, headers: { ...headers, Prefer: "return=minimal" }, body: tijelo ? JSON.stringify(tijelo) : undefined, cache: "no-store" });
  if (!res.ok) throw new Error(`Baza ${res.status}`);
}
