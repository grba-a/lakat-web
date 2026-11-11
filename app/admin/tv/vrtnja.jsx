"use client";

// TV način: ekrani se sami izmjenjuju (12 s), traka napretka pri dnu, strelice/razmak ručno, F = cijeli ekran.
// Pokret samo transform/opacity; uz „smanji pokret" izmjena bez klizanja.
import Link from "next/link";
import { useEffect, useState } from "react";
import { Osvjezi } from "../zivo";

export function Vrtnja({ ekrani, sekundi = 12 }) {
  const [i, setI] = useState(0);
  const [stoji, setStoji] = useState(false);
  const n = ekrani.length;

  useEffect(() => {
    if (stoji) return;
    const id = setTimeout(() => setI((k) => (k + 1) % n), sekundi * 1000);
    return () => clearTimeout(id);
  }, [i, stoji, n, sekundi]);

  useEffect(() => {
    const tipka = (e) => {
      if (e.key === "ArrowRight") setI((k) => (k + 1) % n);
      else if (e.key === "ArrowLeft") setI((k) => (k - 1 + n) % n);
      else if (e.key === " ") setStoji((s) => !s);
      else if (e.key.toLowerCase() === "f") {
        if (document.fullscreenElement) document.exitFullscreen?.();
        else document.documentElement.requestFullscreen?.().catch(() => {});
      } else return;
      e.preventDefault();
    };
    document.addEventListener("keydown", tipka);
    return () => document.removeEventListener("keydown", tipka);
  }, [n]);

  return (
    <div className="flex min-h-dvh flex-col" onClick={() => setI((k) => (k + 1) % n)}>
      <header className="flex items-center justify-between gap-4 border-b border-[color:var(--a-line)] px-[3vw] py-3">
        <span className="lbl whitespace-nowrap">
          [ LKT / TV ] {"///"} {String(i + 1).padStart(2, "0")}/{String(n).padStart(2, "0")} {stoji ? "/// PAUZA" : ""}
        </span>
        <div className="flex items-center gap-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
          <span className="hidden sm:inline"><Osvjezi sekundi={60} /></span>
          <Link href="/admin" className="chip mono border border-[color:var(--a-line)] px-3 py-2 text-[11px] text-[color:var(--a-mute)]">
            [ IZLAZ ]
          </Link>
        </div>
      </header>
      <main key={i} className="tv-ekran flex flex-1 flex-col justify-center px-[4vw] py-[4vh]">
        {ekrani[i]}
      </main>
      <footer className="flex flex-col gap-2 px-[3vw] pb-4">
        <div className="flex gap-1.5" aria-hidden="true">
          {ekrani.map((_, k) => (
            <span key={k} className="relative h-[3px] flex-1 overflow-hidden bg-[color:var(--a-line)]">
              {k === i && !stoji && <span className="tv-napredak absolute inset-0 bg-[color:var(--a-live)]" style={{ animationDuration: `${sekundi}s` }} />}
              {k < i && <span className="absolute inset-0 bg-[color:var(--a-mute)]" />}
            </span>
          ))}
        </div>
        <p className="lbl"><span className="hidden md:inline">← → ekran · razmak pauza · F cijeli ekran · </span>dodir = sljedeći</p>
      </footer>
    </div>
  );
}
