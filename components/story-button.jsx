"use client";

import { track } from "@vercel/analytics";
import { useState } from "react";

// „Spremi za Story“ (Petar n1): slika 9:16 ide ravno u sistemsko dijeljenje (Instagram story),
// a gdje to ne ide, otvori se slika pa je spremiš.
export function StoryButton({ className = "" }) {
  const [state, setState] = useState("");
  async function save() {
    track("story_tap");
    setState("…");
    try {
      const res = await fetch("/api/story");
      const blob = await res.blob();
      const file = new File([blob], "lakat-odbrojavanje.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "LAKAT." });
        setState("");
        return;
      }
      window.open(URL.createObjectURL(blob), "_blank");
      setState("");
    } catch {
      setState("");
    }
  }
  return (
    <button
      type="button"
      onClick={save}
      className={`inline-flex min-h-[48px] items-center gap-2 rounded-full border border-line px-5 text-[15px] font-semibold text-fg active:scale-[0.98] ${className}`}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="6" y="2" width="12" height="20" rx="3" />
        <path d="M12 8v6m-3-3 3 3 3-3" />
      </svg>
      {state || "Spremi za Story"}
    </button>
  );
}
