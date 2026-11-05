import { AppStoreBadge } from "./app-store-badge";

// Hero za prednarudžbu — predložak A „Lakat na šanku" (Petar, 5. 11. 2026., artifact DAJgf4t8mS9EJmeRxVTRZC):
// cijela scena preko ekrana (Krigla naslonjen laktom na šank, Codex), tekst i službeni App Store badge dolje.
// Animacije samo u CSS-u i samo transform/opacity (hero intro nikad u JS-u: LCP na mobitelu).
// Prikazuje se samo dok vrijedi isPreorder(); scena „Tri petka" (hero-s6) ostaje za stanje bez App Store linka.
export function HeroPre() {
  return (
    <section id="hero-pre" aria-labelledby="hero-pre-naslov" className="hero-pre relative isolate overflow-hidden">
      <style>{`
        .hero-pre .scena { animation: hp-scena 1.4s cubic-bezier(.2,.7,.2,1) both; }
        .hero-pre .neon { animation: hp-neon 6s ease-in-out 1.4s infinite; }
        .hero-pre .ulaz > * { animation: hp-ulaz .7s cubic-bezier(.2,.7,.2,1) both; }
        .hero-pre .ulaz > :nth-child(2) { animation-delay: .08s; }
        .hero-pre .ulaz > :nth-child(3) { animation-delay: .16s; }
        .hero-pre .ulaz > :nth-child(4) { animation-delay: .24s; }
        .hero-pre .ulaz > :nth-child(5) { animation-delay: .32s; }
        @keyframes hp-scena { from { transform: scale(1.06); } to { transform: scale(1); } }
        @keyframes hp-ulaz { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes hp-neon { 0%, 100% { opacity: .55; } 48% { opacity: .55; } 50% { opacity: .2; } 52% { opacity: .6; } 54% { opacity: .35; } 56% { opacity: .55; } }
        @media (prefers-reduced-motion: reduce) { .hero-pre .scena, .hero-pre .neon, .hero-pre .ulaz > * { animation: none; } }
      `}</style>

      <picture>
        <source
          media="(min-width: 768px)"
          srcSet="/img/hero/lakat-na-sanku-1024.webp 1024w, /img/hero/lakat-na-sanku-1536.webp 1536w"
          sizes="100vw"
        />
        <source srcSet="/img/hero/lakat-na-sanku-mob-468.webp 468w, /img/hero/lakat-na-sanku-mob.webp 936w" sizes="100vw" />
        <img
          src="/img/hero/lakat-na-sanku-mob.webp"
          alt="Krigla, LAKTOVA maskota, naslonjen laktom na šank namiguje"
          width={936}
          height={1024}
          fetchPriority="high"
          className="scena absolute inset-x-0 top-0 -z-20 h-[78svh] w-full object-cover object-[60%_30%] md:inset-0 md:h-full md:object-[85%_50%]"
        />
      </picture>
      {/* Zeleni neon iza Krigle lagano treperi, kao reklama u kafiću (samo opacity). */}
      <div aria-hidden="true" className="neon pointer-events-none absolute -z-10 top-[8%] right-[-10%] h-[55%] w-[80%] rounded-full bg-accent/25 blur-[90px] md:top-[10%] md:right-[2%] md:h-[80%] md:w-[45%]" />
      {/* Sjena za čitljivost: na mobitelu odozdo, na desktopu slijeva. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(9_9_11/0.35)_0%,rgb(9_9_11/0)_22%,rgb(9_9_11/0)_42%,rgb(9_9_11/0.9)_66%,#09090b_80%)] md:bg-[linear-gradient(90deg,#09090b_0%,rgb(9_9_11/0.92)_32%,rgb(9_9_11/0.35)_55%,rgb(9_9_11/0)_70%)]"
      />

      <header className="mx-auto flex max-w-6xl items-center px-5 pt-[max(14px,env(safe-area-inset-top))] pb-2">
        <span className="font-display text-[22px] leading-none">
          LAKAT<span className="text-accent">.</span>
        </span>
      </header>

      <div className="mx-auto flex min-h-[calc(100svh-48px)] max-w-6xl flex-col justify-end px-5 pb-[max(28px,env(safe-area-inset-bottom))] md:justify-center md:pb-24">
        <div className="ulaz grid max-w-[440px] gap-4">
          <h1 id="hero-pre-naslov" className="font-display text-[clamp(56px,17vw,104px)] leading-[0.9] uppercase">
            <span className="sr-only">LAKAT je aplikacija za druženje s ekipom. </span>
            Ima li koga<span className="text-accent">?</span>
          </h1>
          <p className="max-w-[32ch] text-[17px] leading-relaxed text-soft text-pretty md:text-[19px]">
            LAKAT ti javi tko je vani. Stiže 1.{"\u00a0"}12. u{"\u00a0"}podne.
          </p>
          <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Prednarudžba · iPhone · besplatno</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <AppStoreBadge ct="web-hero-pre" height={54} />
            <a href="#lista" className="min-h-[44px] content-center text-[15px] font-semibold text-soft underline decoration-line underline-offset-4 hover:text-fg">
              Android? Upiši se na listu
            </a>
          </div>
          <p className="text-[13px] text-muted">1.{"\u00a0"}12. ti se LAKAT sam skine.</p>
        </div>
      </div>
    </section>
  );
}
