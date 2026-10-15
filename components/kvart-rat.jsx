import { dbReady, kvartovi } from "@/lib/lista";
import { KvartObrazac } from "./kvart-obrazac";

// Kvartovski rat prije šanka (Petar w07), od 15. 10. na /potvrdeno zajedno s pitanjem za kvart (j-kvart-poslije).
// Vidi se samo kvart i mjesto, nikad ljudi ni brojke (pogled lista_kvartovi broji samo kvartove s 3+ upisa).
export async function KvartRat({ imaKvart = false, mozeUpisati = false }) {
  if (!dbReady() || process.env.NEXT_PUBLIC_LISTA_PRO !== "1") return null;
  const rows = await kvartovi(5).catch(() => []);
  return (
    <section className="grid gap-5">
      <h2 className="font-display text-[clamp(36px,10vw,48px)] leading-[0.95] uppercase">
        Kvart protiv kvarta<span className="text-accent">.</span>
      </h2>
      <p className="text-[15px] text-soft text-pretty">Kvart koji vodi 1. 12. dobiva naslov u aplikaciji. Tvoj kvart treba glasove.</p>
      {mozeUpisati && !imaKvart && <KvartObrazac />}
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
        <p className="text-[14px] text-muted">Još nijedan kvart nema tri upisa. Upiši svoj i dovedi ekipu.</p>
      )}
    </section>
  );
}
