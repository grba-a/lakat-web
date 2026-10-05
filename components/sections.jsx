import { INSTAGRAM } from "@/lib/launch";
import { KriglaSays, Punct } from "./brand";
import { FaqChat } from "./faq-chat";
import { Game } from "./game";
import { SecretKrigla } from "./secret-krigla";
import { Phone, Splash } from "./phone";
import { PromoVideo } from "./promo-video";
import { Waitlist } from "./waitlist";

// Sekcije ispod funkcija, po Petrovim izborima iz artifacta (2026-10-04).
// Raspored je mobile first: jedan stupac, na desktopu tekst i mobitel jedan do drugog.

function Eyebrow({ children }) {
  return <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{children}</span>;
}

function H2({ children, className = "" }) {
  return (
    <h2 className={`font-display text-[clamp(40px,11vw,52px)] leading-[0.95] uppercase text-balance md:text-[clamp(56px,5.6vw,84px)] ${className}`}>
      <Punct>{children}</Punct>
    </h2>
  );
}

const IG = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r=".6" fill="currentColor" />
  </svg>
);

// Tajna (C): sedma funkcija koju tek izmišljamo. Krigla se skoro izlane.
export function Secret({ live = false }) {
  return (
    <section className="mx-auto grid max-w-6xl justify-items-center gap-8 px-5 py-24 text-center md:grid-cols-2 md:items-center md:text-left">
      <div className="grid justify-items-center gap-6 md:justify-items-start">
        <Eyebrow>I još nešto…</Eyebrow>
        <SecretKrigla />
        <H2>{live ? "Uskoro u aplikaciji." : "Vidimo se 1. 12."}</H2>
      </div>
      <div className="float">
        <div style={{ transform: "perspective(1000px) rotateX(7deg) rotateY(14deg) rotateZ(-3deg)" }}>
          <Phone width="clamp(170px, 46vw, 260px)">
            <Splash />
          </Phone>
        </div>
      </div>
    </section>
  );
}

// Igra (A): u mobitelu, bez imena igre.
export function PlayGame() {
  return (
    <section id="igra" className="mx-auto grid max-w-6xl justify-items-center gap-8 px-5 py-24 text-center md:grid-cols-2 md:items-center md:text-left">
      <div className="grid justify-items-center gap-4 md:justify-items-start">
        <Eyebrow>Probaj odmah</Eyebrow>
        <H2>Primjer onoga što dolazi.</H2>
        <p className="max-w-[36ch] text-[15px] text-soft text-pretty md:text-[17px]">
          Igre u LAKTU nemaju kraja, samo rekord. Ovo je jedna od njih. Tap je skok, dulji tap viši skok.
        </p>
      </div>
      <Game />
    </section>
  );
}

// Promo film (A): u mobitelu.
export function Film() {
  return (
    <section className="mx-auto grid max-w-6xl justify-items-center gap-8 px-5 py-24 text-center md:grid-cols-2 md:items-center md:text-left">
      <div className="grid justify-items-center gap-4 md:order-2 md:justify-items-start">
        <Eyebrow>Najava</Eyebrow>
        <H2>Pogledaj prije svih.</H2>
      </div>
      <PromoVideo />
    </section>
  );
}

// Privatnost (Petar nije odabrao varijantu; A je zadana dok ne kaže drugačije).
export function Privacy() {
  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-5 py-28">
      <h2 className="font-display text-[clamp(52px,15vw,64px)] leading-[0.92] uppercase text-balance md:text-[clamp(72px,8vw,128px)]">
        Vidi te samo tvoj pajdaš<span className="text-accent">.</span>
      </h2>
      <p className="max-w-[40ch] text-[16px] text-soft text-pretty md:text-[19px]">
        Javno objavljuješ samo kad ti to uključiš. „Vani sam“ se sam ugasi kad odeš.
      </p>
    </section>
  );
}

