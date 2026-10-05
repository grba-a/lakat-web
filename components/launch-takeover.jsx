"use client";

import { useEffect, useState } from "react";
import { LAUNCH, storeLink } from "@/lib/launch";
import { play } from "@/lib/sfx";

// Podne 1. 12. (Petar q3/w04): zadnjih 60 minuta timer preuzme ekran, a u 12:00 se digne
// metalna roleta šanka. `?roleta=demo` pokaže isto s odbrojavanjem od 8 sekundi.
function pad(n) {
  return String(n).padStart(2, "0");
}

export function LaunchTakeover() {
  const [target, setTarget] = useState(LAUNCH);
  const [now, setNow] = useState(0);
  const [closed, setClosed] = useState(false);
  const [up, setUp] = useState(false);

  useEffect(() => {
    // Demo samo izvan prave domene (Petar, prelazak 2026-10-05): na laktarenje.com ga nitko ne vidi slučajno.
    const demo = !/laktarenje\.com$/.test(window.location.hostname) && new URLSearchParams(window.location.search).get("roleta") === "demo";
    const t0 = setTimeout(() => {
      if (demo) setTarget(Date.now() + 8000);
      setNow(Date.now());
    }, 0);
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => {
      clearTimeout(t0);
      clearInterval(id);
    };
  }, []);

  const left = target - now;
  const opened = now > 0 && left <= 0;
  const show = now > 0 && !closed && left < 60 * 60 * 1000 && left > -15000;

  useEffect(() => {
    if (!opened || up) return;
    const t = setTimeout(() => {
      setUp(true);
      play("kasa");
    }, 300);
    return () => clearTimeout(t);
  }, [opened, up]);

  if (!show) return null;
  const s = Math.max(0, Math.ceil(left / 1000));
  const link = storeLink("web-roleta");

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-hidden bg-bg" role="dialog" aria-label="Lansiranje">
      {/* Iza rolete: otvoren šank. */}
      <div className="absolute inset-0 grid place-items-center px-5 text-center">
        <div className="dots-lg absolute inset-0 opacity-40" aria-hidden="true" />
        {up && <div className="burst pointer-events-none absolute inset-0" aria-hidden="true" />}
        <div className="relative grid justify-items-center gap-6">
          <p className="font-display text-[clamp(56px,16vw,140px)] leading-[0.9] uppercase">
            Šank je otvoren<span className="text-accent">.</span>
          </p>
          <a
            href={link || "/"}
            className="inline-flex min-h-[56px] items-center rounded-full bg-accent px-8 text-[17px] font-bold text-[#052e16]"
          >
            {link ? "Skini LAKAT" : "Na stranicu"}
          </a>
        </div>
      </div>

      {/* Roleta s odbrojavanjem. */}
      <div
        className={`roleta absolute inset-0 grid place-items-center transition-transform duration-[1600ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${up ? "-translate-y-[102%]" : "translate-y-0"}`}
      >
        <div className="grid justify-items-center gap-4 px-5 text-center">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#c9c9cf]">Šank se otvara za</p>
          <p className="font-display text-[clamp(84px,26vw,220px)] leading-none text-fg tabular-nums [text-shadow:0_4px_0_#111]">
            {pad(Math.floor(s / 60))}:{pad(s % 60)}
          </p>
          <span className="h-2 w-40 rounded-full bg-[#1f2025] shadow-[inset_0_1px_2px_#000]" aria-hidden="true" />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setClosed(true)}
        aria-label="Zatvori"
        className="absolute top-[max(12px,env(safe-area-inset-top))] right-3 z-10 grid size-11 place-items-center rounded-full bg-black/40 text-fg"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}
