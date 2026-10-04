// Lansiranje: 1. 12. 2026. u 12:00 po zagrebačkom vremenu (CET = UTC+1).
// Petar, 2026-10-04: nula je u podne. Tada timer nestaje i dolaze store gumbi.
export const LAUNCH = Date.UTC(2026, 11, 1, 11, 0, 0);

// LAKAT_FORCE_LIVE=1 u .env.local prikaže stanje nakon lansiranja (samo za provjeru).
export function isLive(now = Date.now()) {
  if (process.env.LAKAT_FORCE_LIVE === "1") return true;
  return now >= LAUNCH;
}

export function remaining(now = Date.now()) {
  const s = Math.max(0, Math.floor((LAUNCH - now) / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export const INSTAGRAM = "https://www.instagram.com/lakat_app/";

// Link na App Store dolazi tek kad listing postoji (Petar ga upiše u Vercel env).
export const APP_STORE = process.env.NEXT_PUBLIC_APP_STORE_URL || "";