// Lista čekanja (D): Krigla pita. id="lista" skriva donji gumb kad je forma na ekranu.
export function WaitlistSection() {
  return (
    <section id="lista" className="mx-auto grid max-w-6xl gap-8 px-5 py-24 md:grid-cols-2 md:items-center">
      <div className="grid gap-4">
        <H2>Javi mi prvi.</H2>
        <p className="max-w-[36ch] text-[15px] text-soft text-pretty md:text-[17px]">
          Jedan mail 1. 12. u podne kad LAKAT izađe. Ništa više.
        </p>
      </div>
      <div className="w-full max-w-md">
        <Waitlist />
      </div>
    </section>
  );
}

// Instagram (D): Krigla zove.
export function Instagram({ live }) {
  return (
    <section className="mx-auto grid max-w-6xl justify-items-start gap-6 px-5 py-20">
      <KriglaSays size={64}>{live ? "Sve novo prvo ide na Instagram. Prati." : "Ne daš mail? Dobro. Onda me barem prati."}</KriglaSays>
      <a
        href={INSTAGRAM}
        target="_blank"
        rel="noopener"
        className="inline-flex min-h-[52px] items-center gap-2.5 rounded-full border border-[#3a3a42] px-6 text-[16px] font-semibold text-fg transition-[border-color,background-color] hover:border-accent hover:bg-surface"
      >
        {IG}@lakat_app
      </a>
    </section>
  );
}

// FAQ (B): chat, Krigla odgovara na predložena pitanja. Samo ono što je Petar potvrdio.
const FAQ = [
  ["Kad izlazi?", "1. 12. u podne. Prvo na iPhoneu, Android uskoro iza."],
  ["Što je s mojim računom s weba?", "Ostaje. Prijaviš se u aplikaciji i sve te čeka."],
  ["Zašto ne mogu u web app?", "Web je bio proba i bio je solidan. Tek sada dolazi nešto što para gaće."],
  ["Tko me vidi na karti?", "Samo pajdaši koje prihvatiš. Javno samo ako ti to uključiš."],
];

export function Faq({ live }) {
  const items = live ? [["Kad izlazi?", "Već je vani. Na iPhoneu odmah, Android uskoro iza."], ...FAQ.slice(1)] : FAQ;
  return (
    <section className="mx-auto grid max-w-2xl gap-6 px-5 py-24">
      <H2>Pitaš se?</H2>
      <FaqChat items={items} />
    </section>
  );
}

// Footer (C): Krigla maše. Bez potpisa (Petar d5).
export function Footer() {
  return (
    <footer className="border-t border-line px-5 pt-14 pb-36 text-center">
      <div className="mx-auto grid max-w-6xl justify-items-center gap-4">
        {/* Veća Krigla koja lebdi, sa zelenim brend sjajem (Petar, 2026-10-04). */}
        <div className="relative grid place-items-center py-4">
          <div className="krigla-glow pointer-events-none absolute inset-[-10%] rounded-full" aria-hidden="true" />
          <div className="float">
            <img
              src="/img/krigla-lik.webp"
              alt=""
              width={480}
              height={480}
              loading="lazy"
              className="relative w-[clamp(170px,48vw,250px)] object-contain drop-shadow-[0_16px_44px_rgb(74_222_128/0.55)]"
            />
          </div>
        </div>
        <p className="font-display text-[30px] leading-none uppercase">
          Vidimo se za šankom<span className="text-accent">.</span>
        </p>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[14px] text-muted">
          <a className="py-2 hover:text-fg" href="https://laktarenje.com/privatnost">Privatnost</a>
          <a className="py-2 hover:text-fg" href="https://laktarenje.com/uvjeti">Uvjeti</a>
          <a className="py-2 hover:text-fg" href="mailto:support@laktarenje.com">support@laktarenje.com</a>
          <a className="py-2 hover:text-fg" href={INSTAGRAM} target="_blank" rel="noopener">@lakat_app</a>
        </nav>
      </div>
    </footer>
  );
}
