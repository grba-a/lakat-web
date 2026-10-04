"use client";

import { useEffect, useRef, useState } from "react";
import { remaining } from "@/lib/launch";

const UNITS = [
  ["d", "dana"],
  ["h", "sati"],
  ["m", "min"],
  ["s", "sek"],
];

function pad(n) {
  return String(Math.min(99, n)).padStart(2, "0");
}

// Jedna pločica: kad se znamenka promijeni, preklopi se (CSS keyframe).
function Card({ digit }) {
  const ref = useRef(null);
  const prev = useRef(digit);
  useEffect(() => {
    if (prev.current === digit) return;
    prev.current = digit;
    const el = ref.current;
    if (!el) return;
    el.classList.remove("go");
    void el.offsetWidth;
    el.classList.add("go");
  }, [digit]);
  return (
    <span ref={ref} className="flip" suppressHydrationWarning>
      {digit}
    </span>
  );
}

// Preklopni timer do lansiranja. Server iscrta stanje u trenutku rendera,
// klijent odmah preuzme i odbrojava svake sekunde.
export function Countdown({ initial, cardWidth, className = "" }) {
  const [t, setT] = useState(initial);
  useEffect(() => {
    const first = remaining();
    const wasCounting = first.d + first.h + first.m + first.s > 0;
    const id = setInterval(() => {
      const r = remaining();
      setT(r);
      // Nula: povuci svjež HTML sa store gumbima umjesto timera.
      // Samo ako je nula pala dok je stranica otvorena, inače bi se vrtjela u krug.
      if (wasCounting && r.d + r.h + r.m + r.s === 0) {
        clearInterval(id);
        setTimeout(() => window.location.reload(), 1500);
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={`flex justify-center gap-2.5 ${className}`}
      style={cardWidth ? { "--cw": `${cardWidth}px` } : undefined}
      role="timer"
      aria-label={`Još ${t.d} dana, ${t.h} sati i ${t.m} minuta`}
    >
      {UNITS.map(([k, label]) => {
        const v = pad(t[k]);
        return (
          <div key={k} className="grid justify-items-center gap-1.5" aria-hidden="true">
            <div className="flex gap-[3px]">
              <Card digit={v[0]} />
              <Card digit={v[1]} />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
