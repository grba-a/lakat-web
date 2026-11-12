// /admin: šifra i brojke. Samo na serveru.
// Env (Vercel + .env.local, nikad u repo): LAKAT_ADMIN_LOZINKA. Bez nje /admin ne postoji (404).
// Kolačić = rok + HMAC ključem izvedenim iz šifre: nova šifra u Vercelu odjavljuje sve stare kolačiće.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const KOLACIC = "lakat_admin";
export const TRAJANJE_S = 60 * 60 * 24 * 30;

export function adminUkljucen() {
  return (process.env.LAKAT_ADMIN_LOZINKA || "").length >= 6;
}

const hash = (s) => createHash("sha256").update(String(s)).digest();
const potpis = (rok) =>
  createHmac("sha256", hash("lakat-admin:" + process.env.LAKAT_ADMIN_LOZINKA)).update(String(rok)).digest("base64url");

export function tocnaLozinka(unos) {
  if (!adminUkljucen()) return false;
  return timingSafeEqual(hash(unos), hash(process.env.LAKAT_ADMIN_LOZINKA));
}

export function noviKolacic() {
  const rok = Date.now() + TRAJANJE_S * 1000;
  return `${rok}.${potpis(rok)}`;
}

export async function jesamLiAdmin() {
  if (!adminUkljucen()) return false;
  const v = (await cookies()).get(KOLACIC)?.value || "";
  const [rok, sig] = v.split(".");
  if (!rok || !sig || !(Number(rok) > Date.now())) return false;
  const ocekivan = Buffer.from(potpis(rok));
  const dobiven = Buffer.from(sig);
  return ocekivan.length === dobiven.length && timingSafeEqual(ocekivan, dobiven);
}

// Poziv SQL funkcije tajnim ključem (samo server). Baca grešku ako baza ne odgovori, da pozivatelj može zatvoriti vrata.
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

// Otisak IP-a za brojač pokušaja: HMAC, ne sama adresa (docs/supabase-admin2.sql).
export function otisak(ip) {
  return createHmac("sha256", "lakat-admin-ip:" + process.env.LAKAT_ADMIN_LOZINKA).update(String(ip || "?")).digest("base64url").slice(0, 32);
}

// Zaštita od pogađanja, zajednička svim Vercel instancama (docs/supabase-admin2.sql).
// Vraća id pokušaja ili null (limit prijeđen ili baza ne odgovara: vrata ostaju zatvorena).
export async function pokusaj(o) {
  try {
    const id = await rpc("admin_pokusaj", { p_otisak: o });
    return typeof id === "number" ? id : null;
  } catch {
    return null;
  }
}

// 2FA (docs/supabase-admin9.sql): uspjeh samo ako isti 30-sekundni kod još nije iskorišten. Baza ne odgovara = ne.
export async function oznaciUspjeh2(id, korak) {
  try {
    return (await rpc("admin_uspjeh2", { p_id: id, p_korak: korak })) === true;
  } catch {
    return false;
  }
}

// Zadnjih 20 pokušaja prijave za ploču (bez IP-a).
export async function zadnjePrijave() {
  try {
    return (await rpc("admin_prijave_zadnje", {})) ?? [];
  } catch {
    return null;
  }
}

export async function oznaciUspjeh(id) {
  try {
    await rpc("admin_uspjeh", { p_id: id });
  } catch {}
}

// Sve brojke aplikacije jednim pozivom (docs/supabase-admin1.sql). Bez SQL-a vraća razlog, ne ruši stranicu.
export async function statistika(dana = 30) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return { greska: "Supabase nije spojen (SUPABASE_SECRET_KEY)." };
  try {
    const res = await fetch(`${url}/rest/v1/rpc/admin_statistika`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ p_dana: dana }),
      cache: "no-store",
    });
    if (res.status === 404) return { greska: "Pokreni docs/supabase-admin1.sql u SQL editoru (PROD)." };
    if (!res.ok) return { greska: `Baza je vratila ${res.status}.` };
    return { podaci: await res.json() };
  } catch {
    return { greska: "Baza se nije javila." };
  }
}

// Faza 1: sve brojke za razdoblje (7/30/90 dana) s usporedbom (docs/supabase-admin3.sql).
export async function pregled(dana = 30) {
  try {
    return { podaci: await rpc("admin_pregled", { p_dana: dana }) };
  } catch (e) {
    return { greska: String(e.message || e).includes("404") ? "Pokreni docs/supabase-admin3.sql (PROD)." : "Baza se nije javila." };
  }
}

// Zdravlje baze (docs/supabase-admin4.sql): veličina, spajanja, pohrana, tablice, promašaji admin šifre.
export async function baza() {
  try {
    return { podaci: await rpc("admin_baza", {}) };
  } catch {
    return { greska: "Baza se nije javila." };
  }
}

// Niz po danima za bilo koje razdoblje (docs/supabase-admin6.sql): duh prošlog razdoblja i mini grafovi.
export async function dnevno(od, doDana) {
  try {
    return { podaci: await rpc("admin_dnevno", { p_od: od, p_do: doDana }) };
  } catch {
    return { greska: "Niz po danima se nije učitao." };
  }
}

// Detalji jednog dana za ladicu.
export async function jedanDan(dan) {
  return rpc("admin_dan", { p_dan: dan });
}

// Dnevna snimka Instagrama (docs/supabase-admin7.sql): upiše današnje brojke i vrati niz za graf rasta.
export async function igSnimka(pratitelji, objave) {
  try {
    return await rpc("admin_ig_snimka", { p_pratitelji: pratitelji ?? null, p_objave: objave ?? null });
  } catch {
    return [];
  }
}
