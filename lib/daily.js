// Igra dana na webu (Petar w10): ista staza za sve, mijenja se u ponoć po Zagrebu.
export function todayKey(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zagreb" }).format(d); // YYYY-MM-DD
}

// mulberry32: mali, brz i dovoljno dobar za raspored prepreka.
export function seeded(key) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  let a = h >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Prvi rezultat dana je „službeni“; ostali su trening.
const KEY = "lakat-igra-dana";
export function readDaily() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    return v && v.day === todayKey() ? v : null;
  } catch {
    return null;
  }
}
// Partija s 0 bodova se ne broji kao pokušaj (isto pravilo kao igra dana u aplikaciji).
export function saveDaily(score) {
  try {
    if (score <= 0 || readDaily()) return;
    localStorage.setItem(KEY, JSON.stringify({ day: todayKey(), score }));
  } catch {}
}

export function parseScore(r) {
  const n = Number.parseInt(String(r), 10);
  return Number.isFinite(n) && n >= 0 && n <= 999 ? n : null;
}
