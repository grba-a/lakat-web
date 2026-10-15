import { faqZa } from "@/lib/faq";
import { KRIGLA_KORACI } from "@/lib/krigla-slike";
import { MREZE, ODLOMAK } from "@/lib/opis";
import { KriglaSays, Punct } from "./brand";
import { FaqChat } from "./faq-chat";
import { Game } from "./game";
import { HuntKrigla } from "./hunt";
import { SecretKrigla } from "./secret-krigla";
import { MrezaIkona } from "./mreze";
import { KriglaListe } from "./napunite-kriglu";
import { StoryButton } from "./story-button";
import { PrivacyWords } from "./privacy-words";
import { PromoVideo } from "./promo-video";
import { CatchPoint } from "./sticky-cta";
import { Waitlist } from "./waitlist";

// Sekcije početne, nova struktura (Petar, 15. 10., j-nova-struktura): devet sekcija, svaka ima jedan posao.
// Raspored je mobile first: jedan stupac, na desktopu tekst i slika jedno do drugog.

const PRO = process.env.NEXT_PUBLIC_LISTA_PRO === "1";

function H2({ children, className = "", id }) {
  return (
    <h2 id={id} className={`font-display text-[clamp(40px,11vw,52px)] leading-[0.95] uppercase text-balance md:text-[clamp(56px,5.6vw,84px)] ${className}`}>
      <Punct>{children}</Punct>
    </h2>
  );
}

// 2. Laktarenje u tri koraka (j-tri-koraka): kako LAKAT radi, prije ture. Uz svaki korak jedna Krigla (Petar, druge B).
const KORACI = [
  ["Dodaš ekipu.", "Samo ljude koje prihvatiš."],
  ["Vani si? Objaviš rundu.", "Kava se isto računa."],
  ["Ekipa vidi gdje si i dođe.", "Ili te barem zeza da si doma."],
];

export function TriKoraka({ live = false }) {
  return (
    <section aria-labelledby="koraci-naslov" className="relative mx-auto grid max-w-6xl gap-10 px-5 pt-16 pb-20 md:pt-24">
      <HuntKrigla id="tajna" size={20} className="top-4 right-3" />
      <div className="grid gap-4">
        <H2 id="koraci-naslov">Laktarenje u tri koraka.</H2>
        {/* Rečenica koja je bila nad heroom (Petar 16. 10.): ovdje je tiši uvod, a H1 u heroju ju i dalje nosi za tražilice. */}
        <p className="max-w-[38ch] text-[17px] leading-snug text-soft text-pretty md:text-[20px]">
          LAKAT je aplikacija za druženje s ekipom, a cijela znanost stane u tri koraka.
        </p>
      </div>
      <ol className="grid gap-6 md:grid-cols-3 md:gap-8">
        {KORACI.map(([a, b], i) => (
          <li key={a} className="grid grid-cols-[88px_1fr] items-center gap-4 md:grid-cols-1 md:items-start">
            <img src={KRIGLA_KORACI[i]} alt="" width={200} height={200} loading="lazy" className="size-[88px] object-contain md:size-[120px]" />
            <p className="grid gap-1">
              <span className="font-display text-[26px] leading-none text-accent">{i + 1}</span>
              <span className="text-[18px] leading-snug font-semibold text-fg text-pretty md:text-[20px]">{a}</span>
              <span className="text-[16px] leading-snug text-soft text-pretty">{b}</span>
            </p>
          </li>
        ))}
      </ol>
      <div className="grid gap-3 md:flex md:items-center md:justify-between">
        {!live && (
          <a href="#lista" className="text-[16px] font-bold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent">
            {PRO ? "Rezerviraj svoje @ime" : "Javi mi prvi"}
          </a>
        )}
        {/* j-dokaz-bez-brojki: jedino istinito, bez ijednog broja. */}
        <p className="text-[14px] text-muted">LAKAT je već živio na webu, sad seli na iPhone.</p>
      </div>
    </section>
  );
}

