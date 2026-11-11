// Odjeljci /admin ploče, faza 1 (Petar 11. 11.). Podaci: admin_pregled(dana), samo zbrojevi.
// Skupina manja od 3 osobe dolazi iz baze kao null i ovdje piše „< 3“.
import { Kartica, Naslov, Plocica, Stupci, Trake, broj, datum, posto } from "./ui";

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
  piva: "Pivo", kava: "Kava", kava_mljeko: "Kava s mlijekom", voda: "Voda", gemist: "Gemišt", pelin: "Pelin", koktel: "Koktel",
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
  if (r === 0) return <span className="text-muted">isto kao prije</span>;
  const dobro = obrnuto ? r < 0 : r > 0;
  const pct = Number(prije) > 0 ? ` (${r > 0 ? "+" : "−"}${Math.round(Math.abs(r / Number(prije)) * 100)} %)` : "";
  return (
    <span className={dobro ? "text-accent" : "text-red-400"}>
      {r > 0 ? "▲ +" : "▼ −"}
      {zarez(Math.round(Math.abs(r) * 10) / 10)}
      {pct}
    </span>
  );
}

function Odjeljak({ id, naslov, pod, children }) {
  return (
    <section id={id} className="flex scroll-mt-28 flex-col gap-4">
      <Naslov pod={pod}>{naslov}</Naslov>
      {children}
    </section>
  );
}

function Tablica({ stupci, redovi }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm tabular-nums">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-widest text-muted">
            {stupci.map((s, i) => (
              <th key={s} className={`py-1.5 pr-3 font-bold ${i ? "text-right" : ""}`}>
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {redovi.map((r) => (
            <tr key={r[0]} className="border-t border-line">
              {r.map((v, i) => (
                <td key={i} className={`py-2 pr-3 ${i ? "text-right" : "text-soft"}`}>
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
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {kpi.map(([key, ime]) => (
          <Plocica
            key={key}
            oznaka={ime}
            vrijednost={key === "dau" ? zarez(k[key]?.sad ?? "—") : broj(k[key]?.sad)}
            ispod={<Promjena sad={k[key]?.sad} prije={k[key]?.prije} />}
          />
        ))}
      </div>
      <Kartica naslov={`${m[1]} po danu`} pod="Aktivan = otvorio app, objavio rundu, igrao, reagirao ili komentirao.">
        <div className="-mt-2 mb-3 flex flex-wrap gap-1.5">
          {MJERE.map(([key, ime]) => (
            <a
              key={key}
              href={`?d=${p.dana}&m=${key}#pregled`}
              className={`rounded-full border px-3 py-1.5 text-xs ${key === m[0] ? "border-accent bg-accent font-bold text-[#052e16]" : "border-line text-soft"}`}
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
        <ul className="flex flex-col gap-2">
          {koraci.map(([key, ime], i) => {
            const vr = l[key] ?? 0;
            const max = Math.max(1, l.posjet ?? 0, l.registracija ?? 0);
            return (
              <li key={key} className="grid grid-cols-[minmax(0,9.5rem)_1fr] items-center gap-3 text-sm">
                <span className="truncate text-soft">{ime}</span>
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-3 rounded-sm bg-accent" style={{ width: `${Math.max(2, (vr / max) * 65)}%` }} />
                  <span className="shrink-0 tabular-nums text-muted">
                    {broj(vr)}
                    {i >= 3 ? <span className="text-muted/70"> · {pc(vr, l.registracija)} novih</span> : null}
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
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Plocica oznaka="Pozivni linkovi" vrijednost={broj(v.linkovi)} ispod={`u ${p.dana} dana`} />
        <Plocica oznaka="Iskorišteni" vrijednost={broj(v.iskoristeni)} ispod="ljudi ušlo preko linka" />
        <Plocica oznaka="Pajdaša, medijan" vrijednost={v.pajdasi_medijan == null ? "—" : zarez(v.pajdasi_medijan)} ispod="po profilu" />
        <Plocica oznaka="Gornjih 10 %" vrijednost={v.pajdasi_p90 == null ? "—" : `${zarez(Math.round(v.pajdasi_p90))}+`} ispod="pajdaša" />
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
      <div className="grid min-w-[340px] grid-cols-[28px_repeat(24,minmax(0,1fr))] gap-[2px] text-[10px] text-muted">
        <span />
        {sati.map((h) => (
          <span key={h} className="text-center">
            {h % 6 === 0 ? h : ""}
          </span>
        ))}
        {DANI.map((dan, i) => (
          <div key={dan} className="contents">
            <span className="leading-[14px]">{dan}</span>
            {sati.map((h) => {
              const n = mapa.get(`${i + 1}-${h}`) ?? 0;
              return (
                <span
                  key={h}
                  title={`${dan} ${h} h: ${n}`}
                  className="h-[14px] rounded-[2px] bg-accent"
                  style={{ opacity: n ? 0.15 + 0.85 * (n / max) : 0.05 }}
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
  const kvartovi = (p.seg_kvart_runde ?? []).map((x) => ({ k: x.kvart, v: x.runde, n: x.ljudi == null ? null : `${x.ljudi} ljudi` }));
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
        {kvartovi.length ? <Trake redovi={kvartovi} /> : <p className="text-sm text-muted">Nema rundi s kvartom u razdoblju.</p>}
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
          {ulazi.length ? <Trake redovi={ulazi} /> : <p className="text-sm text-muted">Još nema brojki.</p>}
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
        {redovi.length ? <Tablica stupci={["Kafić", "Runde", "Gostiju"]} redovi={redovi} /> : <p className="text-sm text-muted">Nema rundi u kafićima u razdoblju.</p>}
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
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Plocica
          oznaka="Push greške"
          vrijednost={broj(z.push_greske)}
          ton={z.push_greske ? "text-amber" : undefined}
          ispod={<Promjena sad={z.push_greske} prije={z.push_greske_prije} obrnuto />}
        />
        <Plocica oznaka="Prijave čekaju" vrijednost={broj(m.cekaju)} ton={m.cekaju ? "text-red-400" : "text-accent"} ispod={`${broj(m.prijave)} prijava · ${broj(m.blokade)} blokada`} />
        <Plocica oznaka="iOS uređaji" vrijednost={broj(z.ios_uredaji)} ispod={`${broj(z.web_push)} web push`} />
        <Plocica oznaka="Apple opozivi" vrijednost={broj(z.apple_opozivi_cekaju)} ton={z.apple_opozivi_cekaju ? "text-amber" : undefined} ispod="čekaju ponovni pokušaj" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Kartica naslov="Bodovi" pod={`Zarađeno ${broj(b.zaradeno)}, potrošeno ${broj(b.potroseno)}, zadataka ${broj(b.zadaci)}.`}>
          {(b.kupnje ?? []).length ? (
            <Trake redovi={b.kupnje.map((x) => ({ k: x.artikl, v: x.broj }))} />
          ) : (
            <p className="text-sm text-muted">Nitko nije kupovao u dućanu u ovom razdoblju.</p>
          )}
        </Kartica>
        <Kartica naslov="Potrošnja i limiti" pod="Supabase i Vercel limiti dolaze u fazi 2.">
          <p className="text-sm text-muted">—</p>
        </Kartica>
      </div>
    </Odjeljak>
  );
}
