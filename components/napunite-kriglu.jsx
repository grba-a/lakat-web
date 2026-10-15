import { stanje } from "@/lib/krigla-cilj";
import { KRIGLA_RAZINE, razinaPostotka } from "@/lib/krigla-slike";
import { dbReady, ukupno } from "@/lib/lista";
import { KriglaSays } from "./brand";

// Broj potvrđenih upisa (isti izvor za oba prikaza). null = baza nije spojena ili ne odgovara: tada se ništa ne crta.
async function potvrdenih() {
  if (!dbReady()) return null;
  return ukupno().catch(() => null);
}

// Krigla u „Vide te samo pajdaši“ (Petar 16. 10.): puni se sa svakim potvrđenim upisom, slika po pravoj
// napunjenosti, bez postotka i bez poruke o tome koliko fali. Bez baze ili bez ijednog upisa sekcija ostaje bez nje.
export async function KriglaListe() {
  const n = await potvrdenih();
  if (!n) return null;
  const razina = razinaPostotka(stanje(n).pct);
  return (
    <figure data-krigla-lista={razina} className="flex items-center gap-4 md:gap-5">
      <img src={KRIGLA_RAZINE[razina]} alt="" width={360} height={360} loading="lazy" decoding="async" className="size-[104px] shrink-0 object-contain md:size-[148px]" />
      <figcaption className="max-w-[22ch] text-[16px] leading-snug font-semibold text-fg text-pretty md:text-[18px]">
        Svako novo ime na listi dolije malo u Kriglu.
      </figcaption>
    </figure>
  );
}

// Napunite Kriglu (Petar k1–k5) na /potvrdeno: tu tjera na dijeljenje i otkriva tragove o sedmoj funkciji.
// Bez tužne Krigle i bez postotka; traka ostaje.
export async function NapuniteKriglu() {
  if (process.env.NEXT_PUBLIC_LISTA_PRO !== "1") return null;
  const n = await potvrdenih();
  if (n === null) return null;
  const s = stanje(n);
  return (
    <section className="grid gap-4">
      <h2 className="font-display text-[clamp(36px,10vw,48px)] leading-[0.95] uppercase">
        Napunite Kriglu<span className="text-accent">.</span>
      </h2>
      <div className="h-3 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-label="Koliko je Krigla pun" aria-valuenow={s.pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-[linear-gradient(90deg,#f5b544,#4ade80)]" style={{ width: `${Math.max(3, s.pct)}%` }} />
      </div>
      <p className="text-[15px] text-soft text-pretty">
        Svaki potvrđeni upis je jedna kap, i tvoj je već unutra. Kad se Krigla napuni, otkriva se trag o sedmoj funkciji.
      </p>
      {s.tragovi.map((t) => (
        <KriglaSays key={t} size={40}>
          {t}
        </KriglaSays>
      ))}
    </section>
  );
}