// 4. Privatnost: „Vide te samo pajdaši.“ riječ po riječ (Petar w29, c-privatnost-pajdasi).
// Vizual sekcije je Krigla koja se puni s listom (Petar 16. 10.), s pravim brojem s poslužitelja.
export function Privacy() {
  return (
    <PrivacyWords>
      <KriglaListe />
    </PrivacyWords>
  );
}

// 5. Rezerviraj @ime (j-lista-ranije, c-rezervacija-imena): obrazac je peta sekcija.
// id="lista" skriva donji gumb kad je obrazac na ekranu. Nakon lansiranja ostaje za Android (w20).
export function WaitlistSection({ live = false }) {
  const naslov = live ? (
    <div className="grid gap-3">
      <H2>Imaš Android?</H2>
      <p className="max-w-[36ch] text-[17px] leading-snug text-soft text-pretty md:text-[19px]">Android stiže u siječnju 2027. Ostavi mail i javim ti kad stigne.</p>
    </div>
  ) : (
    <div className="grid gap-3">
      <H2>{PRO ? "Rezerviraj svoje @ime." : "Javi mi prvi."}</H2>
      <p className="max-w-[36ch] text-[17px] leading-snug text-soft text-pretty md:text-[19px]">
        {PRO ? "Jedno ime, jedan vlasnik. Tko ga prvi upiše, njegovo je." : "Potvrda sad, a 1. 12. u podne jedan mail s linkom. Ništa više."}
      </p>
    </div>
  );
  return (
    <section id="lista" className="mx-auto max-w-6xl scroll-mt-6 px-5 py-20 md:py-28">
      <div className="mx-auto max-w-md md:max-w-none">
        <Waitlist android={live} velik naslov={naslov} />
      </div>
    </section>
  );
}

