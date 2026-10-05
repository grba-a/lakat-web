"use client";

import { track } from "@vercel/analytics";
import { useState } from "react";

function kapi(n) {
  const z = n % 10, zz = n % 100;
  return z === 1 && zz !== 11 ? "kap" : z >= 2 && z <= 4 && (zz < 12 || zz > 14) ? "kapi" : "kapi";
}

// Ulaznica za šank (w05) s osobnim kodom (w06). Slika za story dolazi s /api/ulaznica.
export function Ticket({ refKod, ime, mjesto, doveo }) {
  const [torn, setTorn] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save() {
    track("ticket_tap");
    setBusy(true);
    setTorn(true);
    try {
      const blob = await (await fetch(`/api/ulaznica?r=${refKod}`)).blob();
      const file = new File([blob], "lakat-ulaznica.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: "LAKAT." });
      else window.open(URL.createObjectURL(blob), "_blank");
    } catch {}
    setBusy(false);
  }

  return (
    <div className="grid gap-4">
      <div className="grid rotate-[-2deg] grid-cols-[1fr_84px] overflow-hidden rounded-2xl bg-[#f3f1ea] text-[#111] shadow-[0_24px_50px_-20px_rgb(0_0_0/0.8)]">
        <div className="grid gap-1 border-r-2 border-dashed border-[#bbb] p-5">
          <span className="font-mono text-[10px] tracking-[0.14em]">LAKAT. · ULAZ NA ŠANK</span>
          <b className="font-display text-[34px] leading-none font-normal">1. 12. · 12:00</b>
          <span className="font-display text-[22px] leading-tight">{ime ? `@${ime}` : "Pajdaš"}</span>
          {mjesto && <span className="text-[13px] text-[#555]">{mjesto}</span>}
        </div>
        <div className={`grid place-items-center font-mono text-[12px] tracking-widest transition-transform duration-500 [writing-mode:vertical-rl] ${torn ? "translate-x-6 rotate-6" : ""}`}>
          {refKod}
        </div>
      </div>
      <button type="button" onClick={save} disabled={busy} className="min-h-[52px] rounded-full bg-accent text-[16px] font-bold text-[#052e16] disabled:opacity-60">
        {busy ? "…" : "Spremi ulaznicu za Story"}
      </button>
      <p className="text-[14px] text-muted">
        {/* Napunite Kriglu (k4): tvoj upis je jedna kap, svaki pajdaš preko tvog linka još jedna. */}
        Ti si dolio {1 + doveo} {kapi(1 + doveo)} u Kriglu.{" "}
        {doveo > 0 ? `Preko tvog linka upisalo se ${doveo} ${doveo === 1 ? "pajdaš" : "pajdaša"}.` : "Pošalji link ekipi, svaki njihov upis je još jedna tvoja kap."}
      </p>
    </div>
  );
}
