import { stanje, BROJ_OD } from "@/lib/krigla-cilj";
import { dbReady, ukupno } from "@/lib/lista";
import { KriglaSays } from "./brand";

// Napunite Kriglu (Petar k1–k5): zajednička Krigla iznad liste čekanja puni se potvrđenim upisima.
export async function NapuniteKriglu() {
  if (!dbReady() || process.env.NEXT_PUBLIC_LISTA_PRO !== "1") return null;
  const n = await ukupno().catch(() => null);
  if (n === null) return null;
  const s = stanje(n);
  return (
    <section data-krigla="Svaki upis je kap u meni." className="mx-auto grid max-w-3xl gap-6 px-5 pt-20 md:grid-cols-[0.9fr_1.1fr] md:items-center">
      <div className="relative mx-auto w-[min(62vw,280px)]">
        <div className="krigla-glow pointer-events-none absolute inset-[-12%] rounded-full" aria-hidden="true" />
        <img src={`/img/krigla/${s.razina}.webp`} alt={`Krigla je ${s.pct} % puna`} width={480} height={480} className="float relative w-full object-contain" />
      </div>
      <div className="grid gap-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          Krigla {Math.min(s.korak + 1, 4)} od 4{s.sljedeci ? ` · cilj ${s.cilj}` : ""}
        </span>
        <h2 className="font-display text-[clamp(40px,11vw,56px)] leading-[0.95] uppercase">
          Napunite Kriglu<span className="text-accent">.</span>
        </h2>
        <div className="grid gap-2">
          <div className="h-3 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={s.pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#f5b544,#4ade80)]" style={{ width: `${Math.max(3, s.pct)}%` }} />
          </div>
          <p className="text-[14px] text-soft">
            <b className="font-display text-[22px] font-normal text-accent">{s.pct} %</b> napunjeno
            {n >= BROJ_OD ? ` · ${n} upisa` : ""}
          </p>
        </div>
        <p className="text-[15px] text-soft text-pretty">
          Svaki potvrđeni upis je jedna kap. Kad se Krigla napuni, otkrije trag o sedmoj funkciji, i kreće nova, veća.
        </p>
        {s.tragovi.map((t) => (
          <KriglaSays key={t} size={40}>
            {t}
          </KriglaSays>
        ))}
      </div>
    </section>
  );
}
