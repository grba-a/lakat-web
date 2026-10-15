"use client";

import { useEffect, useState } from "react";
import { play } from "@/lib/sfx";

// Lov na Krigle (Petar n5): pet malih Krigli skriveno je po stranici.
// Kad nađeš svih pet, Krigla otkrije tajnu repliku. Napredak ostaje u pregledniku.
const KEY = "lakat-lov";
export const SAY = "lakat-say";
export const LOV_GOTOV = "lakat-lov-gotov";
// Isti ključevi kao u waitlist.jsx (SIGNED_KEY) i sticky-cta.jsx (OPEN_SHEET); ovdje kao tekst da ne bude kružnog uvoza.
const UPISAN = "lakat-upisan";
const OTVORI_LISTU = "lakat-lista";
const TOTAL = 5;

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function say(text) {
  window.dispatchEvent(new CustomEvent(SAY, { detail: text }));
}

export function HuntKrigla({ id, className = "", size = 26 }) {
  const [found, setFound] = useState(false);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFound(read().includes(id)), 0);
    return () => clearTimeout(t);
  }, [id]);

  function grab() {
    if (found) return;
    const list = [...new Set([...read(), id])];
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {}
    setPop(true);
    setTimeout(() => setFound(true), 450);
    play(list.length === TOTAL ? "kasa" : "zvecka");
    if (list.length === TOTAL) {
      // Petar 16. 10.: kad nađeš svih pet, izleti prozor s nagradom (HuntNagrada).
      setTimeout(() => window.dispatchEvent(new Event(LOV_GOTOV)), 500);
    } else {
      say(`Našao si me. ${list.length} od ${TOTAL}.`);
    }
  }

  if (found) return null;
  return (
    <button
      type="button"
      onClick={grab}
      aria-label="Skrivena Krigla"
      className={`absolute z-[3] grid place-items-center rounded-full p-2 opacity-60 transition-[opacity,scale] hover:opacity-100 ${pop ? "scale-150 opacity-0 duration-500" : ""} ${className}`}
    >
      <img src="/img/krigla-lik-128.webp" alt="" width={size} height={size} style={{ width: size, height: size }} className="rotate-[-12deg] object-contain" />
    </button>
  );
}

// Nagrada za lov (Petar 16. 10.): Krigla slavi, tajna tapeta. Upisani je odmah sprema,
// ostali je otključaju rezervacijom @imena (tapeta se onda preuzima na /potvrdeno).
export function HuntNagrada() {
  const [on, setOn] = useState(false);
  const [upisan, setUpisan] = useState(false);

  useEffect(() => {
    const otvori = () => {
      try {
        setUpisan(localStorage.getItem(UPISAN) === "1");
      } catch {}
      setOn(true);
    };
    window.addEventListener(LOV_GOTOV, otvori);
    return () => window.removeEventListener(LOV_GOTOV, otvori);
  }, []);

  useEffect(() => {
    if (!on) return;
    const esc = (e) => e.key === "Escape" && setOn(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [on]);

  if (!on) return null;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 px-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lov-naslov"
      onClick={(e) => e.target === e.currentTarget && setOn(false)}
    >
      <div className="nagrada-pop relative grid w-full max-w-[360px] justify-items-center gap-4 rounded-[28px] border border-line bg-surface px-6 pt-6 pb-7 text-center shadow-[0_30px_80px_rgb(0_0_0/0.6)]">
        <img
          src="/img/krigla/koraci/krigla-3-slavi.webp"
          alt=""
          width={132}
          height={132}
          className="float -mt-20 size-[132px] object-contain drop-shadow-[0_14px_36px_rgb(74_222_128/0.45)]"
        />
        <h2 id="lov-naslov" className="font-display text-[clamp(34px,10vw,44px)] leading-[0.95] uppercase text-balance">
          Pravi lovac<span className="text-accent">!</span>
        </h2>
        <p className="text-[15px] text-soft text-pretty">Našao si svih pet Krigli. Nagrada: tajna Krigla za tvoj zaključani ekran.</p>
        <span className="relative block w-[132px] overflow-hidden rounded-2xl border border-line">
          <img
            src="/img/tapete/mala-1.webp"
            alt="Tajna tapeta: Sretni Krigla"
            width={300}
            height={650}
            className={`block w-full object-cover ${upisan ? "" : "blur-[6px] brightness-75"}`}
          />
          {!upisan && (
            <span className="absolute inset-0 grid place-items-center text-[13px] font-bold text-fg">Zaključano</span>
          )}
        </span>
        {!upisan && <p className="-mb-1 text-[14px] text-muted">Tapeta je tvoja čim rezerviraš @ime.</p>}
        {upisan ? (
          <a
            href="/img/tapete/lakat-tapeta-1.jpg"
            download="lakat-tapeta-tajna.jpg"
            onClick={() => play("kasa")}
            className="grid min-h-[52px] w-full place-items-center rounded-full bg-accent px-6 text-[16px] font-bold text-[#052e16]"
          >
            Spremi tapetu
          </a>
        ) : (
          <button
            type="button"
            autoFocus
            onClick={() => {
              setOn(false);
              setTimeout(() => window.dispatchEvent(new Event(OTVORI_LISTU)), 50);
            }}
            className="min-h-[52px] w-full rounded-full bg-accent px-6 text-[16px] font-bold text-[#052e16]"
          >
            Rezerviraj @ime
          </button>
        )}
        <button type="button" onClick={() => setOn(false)} className="min-h-[44px] text-[14px] text-muted underline underline-offset-4">
          Kasnije
        </button>
      </div>
    </div>
  );
}
