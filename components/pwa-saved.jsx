"use client";

import { useEffect, useState } from "react";
import { remaining, storeLink } from "@/lib/launch";
import { OPEN_SHEET } from "./sticky-cta";

// Ekran za ljude koji imaju staru web aplikaciju na početnom ekranu (Petar d4, 2026-10-05).
// Prepozna se po načinu otvaranja (standalone). `?pwa=demo` ga pokaže u običnom pregledniku.
function pad(n) {
  return String(n).padStart(2, "0");
}

export function PwaSaved({ live = false }) {
  const [on, setOn] = useState(false);
  const [t, setT] = useState(null);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    // Demo samo izvan prave domene (Petar, prelazak 2026-10-05): na laktarenje.com ga nitko ne vidi slučajno.
    const demo = !/laktarenje\.com$/.test(window.location.hostname) && new URLSearchParams(window.location.search).get("pwa") === "demo";
    if (!standalone && !demo) return;
    const t0 = setTimeout(() => {
      setOn(true);
      setT(remaining());
    }, 0);
    const id = setInterval(() => setT(remaining()), 1000);
    return () => {
      clearTimeout(t0);
      clearInterval(id);
    };
  }, []);

  if (!on) return null;

  return (
    <div className="fixed inset-0 z-[55] grid place-items-center overflow-y-auto bg-bg px-6 py-10 text-center" role="dialog" aria-label="Račun ti je spremljen">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#12301d,transparent_70%)]" aria-hidden="true" />
      <div className="relative grid max-w-sm justify-items-center gap-5">
        <span className="font-display text-[20px] leading-none">
          LAKAT<span className="text-accent">.</span>
        </span>
        <img src="/img/krigla/mase.webp" alt="" width={160} height={160} className="float size-40 object-contain drop-shadow-[0_16px_40px_rgb(74_222_128/0.5)]" />
        <h1 className="font-display text-[clamp(44px,13vw,60px)] leading-[0.92] uppercase">
          Račun ti je spremljen<span className="text-accent">.</span>
        </h1>
        <p className="text-[16px] text-soft text-pretty">
          Web je otišao u penziju. Tvoj račun, pajdaši i bodovi te čekaju u pravoj aplikaciji.
        </p>
        {!live && t && (
          <div className="flex gap-2 font-display text-[26px] tabular-nums" aria-label={`Još ${t.d} dana`}>
            {[t.d, t.h, t.m, t.s].map((v, i) => (
              <span key={i} className="rounded-lg bg-surface-2 px-2.5 py-1.5">
                {pad(Math.min(99, v))}
              </span>
            ))}
          </div>
        )}
        <p className="text-[15px] text-muted">{live ? "Prijavi se istim podacima." : "1. 12. u podne. Prijavi se istim podacima."}</p>
        <button
          type="button"
          onClick={() => {
            if (live && storeLink("web-pwa")) return void (window.location.href = storeLink("web-pwa"));
            setOn(false);
            setTimeout(() => window.dispatchEvent(new Event(OPEN_SHEET)), 50);
          }}
          className="min-h-[52px] rounded-full bg-accent px-7 text-[16px] font-bold text-[#052e16]"
        >
          {live ? "Skini LAKAT" : "Javi mi kad izađe"}
        </button>
        <button type="button" onClick={() => setOn(false)} className="text-[14px] text-muted underline underline-offset-4">
          Pogledaj što stiže
        </button>
      </div>
    </div>
  );
}
