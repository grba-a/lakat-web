"use client";

import { track } from "@vercel/analytics";
import { useEffect, useState } from "react";

// Krigla tapete za mobitel (Petar n6). Treća („psst“) je nagrada iz lova na Krigle (n5).
const LOV_KEY = "lakat-lov";
const TAPETE = [
  { n: 1, ime: "Puna Krigla" },
  { n: 2, ime: "Krigla maše" },
  { n: 3, ime: "Psst", nagrada: true },
];

// Zaključana tapeta nije link (nema kamo voditi), otključana se preuzima.
function Wrap({ zakljucano, children, ...a }) {
  if (zakljucano) return <div className="grid gap-2">{children}</div>;
  return (
    <a {...a} className="group grid gap-2">
      {children}
    </a>
  );
}

export function Tapete() {
  const [lov, setLov] = useState(false);
  useEffect(() => {
    const sync = () => {
      try {
        setLov(JSON.parse(localStorage.getItem(LOV_KEY) || "[]").length >= 5);
      } catch {}
    };
    const t = setTimeout(sync, 0);
    window.addEventListener("lakat-say", sync);
    return () => {
      clearTimeout(t);
      window.removeEventListener("lakat-say", sync);
    };
  }, []);

  return (
    <section data-krigla="Stavi me na zaključani ekran." className="mx-auto grid max-w-3xl gap-6 px-5 py-20">
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Pozadine za mobitel</span>
      <h2 className="font-display text-[clamp(40px,11vw,52px)] leading-[0.95] uppercase text-balance">
        Krigla na zaključanom ekranu<span className="text-accent">.</span>
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {TAPETE.map((t) => {
          const zakljucano = t.nagrada && !lov;
          return (
            <Wrap
              key={t.n}
              zakljucano={zakljucano}
              href={`/img/tapete/lakat-tapeta-${t.n}.jpg`}
              download={`lakat-tapeta-${t.n}.jpg`}
              onClick={() => track("tapeta_tap", { n: t.n })}
            >
              <span className="relative block overflow-hidden rounded-2xl border border-line">
                <img
                  src={`/img/tapete/mala-${t.n}.webp`}
                  alt={t.ime}
                  width={300}
                  height={650}
                  loading="lazy"
                  className={`aspect-[9/19.5] w-full object-cover transition-[filter,scale] duration-500 ${zakljucano ? "blur-md brightness-50" : "group-hover:scale-[1.03]"}`}
                />
                {zakljucano && (
                  <span className="absolute inset-0 grid place-items-center p-2 text-center text-[12px] leading-snug font-semibold text-fg">
                    Nađi 5 skrivenih Krigli
                  </span>
                )}
              </span>
              <span className="text-center text-[13px] text-muted">{zakljucano ? "Zaključano" : "Preuzmi"}</span>
            </Wrap>
          );
        })}
      </div>
    </section>
  );
}