// 6. Film (A): u mobitelu. Druga prilika za neodlučne.
export function Film() {
  return (
    <section className="relative mx-auto grid max-w-6xl justify-items-center gap-8 px-5 py-20 text-center md:grid-cols-2 md:items-center md:py-24 md:text-left">
      <HuntKrigla id="podne" size={20} className="top-4 left-3" />
      <div className="grid justify-items-center gap-4 md:order-2 md:justify-items-start" data-krigla="Ja sam glavni u filmu.">
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

// 7. Igra (A): u mobitelu, bez imena igre. Zabava ostaje gdje je (j-igra-nagrada NE), s rekordom i ljestvicom.
export function PlayGame({ challenge = null }) {
  return (
    <section id="igra" data-krigla="Ajde, pobijedi me." className="mx-auto grid max-w-6xl justify-items-center gap-8 px-5 py-20 text-center md:grid-cols-2 md:items-center md:py-24 md:text-left">
      <div className="grid justify-items-center gap-4 md:justify-items-start">
        <H2>{challenge !== null ? `Pajdaš ima ${challenge}. Možeš li bolje?` : "Primjer onoga što dolazi."}</H2>
        <p className="max-w-[36ch] text-[15px] text-soft text-pretty md:text-[17px]">
          Igre u LAKTU nemaju kraja, samo rekord. Ovo je jedna od njih, ista staza za sve danas. Tap je skok, dulji tap viši skok.
        </p>
        <div className="hidden md:block">
          <CatchPoint text="Ovo je samo primjer. Ostalo stiže 1. 12." />
        </div>
      </div>
      <Game challenge={challenge} />
      <div className="md:hidden">
        <CatchPoint text="Ovo je samo primjer. Ostalo stiže 1. 12." />
      </div>
    </section>
  );
}

// 8. FAQ (B): chat, odgovori su u HTML-u (faq-u-html).
export function Faq({ live }) {
  return (
    <section data-krigla="Pitaj što god hoćeš." aria-labelledby="faq-naslov" className="relative mx-auto grid max-w-2xl gap-6 px-5 py-20 md:py-24">
      <HuntKrigla id="faq" size={22} className="right-1 bottom-6" />
      <H2 id="faq-naslov">Pitaš se?</H2>
      <FaqChat items={faqZa(live)} />
    </section>
  );
}

// 9a. Mreže (D): Krigla zove, Instagram istaknut, TikTok i Facebook uz njega (mreze, entitet-mreze).
export function Mreze({ live }) {
  const [ig, ...ostale] = MREZE;
  return (
    <section data-krigla="Prati me, tamo sam svaki dan." aria-label="Prati LAKAT" className="mx-auto grid max-w-6xl justify-items-start gap-6 px-5 py-16">
      <KriglaSays size={64}>{live ? "Sve novo prvo ide na mreže. Prati." : "Ne daš mail? Dobro. Onda me barem zaprati."}</KriglaSays>
      <div className="flex flex-wrap items-center gap-3">
        {/* Istaknuti gumb u Instagramovim bojama (Petar, 2026-10-05). */}
        <a
          href={ig.href}
          target="_blank"
          rel="noopener"
          className="ig-btn inline-flex min-h-[56px] items-center gap-3 rounded-full px-7 text-[17px] font-bold text-white active:scale-[0.97]"
        >
          <MrezaIkona id="instagram" />
          Zaprati {ig.rucka}
        </a>
        {ostale.map((m) => (
          <a
            key={m.id}
            href={m.href}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full border border-line bg-surface px-5 text-[15px] font-semibold text-fg transition-colors hover:border-[#3f3f46]"
          >
            <MrezaIkona id={m.id} size={18} />
            {m.ime}
          </a>
        ))}
      </div>
      {!live && <StoryButton />}
    </section>
  );
}

// 9b. Footer (C): Krigla maše i čuva tajnu (isto-dvaput: Tajna je sad ovdje). Bez potpisa (Petar d5).
export function Footer() {
  return (
    <footer className="relative border-t border-line px-5 pt-14 pb-36 text-center">
      <HuntKrigla id="footer" size={20} className="top-4 right-4" />
      <div className="mx-auto grid max-w-6xl justify-items-center gap-4">
        <SecretKrigla />
        <div className="mt-8 grid w-full max-w-sm gap-3">
          <p className="text-[14px] font-semibold text-soft">Prati LAKAT</p>
          <div className="flex justify-center gap-3">
            {MREZE.map((m) => (
              <a
                key={m.id}
                href={m.href}
                target="_blank"
                rel="noopener"
                aria-label={`LAKAT na ${m.ime === "TikTok" ? "TikToku" : m.ime === "Facebook" ? "Facebooku" : "Instagramu"}`}
                className="grid size-12 place-items-center rounded-full border border-line bg-surface text-fg transition-colors hover:border-accent hover:text-accent"
              >
                <MrezaIkona id={m.id} />
              </a>
            ))}
          </div>
          <a
            href="mailto:support@laktarenje.com"
            className="mt-2 flex min-h-[52px] items-center justify-center gap-2.5 rounded-full border border-line bg-surface text-[15px] font-semibold text-fg transition-colors hover:border-[#3f3f46]"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            support@laktarenje.com
          </a>
        </div>
        {/* Jedan opis LAKTA, isti kao u tražilicama i na mrežama (rijeci-namjere, entitet-mreze). */}
        <p className="mt-6 max-w-[52ch] text-[14px] leading-relaxed text-muted text-pretty">{ODLOMAK.join(" ")}</p>
        <div className="mt-4 flex w-full max-w-sm flex-wrap items-center justify-between gap-y-2 border-t border-line pt-5 text-[13px] text-muted">
          <span className="font-display text-[18px] leading-none text-fg">
            LAKAT<span className="text-accent">.</span>
          </span>
          <nav aria-label="Podnožje" className="flex flex-wrap gap-x-5">
            <a className="py-2 hover:text-fg" href="/sto-je-lakat">Što je LAKAT</a>
            <a className="py-2 hover:text-fg" href="/privatnost">Privatnost</a>
            <a className="py-2 hover:text-fg" href="/uvjeti">Uvjeti</a>
            <a className="py-2 hover:text-fg" href="/press">Press</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
