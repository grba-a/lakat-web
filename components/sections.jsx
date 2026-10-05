import { INSTAGRAM } from "@/lib/launch";
import { KriglaSays, Punct } from "./brand";
import { FaqChat } from "./faq-chat";
import { Game } from "./game";
import { HuntKrigla } from "./hunt";
import { SecretKrigla } from "./secret-krigla";
import { StoryButton } from "./story-button";
import { Phone, Splash } from "./phone";
import { PrivacyWords } from "./privacy-words";
import { PromoVideo } from "./promo-video";
import { CatchPoint } from "./sticky-cta";
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
    <section data-krigla="Ne gledaj me tako. Ne smijem." className="relative mx-auto grid max-w-6xl justify-items-center gap-8 px-5 py-24 text-center md:grid-cols-2 md:items-center md:text-left">
      <div className="grid justify-items-center gap-6 md:justify-items-start">
        <Eyebrow>I još nešto…</Eyebrow>
        <SecretKrigla />
        <HuntKrigla id="tajna" size={20} className="top-6 left-2" />
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
export function PlayGame({ challenge = null }) {
  return (
    <section id="igra" data-krigla="Ajde, pobijedi me." className="mx-auto grid max-w-6xl justify-items-center gap-8 px-5 py-24 text-center md:grid-cols-2 md:items-center md:text-left">
      <div className="grid justify-items-center gap-4 md:justify-items-start">
        <Eyebrow>{challenge !== null ? "Izazov" : "Igra dana · ista staza za sve"}</Eyebrow>
        <H2>{challenge !== null ? `Pajdaš ima ${challenge}. Možeš li bolje?` : "Primjer onoga što dolazi."}</H2>
        <p className="max-w-[36ch] text-[15px] text-soft text-pretty md:text-[17px]">
          Igre u LAKTU nemaju kraja, samo rekord. Ovo je jedna od njih. Tap je skok, dulji tap viši skok.
        </p>
        <div className="hidden md:block">
          <CatchPoint />
        </div>
      </div>
      <Game challenge={challenge} />
      <div className="md:hidden">
        <CatchPoint />
      </div>
    </section>
  );
}

// Promo film (A): u mobitelu.
export function Film() {
  return (
    <section className="mx-auto grid max-w-6xl justify-items-center gap-8 px-5 py-24 text-center md:grid-cols-2 md:items-center md:text-left">
      <div className="grid justify-items-center gap-4 md:order-2 md:justify-items-start" data-krigla="Ja sam glavna u filmu.">
        <Eyebrow>Najava</Eyebrow>
        <H2>Pogledaj prije svih.</H2>
        <div className="hidden md:block">
          <CatchPoint text="Svidjelo ti se? Budi prvi za šankom." />
        </div>
      </div>
      <PromoVideo />
      <div className="md:hidden">
        <CatchPoint text="Svidjelo ti se? Budi prvi za šankom." />
      </div>
    </section>
  );
}

// Privatnost: riječ po riječ (Petar w29).
export function Privacy() {
  return <PrivacyWords />;
}

// Lista čekanja (D): Krigla pita. id="lista" skriva donji gumb kad je forma na ekranu.
// Nakon lansiranja forma ostaje za Android (w20).
export function WaitlistSection({ live = false }) {
  return (
    <section id="lista" className="mx-auto grid max-w-6xl gap-8 px-5 py-24 md:grid-cols-2 md:items-center">
      <div className="grid gap-4">
        <H2>{live ? "Imaš Android?" : "Javi mi prvi."}</H2>
        <p className="max-w-[36ch] text-[15px] text-soft text-pretty md:text-[17px]">
          {live ? "Stiže iza iPhonea. Ostavi mail i javim ti kad stigne." : "Potvrda sad, a 1. 12. u podne jedan mail s linkom. Ništa više."}
        </p>
      </div>
      <div className="w-full max-w-md">
        <Waitlist android={live} />
      </div>
    </section>
  );
}

// Instagram (D): Krigla zove.
export function Instagram({ live }) {
  return (
    <section data-krigla="Prati me, tamo sam svaki dan." className="mx-auto grid max-w-6xl justify-items-start gap-6 px-5 py-20">
      <KriglaSays size={64}>{live ? "Sve novo prvo ide na Instagram. Prati." : "Ne daš mail? Dobro. Onda me barem zaprati."}</KriglaSays>
      {/* Istaknuti gumb u Instagramovim bojama (Petar, 2026-10-05). */}
      <a
        href={INSTAGRAM}
        target="_blank"
        rel="noopener"
        className="ig-btn inline-flex min-h-[56px] items-center gap-3 rounded-full px-7 text-[17px] font-bold text-white active:scale-[0.98]"
      >
        {IG}
        Zaprati @lakat_app
      </a>
      {!live && <StoryButton />}
    </section>
  );
}

// FAQ (B): chat, Krigla odgovara na predložena pitanja. Samo ono što je Petar potvrdio.
const FAQ = [
  ["Kad izlazi?", "1. 12. u podne. Prvo na iPhoneu, Android uskoro iza."],
  ["Imam Android. Što sad?", "Stiže iza iPhonea. Ostavi mail i javim ti kad stigne."],
  ["Što je s mojim računom s weba?", "Ostaje. Prijaviš se u aplikaciji i sve te čeka."],
  ["Zašto ne mogu u web app?", "Web je bio proba i bio je solidan. Tek sada dolazi nešto što para gaće."],
  ["Tko me vidi na karti?", "Samo pajdaši koje prihvatiš. Javno samo ako ti to uključiš."],
];

export function Faq({ live }) {
  const items = live ? [["Kad izlazi?", "Već je vani. Na iPhoneu odmah, Android uskoro iza."], ...FAQ.slice(1)] : FAQ;
  return (
    <section data-krigla="Pitaj što god hoćeš." className="relative mx-auto grid max-w-2xl gap-6 px-5 py-24">
      <HuntKrigla id="faq" size={22} className="right-1 bottom-6" />
      <H2>Pitaš se?</H2>
      <FaqChat items={items} />
    </section>
  );
}

// Footer (C): Krigla maše. Bez potpisa (Petar d5).
export function Footer() {
  return (
    <footer className="relative border-t border-line px-5 pt-14 pb-36 text-center">
      <HuntKrigla id="footer" size={20} className="top-4 right-4" />
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
        {/* Donji dio footera, sređen (Petar, 2026-10-05): Instagram i kontakt kao gumbi, pravno sitno ispod. */}
        <div className="mt-4 grid w-full max-w-sm gap-3">
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener"
            className="ig-btn flex min-h-[52px] items-center justify-center gap-2.5 rounded-full text-[16px] font-bold text-white"
          >
            {IG}@lakat_app
          </a>
          <a
            href="mailto:support@laktarenje.com"
            className="flex min-h-[52px] items-center justify-center gap-2.5 rounded-full border border-line bg-surface text-[15px] font-semibold text-fg transition-colors hover:border-[#3f3f46]"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            support@laktarenje.com
          </a>
        </div>
        <div className="mt-6 flex w-full max-w-sm items-center justify-between border-t border-line pt-5 text-[13px] text-muted">
          <span className="font-display text-[18px] leading-none text-fg">
            LAKAT<span className="text-accent">.</span>
          </span>
          <nav className="flex gap-5">
            <a className="py-2 hover:text-fg" href="https://laktarenje.com/privatnost">Privatnost</a>
            <a className="py-2 hover:text-fg" href="https://laktarenje.com/uvjeti">Uvjeti</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
