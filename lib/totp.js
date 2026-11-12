// 2FA za /admin (faza 3, Petar 12. 11.): TOTP po RFC 6238 (30 s, 6 znamenki, SHA-1), bez dodatnih paketa.
// Tajna je u ADMIN_TOTP (Vercel Sensitive + ~/.config/lakat/admin-totp, nikad u repo), u Passwords na iPhoneu.
import { createHmac, timingSafeEqual } from "node:crypto";

const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32(s) {
  const cist = String(s).toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bitovi = 0, vrijednost = 0;
  const out = [];
  for (const z of cist) {
    vrijednost = (vrijednost << 5) | ABC.indexOf(z);
    bitovi += 5;
    if (bitovi >= 8) {
      out.push((vrijednost >>> (bitovi - 8)) & 255);
      bitovi -= 8;
    }
  }
  return Buffer.from(out);
}

function kod(kljuc, korak) {
  const b = Buffer.alloc(8);
  b.writeBigUInt64BE(BigInt(korak));
  const h = createHmac("sha1", kljuc).update(b).digest();
  const o = h[h.length - 1] & 15;
  const n = ((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1_000_000).padStart(6, "0");
}

export function dvaFaktora() {
  return (process.env.ADMIN_TOTP || "").replace(/[^A-Za-z2-7]/g, "").length >= 16;
}

// Vraća korak (broj 30-sekundnog prozora) za točan kod, inače null. Dopušta jedan korak ranije ili kasnije (sat na mobitelu).
export function provjeriKod(unos, sad = Date.now()) {
  if (!dvaFaktora()) return null;
  const cist = String(unos || "").replace(/\D/g, "");
  if (cist.length !== 6) return null;
  const kljuc = base32(process.env.ADMIN_TOTP);
  const t = Math.floor(sad / 1000 / 30);
  for (const k of [t, t - 1, t + 1]) {
    if (timingSafeEqual(Buffer.from(kod(kljuc, k)), Buffer.from(cist))) return k;
  }
  return null;
}
