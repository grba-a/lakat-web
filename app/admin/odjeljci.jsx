// Odjeljci /admin ploče, faza 1 (Petar 11. 11.). Podaci: admin_pregled(dana), samo zbrojevi.
// Skupina manja od 3 osobe dolazi iz baze kao null i ovdje piše „< 3“.
import { Kartica, Naslov, Plocica, Plocice, Stupci, Trake, broj, datum, posto } from "./ui";

export const ODJELJCI = [
  ["pregled", "Pregled"],
  ["rast", "Rast"],
  ["angazman", "Angažman"],
  ["igre", "Igre"],
  ["push", "Push"],
  ["kafici", "Kafići"],
  ["sustav", "Sustav"],
  ["app-store", "App Store"],
];

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
  const rb = String(ODJELJCI.findIndex(([x]) => x === id) + 1).padStart(2, "0");
  return (
    <section id={id} className="flex scroll-mt-32 flex-col gap-3">
      <Naslov pod={pod} broj={rb}>
        {naslov}
      </Naslov>
      {children}
    </section>
  );
}

function Tablica({ stupci, redovi }) {
  return (
    <div className="overflow-x-auto">
      <table className="mono w-full text-[11px] normal-case tabular-nums tracking-[0.03em]">
        <thead>
          <tr className="lbl text-left">
            {stupci.map((s, i) => (
              <th key={s} className={`border-b border-[color:var(--a-fg)] py-1.5 pr-3 font-normal ${i ? "text-right" : ""}`}>
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {redovi.map((r) => (
            <tr key={r[0]} className="row border-b border-[color:var(--a-line)]">
              {r.map((v, i) => (
                <td key={i} className={`py-2 pr-3 ${i ? "text-right" : ""}`}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pregled({ p, mjera }) {
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
    ["novi", "Novi"],
  ];
  const m = MJERE.find(([key]) => key === mjera) ?? MJERE[0];
  const radnje = Object.entries(p.aktivni_po_radnji ?? {})
    .map(([key, v]) => ({ k: RADNJE[key] ?? key, v }))
    .sort((a, b) => b.v - a.v);
  return (
    <Odjeljak id="pregled" naslov="Pregled." pod={`Zadnjih ${p.dana} dana prema ${p.dana} dana prije. Danas ${broj(p.ukupno?.aktivni_danas)} aktivnih, vani sad ${broj(p.ukupno?.vani_sad)}.`}>
      <Plocice>
        {kpi.map(([key, ime], i) => (
          <Plocica
            key={key}
            i={i}
            oznaka={ime}
            vrijednost={key === "dau" ? zarez(k[key]?.sad ?? "—") : broj(k[key]?.sad)}
            ispod={<Promjena sad={k[key]?.sad} prije={k[key]?.prije} />}
          />
        ))}
      </Plocice>
      <Kartica naslov={`${m[1]} po danu`} pod="Aktivan = otvorio app, objavio rundu, igrao, reagirao ili komentirao.">
        <div className="mb-3 flex flex-wrap">
          {MJERE.map(([key, ime]) => (
            <a
              key={key}
              href={`?d=${p.dana}&m=${key}#pregled`}
              aria-current={key === m[0] ? "true" : undefined}
              className="chip mono -ml-px flex h-9 items-center border border-[color:var(--a-line)] px-3 text-[11px] text-[color:var(--a-mute)] first:ml-0"
            >
              {ime}
            </a>
          ))}
        </div>
        <Stupci redovi={p.dnevno ?? []} polje={m[0]} oznaka={m[1]} />
      </Kartica>
      <Kartica naslov="Što ljudi rade" pod={`Koliko je različitih ljudi barem jednom to napravilo u ${p.dana} dana.`}>
        <Trake redovi={radnje} />
      </Kartica>
    </Odjeljak>
  );
}

export function Rast({ p }) {
  const l = p.lijevak ?? {};
  const koraci = [
    ["posjet", "Posjet laktarenje.com"],
    ["lista", "Upis na listu"],
    ["registracija", "Registracija u appu"],
    ["prva_runda", "Prva runda"],
    ["prvi_pajdas", "Prvi pajdaš"],
  ];
  const v = p.viralnost ?? {};
  const pc = (a, b) => (a == null || !b ? "—" : `${Math.round((a / b) * 100)} %`);
  return (
    <Odjeljak id="rast" naslov="Rast." pod="Kako ljudi dolaze i ostaju.">
      <Kartica naslov="Lijevak" pod={`Zadnjih ${p.dana} dana. Prva runda i prvi pajdaš: od novih profila, bilo kad.`}>
        <ul className="flex flex-col">
          {koraci.map(([key, ime], i) => {
            const vr = l[key] ?? 0;
            const max = Math.max(1, l.posjet ?? 0, l.registracija ?? 0);
            return (
              <li key={key} className="row grid grid-cols-[minmax(0,9.5rem)_1fr] items-center gap-3 border-b border-[color:var(--a-line)] py-1.5 last:border-0">
                <span className="mono truncate text-[11px] normal-case tracking-[0.03em]">{ime}</span>
                <span className="flex min-w-0 items-center gap-2">
                  <span className={`bar ${i ? "dim" : ""}`} style={{ width: `${Math.max(2, (vr / max) * 62)}%`, "--i": i }} />
                  <span className="mono shrink-0 text-[11px] tabular-nums">
                    {broj(vr)}
                    {i >= 3 ? <span className="text-[color:var(--a-mute)]"> · {pc(vr, l.registracija)} novih</span> : null}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </Kartica>
      <Kartica naslov="Vraćaju li se" pod="Po tjednu registracije: koliko ih je bilo aktivno dan poslije, u drugom tjednu i oko 30. dana. Prazno = još nije prošlo dovoljno dana.">
        <Tablica
          stupci={["Tjedan od", "Novi", "Dan 1", "Tjedan 2", "Dan 30"]}
          redovi={(p.kohorte ?? []).map((c) => [
            datum(c.tjedan),
            broj(c.novi),
            c.d1 == null ? "—" : `${pc(c.d1, c.novi)} (${c.d1})`,
            c.d7 == null ? "—" : `${pc(c.d7, c.novi)} (${c.d7})`,
            c.d30 == null ? "—" : `${pc(c.d30, c.novi)} (${c.d30})`,
          ])}
        />
      </Kartica>
      <Plocice>
        <Plocica oznaka="Pozivni linkovi" vrijednost={broj(v.linkovi)} ispod={`u ${p.dana} dana`} />
        <Plocica oznaka="Iskorišteni" vrijednost={broj(v.iskoristeni)} ispod="ljudi ušlo preko linka" />
        <Plocica oznaka="Pajdaša, medijan" vrijednost={v.pajdasi_medijan == null ? "—" : zarez(v.pajdasi_medijan)} ispod="po profilu" />
        <Plocica oznaka="Gornjih 10 %" vrijednost={v.pajdasi_p90 == null ? "—" : `${zarez(Math.round(v.pajdasi_p90))}+`} ispod="pajdaša" />
      </Plocice>
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
                  tabIndex={0}
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
      <Kartica naslov="Kad je LAKAT živ" pod="Runde i partije po danu u tjednu i satu (Zagreb). Tamnije = više.">
        <Toplina celije={p.sati} />
      </Kartica>
      <div className="grid gap-4 md:grid-cols-2">
        <Kartica naslov="Značajke" pod={`Od ${broj(z.runde)} rundi i ostalo u razdoblju.`}>
          <Trake redovi={znacajke} />
        </Kartica>
        <Kartica naslov="Što se pije" pod={ukPica ? `${broj(ukPica)} upisanih pića.` : "Nema upisanih pića u razdoblju."}>
          <Trake redovi={pica.map((x) => ({ ...x, n: posto(x.v, ukPica) }))} />
        </Kartica>
      </div>
      <Kartica naslov="Runde po kvartu" pod="Kvartovi s manje od 3 osobe zbrojeni su zajedno, da se nitko ne prepozna.">
        {kvartovi.length ? <Trake redovi={kvartovi} /> : <p className="mono text-[11px] normal-case text-[color:var(--a-mute)]">Nema rundi s kvartom u razdoblju.</p>}
      </Kartica>
    </Odjeljak>
  );
}

export function Igre({ p }) {
  const redovi = (p.igre ?? [])
    .filter((g) => IGRE[g.igra])
    .map((g) => [IGRE[g.igra], broj(g.partije), broj(g.prije), malo(g.igraca)]);
  return (
    <Odjeljak id="igre" naslov="Igre." pod={`Partije u zadnjih ${p.dana} dana i u ${p.dana} dana prije.`}>
      <Kartica naslov="Po igri">
        <Tablica stupci={["Igra", "Partije", "Prije", "Igrača"]} redovi={redovi} />
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
        <Kartica naslov="Po vrsti">
          <Tablica stupci={["Vrsta", "Poslano", "Otvoreno", "Stopa"]} redovi={vrste.map((r) => [r.ime, broj(r.poslano), broj(r.otvoreno), posto(r.otvoreno, r.poslano)])} />
        </Kartica>
        <Kartica naslov="Kako ulaze u app">
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
      <Kartica naslov="Po kafiću" pod="Bez imena gostiju; manje od 3 gosta piše „< 3“.">
        {redovi.length ? <Tablica stupci={["Kafić", "Runde", "Gostiju"]} redovi={redovi} /> : <p className="mono text-[11px] normal-case text-[color:var(--a-mute)]">Nema rundi u kafićima u razdoblju.</p>}
      </Kartica>
    </Odjeljak>
  );
}

export function Sustav({ p }) {
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
        <Kartica naslov="Bodovi" pod={`Zarađeno ${broj(b.zaradeno)}, potrošeno ${broj(b.potroseno)}, zadataka ${broj(b.zadaci)}.`}>
          {(b.kupnje ?? []).length ? (
            <Trake redovi={b.kupnje.map((x) => ({ k: x.artikl, v: x.broj }))} />
          ) : (
            <p className="mono text-[11px] normal-case text-[color:var(--a-mute)]">Nitko nije kupovao u dućanu u ovom razdoblju.</p>
          )}
        </Kartica>
        <Kartica naslov="Potrošnja i limiti" pod="Supabase i Vercel limiti dolaze u fazi 2.">
          <p className="mono text-[11px] normal-case text-[color:var(--a-mute)]">—</p>
        </Kartica>
      </div>
    </Odjeljak>
  );
}
