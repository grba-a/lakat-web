// Odjeljci /admin ploče, faza 1 (Petar 11. 11.). Podaci: admin_pregled(dana), samo zbrojevi.
// Skupina manja od 3 osobe dolazi iz baze kao null i ovdje piše „< 3“.
import { Kartica, Naslov, Plocica, Plocice, Stupci, Trake, broj, datum, posto } from "./ui";
import { mb } from "@/lib/upozorenja";
import { Tablica } from "./tablica";
import { Vrijeme } from "./vrijeme";

export { IGRE, PUSH };

// Tri prigušene boje po skupini (Petar: „nemoj previše boja"), Codexova paleta; zelena/crvena/žuta ostaju za stanje.
export const GRUPE = { korisnici: "#7DD3FC", aktivnost: "#C4B5FD", tehnika: "#A7B4C6" };
// [id, ime, ASCII znak, skupina]
export const ODJELJCI = [
  ["pregled", "Pregled", "[=]", "korisnici"],
  ["rast", "Rast", "/^", "korisnici"],
  ["angazman", "Angažman", "><", "korisnici"],
  ["igre", "Igre", "[+]", "aktivnost"],
  ["push", "Push", ">>", "aktivnost"],
  ["kafici", "Kafići", "[_]", "aktivnost"],
  ["instagram", "Instagram", "[@]", "aktivnost"],
  ["sustav", "Sustav", "</>", "tehnika"],
  ["baza", "Baza", "|||", "tehnika"],
  ["app-store", "App Store", "[A]", "tehnika"],
];
export const odjeljak = (id) => {
  const k = ODJELJCI.findIndex(([x]) => x === id);
  const [, ime, znak, grupa] = ODJELJCI[k] ?? [];
  return { rb: String(k + 1).padStart(2, "0"), ime, znak, boja: GRUPE[grupa] };
};

// Ključevi su iz baze (igra_partije.igra) i ne mijenjaju se; imena su ista kao u iOS appu (Igre.swift).
const IGRE = {
  sankerov_lakat: "Šanker",
  konobar: "Konobar",
  galeb: "Galeb",
  zlatni_tocionik: "Točionik",
  kula: "Kula",
  burek_u_cetiri: "Pekara",
  gajba: "Gajba",
  do_krigle: "Spoji",
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
const RADNJE = { app: "Otvorio app", runda: "Objavio rundu", igra: "Igrao", reakcija: "Reagirao", komentar: "Komentirao" };
const PICA = {
  piva: "Pivo", kava: "Kava", kava_mlijeko: "Kava s mlijekom", voda: "Voda", gemist: "Gemišt", pelin: "Pelin", koktel: "Koktel",
  vino: "Vino", bijelo: "Bijelo vino", crno: "Crno vino", prosek: "Prošek", rakija: "Rakija", viski: "Viski", sok: "Sok", cola: "Cola",
  toceno: "Točeno pivo", bocica: "Pivo u boci", craft: "Craft pivo", tamno: "Tamno pivo", mojito: "Mojito",
};
const DANI = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];
const malo = (n) => (n == null ? "< 3" : broj(n));
const zarez = (n) => String(n).replace(".", ",");

// Promjena prema prethodnom razdoblju iste duljine. `obrnuto` = manje je bolje (npr. greške).
function Promjena({ sad, prije, obrnuto }) {
  if (sad == null || prije == null) return null;
  const r = Number(sad) - Number(prije);
  if (r === 0) return <span>= isto kao prije</span>;
  const dobro = obrnuto ? r < 0 : r > 0;
  // Postotak samo kad je baza dovoljno velika; „+77267 %" od 3 partije ništa ne govori.
  const pct = Number(prije) >= 10 ? ` (${r > 0 ? "+" : "−"}${Math.round(Math.abs(r / Number(prije)) * 100)} %)` : "";
  return (
    <span className={dobro ? "up" : "down"}>
      {r > 0 ? "▲ +" : "▼ −"}
      {zarez(Math.round(Math.abs(r) * 10) / 10)}
      {pct}
    </span>
  );
}

