// LAKAT /admin (Petar 11. 11.): App Store stanje i brojke aplikacije na jednom mjestu, pod šifrom.
// SAMO ZBROJEVI: nijedno ime, slika ni lokacija (pravilo 3.0 vrijedi i za admina).
import { notFound } from "next/navigation";
import { Punct } from "@/components/brand";
import { adminUkljucen, jesamLiAdmin, pregled } from "@/lib/admin";
import { ascPregled, ascReady } from "@/lib/asc";
import { odjava } from "./actions";
import { Prijava } from "./prijava";
import { Kartica, Naslov, Plocica, Stupci, Trake, Upozorenje, broj, datum, vrijeme } from "./ui";
import { Angazman, Igre, Kafici, ODJELJCI, Pregled, Push, Rast, Sustav } from "./odjeljci";

export const metadata = {
  title: "Admin · LAKAT",
  robots: { index: false, follow: false },
};

const WEB = [
  ["posjet", "Posjet"],
  ["obrazac_start", "Počeo obrazac"],
  ["form_ok", "Poslao obrazac"],
  ["potvrda", "Potvrdio e-mail"],
];
const STANJA = {
  PREORDER_READY_FOR_SALE: "Prednarudžba",
  READY_FOR_SALE: "U trgovini",
  WAITING_FOR_REVIEW: "Čeka pregled",
  IN_REVIEW: "U pregledu",
  PENDING_DEVELOPER_RELEASE: "Čeka tvoje puštanje",
  REJECTED: "Odbijeno",
  PREPARE_FOR_SUBMISSION: "Priprema",
};

export default async function AdminPage({ searchParams }) {
  if (!adminUkljucen()) notFound();

  if (!(await jesamLiAdmin())) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-12">
        <h1 className="font-display text-5xl uppercase leading-none">
          <Punct>Admin.</Punct>
        </h1>
        <Prijava />
      </main>
    );
  }

  const sp = (await searchParams) ?? {};
  const dana = [7, 30, 90].includes(Number(sp.d)) ? Number(sp.d) : 30;
  const mjera = typeof sp.m === "string" ? sp.m : "aktivni";
  const [pr, asc] = await Promise.all([pregled(dana), ascPregled()]);
  const p = pr.podaci;
  // App Store odjeljak čita web korake i listu čekanja u starom obliku.
  const s = p
    ? {
        web: p.web,
        web_od: p.od,
        lista: {
          ukupno: p.seg_lista?.ukupno,
          potvrdeno: p.seg_lista?.potvrdeno,
          iphone: p.seg_lista?.platforma?.iphone ?? 0,
          android: p.seg_lista?.platforma?.android ?? 0,
        },
      }
    : null;

  return (
    <main
      className="mx-auto flex max-w-5xl flex-col gap-12 pb-16 pt-8"
      style={{ paddingLeft: "max(16px, env(safe-area-inset-left))", paddingRight: "max(16px, env(safe-area-inset-right))" }}
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl uppercase leading-none">
            LAKAT<span className="text-accent">.</span> Admin
          </h1>
          <p className="mt-2 text-sm text-muted">{p ? `Osvježeno ${vrijeme(p.generirano)}. Samo zbrojevi, uključeni i tvoji testni računi.` : " "}</p>
        </div>
        <form action={odjava}>
          <button type="submit" className="h-11 rounded-xl border border-line px-4 text-sm text-muted hover:text-fg">
            Odjava
          </button>
        </form>
      </header>

      <nav
        aria-label="Odjeljci"
        className="sticky top-0 z-10 -mx-4 -mb-6 flex flex-col gap-2 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur"
        style={{ top: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex items-center gap-1.5">
          {[7, 30, 90].map((n) => (
            <a
              key={n}
              href={`?d=${n}&m=${mjera}`}
              aria-current={n === dana ? "page" : undefined}
              className={`flex h-9 items-center rounded-full border px-3.5 text-sm ${n === dana ? "border-accent bg-accent font-bold text-[#052e16]" : "border-line text-soft"}`}
            >
              {n} d
            </a>
          ))}
          <span className="ml-1 text-xs text-muted">prema {dana} d prije</span>
        </div>
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none]">
          {ODJELJCI.map(([id, ime]) => (
            <a key={id} href={`#${id}`} className="flex h-9 shrink-0 items-center rounded-full bg-surface px-3.5 text-sm text-soft hover:text-fg">
              {ime}
            </a>
          ))}
        </div>
      </nav>

      {p ? (
        <>
          <Pregled p={p} mjera={mjera} />
          <Rast p={p} />
          <Angazman p={p} />
          <Igre p={p} />
          <Push p={p} />
          <Kafici p={p} />
          <Sustav p={p} />
        </>
      ) : (
        <Upozorenje>{pr.greska}</Upozorenje>
      )}
      <AppStore asc={asc} s={s} />
    </main>
  );
}

