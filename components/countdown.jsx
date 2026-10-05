"use client";

import { useEffect, useState } from "react";
import { remaining } from "@/lib/launch";
import { tick } from "@/lib/sfx";

const UNITS = [
  ["d", "dana"],
  ["h", "sati"],
  ["m", "min"],
  ["s", "sek"],
];

function pad(n) {
  return String(Math.min(99, n)).padStart(2, "0");
}

// Jedna pločica kao na kolodvoru (Petar w03): gornja polovica stare znamenke padne prema dolje,
// a donja polovica nove se spusti preko stare. Bez JS-a stoji mirna znamenka.
function Card({ digit }) {
  const [state, setState] = useState({ cur: digit, prev: digit, k: 0 });
  if (state.cur !== digit) {
    setState((s) => ({ cur: digit, prev: s.cur, k: s.k + 1 }));
  }
  const flipping = state.prev !== state.cur;
  useEffect(() => {
    if (!flipping) return;
    tick();
    // Sigurnosna mreža: smanjeno kretanje ili kartica u pozadini ne smiju ostaviti staru znamenku.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setState((s) => ({ ...s, prev: s.cur })), reduce ? 0 : 700);
    return () => clearTimeout(t);
  }, [state.k, flipping]);

  return (
    <span className="sf" suppressHydrationWarning>
      <span className="sf-h sf-t">
        <i>{state.cur}</i>
      </span>
      <span className="sf-h sf-b">
        <i>{flipping ? state.prev : state.cur}</i>
      </span>
      {flipping && (
        <>
          <span key={`t${state.k}`} className="sf-h sf-t sf-ft">
            <i>{state.prev}</i>
          </span>
          <span
            key={`b${state.k}`}
            className="sf-h sf-b sf-fb"
            onAnimationEnd={() => setState((s) => ({ ...s, prev: s.cur }))}
          >
            <i>{state.cur}</i>
          </span>
        </>
      )}
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
