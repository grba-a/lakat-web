// Lista čekanja u LAKAT Supabase PROD (Petar q2 = A) + mailovi preko Brevoa. Samo na serveru.
// Uključuje se kad postoje SUPABASE_URL (ili NEXT_PUBLIC_SUPABASE_URL) i SUPABASE_SECRET_KEY, te BREVO_API_KEY i BREVO_SENDER.
// Tablica i pogled: docs/supabase-lista1.sql (pokreće Petar u SQL editoru).
import { randomInt } from "node:crypto";

const URL_ = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SECRET_KEY;

export function dbReady() {
  return Boolean(URL_ && KEY);
}
export function mailReady() {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER);
}

async function rest(path, { method = "GET", body, prefer, revalidate } = {}) {
  const res = await fetch(`${URL_}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "content-type": "application/json",
      ...(prefer && { Prefer: prefer }),
    },
    body: body ? JSON.stringify(body) : undefined,
    // Čitanja za stranicu (poredak, brojač) smiju biti stara par minuta; sve ostalo je uvijek svježe.
    ...(revalidate ? { next: { revalidate } } : { cache: "no-store" }),
  });
  if (!res.ok) throw new Error(`supabase ${res.status} ${await res.text().catch(() => "")}`.slice(0, 300));
  return res;
}

const ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function noviKod() {
  let s = "";
  for (let i = 0; i < 6; i++) s += ABC[randomInt(ABC.length)];
  return s;
}
const esc = (v) => encodeURIComponent(String(v).replace(/[%_*,()]/g, ""));

// Upis ili osvježavanje nepotvrđenog upisa. Vraća token za mail i osobni kod.
export async function upis({ email, platforma, izvor, grad, kvart, ime, pozvao }) {
  // E-mail je već malim slovima (route), pa je eq dovoljan i ne spotiče se o _ ili %.
  const found = await (await rest(`lista_cekanja?select=id,ref_kod,token,potvrdeno_at&email=eq.${encodeURIComponent(email)}&limit=1`)).json();
  const fields = {
    platforma,
    izvor,
    ...(grad && { grad }),
    ...(kvart && { kvart }),
    ...(ime && { ime }),
    ...(pozvao && { pozvao }),
    updated_at: new Date().toISOString(),
  };
  if (found[0]) {
    const r = found[0];
    if (r.potvrdeno_at) return { already: true, ref: r.ref_kod };
    const [row] = await (await rest(`lista_cekanja?id=eq.${r.id}`, { method: "PATCH", body: fields, prefer: "return=representation" })).json();
    return { token: row.token, ref: row.ref_kod };
  }
  for (let i = 0; i < 4; i++) {
    try {
      const [row] = await (
        await rest("lista_cekanja", { method: "POST", body: { email, ref_kod: noviKod(), ...fields }, prefer: "return=representation" })
      ).json();
      return { token: row.token, ref: row.ref_kod };
    } catch (e) {
      if (!/ref_key|23505/.test(String(e)) || /email_key|ime_key/.test(String(e))) throw e;
    }
  }
  throw new Error("ref kod");
}

export async function potvrdi(token) {
  if (!/^[0-9a-f-]{36}$/i.test(token || "")) return null;
  const rows = await (
    await rest(`lista_cekanja?token=eq.${token}&potvrdeno_at=is.null`, {
      method: "PATCH",
      body: { potvrdeno_at: new Date().toISOString() },
      prefer: "return=representation",
    })
  ).json();
  if (rows[0]) return rows[0];
  const again = await (await rest(`lista_cekanja?token=eq.${token}&select=*`)).json();
  return again[0] || null;
}

export async function poRefu(ref) {
  if (!/^[A-Z2-9]{6}$/.test(ref || "")) return null;
  const rows = await (await rest(`lista_cekanja?ref_kod=eq.${ref}&potvrdeno_at=not.is.null&select=ref_kod,ime,grad,kvart`)).json();
  return rows[0] || null;
}

export async function pozvani(ref) {
  const res = await rest(`lista_cekanja?pozvao=eq.${esc(ref)}&potvrdeno_at=not.is.null&select=id`, { prefer: "count=exact", method: "HEAD" });
  return Number((res.headers.get("content-range") || "*/0").split("/")[1]) || 0;
}

export async function ukupno() {
  const res = await rest("lista_cekanja?potvrdeno_at=not.is.null&select=id", { prefer: "count=exact", method: "HEAD", revalidate: 300 });
  return Number((res.headers.get("content-range") || "*/0").split("/")[1]) || 0;
}

export async function kvartovi(limit = 5) {
  return (await rest(`lista_kvartovi?select=grad,kvart,broj&order=broj.desc&limit=${limit}`, { revalidate: 300 })).json();
}

export async function imeSlobodno(ime) {
  const res = await rest("rpc/lista_ime_slobodno", { method: "POST", body: { p_ime: ime } });
  return (await res.json()) === true;
}

// ---------- Brevo ----------
async function brevo(path, body) {
  const res = await fetch(`https://api.brevo.com/v3${path}`, {
    method: "POST",
    // Brevo iza Cloudflarea odbija zahtjeve bez User-Agenta (greška 1010).
    headers: { "api-key": process.env.BREVO_API_KEY, "content-type": "application/json", accept: "application/json", "User-Agent": "lakat-web/1.0" },
    body: JSON.stringify(body),
  });
  if (!res.ok && res.status !== 204) {
    const t = await res.text().catch(() => "");
    if (!(res.status === 400 && /already exist|duplicate/i.test(t))) throw new Error(`brevo ${res.status} ${t}`.slice(0, 300));
  }
}

