// Tjedni sažetak za Petra (faza 4, Petar 11. 11.): ponedjeljak ujutro, samo njemu, samo zbrojevi.
// Gradi HTML iz istih izvora kao ploča; šalje Brevo na ADMIN_MAIL (Vercel Sensitive, nikad u repo).
import { ascPregled } from "@/lib/asc";
import { instagram } from "@/lib/instagram";
import { provjere } from "@/lib/upozorenja";
import { baza, igSnimka, pregled } from "@/lib/admin";

const IGRE = {
  sankerov_lakat: "Šanker", konobar: "Konobar", galeb: "Galeb", zlatni_tocionik: "Točionik",
  kula: "Kula", burek_u_cetiri: "Pekara", gajba: "Gajba", do_krigle: "Spoji",
};
const broj = (n) => (n == null ? "—" : new Intl.NumberFormat("hr-HR").format(n));
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function red(oznaka, sad, prije) {
  const r = (sad ?? 0) - (prije ?? 0);
  const boja = r >= 0 ? "#4ADE80" : "#FF5A4F";
  const strelica = prije == null ? "" : `<span style="color:${boja};font-size:13px">${r >= 0 ? "▲ +" : "▼ −"}${broj(Math.abs(r))}</span>`;
  return `<tr><td style="padding:10px 0;border-bottom:1px solid #262626;color:#9A9AA2;font-size:13px;letter-spacing:.06em;text-transform:uppercase">${esc(oznaka)}</td>
<td style="padding:10px 0;border-bottom:1px solid #262626;text-align:right;font-size:22px;font-weight:bold;color:#F4F4F5">${broj(sad)}</td>
<td style="padding:10px 0 10px 12px;border-bottom:1px solid #262626;text-align:right;white-space:nowrap">${strelica}</td></tr>`;
}

export async function tjedniSazetak() {
  const [pr, asc, bz, ig] = await Promise.all([pregled(7), ascPregled(), baza(), instagram()]);
  const igNiz = await igSnimka(null, null);
  const p = pr.podaci;
  const k = p?.kpi ?? {};
  const pn = asc?.prednarudzbe;
  const uzbune = provjere({ pregled: pr, asc, baza: bz });
  const igSad = ig?.profil?.pratitelji ?? null;
  const igPrije = igNiz.length ? (igNiz.find((d) => d.dan <= new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10)) ?? igNiz[0]).pratitelji : null;
  const igra = (p?.igre ?? []).find((g) => IGRE[g.igra]);
  const od = p?.od, danas = p?.danas;
  const naslov = `LAKAT tjedan ${od ? `${od.slice(8, 10)}. ${od.slice(5, 7)}.` : ""}–${danas ? `${danas.slice(8, 10)}. ${danas.slice(5, 7)}.` : ""}: ${broj(k.aktivni?.sad)} aktivnih`;

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"></head><body style="margin:0;background:#0A0A0A;font-family:Arial,Helvetica,sans-serif;color:#F4F4F5">
<div style="max-width:520px;margin:0 auto;padding:32px 20px">
<p style="font-size:11px;letter-spacing:.14em;color:#9A9AA2;margin:0 0 6px;text-transform:uppercase">[ LKT / TJEDAN ] samo zbrojevi</p>
<p style="font-size:30px;font-weight:bold;margin:0 0 4px">LAKAT<span style="color:#4ADE80">.</span> tjedan</p>
<p style="font-size:13px;color:#9A9AA2;margin:0 0 24px">Zadnjih 7 dana prema 7 prije. Broji od 20. 10. (iOS).</p>
<table role="presentation" style="width:100%;border-collapse:collapse">
${red("Aktivni", k.aktivni?.sad, k.aktivni?.prije)}
${red("Novi profili", k.novi?.sad, k.novi?.prije)}
${red("Runde", k.runde?.sad, k.runde?.prije)}
${red("Partije", k.partije?.sad, k.partije?.prije)}
${red("Pajdaštva", k.pajdastva?.sad, k.pajdastva?.prije)}
${pn?.ok ? red("Prednarudžbe", pn.ukupno - pn.otkazano, null) : ""}
${igSad != null ? red("Instagram pratitelji", igSad, igPrije) : ""}
</table>
${igra ? `<p style="font-size:14px;color:#C9C9CF;margin:20px 0 0">Najigranija igra: <b style="color:#F4F4F5">${esc(IGRE[igra.igra])}</b>, ${broj(igra.partije)} partija.</p>` : ""}
<p style="font-size:11px;letter-spacing:.14em;color:#9A9AA2;margin:28px 0 8px;text-transform:uppercase">Stanje sustava</p>
${uzbune.length ? uzbune.map((u) => `<p style="margin:0 0 8px;font-size:14px"><b style="color:${u.razina === "kriticno" ? "#FF5A4F" : u.razina === "vazno" ? "#F5B544" : "#9A9AA2"}">!! ${u.razina === "kriticno" ? "KRITIČNO" : u.razina === "vazno" ? "VAŽNO" : "INFO"}</b> ${esc(u.naslov)} <span style="color:#9A9AA2">${esc(u.detalj)}</span></p>`).join("") : `<p style="margin:0;font-size:14px;color:#4ADE80">Sve radi.</p>`}
<a href="https://laktarenje.com/admin" style="display:inline-block;margin-top:28px;background:#4ADE80;color:#052e16;font-weight:bold;font-size:15px;text-decoration:none;padding:13px 24px;border-radius:999px">Otvori ploču</a>
<p style="font-size:12px;color:#6B6B73;margin:28px 0 0">Šalje laktarenje.com/admin svaki ponedjeljak ujutro, samo tebi.</p>
</div></body></html>`;
  return { naslov, html };
}

export async function posaljiTjedni() {
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER || !process.env.ADMIN_MAIL) throw new Error("Nema BREVO_API_KEY, BREVO_SENDER ili ADMIN_MAIL");
  const { naslov, html } = await tjedniSazetak();
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": process.env.BREVO_API_KEY, "content-type": "application/json", accept: "application/json", "User-Agent": "lakat-web/1.0" },
    body: JSON.stringify({
      sender: { email: process.env.BREVO_SENDER, name: "LAKAT ploča" },
      to: [{ email: process.env.ADMIN_MAIL }],
      subject: naslov,
      htmlContent: html,
      tags: ["admin-tjedni"],
    }),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}`);
  return naslov;
}
