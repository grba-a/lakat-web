"use client";

// TV način: okvir zida (zaglavlje, sat, F = cijeli ekran) i fokus ploča koja se sama izmjenjuje (12 s,
// traka napretka, dodir ili razmak = sljedeća). Pokret samo transform/opacity; uz „smanji pokret" bez klizanja.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Osvjezi } from "../zivo";

// Sat piše izravno u element: server i preglednik nikad nemaju različit tekst pri hidrataciji.
export function Sat() {
  const ref = useRef(null);
  useEffect(() => {
    const dva = (n) => String(n).padStart(2, "0");
    const tik = () => {
      const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Zagreb" }));
      if (ref.current) ref.current.textContent = `${dva(d.getHours())}:${dva(d.getMinutes())}:${dva(d.getSeconds())}`;
    };
    tik();
    const id = setInterval(tik, 1000);
    return () => clearInterval(id);
  }, []);
  return <span ref={ref} className="num text-[clamp(1.1rem,1.4vw,2rem)] tabular-nums">—</span>;
}

export function TvOkvir({ sat, children }) {
  useEffect(() => {
    const tipka = (e) => {
      if (e.key.toLowerCase() !== "f" || e.metaKey || e.ctrlKey) return;
      if (document.fullscreenElement) document.exitFullscreen?.();
      else document.documentElement.requestFullscreen?.().catch(() => {});
    };
    document.addEventListener("keydown", tipka);
    return () => document.removeEventListener("keydown", tipka);
  }, []);
  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <header className="flex items-center justify-between gap-4 border-b border-[color:var(--a-line)] px-[clamp(12px,1.6vw,32px)] py-2.5" style={{ paddingTop: "max(10px, env(safe-area-inset-top))" }}>
        <span className="lbl whitespace-nowrap text-[clamp(10px,0.75vw,16px)]">
          [ LKT / TV ] <span className="hidden sm:inline">{"///"} ZID 01 {"///"} SAMO ZBROJEVI</span>
        </span>
        <div className="flex items-center gap-4 whitespace-nowrap">
          {sat}
          <span className="hidden md:inline"><Osvjezi sekundi={60} /></span>
          <Link href="/admin" className="chip mono flex h-11 items-center rounded-[var(--r-sm)] border border-[color:var(--a-line)] px-3 text-[11px] text-[color:var(--a-mute)]">
            [ IZLAZ ]
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}

export function Fokus({ ploce, sekundi = 12 }) {
  const [i, setI] = useState(0);
  const [stoji, setStoji] = useState(false);
  const n = ploce.length;

  useEffect(() => {
    if (stoji || n < 2) return;
    const id = setTimeout(() => setI((k) => (k + 1) % n), sekundi * 1000);
    return () => clearTimeout(id);
  }, [i, stoji, n, sekundi]);

  useEffect(() => {
    const tipka = (e) => {
      if (e.key === "ArrowRight") setI((k) => (k + 1) % n);
      else if (e.key === "ArrowLeft") setI((k) => (k - 1 + n) % n);
      else if (e.key === " ") setStoji((s) => !s);
      else return;
      e.preventDefault();
    };
    document.addEventListener("keydown", tipka);
    return () => document.removeEventListener("keydown", tipka);
  }, [n]);

  const p = ploce[i];
  return (
    <section className="tv-ploca flex min-h-[26vh] cursor-pointer flex-col gap-[1.2vh] p-[clamp(12px,1.1vw,24px)]" onClick={() => setI((k) => (k + 1) % n)} aria-live="polite">
      <header className="flex items-center justify-between gap-3">
        <h2 className="lbl text-[clamp(10px,0.75vw,16px)]">
          <span className="up">FOKUS</span> {"///"} {p.naslov}
        </h2>
        <span className="lbl text-[clamp(10px,0.75vw,16px)]">
          {String(i + 1).padStart(2, "0")}/{String(n).padStart(2, "0")}{stoji ? " · PAUZA" : ""}
        </span>
      </header>
      <div key={i} className="tv-ekran flex flex-1 flex-col justify-center">{p.sadrzaj}</div>
      <div className="flex gap-1.5" aria-hidden="true">
        {ploce.map((_, k) => (
          <span key={k} className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-[color:var(--a-line)]">
            {k === i && !stoji && <span key={i} className="tv-napredak absolute inset-0 bg-[color:var(--a-live)]" style={{ animationDuration: `${sekundi}s` }} />}
            {k < i && <span className="absolute inset-0 bg-[color:var(--a-mute)]" />}
          </span>
        ))}
      </div>
    </section>
  );
}
