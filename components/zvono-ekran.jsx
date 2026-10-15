"use client";

import { useEffect, useState } from "react";

// „Sad ili nikad“ (c-sad-ili-nikad): ekran iz aplikacije još nemamo snimljen, pa ga crtamo.
// Jasno označen primjer: zvono, dvije minute, okidač. Kad je ekran aktivan, sat stvarno odbrojava.
export function ZvonoEkran({ on = false }) {
  const [s, setS] = useState(120);
  useEffect(() => {
    if (!on) return;
    const t0 = setTimeout(() => setS(120), 0);
    const id = setInterval(() => setS((v) => (v > 0 ? v - 1 : 120)), 1000);
    return () => {
      clearTimeout(t0);
      clearInterval(id);
    };
  }, [on]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0b0b0d]" aria-hidden="true">
      <div className="dots breathe absolute -inset-[4%] opacity-25" />
      <div className="zvono-okvir absolute inset-x-[9%] top-[26%] bottom-[27%]" />
      <div className="absolute inset-x-0 top-[38%] grid justify-items-center gap-[calc(var(--w)*0.02)]">
        <span className="font-mono tracking-[0.16em] text-muted uppercase" style={{ fontSize: "calc(var(--w) * 0.04)" }}>
          Sad ili nikad
        </span>
        <span className="font-display leading-none text-accent tabular-nums" style={{ fontSize: "calc(var(--w) * 0.24)" }} suppressHydrationWarning>
          {Math.floor(s / 60)}:{String(s % 60).padStart(2, "0")}
        </span>
      </div>
      <span
        className="absolute bottom-[9%] left-1/2 aspect-square -translate-x-1/2 rounded-full border-fg bg-fg/10"
        style={{ width: "calc(var(--w) * 0.19)", borderWidth: "calc(var(--w) * 0.014)" }}
      />
      <span
        className="absolute bottom-[21%] left-1/2 -translate-x-1/2 rotate-[-4deg] rounded-md border-2 border-amber px-2 py-1 font-mono whitespace-nowrap text-amber uppercase"
        style={{ fontSize: "calc(var(--w) * 0.04)" }}
      >
        Primjer zvona
      </span>
    </div>
  );
}
