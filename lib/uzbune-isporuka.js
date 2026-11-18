// Faza U (Petar 11. 11.): uzbune mailom samo Petru. Zove je /admin/provjera (pg_cron svakih 5 min, tajna u Supabase Vaultu).
// Tihi sati 00–08 (Zagreb): javlja se samo KRITIČNO; ostalo čeka 8 h (ne označava se poslanim). Oporavak se javlja
// samo za uzbune koje su bile javljene. Push na iPhone (grbaa) ide preko rute /api/admin/uzbuna u lakat-pwa
// (LAKAT_API_ORIGIN + UZBUNE_PUSH_TAJNA u oba Vercel projekta); bez njih ide samo mail.
import { baza, pregled } from "@/lib/admin";
import { ascPregled } from "@/lib/asc";
import { provjere } from "@/lib/upozorenja";
import { cronovi, otkucaj } from "@/lib/cronovi";

const RAZINA = { kriticno: "KRITIČNO", vazno: "VAŽNO", info: "INFO" };
const BOJA = { kriticno: "#FF5A4F", vazno: "#F5B544", info: "#9A9AA2" };
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export function tihiSati(sad = new Date()) {
  const h = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", hour: "2-digit", hourCycle: "h23" }).format(sad));
  return h < 8;
}

async function rpc(ime, args) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("supabase nije spojen");
  const res = await fetch(`${url}/rest/v1/rpc/${ime}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`rpc ${ime} ${res.status}`);
  const t = await res.text();
  return t ? JSON.parse(t) : null;
}

export async function tajnaOk(tajna) {
  if (typeof tajna !== "string" || tajna.length !== 64) return false;
  try {
    return (await rpc("admin_uzbune_tajna_ok", { p_tajna: tajna })) === true;
  } catch {
    return false;
  }
}

export async function povijestUzbuna() {
  try {
    return (await rpc("admin_uzbune_povijest", {})) ?? [];
  } catch {
    return null;
  }
}

function mail(otvorene, oporavci) {
  const najgora = otvorene.find((u) => u.razina === "kriticno") ?? otvorene.find((u) => u.razina === "vazno") ?? otvorene[0];
  const naslov = najgora
    ? `LAKAT !! ${RAZINA[najgora.razina]}: ${najgora.naslov}${otvorene.length > 1 ? ` (+${otvorene.length - 1})` : ""}`
    : `LAKAT ✓ riješeno: ${oporavci[0]?.naslov ?? "uzbuna"}${oporavci.length > 1 ? ` (+${oporavci.length - 1})` : ""}`;
  const red = (u, riješeno) =>
    `<p style="margin:0 0 12px;font-size:15px;line-height:1.5"><b style="color:${riješeno ? "#4ADE80" : BOJA[u.razina]}">${riješeno ? "✓ RIJEŠENO" : `!! ${RAZINA[u.razina]}`}</b> ${esc(u.naslov)}<br><span style="color:#9A9AA2;font-size:13px">${esc(u.detalj)}</span></p>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;background:#0A0A0A;font-family:Arial,Helvetica,sans-serif;color:#F4F4F5"><div style="max-width:520px;margin:0 auto;padding:28px 20px">
<p style="font-size:11px;letter-spacing:.14em;color:#9A9AA2;margin:0 0 16px;text-transform:uppercase">[ LKT / UZBUNA ]</p>
${otvorene.map((u) => red(u, false)).join("")}${oporavci.map((u) => red(u, true)).join("")}
<a href="https://laktarenje.com/admin" style="display:inline-block;margin-top:16px;background:#4ADE80;color:#052e16;font-weight:bold;font-size:15px;text-decoration:none;padding:12px 22px;border-radius:999px">Otvori ploču</a>
<p style="font-size:12px;color:#6B6B73;margin:24px 0 0">Provjera svakih 5 minuta. Tihi sati 00–08: noću stiže samo kritično.</p></div></body></html>`;
  return { naslov, html };
}

async function posalji({ naslov, html }) {
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER || !process.env.ADMIN_MAIL) throw new Error("mail nije spojen");
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": process.env.BREVO_API_KEY, "content-type": "application/json", accept: "application/json", "User-Agent": "lakat-web/1.0" },
    body: JSON.stringify({ sender: { email: process.env.BREVO_SENDER, name: "LAKAT ploča" }, to: [{ email: process.env.ADMIN_MAIL }], subject: naslov, htmlContent: html, tags: ["admin-uzbuna"] }),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}`);
}

