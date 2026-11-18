// Zdravlje cronova za /admin (Petar 18. 11.): koji posao koji radi sam kasni ili pada.
// Izvor: RPC admin_cronovi (docs/supabase-admin12.sql) — pg_cron vožnje + otkucaji koje poslovi sami javljaju.
// Prije SQL-a funkcije nema: vraća { nema: true } i ploča samo kaže da čeka SQL.
const MIN = 60 * 1000;
const SAT = 60 * MIN;

// Što očekujemo od svakog posla: ime za ploču i najveći razmak između dva uspjeha prije nego „kasni“.
// `jednokratni`: raspored se mijenja svaki dan (zvono), pa se gleda samo greška, ne kašnjenje.
export const OCEKIVANO = {
  "admin-provjera": { ime: "Provjera ploče", svaki: "5 min", max: 20 * MIN },
  "web-tjedni": { ime: "Tjedni sažetak mailom", svaki: "ponedjeljak 7 h", max: 8 * 24 * SAT },
  "pwa-streak-visi": { ime: "Večernji podsjetnik (streak)", svaki: "dnevno 20 h", max: 26 * SAT },
  "pwa-tjedni-recap": { ime: "Tjedni recap pajdašima", svaki: "ponedjeljak 9 h", max: 8 * 24 * SAT },
  "pwa-sad-ili-nikad": { ime: "Sad ili nikad (aplikacija)", svaki: "dnevno i navečer", max: 26 * SAT },
  "pwa-prvi-tjedan": { ime: "Prvi tjedan (mail i push)", svaki: "svaki sat 7–22 h", max: 11 * SAT },
  lakat_admin_uzbune: { ime: "Okidač provjere (baza)", svaki: "5 min", max: 20 * MIN },
  // Vercel Hobby dopušta cron samo jednom dnevno, pa ova dva zove baza (lakat-pwa supabase-cronovi-pg1.sql).
  lakat_streak_visi: { ime: "Okidač streaka (baza)", svaki: "18 i 19 UTC", max: 26 * SAT },
  lakat_prvi_tjedan: { ime: "Okidač prvog tjedna (baza)", svaki: "svaki sat 7–22 h", max: 11 * SAT },
  "sad-ili-nikad-dan": { ime: "Sad ili nikad: plan dana", svaki: "dnevno 11 h", max: 26 * SAT },
  "sad-ili-nikad-zvono": { ime: "Sad ili nikad: zvono", svaki: "jednom navečer", jednokratni: true },
};

async function rpc(ime) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("supabase nije spojen");
  const res = await fetch(`${url}/rest/v1/rpc/${ime}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: "{}",
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (res.status === 404) return { nema: true };
  if (!res.ok) throw new Error(`rpc ${ime} ${res.status}`);
  return res.json();
}

// Otkucaj ovog weba (provjera, tjedni). Nikad ne ruši pozivatelja.
export async function otkucaj(posao, ok, greska) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return;
  try {
    await fetch(`${url}/rest/v1/rpc/admin_otkucaj`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ p_posao: posao, p_ok: ok, p_greska: greska ? String(greska).slice(0, 300) : null }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
  } catch {}
}

// 1 greška, 2–4 greške, 5+ grešaka (11–14 uvijek „grešaka“).
const greske = (n) => (n % 10 === 1 && n % 100 !== 11 ? "greška" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "greške" : "grešaka");

// Jedan red po poslu: stanje ok | kasni | pada | ceka (još nije javio) | ugasen.
export function procijeni(podaci, sad = new Date()) {
  const redovi = [];
  const t = (v) => (v ? new Date(v).getTime() : null);
  const stanje = (o, zadnjiOk, zadnjaGreska, zadnjiStatus, aktivan = true) => {
    if (!aktivan) return "ugasen";
    if (zadnjiStatus === "failed" || (zadnjaGreska && (!zadnjiOk || zadnjaGreska > zadnjiOk))) return "pada";
    if (!zadnjiOk) return o.jednokratni ? "ok" : "ceka";
    if (!o.jednokratni && sad.getTime() - zadnjiOk > o.max) return "kasni";
    return "ok";
  };
  for (const o of podaci?.otkucaji ?? []) {
    if (o.posao.startsWith("cuvar")) continue; // interni zapis psa čuvara, nije posao
    const oc = OCEKIVANO[o.posao] ?? { ime: o.posao, svaki: "", max: 26 * SAT };
    const ok = t(o.zadnji_ok), gr = t(o.zadnja_greska);
    redovi.push({ posao: o.posao, ime: oc.ime, svaki: oc.svaki, zadnjiOk: o.zadnji_ok, greska: gr && (!ok || gr > ok) ? o.greska : null, stanje: stanje(oc, ok, gr, null), izvor: "otkucaj" });
  }
  for (const j of podaci?.pg ?? []) {
    const oc = OCEKIVANO[j.posao] ?? { ime: j.posao, svaki: j.raspored, max: 26 * SAT };
    redovi.push({ posao: j.posao, ime: oc.ime, svaki: oc.svaki, zadnjiOk: j.zadnji_ok, greska: j.greske_24h ? `${j.greske_24h} ${greske(j.greske_24h)} u 24 h` : null, stanje: stanje(oc, t(j.zadnji_ok), null, j.zadnji_status, j.aktivan), izvor: "baza" });
  }
  // Poslovi koje očekujemo, a nikad se nisu javili (npr. prije deploya): „čeka“, bez uzbune.
  for (const [posao, oc] of Object.entries(OCEKIVANO)) {
    const otkucajni = posao.startsWith("pwa-") || posao.startsWith("web-") || posao === "admin-provjera";
    if (otkucajni && !redovi.some((r) => r.posao === posao))
      redovi.push({ posao, ime: oc.ime, svaki: oc.svaki, zadnjiOk: null, greska: null, stanje: "ceka", izvor: "otkucaj" });
  }
  const red = { pada: 0, kasni: 1, ceka: 2, ugasen: 3, ok: 4 };
  return redovi.sort((a, b) => red[a.stanje] - red[b.stanje] || a.ime.localeCompare(b.ime, "hr"));
}

export async function cronovi() {
  try {
    const podaci = await rpc("admin_cronovi");
    if (podaci?.nema) return { nema: true };
    return { redovi: procijeni(podaci), http: podaci.http ?? null };
  } catch (e) {
    return { greska: String(e.message || e).slice(0, 120) };
  }
}
