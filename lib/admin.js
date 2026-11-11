// /admin: šifra i brojke. Samo na serveru.
// Env (Vercel + .env.local, nikad u repo): LAKAT_ADMIN_LOZINKA. Bez nje /admin ne postoji (404).
// Kolačić = rok + HMAC ključem izvedenim iz šifre: nova šifra u Vercelu odjavljuje sve stare kolačiće.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const KOLACIC = "lakat_admin";
export const TRAJANJE_S = 60 * 60 * 24 * 30;

export function adminUkljucen() {
  return (process.env.LAKAT_ADMIN_LOZINKA || "").length >= 16;
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
