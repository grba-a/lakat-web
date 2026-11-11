// App Store Connect API za /admin. Samo na serveru, samo čitanje.
// Env (Vercel + .env.local, nikad u repo): ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_P8_B64 (cijela .p8 datoteka u base64),
// ASC_VENDOR (broj iz Payments and Financial Reports; bez njega nema prednarudžbi ni preuzimanja).
// Ključ je izvorno u ~/.config/lakat/ na Petrovom Macu.
import { createPrivateKey, sign } from "node:crypto";
import { gunzipSync } from "node:zlib";

export const APP_ID = "6823792924";
const BASE = "https://api.appstoreconnect.apple.com";

export function ascReady() {
  return Boolean(process.env.ASC_KEY_ID && process.env.ASC_ISSUER_ID && process.env.ASC_KEY_P8_B64);
}

const b64url = (buf) => Buffer.from(buf).toString("base64url");

function token() {
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "ES256", kid: process.env.ASC_KEY_ID, typ: "JWT" }));
  const body = b64url(JSON.stringify({ iss: process.env.ASC_ISSUER_ID, iat: now, exp: now + 600, aud: "appstoreconnect-v1" }));
  const key = createPrivateKey(Buffer.from(process.env.ASC_KEY_P8_B64, "base64").toString("utf8"));
  const sig = sign("sha256", Buffer.from(`${head}.${body}`), { key, dsaEncoding: "ieee-p1363" });
  return `${head}.${body}.${b64url(sig)}`;
}

async function get(path, jwt) {
  const res = await fetch(BASE + path, { headers: { Authorization: `Bearer ${jwt}` }, cache: "no-store" });
  if (!res.ok) throw new Error(`ASC ${res.status} ${path.split("?")[0]}`);
  return res.json();
}

// Svaki dio zasebno: ako Apple odbije jedan (npr. uloga ključa), ostali se ipak prikažu.
async function dio(fn) {
  try {
    return { ok: true, ...(await fn()) };
  } catch (e) {
    return { ok: false, greska: String(e.message || e).slice(0, 120) };
  }
}

export async function ascPregled() {
  if (!ascReady()) return null;
  let jwt;
  try {
    jwt = token();
  } catch {
    return { greska: "Ključ se ne da pročitati (ASC_KEY_P8_B64)." };
  }

  const [verzija, build, testeri, recenzije] = await Promise.all([
    dio(async () => {
      const j = await get(`/v1/apps/${APP_ID}/appStoreVersions?limit=1&fields[appStoreVersions]=versionString,appStoreState`, jwt);
      const a = j.data?.[0]?.attributes ?? {};
      return { verzija: a.versionString ?? null, stanje: a.appStoreState ?? null };
    }),
    dio(async () => {
      const j = await get(`/v1/builds?filter[app]=${APP_ID}&sort=-uploadedDate&limit=1&fields[builds]=version,uploadedDate,processingState`, jwt);
      const a = j.data?.[0]?.attributes ?? {};
      return { broj: a.version ?? null, datum: a.uploadedDate ?? null, obrada: a.processingState ?? null };
    }),
    dio(async () => {
      const g = await get(`/v1/apps/${APP_ID}/betaGroups?fields[betaGroups]=name,publicLinkEnabled,publicLinkLimit&limit=20`, jwt);
      const grupe = await Promise.all(
        (g.data ?? []).map(async (x) => {
          const t = await get(`/v1/betaGroups/${x.id}/betaTesters?limit=200&fields[betaTesters]=state`, jwt);
          const sve = t.data ?? [];
          return {
            ime: x.attributes?.name ?? "—",
            ukupno: t.meta?.paging?.total ?? sve.length,
            instalirali: sve.filter((s) => s.attributes?.state === "INSTALLED").length,
            limit: x.attributes?.publicLinkEnabled ? x.attributes?.publicLinkLimit ?? null : null,
          };
        })
      );
      return { grupe };
    }),
    dio(async () => {
      const j = await get(`/v1/apps/${APP_ID}/customerReviews?limit=200&sort=-createdDate&fields[customerReviews]=rating`, jwt);
      const ocjene = (j.data ?? []).map((r) => r.attributes?.rating).filter((n) => typeof n === "number");
      return {
        ukupno: j.meta?.paging?.total ?? ocjene.length,
        prosjek: ocjene.length ? ocjene.reduce((s, n) => s + n, 0) / ocjene.length : null,
      };
    }),
  ]);

  const [prednarudzbe, preuzimanja] = await Promise.all([
    process.env.ASC_VENDOR ? dio(() => poDanima(jwt, "PRE_ORDER", "1_0", PREORDER_OD, IZLAZAK, prednarudzbeDana)) : null,
    process.env.ASC_VENDOR ? dio(() => poDanima(jwt, "SALES", "1_1", IZLAZAK, null, preuzimanjaDana)) : null,
  ]);

  return { verzija, build, testeri, recenzije, prednarudzbe, preuzimanja };
}