export async function posaljiPotvrdu(email, link) {
  // Brevo predložak „LAKAT · potvrda liste čekanja“ (Petar odobrio 2026-10-05); stari HTML ostaje kao rezerva.
  const tpl = Number(process.env.BREVO_TEMPLATE_POTVRDA);
  if (tpl) {
    await brevo("/smtp/email", { templateId: tpl, to: [{ email }], params: { link }, tags: ["lista-potvrda"] });
    return;
  }
  const html = `<!doctype html><html><body style="margin:0;background:#09090B;font-family:Arial,sans-serif;color:#F4F4F5">
<div style="max-width:480px;margin:0 auto;padding:40px 24px">
<p style="font-size:28px;font-weight:bold;margin:0 0 24px">LAKAT<span style="color:#4ADE80">.</span></p>
<p style="font-size:22px;font-weight:bold;margin:0 0 12px">Još jedan klik i na listi si.</p>
<p style="font-size:16px;line-height:1.5;color:#C9C9CF;margin:0 0 28px">Potvrdi da je ovo tvoj mail. Javim ti 1. 12. u podne kad LAKAT izađe. Do tada ništa.</p>
<a href="${link}" style="display:inline-block;background:#4ADE80;color:#052e16;font-weight:bold;font-size:16px;text-decoration:none;padding:14px 26px;border-radius:999px">Potvrdi mail</a>
<p style="font-size:13px;color:#8B8B94;margin:32px 0 0">Nisi se ti upisao? Samo ignoriraj ovaj mail i nećeš dobiti ništa više.</p>
</div></body></html>`;
  await brevo("/smtp/email", {
    sender: { email: process.env.BREVO_SENDER, name: "LAKAT" },
    to: [{ email }],
    subject: "Potvrdi mail i na listi si",
    htmlContent: html,
    tags: ["lista-potvrda"],
  });
}

export async function uListu(row) {
  const listId = Number(process.env.BREVO_LIST_ID);
  if (!listId) return;
  await brevo("/contacts", {
    email: row.email,
    listIds: [listId],
    updateEnabled: true,
    ...(process.env.BREVO_ATTRS === "1" && {
      attributes: { PLATFORMA: row.platforma, IZVOR: row.izvor, GRAD: row.grad || "", KVART: row.kvart || "" },
    }),
  });
}
