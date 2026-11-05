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

// Jedna istina kao kartica: oznaka gore, rečenica ispod. `d` = kašnjenje ulaza u ms.
export function Istina({ oznaka, d = 0, children }) {
  return (
    <li data-reveal style={{ "--rv-d": `${d}ms` }} className="grid gap-1.5 rounded-2xl border border-line bg-surface/80 p-4 md:p-5">
      <span className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">{oznaka}</span>
      <span className="text-[16px] leading-snug text-soft text-pretty md:text-[17px]">{children}</span>
    </li>
  );
}

// `children` = Krigla koja se puni s listom (KriglaListe, server). Vizual sekcije, ne druga tema (Petar 16. 10.).
// `dodatak` = istine iz 1.1 ispod odlomka (sections.jsx, Privatnost11), samo kad je 1.1 upaljen.
export function PrivacyWords({ children = null, dodatak = null }) {
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
    <section ref={ref} id="privatnost" className="relative isolate scroll-mt-4 overflow-hidden" data-krigla="Ja ništa ne vidim. Stvarno.">
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
      {/* Raspored (Petar 5. 11., „bolji raspored, posebno na desktopu“): na mobitelu naslov, pa istine kao kartice,
          pa link na pravila. Na desktopu naslov i link lijevo, kartice desno, cijela širina iskorištena. */}
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-24 md:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] md:gap-x-16 md:gap-y-10 md:py-32">
        <h2 className="font-display text-[clamp(52px,15vw,64px)] leading-[0.92] uppercase text-balance md:col-start-1 md:row-start-1 md:self-end md:text-[clamp(64px,7.4vw,120px)]">
          {WORDS.map((w, i) => (
            <span key={w} className={`transition-colors duration-300 ${i < lit ? (i === WORDS.length - 1 ? "text-accent" : "text-fg") : "text-[#2e2e34]"}`}>
              {w}
              {i === WORDS.length - 1 ? "." : " "}
            </span>
          ))}
        </h2>
        <ul className={`grid content-start gap-3 transition-opacity duration-500 md:col-start-2 md:row-span-2 md:row-start-1 md:self-center ${done ? "opacity-100" : "opacity-40"}`}>
          <Istina oznaka="Pajdaši">Runde, fotke i gdje si vide samo pajdaši koje prihvatiš. To provodi baza, ne samo app.</Istina>
          <Istina oznaka="Javna runda" d={90}>
            Iznimka je javna runda, i to samo kad je sam upališ: 24 sata je vide ljudi u krugu od 1 km.
          </Istina>
          {dodatak}
        </ul>
        <div className="grid content-start justify-items-start gap-8 md:col-start-1 md:row-start-2">
          <a
            href="/privatnost"
            className="inline-flex min-h-[44px] items-center gap-2 text-[15px] font-semibold text-soft underline decoration-line underline-offset-4 hover:text-fg"
          >
            Sva pravila privatnosti
            <span aria-hidden="true" className="text-accent">→</span>
          </a>
          {children}
        </div>
      </div>
    </section>
  );
}