function Odjeljak({ id, naslov, pod, children }) {
  const o = odjeljak(id);
  return (
    <section id={id} className="flex scroll-mt-36 flex-col gap-3 lg:scroll-mt-6" style={{ "--odj": o.boja }}>
      <Naslov pod={pod} broj={o.rb} znak={o.znak}>
        {naslov}
      </Naslov>
      {children}
    </section>
  );
}

export function Pregled({ p, mjera, niz }) {
  const k = p.kpi ?? {};
  const kpi = [
    ["aktivni", "Aktivnih ljudi"],
    ["dau", "Aktivni / dan"],
    ["novi", "Novih profila"],
    ["runde", "Runde"],
    ["partije", "Partije"],
    ["reakcije", "Reakcije"],
    ["komentari", "Komentari"],
    ["pajdastva", "Nova pajdaštva"],
  ];
  const MJERE = [
    ["aktivni", "Aktivni"],
    ["runde", "Runde"],
    ["partije", "Partije"],
    ["reakcije", "Reakcije"],
    ["komentari", "Komentari"],
    ["pajdastva", "Pajdaštva"],
    ["novi", "Novi"],
  ];
  const radnje = Object.entries(p.aktivni_po_radnji ?? {})
    .map(([key, v]) => ({ k: RADNJE[key] ?? key, v }))
    .sort((a, b) => b.v - a.v);
  // Niz 2n dana: prva polovica = prethodno razdoblje (duh), druga = sada.
  const svi = niz ?? p.dnevno ?? [];
  const sad = svi.slice(-p.dana);
  const prije = svi.length >= 2 * p.dana ? svi.slice(0, p.dana) : [];
  const trend = (key) => (key === "dau" ? sad.map((d) => d.aktivni) : sad.map((d) => d[key] ?? 0));
  return (
    <Odjeljak id="pregled" naslov="Pregled." pod={`Zadnjih ${p.dana} dana prema ${p.dana} dana prije.`}>
      <Plocice>
        {kpi.map(([key, ime], i) => (
          <Plocica
            key={key}
            i={i}
            oznaka={ime}
            vrijednost={key === "dau" ? zarez(k[key]?.sad ?? "—") : broj(k[key]?.sad)}
            trend={key === "aktivni" ? null : trend(key)}
            ispod={<Promjena sad={k[key]?.sad} prije={k[key]?.prije} />}
          />
        ))}
      </Plocice>
      <div className="grid gap-3 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <Kartica id="graf-po-danu" naslov="Kroz vrijeme" pod="Puna linija = sad, isprekidana = isto razdoblje prije. Prijeđi mišem ili dodirni; klik otvara dan.">
            <Vrijeme sad={sad} prije={prije} mjere={MJERE} pocetna={mjera} igre={IGRE} push={PUSH} />
          </Kartica>
        </div>
        <div className="min-w-0 xl:col-span-4">
          <Kartica id="sto-rade" naslov="Što ljudi rade" pod={`Koliko je različitih ljudi barem jednom to napravilo u ${p.dana} dana.`}>
            <Trake redovi={radnje} />
          </Kartica>
        </div>
      </div>
    </Odjeljak>
  );
}

