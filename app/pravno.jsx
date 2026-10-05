import Link from "next/link";

// Zajednički izgled za /uvjeti i /privatnost (Apple 1.2 i 5.1.1, GDPR čl. 13).
// Preneseno iz lakat-pwa 2026-10-05 (Petar d2): iOS aplikacija otvara laktarenje.com/uvjeti i /privatnost.
// Petrov izbor (artifact pravno/, 3.10.2026.): kratki sažetak u LAKAT tonu na
// vrhu, ispod formalni tekst. Statično, bez client JS-a, javno (proxy.js).

export const VODITELJ = {
  ime: "Petar Grbić",
  adresa: "Rivjera 10, Mlini, Hrvatska",
  mail: "support@laktarenje.com",
};

export function PravnaStranica({ naslov, verzija, sazetak, children }) {
  return (
    <main className="mx-auto min-h-dvh max-w-[42rem] px-4 pb-24 pt-10">
      <Link href="/" className="font-display text-2xl uppercase leading-none">
        Lakat<span className="text-accent">.</span>
      </Link>

      <h1 className="mt-10 font-display text-5xl uppercase leading-[0.95] tracking-tight text-balance">
        {naslov}
        <span className="text-accent">.</span>
      </h1>
      <p className="mt-3 text-sm text-muted">{verzija}</p>

      <section className="mt-8 rounded-3xl border border-line bg-surface p-5">
        <h2 className="font-display text-2xl uppercase leading-none">
          Ukratko<span className="text-accent">.</span>
        </h2>
        <ul className="mt-4 flex flex-col gap-3 text-[15px] leading-relaxed">
          {sazetak.map((s) => (
            <li key={s} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 flex flex-col gap-9 text-[15px] leading-relaxed text-soft">
        {children}
      </div>

      <nav className="mt-14 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
        <Link href="/uvjeti" className="underline underline-offset-4">Uvjeti korištenja</Link>
        <Link href="/privatnost" className="underline underline-offset-4">Pravila privatnosti</Link>
        <a href={`mailto:${VODITELJ.mail}`} className="underline underline-offset-4">{VODITELJ.mail}</a>
      </nav>
    </main>
  );
}

export function Odjeljak({ broj, naslov, children }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-2xl uppercase leading-tight tracking-tight">
        <span className="mr-2 text-muted">{broj}</span>
        {naslov}
      </h2>
      {children}
    </section>
  );
}

export function Popis({ stavke }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-accent">
      {stavke.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ul>
  );
}
