"use client";

// Živi dijelovi /admin ploče: brojevi koji se odbroje do vrijednosti, auto-osvježavanje i aktivni odjeljak.
// Sve poštuje „smanji pokret": tada se brojevi odmah pokažu, a osvježavanje i dalje radi.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const useIsoLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;
const manjePokreta = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Prima već oblikovan tekst ("2.092", "11,6", "< 3"); odbroji samo ako je cijeli tekst broj.
export function Broj({ v, className }) {
  const tekst = String(v ?? "—");
  const ref = useRef(null);
  useIsoLayout(() => {
    const el = ref.current;
    if (!el || manjePokreta()) return;
    if (!/^-?[\d.]+(,\d+)?$/.test(tekst)) return;
    const decimala = tekst.includes(",") ? tekst.split(",")[1].length : 0;
    const cilj = Number(tekst.replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(cilj) || cilj === 0) return;
    const fmt = new Intl.NumberFormat("hr-HR", { minimumFractionDigits: decimala, maximumFractionDigits: decimala });
    const trajanje = 900;
    const t0 = performance.now();
    let id;
    const korak = (t) => {
      const x = Math.min(1, (t - t0) / trajanje);
      const e = 1 - Math.pow(1 - x, 4); // snažan ease-out
      el.textContent = fmt.format(cilj * e);
      if (x < 1) id = requestAnimationFrame(korak);
      else el.textContent = tekst;
    };
    el.textContent = fmt.format(0);
    id = requestAnimationFrame(korak);
    return () => cancelAnimationFrame(id);
  }, [tekst]);
  return (
    <span ref={ref} className={className}>
      {tekst}
    </span>
  );
}

// Svakih 60 s server ponovno izračuna brojke; pauza dok je kartica skrivena.
export function Osvjezi({ sekundi = 60 }) {
  const router = useRouter();
  const [ostalo, setOstalo] = useState(sekundi);
  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      setOstalo((s) => {
        if (s <= 1) {
          router.refresh();
          return sekundi;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [router, sekundi]);
  return (
    <span className="mono text-[11px] text-[color:var(--a-mute)]" aria-live="off">
      <span className="live-dot mr-2 align-middle" aria-hidden="true" />
      LIVE · SYNC {String(ostalo).padStart(2, "0")}s
    </span>
  );
}

// Označi odjeljak koji je trenutno na ekranu.
export function Izbornik({ odjeljci }) {
  const [aktivan, setAktivan] = useState(odjeljci[0]?.[0]);
  useEffect(() => {
    const els = odjeljci.map(([id]) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (unosi) => {
        const vidljiv = unosi.filter((u) => u.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vidljiv) setAktivan(vidljiv.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [odjeljci]);
  return (
    <div className="-mx-4 flex overflow-x-auto px-4 [scrollbar-width:none]">
      {odjeljci.map(([id, ime], i) => (
        <a
          key={id}
          href={`#${id}`}
          aria-current={id === aktivan ? "true" : undefined}
          className="chip mono flex h-10 shrink-0 items-center border border-[color:var(--a-line)] px-3 text-[11px] text-[color:var(--a-mute)] -ml-px first:ml-0"
        >
          <span className="mr-1.5 opacity-60">{String(i + 1).padStart(2, "0")}</span>
          {ime}
        </a>
      ))}
    </div>
  );
}
