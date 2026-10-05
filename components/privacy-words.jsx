"use client";

import { useEffect, useRef, useState } from "react";

// „Vidi te samo tvoj pajdaš.“ se pali riječ po riječ dok skrolaš, a polje točkica se ugasi
// osim tebe i tri pajdaša (Petar w29). Bez JS-a i sa smanjenim kretanjem sve je upaljeno.
const WORDS = ["Vidi", "te", "samo", "tvoj", "pajdaš"];
// Ti (bijela) i tri pajdaša, ispod teksta da ne padnu preko naslova.
const FRIENDS = [
  ["50%", "88%", true],
  ["38%", "82%"],
  ["63%", "80%"],
  ["57%", "94%"],
];

export function PrivacyWords() {
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
    <section ref={ref} className="relative isolate overflow-hidden">
      <div
        className={`dots-lg pointer-events-none absolute inset-0 -z-10 transition-opacity duration-700 ${done ? "opacity-[0.07]" : "opacity-25"}`}
        aria-hidden="true"
      />
      {FRIENDS.map(([x, y, me], i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`pointer-events-none absolute -z-10 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[opacity,scale] duration-500 ${me ? "bg-fg" : "bg-accent"} ${
            done ? "scale-100 opacity-100 shadow-[0_0_18px_rgb(74_222_128/0.7)]" : "scale-50 opacity-0"
          }`}
          style={{ left: x, top: y, transitionDelay: `${i * 120}ms` }}
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
        <p className={`max-w-[40ch] text-[16px] text-soft text-pretty transition-opacity duration-500 md:text-[19px] ${done ? "opacity-100" : "opacity-40"}`}>
          Javno objavljuješ samo kad ti to uključiš. „Vani sam“ se sam ugasi kad odeš.
        </p>
      </div>
    </section>
  );
}
