// LAKAT /admin (Petar 11. 11.): App Store stanje i brojke aplikacije na jednom mjestu, pod šifrom.
// SAMO ZBROJEVI: nijedno ime, slika ni lokacija (pravilo 3.0 vrijedi i za admina).
import { notFound } from "next/navigation";
import { adminUkljucen, baza as bazaZdravlje, dnevno, igSnimka, jesamLiAdmin, pregled } from "@/lib/admin";
import { instagram } from "@/lib/instagram";
import { provjere } from "@/lib/upozorenja";
import { ascPregled, ascReady } from "@/lib/asc";
import { odjava } from "./actions";
import { Prijava } from "./prijava";
import { Kartica, Naslov, Plocica, Plocice, Stupci, Trake, Upozorenje, broj, datum, vrijeme } from "./ui";
import { Izbornik, Najave, Orb, Osvjezi, Radar, Savjet, Trazilica } from "./zivo";
import { Angazman, Baza, IGRE, Igre, Instagram, Kafici, ODJELJCI, PUSH, Pregled, Push, Rast, Sustav, Uzbune, odjeljak } from "./odjeljci";

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

// Što tražilica zna: odjeljci, kartice, brojke, igre, push vrste, kafići, tablice baze.
function indeks({ p, bz, asc, ig }) {
  const st = [];
  const dodaj = (t, o, id, d, vrsta = "stavka") => st.push({ t, o, id, d, vrsta });
  ODJELJCI.forEach(([id, ime]) => dodaj(ime, "odjeljak", id, null, "odjeljak"));
  [
    ["Graf po danu", "Pregled", "graf-po-danu"], ["Što ljudi rade", "Pregled", "sto-rade"], ["Lijevak", "Rast", "lijevak"],
    ["Povratak po tjednima (kohorte)", "Rast", "kohorte"], ["Kad je LAKAT živ (dan × sat)", "Angažman", "toplina"],
    ["Značajke", "Angažman", "znacajke"], ["Što se pije", "Angažman", "pica"], ["Runde po kvartu", "Angažman", "kvartovi"],
    ["Kako ulaze u app", "Push", "ulazi"], ["Bodovi i dućan", "Sustav", "bodovi"], ["Najveće tablice", "Baza", "tablice-baze"],
    ["Pohrana fotki", "Baza", "pohrana"], ["Prednarudžbe", "App Store", "app-store"], ["Recenzije", "App Store", "app-store"],
    ["Lista čekanja", "App Store", "app-store"], ["Uzbune", "vrh", "vrh"], ["Lijevak aplikacije", "Rast", "lijevak-app"],
  ].forEach(([t, o, id]) => dodaj(t, o, id));
  if (p) {
    const k = p.kpi ?? {};
    [["aktivni", "Aktivni ljudi"], ["dau", "Aktivni po danu"], ["novi", "Novi profili"], ["runde", "Runde"], ["partije", "Partije"],
     ["reakcije", "Reakcije"], ["komentari", "Komentari"], ["pajdastva", "Pajdaštva"]].forEach(([key, t]) =>
      dodaj(t, "Pregled", "pregled", k[key]?.sad != null ? String(k[key].sad).replace(".", ",") : null));
    (p.igre ?? []).forEach((g) => IGRE[g.igra] && dodaj(IGRE[g.igra], "Igre", "igre-tablica", `${broj(g.partije)} partija`));
    Object.entries(PUSH).forEach(([, ime]) => dodaj(`Push: ${ime}`, "Push", "push-tablica"));
    (p.kafici ?? []).forEach((x) => dodaj(x.kafic, "Kafići", "kafici-tablica", `${broj(x.runde)} rundi`));
  }
  (bz?.podaci?.tablice ?? []).forEach((t) => dodaj(`Tablica ${t.tablica}`, "Baza", "tablice-baze", `${broj(t.redaka)} redaka`));
  if (ig?.profil) {
    dodaj("Instagram pratitelji", "Instagram", "instagram", broj(ig.profil.pratitelji));
    dodaj("Najbolja objava (Instagram)", "Instagram", "ig-najbolja");
    dodaj("Instagram objave", "Instagram", "ig-objave", `${broj(ig.profil.objave)} objava`);
  }
  if (asc?.prednarudzbe?.ok) dodaj("Prednarudžbe ukupno", "App Store", "app-store", broj(asc.prednarudzbe.ukupno - asc.prednarudzbe.otkazano));
  return st;
}

