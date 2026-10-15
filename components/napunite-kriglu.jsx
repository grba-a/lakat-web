import { stanje } from "@/lib/krigla-cilj";
import { dbReady, ukupno } from "@/lib/lista";
import { KriglaSays } from "./brand";

// Napunite Kriglu (Petar k1–k5), od 15. 10. samo na /potvrdeno (j-krigla-16): tu tjera na dijeljenje,
// a na početnoj je pred obrascem govorila da nikoga nema. Bez tužne Krigle i bez postotka; traka ostaje.
export async function NapuniteKriglu() {
  if (!dbReady() || process.env.NEXT_PUBLIC_LISTA_PRO !== "1") return null;
  const n = await ukupno().catch(() => null);
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
