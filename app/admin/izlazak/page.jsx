// Ratna soba za dan izlaska /admin/izlazak (Petar 11. 11.): sve ključno za 1. 12. na jednom ekranu, bez vrtnje.
// Ista prijava kao /admin. Samo zbrojevi. Osvježava se svakih 30 s, odbrojavanje svake sekunde.
import { notFound, redirect } from "next/navigation";
import { adminUkljucen, baza, igSnimka, jesamLiAdmin, pregled } from "@/lib/admin";
import { ascPregled } from "@/lib/asc";
import { instagram } from "@/lib/instagram";
import { LAUNCH, isLive } from "@/lib/launch";
import { provjere } from "@/lib/upozorenja";
import { Uzbune } from "../odjeljci";
import { Iskra } from "../ui";
import { Broj, Najave, Odbrojavanje, Osvjezi, Radar } from "../zivo";

export const metadata = { title: "Izlazak · LAKAT", robots: { index: false, follow: false } };

const broj = (n) => (n == null ? "—" : new Intl.NumberFormat("hr-HR").format(n));

// Razlika prema jučer: zelena gore, crvena dolje; bez jučerašnjeg broja ništa.
function Razlika({ sad, jucer }) {
  if (sad == null || jucer == null) return null;
  const r = sad - jucer;
  return <span className={`mono text-[clamp(11px,0.9vw,15px)] ${r >= 0 ? "up" : "down"}`}>{r >= 0 ? "▲ +" : "▼ −"}{broj(Math.abs(r))} od jučer</span>;
}

function Polje({ oznaka, v, ton, ispod, sirok, children }) {
  return (
    <div className={`flex min-w-0 flex-col justify-between gap-2 p-[clamp(12px,1.6vw,24px)] ${sirok ? "sm:col-span-2" : ""}`}>
      <p className="lbl text-[clamp(10.5px,0.9vw,14px)]">{oznaka}</p>
      <div className="flex items-end justify-between gap-3">
        <p className={`num text-[clamp(2.6rem,6.5vw,7rem)] ${ton ?? ""}`}>{typeof v === "string" ? <Broj v={v} /> : v}</p>
        {children}
      </div>
      {ispod && <p className="mono text-[clamp(10.5px,0.85vw,14px)] normal-case tracking-[0.03em] text-[color:var(--a-mute)]">{ispod}</p>}
    </div>
  );
}