// Prodajni izvještaji (Sales and Trends): jedan gzip TSV po danu, Apple ga objavi dan kasnije.
// 404 = taj dan nije bilo ničega, nije greška. Treba ASC_VENDOR (Payments and Financial Reports).
const PREORDER_OD = "2026-11-05";
const IZLAZAK = "2026-12-01";
// Prva preuzimanja (ne nadogradnje): Appleovi kodovi vrste proizvoda za besplatnu aplikaciju.
const PRVO_PREUZIMANJE = new Set(["1", "1F", "1T", "F1"]);

async function dnevni(jwt, tip, verzija, dan) {
  const q = new URLSearchParams({
    "filter[frequency]": "DAILY",
    "filter[vendorNumber]": process.env.ASC_VENDOR,
    "filter[reportType]": tip,
    "filter[reportSubType]": "SUMMARY",
    "filter[version]": verzija,
    "filter[reportDate]": dan,
  });
  const res = await fetch(`${BASE}/v1/salesReports?${q}`, {
    headers: { Authorization: `Bearer ${jwt}`, Accept: "application/a-gzip" },
    cache: "no-store",
  });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`ASC ${res.status} salesReports`);
  const tekst = gunzipSync(Buffer.from(await res.arrayBuffer())).toString("utf8").trim();
  const [glava, ...redovi] = tekst.split("\n").map((l) => l.split("\t"));
  return redovi.map((r) => Object.fromEntries(glava.map((k, i) => [k.trim(), (r[i] ?? "").trim()])));
}

function prednarudzbeDana(redovi) {
  return {
    narudzbe: redovi.reduce((s, r) => s + (Number(r["Ordered"]) || 0), 0),
    otkazano: redovi.reduce((s, r) => s + (Number(r["Cancelled"]) || 0), 0),
  };
}

function preuzimanjaDana(redovi) {
  return {
    narudzbe: redovi
      .filter((r) => PRVO_PREUZIMANJE.has(r["Product Type Identifier"]))
      .reduce((s, r) => s + (Number(r["Units"]) || 0), 0),
    otkazano: 0,
  };
}

// Od `od` do jučer (ili do `do`), najviše 30 zadnjih dana. Prije `od` vraća null (npr. preuzimanja prije izlaska).
async function poDanima(jwt, tip, verzija, od, doDana, zbroj) {
  const jucer = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const kraj = doDana && doDana < jucer ? doDana : jucer;
  if (kraj < od) return { dani: [], ukupno: 0, otkazano: 0, nijePocelo: true };
  const dani = [];
  for (let d = new Date(kraj + "T00:00:00Z"); d.toISOString().slice(0, 10) >= od && dani.length < 30; d = new Date(d - 864e5)) {
    dani.unshift(d.toISOString().slice(0, 10));
  }
  const rezultati = await Promise.all(dani.map(async (dan) => ({ dan, ...zbroj(await dnevni(jwt, tip, verzija, dan)) })));
  return {
    dani: rezultati,
    ukupno: rezultati.reduce((s, r) => s + r.narudzbe, 0),
    otkazano: rezultati.reduce((s, r) => s + r.otkazano, 0),
  };
}
