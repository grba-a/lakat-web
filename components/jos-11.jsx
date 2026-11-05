import { JOS_11 } from "@/lib/features";
import { Punct } from "./brand";

// „Još u 1.1“ (Petar 5. 11., kartica „jos11“): jedna mirna traka ispod ture sa šest ostalih novosti iz 1.1,
// svaka u jednom retku. Crta se samo kad je 1.1 upaljen (home.jsx). Ekrani su iz simulatora s DEV testnim podacima.
const EKRANI = [
  ["globus", "LAKAT 1.1, karta odzumirana do globusa", "-rotate-[5deg] translate-y-3"],
  ["pokazi", "LAKAT 1.1, Šank sa zahtjevom „Pokaži se“", "z-10"],
  ["demo", "LAKAT 1.1, primjer Šanka prije prijave", "rotate-[5deg] translate-y-3"],
];

export function Jos11() {
  return (
    <section aria-labelledby="jos11-naslov" data-krigla="Ima još. Puno još." className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-16 md:py-28">
      <div className="grid gap-8">
        <h2 id="jos11-naslov" className="font-display text-[clamp(40px,11vw,52px)] leading-[0.95] uppercase md:text-[clamp(56px,5.6vw,84px)]">
          <Punct>Još u 1.1.</Punct>
        </h2>
        <div className="grid grid-cols-3 items-start gap-3 px-1 md:gap-4">
          {EKRANI.map(([id, alt, kut], i) => (
            <div key={id} data-reveal="pop" style={{ "--rv-d": `${i * 120}ms` }} className={kut}>
              <img
                src={`/img/jos11/${id}-240.webp`}
                srcSet={`/img/jos11/${id}-240.webp 240w, /img/jos11/${id}-480.webp 480w`}
                sizes="(min-width: 768px) 150px, calc((100vw - 64px) / 3)"
                alt={alt}
                width={480}
                height={988}
                loading="lazy"
                decoding="async"
                className="w-full rounded-[14px] border border-line shadow-[0_18px_40px_-18px_rgb(0_0_0/0.9)] md:rounded-[18px]"
              />
            </div>
          ))}
        </div>
      </div>
      <ul className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
        {JOS_11.map((f, i) => (
          <li key={f.id} data-reveal style={{ "--rv-d": `${(i % 2) * 90 + Math.floor(i / 2) * 70}ms` }} className="grid content-start gap-1 rounded-2xl border border-line bg-surface p-4">
            <b className="text-[16px] leading-tight font-semibold text-fg">{f.name}</b>
            <span className="text-[14px] leading-snug text-muted text-pretty">{f.line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
