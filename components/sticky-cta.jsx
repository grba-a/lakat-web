"use client";

import { track } from "@vercel/analytics";
import { useEffect, useRef, useState } from "react";
import { APP_STORE, storeLink } from "@/lib/launch";
import { play } from "@/lib/sfx";
import { greeting, moodLine } from "@/lib/krigla-voice";
import { shareLakat, source } from "@/lib/share";
import { SIGNED_KEY, Waitlist } from "./waitlist";

export const OPEN_SHEET = "lakat-lista";

// Donji gumb „Javi mi prvi“ (hero B). Tap otvara formu odozdo s već fokusiranim poljem,
// pa nitko ne skače 9.000 px i ne gubi mjesto (Petar w18). Nakon prijave postaje „Pošalji ekipi“.
// position: fixed, ne sticky: sticky s negativnom marginom bježi (zamka iz vaulta).
export function StickyCta({ live: launched = false }) {
  // Bez App Store linka i nakon lansiranja ostaje lista čekanja, nikad mrtvi „#“.
  const live = launched && Boolean(APP_STORE);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [signed, setSigned] = useState(false);
  const input = useRef(null);
  // Krigla uz gumb mijenja repliku po sekciji (Petar w26).
  const [line, setLine] = useState({ text: "", k: 0 });
  const [talk, setTalk] = useState(false);

  useEffect(() => {
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

  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  function openSheet() {
    setOpen(true);
    // Fokus u istom tapu, inače iOS ne otvori tipkovnicu.
    input.current?.focus({ preventScroll: true });
  }

  function onTap(e) {
    play("zvecka");
    track("cta_tap", { gdje: "donji" });
    if (live) return;
    e.preventDefault();
    if (signed) return void shareLakat();
    openSheet();
  }

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
            <img src="/img/krigla-lik.webp" alt="" width={48} height={48} className="size-12 object-contain drop-shadow-[0_6px_14px_rgb(74_222_128/0.35)]" />
            {talk && line.text && (
              <p
                key={line.k}
                className="chat-in absolute bottom-[110%] left-0 w-max max-w-[240px] rounded-[16px] rounded-bl-md border border-line bg-surface-2 px-3 py-2 text-[13px] leading-snug text-fg shadow-lg"
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
          className="pointer-events-auto flex min-h-[52px] w-full items-center justify-center rounded-full bg-accent text-[16px] font-bold text-[#052e16] shadow-[0_10px_30px_-10px_rgb(74_222_128/0.6)] active:scale-[0.98]"
        >
          {live ? "Skini LAKAT" : signed ? "Pošalji ekipi" : "Javi mi prvi"}
        </a>
        </div>
      </div>

      {!live && (
        <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Zatvori"
            onClick={() => setOpen(false)}
            className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Javi mi prvi"
            className={`absolute inset-x-0 bottom-0 mx-auto max-h-[88svh] max-w-lg overflow-y-auto rounded-t-[28px] border-t border-line bg-[#141417] px-5 pt-3 pb-[max(24px,env(safe-area-inset-bottom))] transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              open ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="mx-auto h-1.5 w-10 rounded-full bg-line" />
              <button type="button" onClick={() => setOpen(false)} aria-label="Zatvori" className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-muted">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <p className="mb-4 font-display text-[34px] leading-none uppercase">
              Javi mi prvi<span className="text-accent">.</span>
            </p>
            <Waitlist prefix="sheet-" inputRef={input} />
          </div>
        </div>
      )}
    </>
  );
}

// Gumb usred stranice (w21): otvara isti sheet.
export function CatchPoint({ text = "Ovo je samo primjer. Ostalo stiže 1. 12." }) {
  return (
    <div className="grid justify-items-center gap-3 text-center md:justify-items-start md:text-left">
      <p className="text-[14px] text-soft">{text}</p>
      <button
        type="button"
        onClick={() => {
          track("cta_tap", { gdje: "usred" });
          window.dispatchEvent(new Event(OPEN_SHEET));
        }}
        className="inline-flex min-h-[48px] items-center rounded-full border border-accent/60 px-5 text-[15px] font-bold text-accent active:scale-[0.98]"
      >
        Javi mi prvi
      </button>
    </div>
  );
}