function AppStore({ asc, s }) {
  const web = Object.fromEntries((s?.web ?? []).map((w) => [w.korak, w.broj]));
  const lista = s?.lista;
  const v = asc?.verzija, b = asc?.build, t = asc?.testeri, r = asc?.recenzije;
  const pn = asc?.prednarudzbe, pz = asc?.preuzimanja;
  return (
    <section id="app-store" className="flex scroll-mt-28 flex-col gap-4">
      <Naslov pod="Izlazak 1. 12. 2026.">App Store.</Naslov>
      {!ascReady() && <Upozorenje>Appleov ključ nije spojen (ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_P8_B64).</Upozorenje>}
      {asc?.greska && <Upozorenje>{asc.greska}</Upozorenje>}
      {asc && !asc.greska && (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {pn && (
            <Plocica
              oznaka="Prednarudžbe"
              vrijednost={pn.ok ? broj(pn.ukupno - pn.otkazano) : "—"}
              ton="text-accent"
              ispod={pn.ok ? `${broj(pn.ukupno)} naručilo · ${broj(pn.otkazano)} otkazalo` : pn.greska}
            />
          )}
          {pz?.ok && !pz.nijePocelo && (
            <Plocica oznaka="Preuzimanja" vrijednost={broj(pz.ukupno)} ton="text-accent" ispod="prva preuzimanja, do jučer" />
          )}
          <Plocica
            oznaka={`Verzija ${v?.verzija ?? ""}`}
            vrijednost={v?.ok ? STANJA[v.stanje] ?? v.stanje ?? "—" : "—"}
            ton="text-accent"
            mala
            ispod={v?.ok ? null : v?.greska}
          />
          {b?.ok && <Plocica oznaka="Zadnji build" vrijednost={b.broj ?? "—"} mala ispod={b.datum ? `predan ${datum(b.datum)}` : null} />}
          {(t?.ok ? t.grupe : []).map((g) => (
            <Plocica
              key={g.ime}
              oznaka={`TestFlight · ${g.ime}`}
              vrijednost={broj(g.ukupno)}
              ispod={`${broj(g.instalirali)} instaliralo${g.limit ? ` · link do ${g.limit}` : ""}`}
            />
          ))}
          <Plocica
            oznaka="Recenzije"
            vrijednost={r?.ok ? broj(r.ukupno) : "—"}
            ispod={r?.ok ? (r.prosjek ? `prosjek ${String(Math.round(r.prosjek * 10) / 10).replace(".", ",")} ★` : "stižu nakon izlaska") : r?.greska}
          />
        </div>
      )}
      {pn?.ok && pn.dani.length > 0 && (
        <Kartica naslov="Prednarudžbe po danu" pod="Appleov izvještaj stiže dan kasnije. Otkazane nisu oduzete.">
          <Stupci redovi={pn.dani} polje="narudzbe" oznaka="Prednarudžbe" />
        </Kartica>
      )}
      {pz?.ok && pz.dani.length > 0 && (
        <Kartica naslov="Preuzimanja po danu" pod="Prva preuzimanja, bez nadogradnji. Zadnjih 30 dana.">
          <Stupci redovi={pz.dani} polje="narudzbe" oznaka="Preuzimanja" />
        </Kartica>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <Kartica
          naslov="laktarenje.com, lista čekanja"
          pod={lista ? `Na listi ${broj(lista.ukupno)} (iPhone ${broj(lista.iphone)}, Android ${broj(lista.android)}), potvrdilo ${broj(lista.potvrdeno)}.` : null}
        >
          {s ? (
            <Trake redovi={WEB.map(([k, ime]) => ({ k: ime, v: web[k] ?? 0 }))} />
          ) : (
            <p className="text-sm text-muted">—</p>
          )}
          {s?.web_od && <p className="mt-3 text-xs text-muted">Koraci od {datum(s.web_od)}</p>}
        </Kartica>
        <Kartica naslov="Još ne vidim" pod="Apple je počeo skupljati 11. 11.">
          <ul className="flex flex-col gap-2 text-sm">
            {!(b?.ok && t?.ok && t.grupe.length) && (
              <li className="rounded-xl border border-dashed border-line px-3 py-2">
                <b className="font-bold">Buildovi i TestFlight</b>
                <span className="block text-xs text-muted">Ključ na webu smije samo izvještaje, namjerno. To je u TestFlight appu.</span>
              </li>
            )}
            <li className="rounded-xl border border-dashed border-line px-3 py-2">
              <b className="font-bold">Prikazi stranice, konverzija, zadržavanje</b>
              <span className="block text-xs text-muted">App Analytics, Apple ih puni 1 do 2 dana nakon prvog zahtjeva.</span>
            </li>
          </ul>
        </Kartica>
      </div>
    </section>
  );
}