export default async function IzlazakPage() {
  if (!adminUkljucen()) notFound();
  if (!(await jesamLiAdmin())) redirect("/admin");

  const [pr, asc, bz, ig] = await Promise.all([pregled(7), ascPregled(), baza(), instagram()]);
  const igNiz = ig?.profil ? await igSnimka(ig.profil.pratitelji, ig.profil.objave) : [];
  const p = pr.podaci;
  const uzbune = provjere({ pregled: pr, asc, baza: bz });
  const dani = p?.dnevno ?? [];
  const danas = dani.at(-1), jucer = dani.at(-2);
  const niz = (polje) => dani.map((d) => d[polje]);
  const pn = asc?.prednarudzbe, pz = asc?.preuzimanja;
  const lansirano = isLive();
  const igJucer = igNiz.length > 1 ? igNiz.at(-2).pratitelji : null;

  return (
    <main className="flex min-h-dvh flex-col gap-4 px-[3vw] py-4" style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <span className="lbl">[ LKT / IZLAZAK ] {"///"} 1. 12. 2026. 12:00</span>
        <div className="flex items-center gap-3">
          <Osvjezi sekundi={30} />
          <a href="/admin" className="chip mono flex h-11 items-center rounded-[var(--r-sm)] border border-[color:var(--a-line)] px-3 py-2 text-[11px] text-[color:var(--a-mute)]">
            [ PLOČA ]
          </a>
        </div>
      </header>

      <section className="border-b border-[color:var(--a-line)] pb-4">
        <p className="lbl">{lansirano ? "U trgovini" : "Do izlaska"}</p>
        <Odbrojavanje cilj={LAUNCH} className="num up block text-[clamp(3.5rem,13vw,12rem)] leading-none tabular-nums" />
      </section>

      <Uzbune popis={uzbune} />

      <div className="grid-lines grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {lansirano && pz?.ok && !pz.nijePocelo ? (
          <Polje oznaka="Preuzimanja" v={broj(pz.ukupno)} ton="up" ispod="Apple javlja dan kasnije" />
        ) : (
          <Polje oznaka="Prednarudžbe" v={pn?.ok ? broj(pn.ukupno - pn.otkazano) : "—"} ton="up" ispod={pn?.ok ? `${broj(pn.ukupno)} naručilo · Apple kasni 1 dan` : null} />
        )}
        <Polje oznaka="Novi profili danas" v={broj(danas?.novi)} ispod={`${broj(p?.ukupno?.profili)} ukupno`}>
          <div className="flex flex-col items-end gap-1"><Iskra niz={niz("novi")} oznaka="Novi profili" /><Razlika sad={danas?.novi} jucer={jucer?.novi} /></div>
        </Polje>
        <Polje oznaka="Aktivni danas" v={broj(p?.ukupno?.aktivni_danas)} ton="up" ispod={`${broj(danas?.runde)} rundi danas`}>
          <div className="flex flex-col items-end gap-1"><Iskra niz={niz("aktivni")} oznaka="Aktivni" /><Razlika sad={danas?.aktivni} jucer={jucer?.aktivni} /></div>
        </Polje>
        <Polje oznaka="Vani sad" v={broj(p?.ukupno?.vani_sad)} ispod="„Vani sam“ upaljen">
          <Radar broj={p?.ukupno?.vani_sad} velicina={72} />
        </Polje>
        <Polje
          oznaka="Instagram pratitelji"
          v={broj(ig?.profil?.pratitelji)}
          ispod={igJucer != null ? `${ig.profil.pratitelji - igJucer >= 0 ? "+" : "−"}${broj(Math.abs(ig.profil.pratitelji - igJucer))} od jučer` : "@lakat_app"}
        />
        <Polje oznaka="Lista čekanja" v={broj(p?.seg_lista?.potvrdeno)} ispod={`potvrđenih od ${broj(p?.seg_lista?.ukupno)}`} />
        <Polje oznaka="Oglas" v="—" ispod="spaja se kad dodaš ads_read (od 1. 12.)" />
        <Polje oznaka="Sustav" v={uzbune.some((u) => u.razina === "kriticno") ? "PAŽNJA" : "OK"} ton={uzbune.some((u) => u.razina === "kriticno") ? "down" : "up"} ispod={`${uzbune.length} uzbuna`} />
      </div>

      <section className="panel flex flex-col gap-2 p-[clamp(12px,1.6vw,24px)]" aria-label="Dnevnik zadnjih dana">
        <div className="flex items-center justify-between gap-3">
          <p className="lbl">Dnevnik {"///"} zadnjih {dani.length} dana</p>
          <p className="lbl hidden sm:block">novi · aktivni · runde · partije</p>
        </div>
        <ul className="mono text-[clamp(11px,0.9vw,15px)] tabular-nums">
          {[...dani].reverse().map((d, n) => (
            <li key={d.dan} className={`grid grid-cols-[1fr_repeat(4,5ch)] gap-2 border-b border-[color:var(--a-line)] py-1.5 last:border-0 ${n ? "text-[color:var(--a-mute)]" : ""}`}>
              <span>{n ? `${d.dan.slice(8, 10)}. ${d.dan.slice(5, 7)}.` : "> danas"}</span>
              <span className="text-right">{d.novi}</span>
              <span className={`text-right ${n ? "" : "up"}`}>{d.aktivni}</span>
              <span className="text-right">{d.runde}</span>
              <span className="text-right">{d.partije}</span>
            </li>
          ))}
        </ul>
      </section>

      <Najave
        uzbune={uzbune}
        brojke={{
          profili: p?.ukupno?.profili ?? null,
          prednarudzbe: pn?.ok ? pn.ukupno : null,
          pratitelji: ig?.profil?.pratitelji ?? null,
          runde: danas?.runde ?? null,
        }}
      />
    </main>
  );
}
