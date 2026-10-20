import { track } from "@/lib/korak";

// Moj osobni kod (?ref=) za „Dovedi pajdaša“: dobijem ga kad se upišem, a /potvrdeno ga potvrdi.
// Svaki gumb „Pošalji ekipi“ ga nosi (Codex referral-kod). Kod pajdaša koji je mene doveo je drugo (referrer()).
const MOJ_REF = "lakat-moj-ref";
const KOD = /^[A-Z2-9]{6}$/;
export function mojRef() {
  try {
    const v = localStorage.getItem(MOJ_REF) || "";
    return KOD.test(v) ? v : "";
  } catch {
    return "";
  }
}
export function spremiMojRef(kod) {
  try {
    if (KOD.test(kod || "")) localStorage.setItem(MOJ_REF, kod);
  } catch {}
}

// „Pošalji ekipi“: sistemsko dijeljenje na mobitelu, inače kopiranje linka.
export async function shareLakat(refKod = mojRef()) {
  const url = refKod ? `${window.location.origin}/?ref=${refKod}` : `${window.location.origin}/?src=share`;
  const text = "LAKAT, aplikacija za druženje s ekipom, stiže 1. 12. u podne. Rezerviraj svoje @ime:";
  track("share_tap");
  try {
    if (navigator.share) {
      await navigator.share({ title: "LAKAT.", text, url });
      return "shared";
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    return "copied";
  } catch {
    return "cancel";
  }
}

// Odakle je posjetitelj došao (?src=ig-bio, ig-story, share…), za Brevo atribut IZVOR.
// Osobni kod pajdaša iz linka (?ref=ABC123), za „Dovedi pajdaša“ (w06).
export function referrer() {
  try {
    const q = new URLSearchParams(window.location.search).get("ref");
    if (q && KOD.test(q) && q !== mojRef()) sessionStorage.setItem("lakat-ref", q);
    return sessionStorage.getItem("lakat-ref") || "";
  } catch {
    return "";
  }
}

export function source() {
  try {
    const p = new URLSearchParams(window.location.search);
    const q = p.get("src") || (p.get("ref") ? "pajdas" : "");
    if (q) sessionStorage.setItem("lakat-src", q.slice(0, 40));
    return sessionStorage.getItem("lakat-src") || "direkt";
  } catch {
    return "direkt";
  }
}

// Dijeljenje bilo kojeg linka na ovom webu (izazov u igri).
export async function shareText(path, text) {
  const ref = mojRef();
  const url = `${window.location.origin}${path}${path.includes("?") ? "&" : "?"}src=izazov${ref ? `&ref=${ref}` : ""}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: "LAKAT.", text, url });
      return "shared";
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    return "copied";
  } catch {
    return "cancel";
  }
}
