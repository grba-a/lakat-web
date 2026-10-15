"use client";

import { useEffect, useRef, useState } from "react";

// „Vide te samo pajdaši.“ se pali riječ po riječ dok skrolaš, a polje točkica se ugasi
// osim tebe i tri pajdaša (Petar w29). Bez JS-a i sa smanjenim kretanjem sve je upaljeno.
// Obećanje je usklađeno s aplikacijom (c-privatnost-pajdasi): javna runda postoji, ali samo kad je sam upališ.
const WORDS = ["Vide", "te", "samo", "pajdaši"];
// Ti (bijela) i tri pajdaša, u donjem rubu sekcije (px od dna), da ne padnu preko naslova ni Krigle.
const FRIENDS = [
  ["50%", 51, true],
  ["38%", 77],
  ["63%", 86],
  ["57%", 26],
];

// `children` = Krigla koja se puni s listom (KriglaListe, server). Vizual sekcije, ne druga tema (Petar 16. 10.).
export function PrivacyWords({ children = null }) {
  const ref = useRef(null);
  const [lit, setLit] = useState(WORDS.length);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    function update() {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 kad vrh sekcije uđe na dno ekrana, 1 kad je sredina sekcije na 40 % visine.
      const p = (vh - r.top) / (vh * 0.6 + r.height * 0.5);
      setLit(Math.max(0, Math.min(WORDS.length, Math.floor(p * (WORDS.length + 1)))));
    }
    function onScroll() {
      if (!raf) raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const done = lit >= WORDS.length;

  return (
    <section ref={ref} className="relative isolate overflow-hidden" data-krigla="Ja ništa ne vidim. Stvarno.">
      <div
        className={`dots-lg pointer-events-none absolute inset-0 -z-10 transition-opacity duration-700 ${done ? "opacity-[0.07]" : "opacity-25"}`}
        aria-hidden="true"
      />
      {FRIENDS.map(([x, y, me], i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`pointer-events-none absolute -z-10 size-3 -translate-x-1/2 translate-y-1/2 rounded-full transition-[opacity,scale] duration-500 ${me ? "bg-fg" : "bg-accent"} ${
            done ? "scale-100 opacity-100 shadow-[0_0_18px_rgb(74_222_128/0.7)]" : "scale-50 opacity-0"
          }`}
          style={{ left: x, bottom: y, transitionDelay: `${i * 120}ms` }}
        />
      ))}
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-28">
        <h2 className="font-display text-[clamp(52px,15vw,64px)] leading-[0.92] uppercase text-balance md:text-[clamp(72px,8vw,128px)]">
          {WORDS.map((w, i) => (
            <span key={w} className={`transition-colors duration-300 ${i < lit ? (i === WORDS.length - 1 ? "text-accent" : "text-fg") : "text-[#2e2e34]"}`}>
              {w}
              {i === WORDS.length - 1 ? "." : " "}
            </span>
          ))}
        </h2>
        <div className={`grid gap-8 transition-opacity duration-500 md:grid-cols-[minmax(0,42ch)_auto] md:items-center md:justify-between md:gap-12 ${done ? "opacity-100" : "opacity-40"}`}>
          <p className="max-w-[42ch] text-[16px] text-soft text-pretty md:text-[19px]">
            Runde, fotke i gdje si vide samo pajdaši koje prihvatiš. Iznimka je javna runda, i to samo kad je sam upališ: 24 sata je vide ljudi u krugu od 1 km.
          </p>
          {children}
        </div>
      </div>
    </section>
  );
}
