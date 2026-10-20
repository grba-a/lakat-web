"use client";

import { track as vercelTrack } from "@vercel/analytics";
import { source } from "./share";

// Isti track() kao prije, ali korak ide i u našu tablicu web_koraci (Vercel Hobby ne bilježi custom događaje).
// „cta_tap“ s { gdje } postaje cta_donji / cta_usred. Varijanta heroja (A/B test) čita se iz sessionStoragea.
export function track(name, props) {
  vercelTrack(name, props);
  const k = props?.gdje ? `${name.replace(/_tap$/, "")}_${props.gdje}` : name;
  korak(k);
}

export function korak(k) {
  try {
    let v = "-";
    try {
      v = sessionStorage.getItem("lakat-var") || "-";
    } catch {}
    const body = JSON.stringify({ k, izvor: source(), v });
    if (!navigator.sendBeacon?.("/api/korak", new Blob([body], { type: "application/json" }))) {
      fetch("/api/korak", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
    }
  } catch {}
}

// Jednom po posjetu (posjet, početak obrasca), da osvježavanje ne napuše brojač.
export function jednom(k) {
  try {
    if (sessionStorage.getItem(`lakat-k-${k}`)) return;
    sessionStorage.setItem(`lakat-k-${k}`, "1");
  } catch {}
  korak(k);
}
