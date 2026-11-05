"use client";

import { useEffect, useId, useRef, useState } from "react";

// Izbornik samo na mobitelu (Petar 5. 11.: „makni hamburger sa desktop verzije"; home.jsx ga omata u md:hidden).
// Gumb gore desno (zatvoren ispod modala lova i lansiranja, z 45) na svakoj širini, ne dira „LAKAT.“ u heroju (hero-pre.jsx je lijevo).
// Otvoren: cijeli ekran, Escape i tap na link zatvaraju, Tab kruži unutra, stranica ispod ne skrola i nije fokusabilna,
// fokus se vraća na gumb. Ulaz linkova samo opacity/transform; smanjeno kretanje to gasi (globals.css).
// `linkovi` = [href, tekst] samo za sekcije i stranice koje postoje (home.jsx), `dno` = npr. App Store badge.
export function Meni({ linkovi = [], dno = null }) {
  const [open, setOpen] = useState(false);
  const btn = useRef(null);
  const panel = useRef(null);
  const id = useId();

  // Ako se otvori na mobitelu pa prozor naraste do desktopa (md, 768 px), zatvori ga, da scroll ne ostane zaključan.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const zatvori = () => mq.matches && setOpen(false);
    mq.addEventListener("change", zatvori);
    return () => mq.removeEventListener("change", zatvori);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prije = html.style.overflow;
    html.style.overflow = "hidden";
    const pozadina = [...document.querySelectorAll("body > main, body > footer")];
    pozadina.forEach((el) => (el.inert = true));
    panel.current?.querySelector("a")?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === "Escape") return setOpen(false);
      if (e.key !== "Tab" || !panel.current) return;
      const f = [btn.current, ...panel.current.querySelectorAll("a[href], button")].filter(Boolean);
      e.preventDefault();
      const i = f.indexOf(document.activeElement);
      f[i === -1 ? 0 : (i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prije;
      pozadina.forEach((el) => (el.inert = false));
      btn.current?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <>
      <button
        ref={btn}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={open ? "Zatvori izbornik" : "Otvori izbornik"}
        onClick={() => setOpen((o) => !o)}
        className={`fixed top-[max(8px,env(safe-area-inset-top))] right-3 ${open ? "z-[70]" : "z-[45]"} grid size-11 place-items-center rounded-full border border-line bg-[#09090b]/80 text-fg shadow-[0_8px_24px_-10px_rgb(0_0_0/0.9)] transition-[background-color,border-color] duration-200 hover:border-[#3f3f46] md:right-5`}
      >
        <span aria-hidden="true" className="relative block h-3.5 w-[18px]">
          <span className={`absolute inset-x-0 top-0 h-0.5 rounded-full bg-current transition-transform duration-300 ${open ? "translate-y-[6px] rotate-45" : ""}`} />
          <span className={`absolute inset-x-0 top-[6px] h-0.5 rounded-full bg-current transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
          <span className={`absolute inset-x-0 top-3 h-0.5 rounded-full bg-current transition-transform duration-300 ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
        </span>
      </button>

      <div
        ref={panel}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label="Izbornik"
        inert={!open}
        className={`meni fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-bg transition-opacity duration-300 ${open ? "meni-on opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div className="mx-auto grid min-h-full max-w-6xl content-between gap-10 px-5 pt-[max(18px,env(safe-area-inset-top))] pb-[max(28px,env(safe-area-inset-bottom))]">
          <span className="font-display text-[22px] leading-none">
            LAKAT<span className="text-accent">.</span>
          </span>
          <nav aria-label="Glavni">
            <ul className="grid gap-1">
              {linkovi.map(([href, tekst], i) => (
                <li key={href} className="meni-stavka" style={{ "--i": i }}>
                  <a
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-[52px] items-center font-display text-[clamp(34px,10vw,52px)] leading-none uppercase transition-colors hover:text-accent focus-visible:text-accent"
                  >
                    {tekst}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {dno && (
            <div className="meni-stavka grid justify-items-start gap-3" style={{ "--i": linkovi.length }}>
              {dno}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
