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

// Jedan tooltip za cijelu ploču: svaki element s data-tip pokaže vrijednost
// na prelazak mišem, na dodir (mobitel) i na fokus tipkovnicom. Grafovi ostaju server komponente.
export function Savjet() {
  const [tip, setTip] = useState(null);
  useEffect(() => {
    const nadji = (el) => (el && el.closest ? el.closest("[data-tip]") : null);
    const pokazi = (el, x, y) => {
      const t = nadji(el);
      if (!t) return false;
      const r = t.getBoundingClientRect();
      setTip({ text: t.getAttribute("data-tip"), x: x ?? r.left + r.width / 2, y: y ?? r.top });
      return true;
    };
    const preko = (e) => {
      if (e.pointerType === "touch") return;
      if (!pokazi(e.target, e.clientX, e.clientY)) setTip(null);
    };
    const pomak = (e) => {
      if (e.pointerType === "touch") return;
      if (nadji(e.target)) setTip((s) => (s ? { ...s, x: e.clientX, y: e.clientY } : s));
    };
    const dodir = (e) => {
      if (e.pointerType !== "touch") return;
      const t = nadji(e.target);
      if (t) {
        const r = t.getBoundingClientRect();
        pokazi(t, r.left + r.width / 2, r.top);
      } else setTip(null);
    };
    const fokus = (e) => pokazi(e.target);
    const van = () => setTip(null);
    document.addEventListener("pointerover", preko);
    document.addEventListener("pointermove", pomak, { passive: true });
    document.addEventListener("pointerdown", dodir);
    document.addEventListener("focusin", fokus);
    document.addEventListener("focusout", van);
    window.addEventListener("scroll", van, { passive: true });
    return () => {
      document.removeEventListener("pointerover", preko);
      document.removeEventListener("pointermove", pomak);
      document.removeEventListener("pointerdown", dodir);
      document.removeEventListener("focusin", fokus);
      document.removeEventListener("focusout", van);
      window.removeEventListener("scroll", van);
    };
  }, []);
  if (!tip) return null;
  // Iznad pokazivača; uz rub ekrana se ne reže.
  const sirina = typeof window !== "undefined" ? window.innerWidth : 400;
  const x = Math.min(Math.max(tip.x, 90), sirina - 90);
  return (
    <div
      role="status"
      className="mono pointer-events-none fixed z-[60] max-w-[180px] -translate-x-1/2 -translate-y-full border border-[color:var(--a-live)] bg-[color:var(--a-panel)] px-2.5 py-1.5 text-[11px] normal-case tracking-[0.03em] text-[color:var(--a-fg)] shadow-[0_0_0_1px_#000]"
      style={{ left: x, top: tip.y - 10 }}
    >
      {tip.text}
    </div>
  );
}
