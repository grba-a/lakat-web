import { storeLink } from "@/lib/launch";

// Hero za prednarudžbu (Petar, 5. 11. 2026.: „hero treba biti simple; nešto kao Duolingo kada imamo prednaruči button").
// Krigla, jedna rečenica, jedan glavni gumb. Gumb je „podmetač" kao u iOS appu (kut 12 + tamno dno, tone na dodir).
// Prikazuje se samo dok vrijedi isPreorder(); scena „Tri petka" (hero-s6) ostaje za stanje bez App Store linka.
export function HeroPre() {
  return (
    <section id="hero-pre" aria-labelledby="hero-pre-naslov" className="relative isolate">
      <header className="mx-auto flex max-w-5xl items-center px-5 pt-[max(14px,env(safe-area-inset-top))] pb-2">
        <span className="font-display text-[22px] leading-none">
          LAKAT<span className="text-accent">.</span>
        </span>
      </header>

      <div className="mx-auto grid min-h-[calc(100svh-56px)] max-w-5xl content-center items-center gap-8 px-5 pt-4 pb-20 md:grid-cols-[1fr_1.1fr] md:gap-16 md:pb-24">
        <div className="relative mx-auto w-[min(56vw,230px)] md:w-full md:max-w-[420px]">
          <div
            aria-hidden="true"
            className="absolute inset-[12%] -z-10 rounded-full bg-accent/25 blur-[60px]"
          />
          <img
            src="/img/krigla/mase.webp"
            alt="Krigla, LAKTOVA maskota, maše"
            width={453}
            height={480}
            fetchPriority="high"
            className="h-auto w-full object-contain"
          />
        </div>

        <div className="grid justify-items-center gap-6 text-center md:justify-items-start md:text-left">
          <h1 id="hero-pre-naslov" className="font-display text-[clamp(46px,13vw,88px)] leading-[0.95] uppercase text-balance">
            <span className="sr-only">LAKAT je aplikacija za druženje s ekipom. </span>
            Ima li koga?
            <br />
            LAKAT javi<span className="text-accent">.</span>
          </h1>
          <p className="max-w-[34ch] text-[17px] leading-relaxed text-soft text-pretty md:text-[19px]">
            Aplikacija za ekipu koja izlazi. Stiže 1. 12. u podne, prvo za iPhone.
          </p>

          <div className="grid w-full max-w-[360px] gap-3">
            <a
              href={storeLink("web-hero-pre")}
              className="flex min-h-[56px] items-center justify-center rounded-[12px] bg-accent px-5 text-[17px] font-extrabold text-[#052e16] shadow-[0_5px_0_#15803d] transition-[translate,box-shadow] duration-100 ease-out active:translate-y-[5px] active:shadow-[0_0_0_#15803d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Prednaruči na App Storeu
            </a>
            <a
              href="#lista"
              className="flex min-h-[56px] items-center justify-center rounded-[12px] border-2 border-line bg-surface px-5 text-[16px] font-bold text-fg shadow-[0_5px_0_#27272a] transition-[translate,box-shadow] duration-100 ease-out active:translate-y-[5px] active:shadow-[0_0_0_#27272a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Android? Upiši se na listu
            </a>
          </div>

          <p className="max-w-[30ch] font-mono text-[11px] tracking-[0.14em] text-muted uppercase text-balance md:max-w-none">
            Prednarudžba je besplatna · 1. 12. se sam skine
          </p>
        </div>
      </div>
    </section>
  );
}