// Push na Petrov iPhone kroz aplikaciju (ona ima Appleov ključ; ovaj web ga nema i ne treba ga imati).
async function pushNaIphone({ naslov, tekst }) {
  const origin = process.env.LAKAT_API_ORIGIN, tajna = process.env.UZBUNE_PUSH_TAJNA;
  if (!origin || !tajna) throw new Error("push nije spojen");
  const res = await fetch(`${origin}/api/admin/uzbuna`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-uzbune-push": tajna },
    body: JSON.stringify({ naslov: naslov.slice(0, 120), tekst: tekst.slice(0, 240) }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`push ${res.status}`);
  const j = await res.json().catch(() => ({}));
  if (!j.poslano) throw new Error("push: nijedan uređaj");
}

function pushTekst(otvorene, oporavci) {
  const najgora = otvorene.find((u) => u.razina === "kriticno") ?? otvorene.find((u) => u.razina === "vazno") ?? otvorene[0];
  if (najgora) return { naslov: `${RAZINA[najgora.razina]}: ${najgora.naslov}`, tekst: [najgora.detalj, otvorene.length > 1 ? `i još ${otvorene.length - 1}` : ""].filter(Boolean).join(" · ") };
  return { naslov: `Riješeno: ${oporavci[0]?.naslov ?? "uzbuna"}`, tekst: oporavci.length > 1 ? `i još ${oporavci.length - 1}` : "Ploča je opet mirna." };
}

// Jedan krug: izračunaj uzbune, ažuriraj incidente, pošalji što treba. Vraća sažetak (bez osobnih podataka).
export async function krug(sad = new Date()) {
  const [pr, asc, bz, cr] = await Promise.all([pregled(7), ascPregled(), baza(), cronovi()]);
  // Bez podataka o cronovima ne usklađuj incidente: inače bi otvorene cron uzbune izgledale riješeno (Codex 18. 11.).
  // Otkucaj je tad neuspješan, pa pas čuvar javi ako to potraje.
  if (cr?.greska) {
    await otkucaj("admin-provjera", false, `cronovi: ${cr.greska}`);
    return { aktivnih: null, poslano: 0, preskoceno: "cronovi" };
  }
  const aktivne = provjere({ pregled: pr, asc, baza: bz, cronovi: cr });
  const stanje = await rpc("admin_uzbune_azuriraj", { p_aktivne: aktivne });
  const tiho = tihiSati(sad);
  const otvorene = (stanje?.otvorene ?? []).filter((u) => !tiho || u.razina === "kriticno");
  const oporavci = tiho ? [] : stanje?.oporavci ?? [];
  let kanali = 0;
  if (otvorene.length || oporavci.length) {
    // Mail i push neovisno: kad jedan kanal padne, drugi i dalje stigne; „poslano“ tek kad je bar jedan prošao.
    const [m, p] = await Promise.allSettled([posalji(mail(otvorene, oporavci)), pushNaIphone(pushTekst(otvorene, oporavci))]);
    kanali = [m, p].filter((x) => x.status === "fulfilled").length;
    if (m.status === "rejected") console.error("uzbune mail", String(m.reason?.message || m.reason).slice(0, 120));
    if (p.status === "rejected") console.error("uzbune push", String(p.reason?.message || p.reason).slice(0, 120));
    if (!kanali) throw new Error("ni mail ni push nisu prošli");
    await rpc("admin_uzbune_poslano", { p_otvorene: otvorene.map((u) => u.kljuc), p_oporavci: oporavci.map((u) => u.kljuc) });
  }
  // Otkucaj: pas čuvar u aplikaciji gleda ovaj red; kad se provjera dugo ne javi, sam javi Petru.
  await otkucaj("admin-provjera", true);
  return { aktivnih: aktivne.length, poslano: otvorene.length + oporavci.length, kanali, tiho };
}