export default async function AdminPage({ searchParams }) {
  if (!adminUkljucen()) notFound();

  if (!(await jesamLiAdmin())) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-12">
        <div className="mono mb-6 flex flex-col gap-1 text-[11px] text-[color:var(--a-mute)]" aria-hidden="true">
          {["> SPAJANJE NA LKT/PROD …… OK", "> ŠIFRIRANI KANAL …… OK", "> PROVJERA OVLASTI …… ČEKAM"].map((l, i) => (
            <span key={l} className="boot-linija" style={{ "--i": i }}>
              {l}
            </span>
          ))}
        </div>
        <p className="lbl boot">[ LKT / ADMIN ] {"///"} PRISTUP</p>
        <h1 className="macro boot mt-3" style={{ "--i": 1 }}>
          Admin
          <span className="cursor" aria-hidden="true" />
        </h1>
        <Prijava />
      </main>
    );
  }

  const sp = (await searchParams) ?? {};
  const dana = [7, 30, 90].includes(Number(sp.d)) ? Number(sp.d) : 30;
  const mjera = typeof sp.m === "string" ? sp.m : "aktivni";
  // Današnji dan u Zagrebu (kao u SQL-u); niz 2n dana daje i duh prethodnog razdoblja.
  const danas = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zagreb" }).format(new Date());
  const od2 = new Date(Date.parse(`${danas}T12:00:00Z`) - (2 * dana - 1) * 864e5).toISOString().slice(0, 10);
  const [pr, asc, bz, nz, ig] = await Promise.all([pregled(dana), ascPregled(), bazaZdravlje(), dnevno(od2, danas), instagram()]);
  // Instagram ne daje povijest pratitelja: svako otvaranje upiše današnju snimku i vrati niz.
  const igNiz = ig?.profil ? await igSnimka(ig.profil.pratitelji, ig.profil.objave) : [];
  const uzbune = provjere({ pregled: pr, asc, baza: bz });
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
      className="mx-auto flex max-w-[1600px] flex-col gap-10 pb-28 pt-6 lg:px-8"
      style={{ paddingLeft: "max(16px, env(safe-area-inset-left))", paddingRight: "max(16px, env(safe-area-inset-right))" }}
    >
      <header id="vrh" className="flex flex-col gap-4">
        <div className="lbl boot flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <span>[ LKT / ADMIN ] {"///"} UNIT D-01 {"///"} REV 1.1</span>
          <Osvjezi sekundi={60} />
        </div>
        <div className="boot flex flex-wrap items-end justify-between gap-x-8 gap-y-4" style={{ "--i": 1 }}>
          <h1 className="num text-[clamp(2.6rem,9vw,4.5rem)] uppercase leading-[0.88]">
            LAKAT<span className="up">.</span> Kontrola
            <span className="cursor" aria-hidden="true" />
          </h1>
          {p && (
            <div className="flex items-end gap-6" aria-label="Sada">
              <div>
                <p className="lbl">
                  <span className="live-dot mr-1.5 align-middle" aria-hidden="true" />
                  Aktivni danas
                </p>
                <p className="num up text-[clamp(4rem,14vw,5.5rem)]">{broj(p.ukupno?.aktivni_danas)}</p>
              </div>
              <div className="flex items-end gap-3">
                <div>
                  <p className="lbl">Vani sad</p>
                  <p className="num text-[clamp(2.6rem,9vw,3.5rem)]">{broj(p.ukupno?.vani_sad)}</p>
                </div>
                <Radar broj={p.ukupno?.vani_sad} velicina={60} />
              </div>
            </div>
          )}
        </div>
        <div className="boot flex flex-wrap items-end justify-between gap-3" style={{ "--i": 2 }}>
          <p className="mono max-w-[52ch] text-[11px] normal-case leading-relaxed tracking-[0.04em] text-[color:var(--a-mute)]">
            {p ? `Stanje ${vrijeme(p.generirano)}. Broji od 20. 10. (iOS app); stariji web sadržaj ostaje u bazi, ali se ne broji. Samo zbrojevi; uključeni i tvoji testni računi.` : " "}
          </p>
          <div className="flex gap-2">
          <a href="/admin/tv" className="chip mono flex h-11 items-center border border-[color:var(--a-line)] px-4 text-[11px] text-[color:var(--a-mute)] lg:hidden">
            [ TV ]
          </a>
          <a href="/admin/izlazak" className="chip mono flex h-11 items-center border border-[color:var(--a-line)] px-4 text-[11px] text-[color:var(--a-mute)] lg:hidden">
            [ 1. 12. ]
          </a>
          <form action={odjava}>
            <button type="submit" className="chip mono h-11 border border-[color:var(--a-line)] px-4 text-[11px] text-[color:var(--a-mute)]">
              [ ODJAVA ]
            </button>
          </form>
          </div>
        </div>
      </header>

      <Uzbune popis={uzbune} />

      {p && (
        <div className="ticker -mx-4 boot" aria-hidden="true" style={{ "--i": 3 }}>
          <div className="ticker-track">
            {[0, 1].map((kopija) => (
              <div key={kopija} className="flex">
                {[
                  ["AKTIVNI DANAS", broj(p.ukupno?.aktivni_danas)],
                  ["VANI SAD", broj(p.ukupno?.vani_sad)],
                  [`RUNDE ${dana}D`, broj(p.kpi?.runde?.sad)],
                  [`PARTIJE ${dana}D`, broj(p.kpi?.partije?.sad)],
                  ["PAJDAŠTVA", broj(p.ukupno?.pajdastva)],
                  ["PROFILI", broj(p.ukupno?.profili)],
                  ["iOS PUSH", broj(p.ukupno?.ios_push)],
                  ["PRIJAVE ČEKAJU", broj(p.moderacija?.cekaju)],
                ].map(([oz, v]) => (
                  <span key={oz} className="ticker-item mono text-[11px] text-[color:var(--a-mute)]">
                    {oz} <span className="text-[color:var(--a-fg)]">{v}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <nav
        aria-label="Odjeljci"
        className="sticky z-20 -mx-4 -mb-6 flex flex-col gap-2 border-b border-[color:var(--a-line)] bg-[color:var(--a-bg)] px-4 py-2.5 lg:hidden"
        style={{ top: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center">
          {[7, 30, 90].map((n) => (
            <a
              key={n}
              href={`?d=${n}&m=${mjera}`}
              aria-current={n === dana ? "page" : undefined}
              className="chip mono -ml-px flex h-10 flex-1 items-center justify-center border border-[color:var(--a-line)] px-3.5 text-[11px] text-[color:var(--a-mute)] first:ml-0 lg:flex-none"
            >
              {n}D
            </a>
          ))}
          </div>
        </div>
        <Izbornik odjeljci={ODJELJCI} />
      </nav>

      <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
        <aside className="hidden lg:block" aria-label="Izbornik">
          <div className="sticky top-6 flex flex-col gap-3">
            <a href="/admin/tv" className="chip mono flex h-10 items-center justify-between border border-[color:var(--a-line)] px-3 text-[11px] text-[color:var(--a-mute)]">
              <span>[ TV NAČIN ]</span>
              <span aria-hidden="true">▶</span>
            </a>
            <a href="/admin/izlazak" className="chip mono flex h-10 items-center justify-between border border-[color:var(--a-line)] px-3 text-[11px] text-[color:var(--a-mute)]">
              <span>[ RATNA SOBA 1. 12. ]</span>
              <span aria-hidden="true">◉</span>
            </a>
            <div className="flex items-center">
          {[7, 30, 90].map((n) => (
            <a
              key={n}
              href={`?d=${n}&m=${mjera}`}
              aria-current={n === dana ? "page" : undefined}
              className="chip mono -ml-px flex h-10 flex-1 items-center justify-center border border-[color:var(--a-line)] px-3.5 text-[11px] text-[color:var(--a-mute)] first:ml-0 lg:flex-none"
            >
              {n}D
            </a>
          ))}
            </div>
            <span className="lbl">vs {dana}D prije</span>
            <Izbornik odjeljci={ODJELJCI} vertikalno />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-14">
          {p ? (
            <>
              <Pregled p={p} mjera={mjera} niz={nz.podaci} />
              <Rast p={p} />
              <Angazman p={p} />
              <Igre p={p} />
              <Push p={p} />
              <Kafici p={p} />
              <Instagram ig={ig} niz={igNiz} />
              <Sustav p={p} />
              <Baza b={bz.podaci} greska={bz.greska} />
            </>
          ) : (
            <Upozorenje>{pr.greska}</Upozorenje>
          )}
          <AppStore asc={asc} s={s} />
        </div>
      </div>
      <Savjet />
      <Najave
        uzbune={uzbune}
        brojke={{
          profili: p?.ukupno?.profili ?? null,
          prednarudzbe: asc?.prednarudzbe?.ok ? asc.prednarudzbe.ukupno : null,
          pratitelji: ig?.profil?.pratitelji ?? null,
          runde: p?.dnevno?.at(-1)?.runde ?? null,
        }}
      />
      <Orb />
      <Trazilica stavke={indeks({ p, bz, asc, ig })} />
    </main>
  );
}

function AppStore({ asc, s }) {
  const web = Object.fromEntries((s?.web ?? []).map((w) => [w.korak, w.broj]));
  const lista = s?.lista;
  const v = asc?.verzija, b = asc?.build, t = asc?.testeri, r = asc?.recenzije;
  const pn = asc?.prednarudzbe, pz = asc?.preuzimanja;
  return (
    <section id="app-store" className="flex scroll-mt-36 flex-col gap-3 lg:scroll-mt-6" style={{ "--odj": odjeljak("app-store").boja }}>
      <Naslov pod="Izlazak 1. 12. 2026." broj={odjeljak("app-store").rb} znak={odjeljak("app-store").znak}>
        App Store.
      </Naslov>
      {!ascReady() && <Upozorenje>Appleov ključ nije spojen (ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_P8_B64).</Upozorenje>}
      {asc?.greska && <Upozorenje>{asc.greska}</Upozorenje>}
      {asc && !asc.greska && (
        <Plocice>
          {pn && (
            <Plocica
              oznaka="Prednarudžbe"
              vrijednost={pn.ok ? broj(pn.ukupno - pn.otkazano) : "—"}
              ton="up"
              ispod={pn.ok ? `${broj(pn.ukupno)} naručilo · ${broj(pn.otkazano)} otkazalo` : pn.greska}
            />
          )}
          {pz?.ok && !pz.nijePocelo && (
            <Plocica oznaka="Preuzimanja" vrijednost={broj(pz.ukupno)} ton="up" ispod="prva preuzimanja, do jučer" />
          )}
          <Plocica
            oznaka={`Verzija ${v?.verzija ?? ""}`}
            vrijednost={v?.ok ? STANJA[v.stanje] ?? v.stanje ?? "—" : "—"}
            ton="up"
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
        </Plocice>
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
      <div className="grid gap-3 md:grid-cols-2">
        <Kartica
          naslov="laktarenje.com, lista čekanja"
          pod={lista ? `Na listi ${broj(lista.ukupno)} (iPhone ${broj(lista.iphone)}, Android ${broj(lista.android)}), potvrdilo ${broj(lista.potvrdeno)}.` : null}
        >
          {s ? (
            <Trake redovi={WEB.map(([k, ime]) => ({ k: ime, v: web[k] ?? 0 }))} />
          ) : (
            <p className="mono text-[11px] text-[color:var(--a-mute)]">—</p>
          )}
          {s?.web_od && <p className="lbl mt-3">Koraci od {datum(s.web_od)}</p>}
        </Kartica>
        <Kartica naslov="Još ne vidim" pod="Apple je počeo skupljati 11. 11.">
          <ul className="flex flex-col gap-2">
            {!(b?.ok && t?.ok && t.grupe.length) && (
              <li className="border border-dashed border-[color:var(--a-line)] px-3 py-2">
                <b className="mono block text-[11px] font-bold">Buildovi i TestFlight</b>
                <span className="mono mt-1 block text-[10.5px] normal-case tracking-[0.03em] text-[color:var(--a-mute)]">Ključ na webu smije samo izvještaje, namjerno. To je u TestFlight appu.</span>
              </li>
            )}
            <li className="border border-dashed border-[color:var(--a-line)] px-3 py-2">
              <b className="mono block text-[11px] font-bold">Prikazi stranice, konverzija, zadržavanje</b>
              <span className="mono mt-1 block text-[10.5px] normal-case tracking-[0.03em] text-[color:var(--a-mute)]">App Analytics, Apple ih puni 1 do 2 dana nakon prvog zahtjeva.</span>
            </li>
          </ul>
        </Kartica>
      </div>
    </section>
  );
}
