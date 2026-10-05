import { dbReady, kvartovi } from "@/lib/lista";
import { KriglaSays } from "./brand";

// Kvartovski rat prije šanka (Petar w07): poredak kvartova po potvrđenim upisima.
// Vidi se samo kvart i mjesto, nikad ljudi ni brojke (pogled lista_kvartovi broji samo kvartove s 3+ upisa).
export async function KvartRat() {
  if (!dbReady() || process.env.NEXT_PUBLIC_LISTA_PRO !== "1") return null;
  const rows = await kvartovi(5).catch(() => []);
  return (
    <section data-krigla="Tvoj kvart treba glasove." className="mx-auto grid max-w-2xl gap-6 px-5 py-20">
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Kafanski ratovi, prije šanka</span>
      <h2 className="font-display text-[clamp(40px,11vw,52px)] leading-[0.95] uppercase">
        Kvart protiv kvarta<span className="text-accent">.</span>
      </h2>
      {rows.length ? (
        <ol className="grid gap-2">
          {rows.map((r, i) => (
            <li key={`${r.grad}-${r.kvart}`} className={`grid grid-cols-[40px_1fr] items-center gap-3 rounded-2xl border px-4 py-3 ${i === 0 ? "border-accent/50 bg-accent/10" : "border-line bg-surface"}`}>
              <b className="font-display text-[26px] leading-none font-normal text-accent">{i + 1}</b>
              <span>
                <b className="block font-semibold">{r.kvart}</b>
                <span className="text-[13px] text-muted">{r.grad}</span>
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <KriglaSays size={48}>Još nijedan kvart nema tri upisa. Upiši svoj i dovedi ekipu.</KriglaSays>
      )}
      <p className="text-[14px] text-soft">Kvart koji vodi 1. 12. dobiva naslov u aplikaciji. Upiši kvart kad se prijaviš na listu.</p>
    </section>
  );
}
