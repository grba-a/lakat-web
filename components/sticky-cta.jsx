"use client";

import { jednom, track } from "@/lib/korak";
import { useEffect, useRef, useState } from "react";
import { APP_STORE, storeLink } from "@/lib/launch";
import { play } from "@/lib/sfx";
import { greeting, moodLine } from "@/lib/krigla-voice";
import { shareLakat, source } from "@/lib/share";
import { SAY } from "./hunt";
import { SIGNED_KEY, Waitlist } from "./waitlist";

export const OPEN_SHEET = "lakat-lista";
const PRO = process.env.NEXT_PUBLIC_LISTA_PRO === "1";
export const CTA_TEXT = PRO ? "Rezerviraj @ime" : "Javi mi prvi";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([type="hidden"]):not([tabindex="-1"]), select, textarea, [tabindex]:not([tabindex="-1"])';
// Što Kriglin balončić nikad ne smije prekriti (j-krigla-balon, Petar: „to mi je fora“, ostaje).
const NE_PREKRIVAJ = "main h1, main h2, main h3, main summary, main a[href], main button, main input, main label, footer a[href], footer button, footer p.font-display";

// Donji gumb „Rezerviraj @ime“ (hero B + c-rezervacija-imena). Tap otvara obrazac odozdo s već fokusiranim
// poljem, pa nitko ne skače po stranici (Petar w18). Nakon potvrde maila postaje „Pošalji ekipi“.
// position: fixed, ne sticky: sticky s negativnom marginom bježi (zamka iz vaulta).
export function StickyCta({ live: launched = false }) {
  // Bez App Store linka i nakon lansiranja ostaje lista čekanja, nikad mrtvi „#“.
  const live = launched && Boolean(APP_STORE);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [signed, setSigned] = useState(false);
  const [bioOtvoren, setBioOtvoren] = useState(false);
  const first = useRef(null);
  const sheetRoot = useRef(null);
  const dialog = useRef(null);
  const opener = useRef(null);
  const balon = useRef(null);
  // Krigla uz gumb mijenja repliku po sekciji (Petar w26).
  const [line, setLine] = useState({ text: "", k: 0 });
  const [talk, setTalk] = useState(false);
  // Krigla se puni dok skrolaš prema obrascu (Petar w26): prazna → pola → puna.
  const [razina, setRazina] = useState("prazna");

  useEffect(() => {
    // Vrh lijevka (web_koraci): jedan posjet početne po sesiji. Donji gumb živi samo na početnoj.
    jednom("posjet");
    const sync = () => {
      try {
        setSigned(localStorage.getItem(SIGNED_KEY) === "1");
      } catch {}
    };
    sync();
    window.addEventListener(SIGNED_KEY, sync);
    const show = () => openSheet();
    window.addEventListener(OPEN_SHEET, show);
    return () => {
      window.removeEventListener(SIGNED_KEY, sync);
      window.removeEventListener(OPEN_SHEET, show);
    };
  }, []);

  useEffect(() => {
    if (live) return;
    const target = document.getElementById("lista");
    if (!target) return;
    const io = new IntersectionObserver(([e]) => setHidden(e.isIntersecting), { rootMargin: "0px 0px -20% 0px" });
    io.observe(target);
    return () => io.disconnect();
  }, [live]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      if (signed) return setRazina("puna");
      const lista = document.getElementById("lista");
      const end = lista ? lista.getBoundingClientRect().top + window.scrollY - window.innerHeight : document.body.scrollHeight;
      const p = end > 0 ? window.scrollY / end : 1;
      setRazina(p < 0.33 ? "prazna" : p < 0.8 ? "pola" : "puna");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [signed]);

  // Bilo tko na stranici može natjerati Kriglu da nešto kaže (lov na Krigle).
  useEffect(() => {
    let t = 0;
    const onSay = (e) => {
      setLine((l) => ({ text: e.detail, k: l.k + 1 }));
      setTalk(true);
      clearTimeout(t);
      t = setTimeout(() => setTalk(false), 3800);
    };
    window.addEventListener(SAY, onSay);
    return () => {
      window.removeEventListener(SAY, onSay);
      clearTimeout(t);
    };
  }, []);

  // Pozdrav nakon par sekundi: od pajdaša (n2) ili prema dobu dana (n3).
  useEffect(() => {
    const t = setTimeout(() => {
      const text = greeting(source()) || moodLine();
      setLine((l) => ({ text, k: l.k + 1 }));
      setTalk(true);
      setTimeout(() => setTalk(false), 3600);
    }, 2600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (live) return;
    const els = [...document.querySelectorAll("[data-krigla]")];
    let last = "";
    let hide = 0;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const text = e.target.dataset.krigla;
          if (text === last) return;
          last = text;
          setLine((l) => ({ text, k: l.k + 1 }));
          setTalk(true);
          clearTimeout(hide);
          hide = setTimeout(() => setTalk(false), 2800);
        });
      },
      { rootMargin: "-48% 0px -48% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      clearTimeout(hide);
    };
  }, [live]);

  // Dok Krigla priča, balončić se skloni čim bi prekrio naslov, gumb, polje ili link (provjera na svakom skrolu).
  useEffect(() => {
    if (!talk) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      const b = balon.current?.getBoundingClientRect();
      if (!b) return;
      for (const el of document.querySelectorAll(NE_PREKRIVAJ)) {
        const r = el.getBoundingClientRect();
        if (r.width && r.bottom > b.top - 4 && r.top < b.bottom + 4 && r.right > b.left - 4 && r.left < b.right + 4) {
          setTalk(false);
          return;
        }
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [talk, line.k]);

  // Otvoren list: pozadina je inert (ni fokus ni tap ne bježe van), Tab kruži unutra, Escape zatvara,
  // a fokus se vraća na gumb koji je list otvorio (fokus-obrasca).
  useEffect(() => {
    if (!open) return;
    const pozadina = [...document.querySelectorAll("body > main, body > footer")];
    pozadina.forEach((el) => (el.inert = true));
    const onKey = (e) => {
      if (e.key === "Escape") return setOpen(false);
      if (e.key !== "Tab" || !dialog.current) return;
      const f = [...dialog.current.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!f.length) return;
      // Uvijek sami pomičemo fokus: WebKit bi Tabom inače skakao samo po poljima i izlazio iz lista.
      e.preventDefault();
      const i = f.indexOf(document.activeElement);
      const next = i === -1 ? (e.shiftKey ? f.length - 1 : 0) : (i + (e.shiftKey ? -1 : 1) + f.length) % f.length;
      f[next].focus();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      pozadina.forEach((el) => (el.inert = false));
      const back = opener.current;
      if (back && document.contains(back)) back.focus({ preventScroll: true });
    };
  }, [open]);

  function openSheet() {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // Zatvoreni list je `inert` (ništa unutra ne prima fokus); skini to odmah, prije fokusa.
    if (sheetRoot.current) sheetRoot.current.inert = false;
    setOpen(true);
    setBioOtvoren(true);
    // Fokus u istom tapu, inače iOS ne otvori tipkovnicu.
    first.current?.focus({ preventScroll: true });
  }

  function onTap(e) {
    play("zvecka");
    track("cta_tap", { gdje: "donji" });
    if (live) return;
    e.preventDefault();
    if (signed) return void shareLakat();
    openSheet();
  }

  const label = live ? "Skini LAKAT" : signed ? "Pošalji ekipi" : CTA_TEXT;

  return (
    <>
      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 px-5 pt-8 pb-[max(16px,env(safe-area-inset-bottom))] transition-[opacity,translate] duration-300 ${
          hidden || open ? "translate-y-4 opacity-0" : "opacity-100"
        }`}
        style={{ background: "linear-gradient(transparent, rgb(9 9 11 / 0.92) 45%)" }}
      >
        <div className="relative mx-auto flex max-w-sm items-center gap-2.5 md:max-w-xs">
          {!live && (
            <div className="pointer-events-none relative shrink-0">
              <img
                key={razina}
                src={`/img/krigla/sm/${razina}.webp`}
                alt=""
                width={48}
                height={48}
                className="chat-in size-12 object-contain drop-shadow-[0_6px_14px_rgb(74_222_128/0.35)]"
              />
              {talk && line.text && (
                <p
                  ref={balon}
                  key={line.k}
                  className="chat-in absolute bottom-[110%] left-0 w-max max-w-[min(220px,calc(100vw-80px))] rounded-[16px] rounded-bl-md border border-line bg-surface-2 px-3 py-2 text-[13px] leading-snug text-fg shadow-lg"
                >
                  {line.text}
                </p>
              )}
            </div>
          )}
          <a
            href={live ? storeLink("web-sticky") : "#lista"}
            onClick={onTap}
            tabIndex={hidden || open ? -1 : 0}
            aria-hidden={hidden || open}
            className="pointer-events-auto flex min-h-[52px] w-full items-center justify-center rounded-full bg-accent text-[16px] font-bold text-[#052e16] shadow-[0_10px_30px_-10px_rgb(74_222_128/0.6)] transition-[scale] duration-150 ease-out active:scale-[0.97]"
          >
            {label}
          </a>
        </div>
      </div>

      {!live && (
        <div ref={sheetRoot} inert={!open} className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Zatvori"
            onClick={() => setOpen(false)}
            className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
          />
          <div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-naslov"
            className={`absolute inset-x-0 bottom-0 mx-auto max-h-[92svh] max-w-lg overflow-y-auto overscroll-contain rounded-t-[28px] border-t border-line bg-[#141417] px-5 pt-3 pb-[max(24px,env(safe-area-inset-bottom))] transition-transform duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
              open ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="mx-auto h-1.5 w-10 rounded-full bg-line" />
              <button type="button" onClick={() => setOpen(false)} aria-label="Zatvori" className="absolute top-3 right-3 grid size-11 place-items-center rounded-full text-muted">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <Waitlist
              prefix="sheet-"
              firstRef={first}
              aktivan={bioOtvoren}
              naslov={
                <p id="sheet-naslov" className="font-display text-[34px] leading-none uppercase">
                  {PRO ? (
                    <>
                      Rezerviraj svoje @ime<span className="text-accent">.</span>
                    </>
                  ) : (
                    <>
                      Javi mi prvi<span className="text-accent">.</span>
                    </>
                  )}
                </p>
              }
            />
          </div>
        </div>
      )}
    </>
  );
}

// Gumb usred stranice (w21): otvara isti list. Nakon lansiranja lista (list) se više ne crta,
// pa gumb vodi ravno na App Store umjesto da ne radi ništa (Codex/Claude 20. 10., a4).
export function CatchPoint({ text = "", live: launched = false }) {
  const live = launched && Boolean(APP_STORE);
  const klasa =
    "inline-flex min-h-[48px] items-center rounded-full border border-accent/60 px-5 text-[15px] font-bold text-accent transition-[scale] duration-150 ease-out active:scale-[0.97]";
  return (
    <div className="grid justify-items-center gap-3 text-center md:justify-items-start md:text-left">
      {text && <p className="text-[14px] text-soft">{text}</p>}
      {live ? (
        <a href={storeLink("web-usred")} onClick={() => track("cta_tap", { gdje: "usred" })} className={klasa}>
          Skini LAKAT
        </a>
      ) : (
      <button
        type="button"
        onClick={() => {
          track("cta_tap", { gdje: "usred" });
          window.dispatchEvent(new Event(OPEN_SHEET));
        }}
        className={klasa}
      >
        {CTA_TEXT}
      </button>
      )}
    </div>
  );
}