// Pravi lijevak: ista skupina ljudi kroz korake, gubitak između svakog koraka (Codex 11. 11.).
function Lijevak({ koraci }) {
  const max = Math.max(1, ...koraci.map(([, n]) => n ?? 0));
  return (
    <ol className="flex flex-col">
      {koraci.map(([ime, n], i) => {
        const prethodni = i ? koraci[i - 1][1] : null;
        const gubitak = prethodni ? Math.round((1 - (n ?? 0) / prethodni) * 100) : null;
        return (
          <li key={ime} className="flex flex-col">
            {gubitak != null && (
              <span className={`mono py-1 pl-2 text-[10.5px] ${gubitak >= 50 ? "down" : gubitak > 0 ? "warn" : "up"}`}>
                {gubitak > 0 ? `↓ −${gubitak} %` : "↓ bez gubitka"}
              </span>
            )}
            <div
              tabIndex={0}
              data-tip={`${ime}: ${broj(n)}${prethodni ? ` · ${Math.round(((n ?? 0) / prethodni) * 100)} % od prethodnog koraka` : ""}`}
              className="row flex items-center gap-3 rounded-[var(--r-sm)] border border-[color:var(--a-line)] px-3 py-2 outline-none focus-visible:border-[color:var(--a-fg)]"
            >
              <span className="mono w-36 shrink-0 truncate text-[11.5px] normal-case">{ime}</span>
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <span className={`bar ${i ? "dim" : ""}`} style={{ width: `${Math.max(2, ((n ?? 0) / max) * 80)}%`, "--i": i }} />
                <span className="num text-[1.3rem]">{broj(n)}</span>
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function Rast({ p }) {
  const l = p.lijevak ?? {};
  const web = Object.fromEntries((p.web ?? []).map((w) => [w.korak, w.broj]));
  const v = p.viralnost ?? {};
  const pc = (a, b) => (a == null || !b ? "—" : `${Math.round((a / b) * 100)} %`);
  return (
    <Odjeljak id="rast" naslov="Rast." pod={`Kako ljudi dolaze i ostaju. Zadnjih ${p.dana} dana.`}>
      <div className="grid gap-3 xl:grid-cols-2">
        <Kartica id="lijevak" naslov="Lijevak · laktarenje.com" pod="Posjeti stranice do potvrđenog upisa na listu čekanja.">
          <Lijevak koraci={[["Posjet", web.posjet ?? 0], ["Počeo obrazac", web.obrazac_start ?? 0], ["Poslao obrazac", web.form_ok ?? 0], ["Potvrdio e-mail", web.potvrda ?? 0]]} />
        </Kartica>
        <Kartica id="lijevak-app" naslov="Lijevak · aplikacija" pod="Novi profili iz ovog razdoblja: koliko ih je objavilo prvu rundu i dobilo prvog pajdaša.">
          <Lijevak koraci={[["Registracija", l.registracija ?? 0], ["Prva runda", l.prva_runda ?? 0], ["Prvi pajdaš", l.prvi_pajdas ?? 0]]} />
        </Kartica>
      </div>
      <div className="grid gap-3 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-7">
          <Kartica id="kohorte" naslov="Vraćaju li se" pod="Po tjednu registracije: aktivni dan poslije, u drugom tjednu, oko 30. dana. Plavije = više se vratilo. „—“ = još nije prošlo dovoljno dana.">
            <Tablica
              naziv="kohorte"
              stupci={["Tjedan od", "Novi", "Dan 1", "Tjedan 2", "Dan 30"]}
              redovi={(p.kohorte ?? []).map((c) =>
                c.malo
                  ? [datum(c.tjedan), "< 3", "skriveno", "—", "—"]
                  : [datum(c.tjedan), broj(c.novi), ...[c.d1, c.d7, c.d30].map((d) => (d == null ? "—" : { t: `${pc(d, c.novi)} (${d})`, v: d / c.novi, h: d / c.novi }))]
              )}
            />
          </Kartica>
        </div>
        <div className="min-w-0 xl:col-span-5">
          <Plocice stupaca={2}>
            <Plocica oznaka="Pozivni linkovi" vrijednost={broj(v.linkovi)} ispod={`u ${p.dana} dana`} />
            <Plocica oznaka="Iskorišteni" vrijednost={broj(v.iskoristeni)} ispod="ljudi ušlo preko linka" />
            <Plocica oznaka="Pajdaša, medijan" vrijednost={v.pajdasi_medijan == null ? "—" : zarez(v.pajdasi_medijan)} ispod="po profilu" />
            <Plocica oznaka="Gornjih 10 %" vrijednost={v.pajdasi_p90 == null ? "—" : `${zarez(Math.round(v.pajdasi_p90))}+`} ispod="pajdaša" />
          </Plocice>
        </div>
      </div>
    </Odjeljak>
  );
}

function Toplina({ celije }) {
  const mapa = new Map((celije ?? []).map((c) => [`${c.d}-${c.h}`, c.n]));
  const max = Math.max(1, ...(celije ?? []).map((c) => c.n));
  const sati = Array.from({ length: 24 }, (_, h) => h);
  return (
    <div className="overflow-x-auto">
      <div className="mono grid min-w-[340px] grid-cols-[30px_repeat(24,minmax(0,1fr))] gap-[2px] text-[9px] text-[color:var(--a-mute)]">
        <span />
        {sati.map((h) => (
          <span key={h} className="text-center">
            {h % 6 === 0 ? h : ""}
          </span>
        ))}
        {DANI.map((dan, i) => (
          <div key={dan} className="contents">
            <span className="leading-[14px]">{dan.toUpperCase()}</span>
            {sati.map((h) => {
              const n = mapa.get(`${i + 1}-${h}`) ?? 0;
              return (
                <span
                  key={h}
                  data-tip={`${dan} ${String(h).padStart(2, "0")}–${String(h + 1).padStart(2, "0")} h: ${n} ${n === 1 ? "runda/partija" : "rundi i partija"}`}
                  className="cell h-[14px]"
                  style={{ background: n ? "var(--a-live)" : "var(--a-line)", opacity: n ? 0.2 + 0.8 * (n / max) : 0.5, "--i": i * 24 + h }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Angazman({ p }) {
  const z = p.znacajke ?? {};
  const znacajke = [
    ["Druga fotka", z.druga_fotka],
    ["Runda u kafiću", z.u_kaficu],
    ["Sad ili nikad", z.sad_ili_nikad],
    ["Javna runda", z.javne],
    ["Video", z.video],
    ["Saziv", z.sazivi],
    ["Odaziv na saziv", z.odazivi],
    ["Lakat", z.laktovi],
    ["Pokaži se", z.pokazi],
    ["Nađena Krigla", z.krigle],
  ].map(([k, v]) => ({ k, v: v ?? 0 }));
  const svaPica = (p.pica ?? []).map((x) => ({ k: PICA[x.vrsta] ?? x.vrsta, v: x.broj }));
  const ukPica = svaPica.reduce((s, x) => s + x.v, 0);
  const ostalo = svaPica.slice(8).reduce((s, x) => s + x.v, 0);
  const pica = [...svaPica.slice(0, 8), ...(ostalo ? [{ k: `Ostalo (${svaPica.length - 8})`, v: ostalo }] : [])];
  const kvartovi = (p.seg_kvart_runde ?? []).map((x) => ({ k: x.kvart.replace("Ostali kvartovi", "Ostali"), v: x.runde, n: x.ljudi == null ? null : `${x.ljudi} ljudi` }));
  return (
    <Odjeljak id="angazman" naslov="Angažman." pod={`Zadnjih ${p.dana} dana.`}>
      <Kartica id="toplina" naslov="Kad je LAKAT živ" pod="Runde i partije po danu u tjednu i satu (Zagreb). Tamnije = više.">
        <Toplina celije={p.sati} />
      </Kartica>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Kartica id="znacajke" naslov="Značajke" pod={`Od ${broj(z.runde)} rundi i ostalo u razdoblju.`}>
          <Trake redovi={znacajke} />
        </Kartica>
        <Kartica id="pica" naslov="Što se pije" pod={ukPica ? `${broj(ukPica)} upisanih pića.` : "Nema upisanih pića u razdoblju."}>
          <Trake redovi={pica.map((x) => ({ ...x, n: posto(x.v, ukPica) }))} />
        </Kartica>
        <Kartica id="kvartovi" naslov="Runde po kvartu" pod="Kvartovi s manje od 3 osobe zbrojeni su zajedno, da se nitko ne prepozna.">
          {kvartovi.length ? <Trake redovi={kvartovi} /> : <p className="mono text-[11px] normal-case text-[color:var(--a-mute)]">Nema rundi s kvartom u razdoblju.</p>}
        </Kartica>
      </div>
    </Odjeljak>
  );
}

export function Igre({ p }) {
  const redovi = (p.igre ?? [])
    .filter((g) => IGRE[g.igra])
    .map((g) => [IGRE[g.igra], broj(g.partije), broj(g.prije), malo(g.igraca)]);
  return (
    <Odjeljak id="igre" naslov="Igre." pod={`Partije u zadnjih ${p.dana} dana i u ${p.dana} dana prije.`}>
      <Kartica id="igre-tablica" naslov="Po igri">
        <Tablica naziv="igre" stupci={["Igra", "Partije", "Prije", "Igrača"]} redovi={redovi} />
      </Kartica>
    </Odjeljak>
  );
}

export function Push({ p }) {
  const puls = Object.fromEntries((p.puls ?? []).map((x) => [x.kljuc, x.broj]));
  const vrste = Object.keys(PUSH)
    .map((k) => ({ ime: PUSH[k], poslano: puls[`push.poslano.${k}`] ?? 0, otvoreno: puls[`push.otvoreno.${k}`] ?? 0 }))
    .filter((r) => r.poslano || r.otvoreno)
    .sort((a, b) => b.poslano - a.poslano);
  const uk = vrste.reduce((s, r) => s + r.poslano, 0);
  const otv = vrste.reduce((s, r) => s + r.otvoreno, 0);
  const ulazi = Object.keys(ULAZI)
    .map((k) => ({ k: ULAZI[k], v: puls[`ulaz.${k}`] ?? 0 }))
    .filter((r) => r.v);
  const od = p.puls_od && p.puls_od > p.od ? `Brojanje od ${datum(p.puls_od)} · ` : "";
  return (
    <Odjeljak id="push" naslov="Push." pod={`${od}Otvoreno ${posto(otv, uk)} od ${broj(uk)} poslanih.`}>
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <Kartica id="push-tablica" naslov="Po vrsti">
          <Tablica naziv="push" stupci={["Vrsta", "Poslano", "Otvoreno", "Stopa"]} redovi={vrste.map((r) => [r.ime, broj(r.poslano), broj(r.otvoreno), posto(r.otvoreno, r.poslano)])} />
        </Kartica>
        <Kartica id="ulazi" naslov="Kako ulaze u app">
          {ulazi.length ? <Trake redovi={ulazi} /> : <p className="mono text-[11px] normal-case text-[color:var(--a-mute)]">Još nema brojki.</p>}
        </Kartica>
      </div>
    </Odjeljak>
  );
}

export function Kafici({ p }) {
  const redovi = (p.kafici ?? []).map((x) => [`${x.kafic}${x.partner ? " ★" : ""}`, broj(x.runde), malo(x.gostiju)]);
  return (
    <Odjeljak id="kafici" naslov="Kafići." pod={`Runde u kafićima, zadnjih ${p.dana} dana. ★ = partner.`}>
      <Kartica id="kafici-tablica" naslov="Po kafiću" pod="Bez imena gostiju. Kafići s manje od 3 gosta zbrojeni su u „ostali“ ili izostavljeni.">
        {redovi.length ? <Tablica naziv="kafici" stupci={["Kafić", "Runde", "Gostiju"]} redovi={redovi} /> : <p className="mono text-[11px] normal-case text-[color:var(--a-mute)]">Nema rundi u kafićima u razdoblju.</p>}
      </Kartica>
    </Odjeljak>
  );
}

// Supabase Pro: uključeno u plan (supabase.com/pricing, provjereno 12. 11. 2026.). Iznad toga se plaća dodatno.
const SUPABASE_PRO = { baza: 8 * 1024 ** 3, pohrana: 100 * 1024 ** 3, mau: 100000 };

function Limit({ oznaka, sad, max, ispis, napomena }) {
  const udio = max ? Math.min(1, (Number(sad) || 0) / max) : 0;
  const ton = udio >= 0.8 ? "var(--a-alarm)" : udio >= 0.5 ? "var(--a-warn)" : "var(--a-live)";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="lbl">{oznaka}</span>
        <span className="mono text-[11px] normal-case">{ispis}</span>
      </div>
      <span className="relative block h-2 overflow-hidden rounded-full bg-[color:var(--a-line)]" aria-hidden="true">
        <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.max(1, udio * 100)}%`, background: ton }} />
      </span>
      {napomena && <span className="mono text-[10.5px] normal-case text-[color:var(--a-mute)]">{napomena}</span>}
    </div>
  );
}

const velicina = (b) => {
  const n = Number(b) || 0;
  return n >= 1024 ** 3 ? `${(n / 1024 ** 3).toFixed(2).replace(".", ",")} GB` : `${Math.round(n / 1024 ** 2)} MB`;
};

export function Sustav({ p, baza: bz }) {
  const z = p.zdravlje ?? {};
  const m = p.moderacija ?? {};
  const b = p.bodovi ?? {};
  return (
    <Odjeljak id="sustav" naslov="Sustav." pod={`Zdravlje, prijave i bodovi, zadnjih ${p.dana} dana.`}>
      <Plocice>
        <Plocica
          oznaka="Push greške"
          vrijednost={broj(z.push_greske)}
          ton={z.push_greske ? "warn" : undefined}
          ispod={<Promjena sad={z.push_greske} prije={z.push_greske_prije} obrnuto />}
        />
        <Plocica oznaka="Prijave čekaju" vrijednost={broj(m.cekaju)} ton={m.cekaju ? "down" : "up"} ispod={`${broj(m.prijave)} prijava · ${broj(m.blokade)} blokada`} />
        <Plocica oznaka="iOS uređaji" vrijednost={broj(z.ios_uredaji)} ispod={`${broj(z.web_push)} web push`} />
        <Plocica oznaka="Apple opozivi" vrijednost={broj(z.apple_opozivi_cekaju)} ton={z.apple_opozivi_cekaju ? "warn" : undefined} ispod="čekaju ponovni pokušaj" />
      </Plocice>
      <div className="grid gap-4 md:grid-cols-2">
        <Kartica id="bodovi" naslov="Bodovi" pod={`Zarađeno ${broj(b.zaradeno)}, potrošeno ${broj(b.potroseno)}, zadataka ${broj(b.zadaci)}.`}>
          {(b.kupnje ?? []).length ? (
            <Trake redovi={b.kupnje.map((x) => ({ k: x.artikl, v: x.broj }))} />
          ) : (
            <p className="mono text-[11px] normal-case text-[color:var(--a-mute)]">Nitko nije kupovao u dućanu u ovom razdoblju.</p>
          )}
        </Kartica>
        <Kartica id="limiti" naslov="Potrošnja i limiti" pod="Supabase Pro: koliko je potrošeno od uključenog u plan. Žuto od 50 %, crveno od 80 %.">
          {bz ? (
            <div className="flex flex-col gap-4">
              <Limit oznaka="Baza" sad={bz.baza_b} max={SUPABASE_PRO.baza} ispis={`${velicina(bz.baza_b)} od 8 GB`} />
              {(() => {
                const foto = (bz.pohrana ?? []).reduce((s, x) => s + Number(x.b || 0), 0);
                return <Limit oznaka="Fotke i datoteke" sad={foto} max={SUPABASE_PRO.pohrana} ispis={`${velicina(foto)} od 100 GB`} />;
              })()}
              <Limit
                oznaka="Aktivni korisnici"
                sad={p.kpi?.aktivni?.sad}
                max={SUPABASE_PRO.mau}
                ispis={`${broj(p.kpi?.aktivni?.sad)} od 100.000`}
                napomena={`Aktivni u zadnjih ${p.dana} dana, približno Supabaseovom MAU.`}
              />
              <p className="mono text-[10.5px] normal-case text-[color:var(--a-mute)]">Promet (egress, 250 GB) traži Supabase pristupni token, a Vercel limiti Vercel token. Oba od tebe.</p>
            </div>
          ) : (
            <p className="mono text-[11px] normal-case text-[color:var(--a-mute)]">Baza se ne javlja.</p>
          )}
        </Kartica>
      </div>
    </Odjeljak>
  );
}

// Traka uzbuna na vrhu: zeleno „sve radi" ili popis po razini (kritično crveno, važno žuto).
export function Uzbune({ popis }) {
  if (!popis.length) {
    return (
      <div className="boot flex items-center gap-3 rounded-[var(--r-md)] border border-[color:var(--a-live)] px-3.5 py-3 shadow-[0_0_24px_-12px_var(--a-live)]" style={{ "--i": 3 }}>
        <span className="live-dot" aria-hidden="true" />
        <span className="mono text-[11px] up">[ SVE RADI ] 0 uzbuna</span>
      </div>
    );
  }
  const boja = { kriticno: "var(--a-alarm)", vazno: "var(--a-warn)", info: "var(--a-mute)" };
  const oznaka = { kriticno: "KRITIČNO", vazno: "VAŽNO", info: "INFO" };
  return (
    <ul className="boot flex flex-col gap-1.5" style={{ "--i": 3 }} aria-label="Uzbune">
      {popis.map((x, i) => (
        <li
          key={x.kljuc}
          className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 rounded-[var(--r-md)] border px-3.5 py-2.5"
          style={{ borderColor: boja[x.razina], "--i": i }}
        >
          <span className="mono text-[10.5px] font-bold" style={{ color: boja[x.razina] }}>
            !! {oznaka[x.razina]}
          </span>
          <span className="mono text-[12px] normal-case tracking-[0.02em]">{x.naslov}</span>
          <span className="mono text-[10.5px] normal-case tracking-[0.02em] text-[color:var(--a-mute)]">{x.detalj}</span>
        </li>
      ))}
    </ul>
  );
}

export function Baza({ b, greska }) {
  if (!b) {
    return (
      <Odjeljak id="baza" naslov="Baza." pod="Supabase PROD.">
        <p className="mono text-[11px] down">{greska}</p>
      </Odjeljak>
    );
  }
  const foto = (b.pohrana ?? []).reduce((s, x) => s + Number(x.b || 0), 0);
  const udio = b.spajanja_max ? b.spajanja / b.spajanja_max : 0;
  return (
    <Odjeljak id="baza" naslov="Baza." pod="Supabase PROD, uživo. Sadržaj se ne čita, samo veličine i brojke.">
      <Plocice>
        <Plocica i={0} oznaka="Veličina baze" vrijednost={mb(b.baza_b)} mala ispod={`${broj(b.auth_racuni)} računa`} />
        <Plocica i={1} oznaka="Fotke i datoteke" vrijednost={mb(foto)} mala ispod={`+${mb(b.pohrana_7d_b)} u 7 dana`} />
        <Plocica
          i={2}
          oznaka="Spajanja"
          vrijednost={`${b.spajanja}/${b.spajanja_max}`}
          mala
          ton={udio >= 0.8 ? "down" : udio >= 0.6 ? "warn" : undefined}
          ispod={`aktivnih upita: ${broj(b.spajanja_aktivna)}`}
        />
        <Plocica i={3} oznaka="Cache" vrijednost={`${String(b.cache_pct ?? "—").replace(".", ",")} %`} mala ton={Number(b.cache_pct) >= 99 ? "up" : "warn"} ispod={`najdulji upit ${b.najduzi_upit_s} s`} />
      </Plocice>
      <div className="grid gap-3 md:grid-cols-2">
        <Kartica id="tablice-baze" naslov="Najveće tablice" pod="Veličina s indeksima; mrtvi redovi čekaju čišćenje (vacuum).">
          <Tablica
            naziv="tablice-baze"
            stupci={["Tablica", "Veličina", "Redaka", "Mrtvih"]}
            redovi={(b.tablice ?? []).map((t) => [t.tablica, mb(t.b), broj(t.redaka), broj(t.mrtvih)])}
          />
        </Kartica>
        <Kartica id="pohrana" naslov="Pohrana po mjestu" pod="dokazi = fotke rundi, avatars = profilne.">
          <Tablica naziv="pohrana" stupci={["Mjesto", "Veličina", "Datoteka"]} redovi={(b.pohrana ?? []).map((x) => [x.bucket, mb(Number(x.b)), broj(x.datoteka)])} />
        </Kartica>
      </div>
    </Odjeljak>
  );
}

// Instagram @lakat_app: brojke računa i zadnje objave (Graph API, samo čitanje) + dnevna snimka pratitelja u bazi.
export function Instagram({ ig, niz }) {
  if (!ig) {
    return (
      <Odjeljak id="instagram" naslov="Instagram." pod="Nije spojen (META_PAGE_TOKEN, IG_USER_ID).">
        <p className="mono text-[11px] text-[color:var(--a-mute)]">—</p>
      </Odjeljak>
    );
  }
  if (ig.greska) {
    return (
      <Odjeljak id="instagram" naslov="Instagram." pod="@lakat_app">
        <p className="mono text-[11px] down">{ig.greska}</p>
      </Odjeljak>
    );
  }
  const { profil, objave } = ig;
  const zadnjih = objave.slice(0, 10);
  const prosjek = (k) => (zadnjih.length ? Math.round((zadnjih.reduce((x, o) => x + o[k], 0) / zadnjih.length) * 10) / 10 : null);
  const najbolja = [...objave].sort((a, b) => b.lajkovi + b.komentari - (a.lajkovi + a.komentari))[0];
  const prvi = niz?.[0];
  const rast = prvi && niz.length > 1 ? profil.pratitelji - prvi.pratitelji : null;
  return (
    <Odjeljak id="instagram" naslov="Instagram." pod={`@${profil.korisnik} · javni brojevi računa, uživo. Doseg i pregledi traže dodatnu Metinu dozvolu (nije uključena).`}>
      <Plocice>
        <Plocica
          i={0}
          oznaka="Pratitelji"
          vrijednost={broj(profil.pratitelji)}
          trend={niz && niz.length > 1 ? niz.map((d) => d.pratitelji) : null}
          ispod={rast == null ? "rast se bilježi od 11. 11." : <Promjena sad={profil.pratitelji} prije={prvi.pratitelji} />}
        />
        <Plocica i={1} oznaka="Objave" vrijednost={broj(profil.objave)} ispod={`prati ${broj(profil.prati)}`} />
        <Plocica i={2} oznaka="Lajkova / objava" vrijednost={zarez(prosjek("lajkovi") ?? "—")} ispod="prosjek zadnjih 10" />
        <Plocica i={3} oznaka="Komentara / objava" vrijednost={zarez(prosjek("komentari") ?? "—")} ispod="prosjek zadnjih 10" />
      </Plocice>
      <div className="grid gap-3 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-5">
          <Kartica id="ig-najbolja" naslov="Najbolja objava" pod="Najviše lajkova i komentara od zadnjih 25.">
            {najbolja ? (
              <a href={najbolja.link} target="_blank" rel="noopener noreferrer" className="row flex flex-col gap-2 rounded-[var(--r-md)] border border-[color:var(--a-line)] p-3">
                <span className="lbl">{datum(najbolja.dan)} · {najbolja.vrsta} ↗</span>
                <span className="mono text-[12px] normal-case leading-relaxed">{najbolja.opis || "bez opisa"}</span>
                <span className="num up text-[2.2rem]">♥ {broj(najbolja.lajkovi)} <span className="text-[color:var(--a-mute)]">· {broj(najbolja.komentari)} kom.</span></span>
              </a>
            ) : (
              <p className="mono text-[11px] text-[color:var(--a-mute)]">Još nema objava.</p>
            )}
          </Kartica>
        </div>
        <div className="min-w-0 xl:col-span-7">
          <Kartica id="ig-lajkovi" naslov="Lajkovi po objavi" pod="Zadnjih 12 objava, najnovija gore.">
            <Trake redovi={objave.slice(0, 12).map((o) => ({ k: `${datum(o.dan)} ${o.vrsta}`, v: o.lajkovi, n: `${o.komentari} kom.` }))} />
          </Kartica>
        </div>
      </div>
      {niz && niz.length > 1 && (
        <Kartica id="ig-rast" naslov="Pratitelji po danu" pod="Jedna snimka dnevno, od 11. 11.">
          <Stupci redovi={niz} polje="pratitelji" oznaka="Pratitelji" />
        </Kartica>
      )}
      <Kartica id="ig-objave" naslov="Objave" pod="Zadnjih 25. Klik na zaglavlje sortira.">
        <Tablica
          naziv="instagram-objave"
          stupci={["Dan", "Vrsta", "Opis", "Lajkovi", "Komentari"]}
          redovi={objave.map((o) => [{ t: datum(o.dan), v: o.dan }, o.vrsta, { t: o.opis || "—", v: o.opis }, broj(o.lajkovi), broj(o.komentari)])}
        />
      </Kartica>
    </Odjeljak>
  );
}
