import { track } from "@vercel/analytics";

// „Pošalji ekipi“: sistemsko dijeljenje na mobitelu, inače kopiranje linka.
export async function shareLakat() {
  const url = `${window.location.origin}/?src=share`;
  const text = "Šank se otvara 1. 12. u podne. Upiši se da ti jave:";
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
export function source() {
  try {
    const q = new URLSearchParams(window.location.search).get("src");
    if (q) sessionStorage.setItem("lakat-src", q.slice(0, 40));
    return sessionStorage.getItem("lakat-src") || "direkt";
  } catch {
    return "direkt";
  }
}

// Dijeljenje bilo kojeg linka na ovom webu (izazov u igri).
export async function shareText(path, text) {
  const url = `${window.location.origin}${path}${path.includes("?") ? "&" : "?"}src=izazov`;
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
