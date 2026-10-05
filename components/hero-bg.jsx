"use client";

import { useEffect, useRef } from "react";

// Pozadina heroja (Petar w27): polje točkica složi obalu Jadrana i Balkan, gradovi tiho pulsiraju,
// a na desktopu miš radi kao svjetiljka. Pulsevi su ukras: nikakvi brojevi ni ljudi.
const CITIES = [
  ["Zagreb", 33.2, 19.3],
  ["Rijeka", 20.3, 26.0],
  ["Zadar", 26.9, 42.8],
  ["Split", 37.0, 51.3],
  ["Dubrovnik", 50.7, 63.2],
  ["Osijek", 55.8, 22.9],
  ["Ljubljana", 20.9, 15.8],
  ["Sarajevo", 53.4, 46.4],
  ["Beograd", 70.5, 33.5],
];

export function HeroBg() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          el.style.setProperty("--mx", `${x}px`);
          el.style.setProperty("--my", `${y}px`);
          el.style.setProperty("--lamp", "1");
        });
    };
    const leave = () => el.style.setProperty("--lamp", "0");
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="dots-lg absolute inset-0 opacity-[0.12]" />
      <div className="absolute top-1/2 left-1/2 aspect-[1000/834] w-[max(170%,760px)] -translate-x-[54%] -translate-y-1/2 md:w-[115%] md:-translate-x-1/2">
        <div className="land-dots absolute inset-0" />
        {CITIES.map(([name, x, y], i) => (
          <span key={name} className="city-dot" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(i * 0.7) % 4}s` }} />
        ))}
      </div>
      <div className="lamp absolute inset-0" />
    </div>
  );
}
