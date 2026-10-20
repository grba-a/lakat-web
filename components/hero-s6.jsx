import { preload } from "react-dom";
import { remaining } from "@/lib/launch";
import { S6Scroll } from "./hero-s6-scroll";
import { HuntKrigla } from "./hunt";
import { SoundToggle } from "./sound-toggle";

// Hero S6 „Tri petka" (Petar, 20. 10., runda 5 → S6 + film L). Zamjenjuje hero B (hero.jsx ostaje kao rezerva).
export function HeroS6({ live = false }) {
  preload("/img/s6/000.webp", { as: "image", fetchPriority: "high" });
  return (
    <section className="relative isolate">
      <h1 className="sr-only">
        LAKAT je aplikacija za druženje s ekipom.{" "}
        <span>{live ? "Sad je vani." : "Stiže 1. 12. u podne."}</span>
      </h1>
      <header className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-6xl items-center justify-between px-5 pt-[max(14px,env(safe-area-inset-top))] pb-2">
        <span className="font-display text-[22px] leading-none">
          LAKAT<span className="text-accent">.</span>
        </span>
        <SoundToggle />
      </header>
      <HuntKrigla id="hero" className="top-[22%] right-2 z-20 md:right-10" />
      <S6Scroll live={live} initial={remaining()} />
    </section>
  );
}
