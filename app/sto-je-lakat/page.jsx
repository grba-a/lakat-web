import Link from "next/link";
import { faqZa } from "@/lib/faq";
import { FEATURES, JOS } from "@/lib/features";
import { faqGraf, mrvice } from "@/lib/jsonld";
import { isLive } from "@/lib/launch";
import { KAD, MREZE, ODLOMAK } from "@/lib/opis";
import { jsonLd, stranica } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = stranica({
  naslov: "Što je LAKAT · aplikacija za druženje s ekipom",
  opis: "Što je LAKAT: hrvatska iPhone aplikacija za druženje i izlaske s ekipom. Funkcije, tko te vidi, kad izlazi i tko stoji iza.",
  put: "/sto-je-lakat",
});

// Mirna, činjenična stranica za ljude, Google i AI alate (SEO pregled sto-je-lakat). Samo potvrđene činjenice.
function Blok({ naslov, children }) {
  return (
    <section className="grid gap-4 border-t border-line pt-8 md:grid-cols-[1fr_1.6fr] md:gap-10">
      <h2 className="font-display text-[30px] leading-none uppercase">{naslov}</h2>
      <div className="grid gap-3 text-[16px] leading-relaxed text-soft">{children}</div>
    </section>
  );
}

export default function StoJeLakat() {
  const live = isLive();
  const faq = faqZa(live);
  return (
    <main className="mx-auto grid max-w-4xl gap-12 px-5 py-14 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(mrvice("Što je LAKAT", "/sto-je-lakat"))} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqGraf(faq))} />
      <header className="grid gap-6">
        <Link href="/" className="font-display text-[22px] leading-none">
          LAKAT<span className="text-accent">.</span>
        </Link>
        <h1 className="font-display text-[clamp(48px,12vw,96px)] leading-[0.92] uppercase">
          Što je LAKAT<span className="text-accent">?</span>
        </h1>
        <div className="grid max-w-[60ch] gap-3 text-[18px] leading-relaxed text-fg">
          {ODLOMAK.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p className="text-soft">{KAD[live ? "poslije" : "prije"]}</p>
        </div>
      </header>

      <Blok naslov="Što radi">
        <dl className="grid gap-4">
          {[...FEATURES, ...JOS].map((f) => (
            <div key={f.id} className="grid gap-1">
              <dt className="font-semibold text-fg">{f.name}</dt>
              <dd>{f.line}</dd>
            </div>
          ))}
        </dl>
      </Blok>

      <Blok naslov="Tko te vidi">
        <p>Runde, fotke i gdje si vide samo pajdaši koje prihvatiš. To provodi baza, ne samo aplikacija.</p>
        <p>Iznimka je javna runda, i to samo kad je sam upališ: 24 sata je vide ljudi u krugu od 1 km, a mjesto vide zaokruženo na oko 100 m.</p>
        <p>
          Sve piše u <Link href="/privatnost" className="text-accent underline underline-offset-4">pravilima privatnosti</Link>.
        </p>
      </Blok>

      <Blok naslov="Kad i gdje">
        <p>{KAD[live ? "poslije" : "prije"]}</p>
        <p>LAKAT je besplatan i samo za punoljetne (18+). Treba iOS 26 ili noviji.</p>
      </Blok>

      <Blok naslov="Tko stoji iza">
        <p>LAKAT radi Petar Grbić iz Hrvatske. Pitanja, prijave i mediji: <a href="mailto:support@laktarenje.com" className="text-accent underline underline-offset-4">support@laktarenje.com</a>.</p>
        <p>
          Za novinare: <Link href="/press" className="text-accent underline underline-offset-4">press</Link>, s ekranima i najavom.
        </p>
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          {MREZE.map((m) => (
            <a key={m.id} href={m.href} target="_blank" rel="noopener" className="text-accent underline underline-offset-4">
              {m.ime}
            </a>
          ))}
        </p>
      </Blok>

      <Blok naslov="Pitanja">
        <dl className="grid gap-5">
          {faq.map(([q, a]) => (
            <div key={q} className="grid gap-1">
              <dt className="font-semibold text-fg">{q}</dt>
              <dd>{a}</dd>
            </div>
          ))}
        </dl>
      </Blok>

      <Link href={live ? "/" : "/#lista"} className="inline-flex min-h-[52px] items-center justify-center justify-self-start rounded-full bg-accent px-6 text-[16px] font-bold text-[#052e16]">
        {live ? "Natrag na LAKAT" : "Rezerviraj svoje @ime"}
      </Link>
    </main>
  );
}
