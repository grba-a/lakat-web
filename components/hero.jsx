import { preload } from "react-dom";
import { remaining } from "@/lib/launch";
import { HeroBg } from "./hero-bg";
import { HuntKrigla } from "./hunt";
import { SoundToggle } from "./sound-toggle";
import { StoreButtons } from "./store";
import { StoreQR } from "./store-qr";
import { TimerTalk } from "./timer-talk";
import { TiltPhone } from "./tilt-phone";

// Hero, varijanta B (Petar, 2026-10-04): naslov gore, mobitel, timer, a gumb
// stoji na dnu ekrana (StickyCta). Na desktopu naslov i timer idu lijevo, mobitel desno.
//
// Mobitel se skalira po visini ekrana da naslov, mobitel i timer stanu u prvi
// pogled i na 360×640.
const PHONE_W = "clamp(104px, min(46vw, calc((100svh - 480px) / 2.17)), 300px)";

export function Hero({ live = false }) {
  // Obala od točkica crta se kao maska (globals.css): ne smije čekati, ali više nije LCP pa nema visok prioritet.
  preload("/img/obala-tocke.png", { as: "image", crossOrigin: "anonymous" });
  const initial = remaining();
  return (
    <section className="relative isolate overflow-hidden">
      <HeroBg />
      <HuntKrigla id="hero" className="top-[38%] right-2 md:top-auto md:right-10 md:bottom-16" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 pt-[max(14px,env(safe-area-inset-top))] pb-2">
        <span className="font-display text-[22px] leading-none">
          LAKAT<span className="text-accent">.</span>
        </span>
        <div className="flex items-center gap-3">
          <SoundToggle />
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl justify-items-center gap-5 px-5 pt-3 pb-32 [@media(max-height:700px)]:gap-3 text-center md:grid-cols-[1.1fr_1fr] md:min-h-[calc(100svh-64px)] md:content-center md:items-center md:gap-x-10 md:gap-y-8 md:pt-4 md:pb-28 md:text-left">
        {/* Što je LAKAT i kad stiže (c-hero-cta, s-h1-znacenje): H1 nosi ime i značenje, veliki natpis ostaje isti, samo kao <p>. */}
        <div className="intro-1 grid justify-items-center gap-4 [@media(max-height:700px)]:gap-3 md:col-start-1 md:gap-6 md:row-start-1 md:self-end md:justify-items-start">
          <h1 className="max-w-[30ch] text-[15px] leading-snug font-semibold text-soft text-balance md:max-w-[34ch] md:text-[19px]">
            LAKAT je hrvatska iPhone aplikacija za druženje s ekipom.{" "}
            <span className="text-fg">{live ? "Sad je vani." : "Stiže 1. 12. u podne."}</span>
          </h1>
          <p className="font-display text-[clamp(48px,14vw,62px)] leading-[0.93] uppercase text-balance md:text-[clamp(64px,7.4vw,112px)]">
            {live ? (
              <>
                Šank je otvoren<span className="text-accent">.</span>
              </>
            ) : (
              <>
                Šank se otvara za<span className="text-accent">…</span>
              </>
            )}
          </p>
        </div>

        <div className="intro-2 md:col-start-2 md:row-span-2 md:row-start-1">
          <div className="float">
            <TiltPhone width={PHONE_W} live={live} />
          </div>
        </div>

        <div className="intro-3 grid gap-4 [@media(max-height:700px)]:gap-2.5 md:col-start-1 md:row-start-2 md:self-start md:justify-self-start md:justify-items-start">
          {live ? (
            <>
              <StoreButtons />
              <StoreQR />
            </>
          ) : (
            <TimerTalk initial={initial} className="[--cw:38px] [@media(max-height:700px)]:[--cw:30px] md:justify-start md:[--cw:46px]" />
          )}
        </div>
      </div>
    </section>
  );
}
