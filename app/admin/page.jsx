// LAKAT /admin (Petar 11. 11.): App Store stanje i brojke aplikacije na jednom mjestu, pod šifrom.
// SAMO ZBROJEVI: nijedno ime, slika ni lokacija (pravilo 3.0 vrijedi i za admina).
import { notFound } from "next/navigation";
import { Punct } from "@/components/brand";
import { adminUkljucen, jesamLiAdmin, statistika } from "@/lib/admin";
import { ascPregled, ascReady } from "@/lib/asc";
import { odjava } from "./actions";
import { Prijava } from "./prijava";

export const metadata = {
  title: "Admin · LAKAT",
  robots: { index: false, follow: false },
};

const IGRE = {
  sankerov_lakat: "Šankerov lakat",
  konobar: "Konobar",
  galeb: "Galeb",
  zlatni_tocionik: "Zlatni točionik",
  kula: "Kula",
  burek_u_cetiri: "Burek u četiri",
  gajba: "Gajba",
  do_krigle: "Do krigle",
};
const PUSH = {
  runda: "Runda",
  reakcija: "Reakcija",
  sad_ili_nikad: "Sad ili nikad",
  rekord: "Rekord",
  pajdas: "Pajdaš",
  najava: "Najava",
  tjedni_recap: "Tjedni recap",
  komentar: "Komentar",
  lakat: "Lakat",
  pokazi: "Pokaži",
  fomo: "Fomo",
};
const ULAZI = { ikona: "Ikona", push: "Push", link: "Link" };
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

const broj = (n) => (n == null ? "—" : new Intl.NumberFormat("hr-HR").format(n));
const posto = (a, b) => (b ? `${Math.round((a / b) * 100)} %` : "—");
const MJ = ["sij", "velj", "ožu", "tra", "svi", "lip", "srp", "kol", "ruj", "lis", "stu", "pro"];
// Datumi se slažu ručno, ne preko Intl: Node i Safari imaju različit ICU za hrvatski (hydration #418).
const datum = (iso) => {
  const [g, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  return g ? `${d}. ${m}.` : "—";
};
const vrijeme = (iso) => {
  const d = new Date(iso);
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", hour: "2-digit", minute: "2-digit", day: "numeric", month: "numeric" }).formatToParts(d);
  const v = Object.fromEntries(p.map((x) => [x.type, x.value]));
  return `${v.day}. ${MJ[Number(v.month) - 1]} u ${v.hour}:${v.minute}`;
};

export default async function AdminPage() {
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

  const [stat, asc] = await Promise.all([statistika(30), ascPregled()]);
  const s = stat.podaci;

  return (
    <main
      className="mx-auto flex max-w-5xl flex-col gap-10 pb-16 pt-8"
      style={{ paddingLeft: "max(16px, env(safe-area-inset-left))", paddingRight: "max(16px, env(safe-area-inset-right))" }}
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl uppercase leading-none">
            LAKAT<span className="text-accent">.</span> Admin
          </h1>
          <p className="mt-2 text-sm text-muted">{s ? `Osvježeno ${vrijeme(s.generirano)}. Samo zbrojevi, uključeni i tvoji testni računi.` : " "}</p>
        </div>
        <form action={odjava}>
          <button type="submit" className="h-11 rounded-xl border border-line px-4 text-sm text-muted hover:text-fg">
            Odjava
          </button>
        </form>
      </header>

      {s ? <Aplikacija s={s} /> : <Upozorenje>{stat.greska}</Upozorenje>}
      <AppStore asc={asc} s={s} />
    </main>
  );
}

function Upozorenje({ children }) {
  return <p className="rounded-xl border border-amber/40 bg-amber/5 px-4 py-3 text-sm text-amber">{children}</p>;
}

function Naslov({ children, pod }) {
  return (
    <div>
      <h2 className="font-display text-3xl uppercase leading-none">
        <Punct>{children}</Punct>
      </h2>
      {pod && <p className="mt-1.5 text-sm text-muted">{pod}</p>}
    </div>
  );
}

function Plocica({ oznaka, vrijednost, ispod, ton, mala }) {
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-surface px-4 py-3.5">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted">{oznaka}</p>
      <p className={`mt-1 font-display leading-none tabular-nums ${mala ? "text-2xl" : "text-4xl"} ${ton ?? "text-fg"}`}>{vrijednost}</p>
      {ispod && <p className="mt-1.5 text-xs text-muted tabular-nums">{ispod}</p>}
    </div>
  );
}

