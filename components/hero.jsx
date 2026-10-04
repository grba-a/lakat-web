import { remaining } from "@/lib/launch";
import { SoundToggle } from "./sound-toggle";
import { StoreButtons } from "./store";
import { Countdown } from "./countdown";
import { TiltPhone } from "./tilt-phone";

// Hero, varijanta B (Petar, 2026-10-04): naslov gore, mobitel, timer, a gumb
// stoji na dnu ekrana (StickyCta). Na desktopu naslov i timer idu lijevo, mobitel desno.
//
// Mobitel se skalira po visini ekrana da naslov, mobitel i timer stanu u prvi
// pogled i na 360×640.
const PHONE_W = "clamp(128px, min(46vw, calc((100svh - 400px) / 2.17)), 300px)";

export function Hero({ live = false }) {
  const initial = remaining();
  return (
    <section className="relative isolate overflow-hidden">
      <div className="dots-lg pointer-events-none absolute inset-0 -z-10 opacity-30" aria-hidden="true" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 pt-[max(14px,env(safe-area-inset-top))] pb-2">
        <span className="font-display text-[22px] leading-none">
          LAKAT<span className="text-accent">.</span>
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">iOS · 1. 12.</span>
          <SoundToggle />
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl justify-items-center gap-5 px-5 pt-3 pb-32 text-center md:grid-cols-[1.1fr_1fr] md:min-h-[calc(100svh-64px)] md:content-center md:items-center md:gap-x-10 md:gap-y-8 md:pt-4 md:pb-28 md:text-left">
        <h1 className="intro-1 font-display text-[clamp(48px,14vw,62px)] leading-[0.93] uppercase text-balance md:col-start-1 md:row-start-1 md:self-end md:justify-self-start md:text-[clamp(64px,7.4vw,112px)]">
          {live ? (
            <>
              Šank je otvoren<span className="text-accent">.</span>
            </>
          ) : (
            <>
              Šank se otvara za<span className="text-accent">…</span>
            </>
          )}
        </h1>

        <div className="intro-2 md:col-start-2 md:row-span-2 md:row-start-1">
          <div className="float">
            <TiltPhone width={PHONE_W} live={live} />
          </div>
        </div>

        <div className="intro-3 grid gap-4 md:col-start-1 md:row-start-2 md:self-start md:justify-self-start md:justify-items-start">
          {live ? (
            <StoreButtons />
          ) : (
            <Countdown initial={initial} className="[--cw:34px] md:justify-start md:[--cw:46px]" />
          )}
          <p className="max-w-[34ch] text-[15px] text-soft text-pretty md:text-[17px]">
            {live ? "Vidiš tko je vani, tko stiže i tko časti." : "1. 12. u podne na iPhoneu. Vidiš tko je vani, tko stiže i tko časti."}
          </p>
        </div>
      </div>
    </section>
  );
}
