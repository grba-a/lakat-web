"use client";

// Živi dijelovi /admin ploče: brojevi koji se odbroje do vrijednosti, auto-osvježavanje i aktivni odjeljak.
// Sve poštuje „smanji pokret": tada se brojevi odmah pokažu, a osvježavanje i dalje radi.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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

// Označi odjeljak koji je trenutno na ekranu. Vodoravno (mobitel) ili okomito (lijevi izbornik na velikom ekranu).
const BOJE = { korisnici: "#7DD3FC", aktivnost: "#C4B5FD", tehnika: "#A7B4C6" };
export function Izbornik({ odjeljci, vertikalno = false }) {
  const [aktivan, setAktivan] = useState(odjeljci[0]?.[0]);
  useEffect(() => {
    const els = odjeljci.map(([id]) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (unosi) => {
        const vidljiv = unosi.filter((u) => u.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vidljiv) setAktivan(vidljiv.target.id);
      },
      { rootMargin: "-25% 0px -65% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [odjeljci]);
  return (
    <div className={vertikalno ? "flex flex-col" : "-mx-4 flex overflow-x-auto px-4 [scrollbar-width:none]"}>
      {odjeljci.map(([id, ime, znak, grupa], i) => (
        <a
          key={id}
          href={`#${id}`}
          aria-current={id === aktivan ? "true" : undefined}
          style={{ "--odj": BOJE[grupa] }}
          className={`odj chip mono flex h-10 shrink-0 items-center gap-2 border border-[color:var(--a-line)] px-3 text-[11px] text-[color:var(--a-mute)] ${vertikalno ? "-mt-px first:mt-0" : "-ml-px first:ml-0"}`}
        >
          <span className="opacity-60">{String(i + 1).padStart(2, "0")}</span>
          <span className="znak w-7">{znak}</span>
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
    const tipka = (e) => {
      if (e.key === "Escape") setTip(null);
    };
    document.addEventListener("keydown", tipka);
    document.addEventListener("pointerover", preko);
    document.addEventListener("pointermove", pomak, { passive: true });
    document.addEventListener("pointerdown", dodir);
    document.addEventListener("focusin", fokus);
    document.addEventListener("focusout", van);
    window.addEventListener("scroll", van, { passive: true });
    return () => {
      document.removeEventListener("keydown", tipka);
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
  // Uz vrh ekrana (ispod ljepljivog izbornika) tooltip ide ispod točke, inače iznad.
  const ispod = tip.y < 150;
  return (
    <div
      role="status"
      className={`mono pointer-events-none fixed z-[80] max-w-[180px] -translate-x-1/2 ${ispod ? "" : "-translate-y-full"} border border-[color:var(--a-live)] bg-[color:var(--a-panel)] px-2.5 py-1.5 text-[11px] normal-case tracking-[0.03em] text-[color:var(--a-fg)] shadow-[0_0_0_1px_#000]`}
      style={{ left: x, top: ispod ? tip.y + 18 : tip.y - 10 }}
    >
      {tip.text}
    </div>
  );
}

// Tražilica po ploči: „/" ili ⌘K (Ctrl+K), ili gumb. Bez kvačica: „kafic" nađe „Kafić".
const sklopi = (s) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function Trazilica({ stavke }) {
  const [otvoreno, setOtvoreno] = useState(false);
  const [upit, setUpit] = useState("");
  const [oznacen, setOznacen] = useState(0);
  const ulaz = useRef(null);

  useEffect(() => {
    const otvori = () => {
      setUpit("");
      setOznacen(0);
      setOtvoreno(true);
    };
    const tipka = (e) => {
      const uPolju = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? "");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !uPolju)) {
        e.preventDefault();
        otvori();
      } else if (e.key === "Escape") setOtvoreno(false);
    };
    const gumb = () => otvori();
    document.addEventListener("keydown", tipka);
    window.addEventListener("adm-trazi", gumb);
    return () => {
      document.removeEventListener("keydown", tipka);
      window.removeEventListener("adm-trazi", gumb);
    };
  }, []);

  const rezultati = useMemo(() => {
    const q = sklopi(upit).trim();
    if (!q) return stavke.filter((s) => s.vrsta === "odjeljak");
    return stavke
      .map((s) => {
        const t = sklopi(s.t);
        const sve = sklopi(`${s.t} ${s.o} ${s.d ?? ""}`);
        const bod = t.startsWith(q) ? 3 : t.split(/\s+/).some((w) => w.startsWith(q)) ? 2 : sve.includes(q) ? 1 : 0;
        return { s, bod };
      })
      .filter((x) => x.bod)
      .sort((a, b) => b.bod - a.bod)
      .slice(0, 12)
      .map((x) => x.s);
  }, [upit, stavke]);

  const idi = (s) => {
    setOtvoreno(false);
    const el = document.getElementById(s.id);
    if (!el) return;
    el.scrollIntoView({ block: "start" });
    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");
  };

  if (!otvoreno) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/70 px-4 pt-[12vh]" onPointerDown={(e) => e.target === e.currentTarget && setOtvoreno(false)}>
      <div role="dialog" aria-label="Traži po ploči" className="trazi w-full max-w-xl border border-[color:var(--a-live)] bg-[color:var(--a-panel)]">
        <div className="flex items-center gap-2 border-b border-[color:var(--a-line)] px-3">
          <span className="mono up text-[13px]">/</span>
          <input
            ref={ulaz}
            autoFocus
            value={upit}
            onChange={(e) => {
              setUpit(e.target.value);
              setOznacen(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOznacen((i) => Math.min(i + 1, rezultati.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setOznacen((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter" && rezultati[oznacen]) idi(rezultati[oznacen]);
            }}
            placeholder="igra, push, kafić, baza…"
            aria-label="Traži"
            className="h-12 w-full bg-transparent font-[family-name:var(--a-mono)] text-[16px] text-[color:var(--a-fg)] outline-none placeholder:text-[color:var(--a-mute)]"
          />
          <kbd className="lbl">ESC</kbd>
        </div>
        <ul className="max-h-[55vh] overflow-y-auto">
          {rezultati.length === 0 && <li className="mono px-3 py-3 text-[11px] normal-case text-[color:var(--a-mute)]">Ništa za „{upit}“.</li>}
          {rezultati.map((s, i) => (
            <li key={`${s.id}-${s.t}`}>
              <button
                type="button"
                onClick={() => idi(s)}
                onPointerMove={() => setOznacen(i)}
                className={`flex min-h-11 w-full items-baseline justify-between gap-3 border-b border-[color:var(--a-line)] px-3 py-2 text-left ${i === oznacen ? "bg-[#161a17]" : ""}`}
              >
                <span className="mono text-[12px] normal-case tracking-[0.02em] text-[color:var(--a-fg)]">
                  {i === oznacen ? <span className="up">› </span> : null}
                  {s.t}
                  {s.d ? <span className="text-[color:var(--a-mute)]"> · {s.d}</span> : null}
                </span>
                <span className="lbl shrink-0">{s.o}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function TraziGumb({ className = "" }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("adm-trazi"))}
      className={`chip mono flex h-10 items-center gap-2 border border-[color:var(--a-line)] px-3 text-[11px] text-[color:var(--a-mute)] ${className}`}
    >
      <span className="up">/</span> TRAŽI
      <kbd className="hidden opacity-60 md:inline">⌘K</kbd>
    </button>
  );
}