function Kartica({ naslov, pod, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-line bg-surface p-4">
      <h3 className="font-bold">{naslov}</h3>
      {pod && <p className="mt-0.5 text-xs text-muted">{pod}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

// Stupci po danu, crtani na serveru: bez biblioteke, širi se s karticom (viewBox + 100 %).
function Stupci({ redovi, polje, oznaka }) {
  const W = 360, H = 150, L = 24, B = 18;
  const max = Math.max(1, ...redovi.map((r) => r[polje]));
  const korak = Math.max(1, Math.ceil(max / 4));
  const vrh = korak * 4;
  const sir = (W - L) / redovi.length;
  const y = (v) => H - B - ((H - B - 8) * v) / vrh;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${oznaka} po danu, zadnjih ${redovi.length} dana`} className="block">
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <line x1={L} x2={W} y1={y(i * korak)} y2={y(i * korak)} stroke="var(--color-line)" strokeWidth="1" />
          <text x={L - 6} y={y(i * korak)} dy="0.32em" textAnchor="end" fontSize="11" fill="var(--color-muted)">
            {i * korak}
          </text>
        </g>
      ))}
      {redovi.map((r, i) => {
        const zadnji = i === redovi.length - 1;
        return (
          <g key={r.dan}>
            <rect
              x={L + i * sir + sir * 0.15}
              width={sir * 0.7}
              y={y(r[polje])}
              height={Math.max(0, H - B - y(r[polje]))}
              rx="2"
              fill="var(--color-accent)"
              opacity={zadnji ? 1 : 0.55}
            >
              <title>{`${datum(r.dan)}: ${r[polje]}`}</title>
            </rect>
            {(redovi.length - 1 - i) % 7 === 0 && (
              <text x={zadnji ? W : L + i * sir + sir / 2} y={H - 5} textAnchor={zadnji ? "end" : "middle"} fontSize="11" fill="var(--color-muted)">
                {datum(r.dan)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Trake({ redovi }) {
  const max = Math.max(1, ...redovi.map((r) => r.v));
  return (
    <ul className="flex flex-col gap-2">
      {redovi.map((r) => (
        <li key={r.k} className="grid grid-cols-[minmax(0,8.5rem)_1fr] items-center gap-3 text-sm">
          <span className="truncate text-soft">{r.k}</span>
          <span className="flex min-w-0 items-center gap-2">
            <span className="h-3 rounded-sm bg-accent" style={{ width: `${Math.max(2, (r.v / max) * 70)}%` }} />
            <span className="shrink-0 tabular-nums text-muted">
              {broj(r.v)}
              {r.n ? <span className="text-muted/70"> · {r.n}</span> : null}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Aplikacija({ s }) {
  const d = s.dnevno ?? [];
  const zad7 = d.slice(-7), pri7 = d.slice(-14, -7);
  const prosjek = (a) => (a.length ? a.reduce((x, r) => x + r.aktivni, 0) / a.length : 0);
  const dau = prosjek(zad7), dauPrije = prosjek(pri7);
  const razlika = Math.round((dau - dauPrije) * 10) / 10;
  const runde7 = zad7.reduce((x, r) => x + r.runde, 0);
  const u = s.ukupno;
  const zarez = (n) => String(n).replace(".", ",");

  const puls = Object.fromEntries((s.puls ?? []).map((p) => [p.kljuc, p.broj]));
  const pushVrste = Object.keys(PUSH)
    .map((k) => ({ k, ime: PUSH[k], poslano: puls[`push.poslano.${k}`] ?? 0, otvoreno: puls[`push.otvoreno.${k}`] ?? 0 }))
    .filter((r) => r.poslano || r.otvoreno)
    .sort((a, b) => b.poslano - a.poslano);
  const pushUk = pushVrste.reduce((x, r) => x + r.poslano, 0);
  const pushOtv = pushVrste.reduce((x, r) => x + r.otvoreno, 0);
  const ulazi = Object.keys(ULAZI).map((k) => ({ k: ULAZI[k], v: puls[`ulaz.${k}`] ?? 0 })).filter((r) => r.v);
  const igre = (s.igre ?? [])
    .filter((g) => IGRE[g.igra])
    .map((g) => ({ k: IGRE[g.igra], v: g.partije_7d, n: `${g.igraca} igr.` }))
    .sort((a, b) => b.v - a.v);

  return (
    <section className="flex flex-col gap-4">
      <Naslov pod={`Danas ${broj(u.aktivni_danas)} aktivnih, ${broj(d.at(-1)?.runde)} rundi. Vani sam: ${broj(u.vani_sad)}.`}>Aplikacija.</Naslov>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Plocica
          oznaka="Aktivni / dan"
          vrijednost={zarez(Math.round(dau * 10) / 10)}
          ispod={`${razlika > 0 ? "+" : razlika < 0 ? "−" : "±"}${zarez(Math.abs(razlika))} prema tjednu prije`}
        />
        <Plocica oznaka="Aktivni 30 d" vrijednost={broj(u.aktivni_30d)} ispod={`od ${broj(u.profili)} profila`} />
        <Plocica oznaka="Runde 7 d" vrijednost={broj(runde7)} ispod={`${broj(u.runde)} od početka`} />
        <Plocica oznaka="Pajdaštva" vrijednost={broj(u.pajdastva)} ispod={`${broj(u.sazivi)} saziva · ${broj(u.komentari)} komentara`} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Kartica naslov="Aktivni po danu" pod="Napravio rundu, partiju, reakciju, komentar ili otvorio app.">
          <Stupci redovi={d} polje="aktivni" oznaka="Aktivni" />
        </Kartica>
        <Kartica naslov="Runde po danu" pod={`Novih profila u 30 dana: ${broj(d.reduce((x, r) => x + r.novi, 0))}.`}>
          <Stupci redovi={d} polje="runde" oznaka="Runde" />
        </Kartica>
        <Kartica naslov="Igre, partije u 7 dana" pod="Uz broj: koliko je ljudi igralo, od početka.">
          <Trake redovi={igre} />
        </Kartica>
        <Kartica naslov="Kako ulaze u app" pod={s.puls_od ? `Brojanje od ${datum(s.puls_od)}` : null}>
          {ulazi.length ? <Trake redovi={ulazi} /> : <p className="text-sm text-muted">Još nema brojki.</p>}
        </Kartica>
      </div>
      <Kartica naslov="Push obavijesti" pod={`${s.puls_od ? `Od ${datum(s.puls_od)} ` : ""}Otvoreno ${posto(pushOtv, pushUk)} od ${broj(pushUk)} poslanih.`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-widest text-muted">
                <th className="py-1.5 pr-3 font-bold">Vrsta</th>
                <th className="py-1.5 pr-3 text-right font-bold">Poslano</th>
                <th className="py-1.5 pr-3 text-right font-bold">Otvoreno</th>
                <th className="py-1.5 text-right font-bold">Stopa</th>
              </tr>
            </thead>
            <tbody>
              {pushVrste.map((r) => (
                <tr key={r.k} className="border-t border-line">
                  <td className="py-2 pr-3 text-soft">{r.ime}</td>
                  <td className="py-2 pr-3 text-right">{broj(r.poslano)}</td>
                  <td className="py-2 pr-3 text-right">{broj(r.otvoreno)}</td>
                  <td className="py-2 text-right text-muted">{posto(r.otvoreno, r.poslano)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Kartica>
    </section>
  );
}

function AppStore({ asc, s }) {
  const web = Object.fromEntries((s?.web ?? []).map((w) => [w.korak, w.broj]));
  const lista = s?.lista;
  const v = asc?.verzija, b = asc?.build, t = asc?.testeri, r = asc?.recenzije;
  const pn = asc?.prednarudzbe, pz = asc?.preuzimanja;
  return (
    <section className="flex flex-col gap-4">
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
