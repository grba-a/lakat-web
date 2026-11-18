"use client";

// Kalendar plana (Petar 18. 11.: „kao Google kalendar“): Mjesec, Tjedan, Dan, s ‹ › i Danas. Boja = područje, prekriženo = gotovo,
// crveno = kasni. Dodir dana otvara Dan, dodir stavke otvara ladicu (stanje, datum, područje, bilješka), „+“ dodaje tvoju bilješku.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { STANJA } from "@/lib/plan";
import { dodajKarticu, obrisiKarticu, spremiKarticu } from "./actions";

const BOJA_RED = { app: "#4ade80", web: "#7dd3fc", ig: "#f472b6", ti: "#c4b5fd" };
const STANJE_BOJA = { todo: "var(--a-mute)", radim: "var(--a-warn)", spremno: "#7dd3fc", gotovo: "var(--a-live)", ne: "#55595c" };
const DANI_KRATKO = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];
const LBL = "lbl text-[clamp(10px,0.72vw,14px)]";
const url = (v, d) => `/admin/plan?v=${v}&d=${d}`;
const gotova = (k) => k.stanje === "gotovo" || k.stanje === "ne";

// Mala stavka u mjesecu i tjednu: obojena lijeva crta po području, jedna linija teksta.
function Cip({ k, otvori, veliki = false }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); otvori(k); }}
      className={`relative flex w-full min-w-0 items-center gap-1.5 rounded-[6px] py-1 pl-2.5 pr-1.5 text-left transition-[background-color] duration-150 hover:bg-[rgb(255_255_255/0.08)] ${k.moja ? "bg-[#f3e27a] text-[#1e1a05]" : "bg-[rgb(255_255_255/0.04)]"} ${gotova(k) ? "opacity-50" : ""}`}
      style={{ minHeight: veliki ? 40 : 26 }}
    >
      <span aria-hidden="true" className="absolute bottom-1 left-0 top-1 w-[3px] rounded-r" style={{ background: k.kasni ? "var(--a-alarm)" : BOJA_RED[k.red] }} />
      <span className={`truncate normal-case ${veliki ? "text-[clamp(13px,0.95vw,17px)] font-semibold" : "text-[clamp(11px,0.78vw,14px)]"} ${gotova(k) ? "line-through" : ""}`}>{k.naslov}</span>
      {k.kasni && <span className="mono ml-auto shrink-0 text-[10px] text-[color:var(--a-alarm)]">KASNI</span>}
    </button>
  );
}

// Puna kartica u prikazu dana i u popisu bez datuma.
function Kartica({ k, otvori }) {
  return (
    <button type="button" onClick={() => otvori(k)} className={`relative grid w-full gap-1.5 rounded-[var(--r-md)] border py-2.5 pl-4 pr-3 text-left active:scale-[0.99] ${k.moja ? "border-transparent bg-[#f3e27a] text-[#1e1a05]" : "border-[color:var(--a-line)] bg-[rgb(255_255_255/0.03)]"} ${gotova(k) ? "opacity-55" : ""}`} style={{ minHeight: 44 }}>
      <span aria-hidden="true" className="absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-r" style={{ background: k.kasni ? "var(--a-alarm)" : BOJA_RED[k.red] }} />
      <span className={`text-[clamp(14px,1vw,18px)] font-semibold leading-snug normal-case ${gotova(k) ? "line-through" : ""}`}>{k.naslov}</span>
      {(k.biljeska || k.napomena) && <span className={`text-[clamp(12px,0.85vw,15px)] leading-snug normal-case ${k.moja ? "text-[#5b5214]" : "text-[color:var(--a-mute)]"}`}>{k.biljeska || k.napomena}</span>}
      <span className="flex flex-wrap gap-1.5">
        {k.kasni && <span className="mono rounded-full border border-[color:var(--a-alarm)] px-2 text-[11px] text-[color:var(--a-alarm)]">KASNI</span>}
        <span className="mono rounded-full border px-2 text-[11px]" style={{ color: STANJE_BOJA[k.stanje], borderColor: STANJE_BOJA[k.stanje] }}>{STANJA.find(([s]) => s === k.stanje)?.[1]}</span>
        {(k.tko ?? "").split(",").filter(Boolean).map((t) => <span key={t} className={`mono rounded-full border border-[color:var(--a-line)] px-2 text-[11px] ${t === "ti" ? "text-[#7dd3fc]" : "text-[color:var(--a-mute)]"}`}>{t}</span>)}
      </span>
    </button>
  );
}

function Ladica({ k, redovi, zatvori }) {
  const router = useRouter();
  const [nacrt, setNacrt] = useState(k);
  const [tekst, setTekst] = useState(k.id ? (k.moja ? k.naslov : k.biljeska ?? "") : "");
  const [greska, setGreska] = useState("");
  const [radi, start] = useTransition();
  const ladica = useRef(null);
  const zatvoriRef = useRef(zatvori);
  useEffect(() => { zatvoriRef.current = zatvori; }, [zatvori]);
  const maks = !k.id || k.moja ? 200 : 600;
  useEffect(() => {
    const tipka = (e) => {
      if (e.key === "Escape") return zatvoriRef.current();
      if (e.key !== "Tab" || !ladica.current) return;
      const f = [...ladica.current.querySelectorAll("button, textarea, input")].filter((x) => !x.disabled);
      if (!f.length) return;
      const [prvi, zadnji] = [f[0], f.at(-1)];
      if (e.shiftKey && document.activeElement === prvi) { e.preventDefault(); zadnji.focus(); }
      else if (!e.shiftKey && document.activeElement === zadnji) { e.preventDefault(); prvi.focus(); }
      else if (!ladica.current.contains(document.activeElement)) { e.preventDefault(); prvi.focus(); }
    };
    document.addEventListener("keydown", tipka);
    return () => document.removeEventListener("keydown", tipka);
  }, []);
  const izbor = (polje, v) => setNacrt((n) => ({ ...n, [polje]: v }));
  const spremi = () =>
    start(async () => {
      let r;
      if (k.id) {
        // Šalje se samo stvarna promjena prema izvorniku (Codex 18. 11.).
        const p = {};
        if (nacrt.stanje !== k.stanje) p.stanje = nacrt.stanje;
        if (nacrt.red !== k.red) p.red = nacrt.red;
        if ((nacrt.dan ?? null) !== (k.dan ?? null)) p.dan = nacrt.dan ?? null;
        if (k.moja) { if (tekst.trim() !== k.naslov) p.naslov = tekst; }
        else if (tekst.trim() !== (k.biljeska ?? "")) p.biljeska = tekst;
        r = Object.keys(p).length ? await spremiKarticu(k.id, p) : { ok: true };
      } else {
        r = tekst.trim() ? await dodajKarticu({ naslov: tekst, red: nacrt.red, dan: nacrt.dan ?? null, stanje: "todo" }) : { ok: true };
      }
      if (r.greska) return setGreska(r.greska);
      router.refresh();
      zatvori();
    });
  const obrisi = () =>
    start(async () => {
      const r = await obrisiKarticu(k.id);
      if (r.greska) return setGreska(r.greska);
      router.refresh();
      zatvori();
    });
  const gumb = (aktivan) => `chip mono min-h-11 rounded-full border px-3 text-[12px] ${aktivan ? "border-[color:var(--a-live)] bg-[color:var(--a-live)] text-[#04140a]" : "border-[color:var(--a-line)] text-[color:var(--a-fg)]"}`;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={zatvori} aria-hidden="true" />
      <section ref={ladica} role="dialog" aria-modal="true" aria-label={k.id ? k.naslov : "Nova bilješka"} className="fixed inset-x-0 bottom-0 z-50 mx-auto grid max-h-[86dvh] max-w-[640px] gap-3 overflow-y-auto rounded-t-[20px] border-t border-[color:var(--a-line)] bg-[#121413] p-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-[20px] md:border" style={{ paddingBottom: "max(18px, env(safe-area-inset-bottom))" }}>
        <h3 className="text-[18px] font-extrabold normal-case">{k.id ? (k.moja ? "Tvoja bilješka" : k.naslov) : "Nova bilješka"}</h3>
        {k.id && !k.moja && k.napomena && <p className="text-[14px] normal-case text-[color:var(--a-mute)]">{k.napomena}</p>}
        <label className="sr-only" htmlFor="plan-tekst">{k.id && !k.moja ? "Napomena za Claudea" : "Tekst bilješke"}</label>
        <textarea id="plan-tekst" autoFocus maxLength={maks} value={tekst} onChange={(e) => setTekst(e.target.value)} placeholder={k.id && !k.moja ? "Napomena za Claudea…" : "Napiši bilješku…"} className="min-h-16 w-full rounded-[var(--r-md)] border border-[color:var(--a-line)] bg-[#0d0f0e] p-3 text-[15px] normal-case text-[color:var(--a-fg)]" />
        <p className="mono -mt-1 text-right text-[11px] text-[color:var(--a-mute)]">{tekst.length} / {maks}</p>
        {k.id && (
          <>
            <p className="lbl">Stanje</p>
            <div className="flex flex-wrap gap-2">{STANJA.map(([s, ime]) => <button key={s} type="button" className={gumb(nacrt.stanje === s)} onClick={() => izbor("stanje", s)}>{ime}</button>)}</div>
          </>
        )}
        <p className="lbl">Datum</p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="plan-dan">Datum</label>
          <input id="plan-dan" type="date" value={nacrt.dan ?? ""} onChange={(e) => izbor("dan", e.target.value || null)} className="min-h-11 rounded-[var(--r-md)] border border-[color:var(--a-line)] bg-[#0d0f0e] px-3 text-[15px] text-[color:var(--a-fg)] [color-scheme:dark]" />
          <button type="button" className={gumb(!nacrt.dan)} onClick={() => izbor("dan", null)}>Bez datuma</button>
        </div>
        <p className="lbl">Područje</p>
        <div className="flex flex-wrap gap-2">{redovi.map(([r, ime]) => <button key={r} type="button" className={gumb(nacrt.red === r)} onClick={() => izbor("red", r)}><span aria-hidden="true" className="mr-1.5 inline-block size-2 rounded-full" style={{ background: BOJA_RED[r] }} />{ime}</button>)}</div>
        {greska && <p className="mono text-[12px] text-[color:var(--a-alarm)]">{greska}</p>}
        <div className="flex justify-between gap-2">
          {k.id && k.moja ? <button type="button" disabled={radi} onClick={obrisi} className="chip mono min-h-11 rounded-[var(--r-md)] border border-[color:var(--a-alarm)] px-4 text-[12px] text-[color:var(--a-alarm)]">Obriši</button> : <span />}
          <button type="button" disabled={radi} onClick={spremi} className="chip mono min-h-11 rounded-[var(--r-md)] bg-[color:var(--a-live)] px-5 text-[12px] font-bold text-[#04140a]">{radi ? "Spremam…" : "Spremi"}</button>
        </div>
      </section>
    </>
  );
}

export function Kalendar({ v, d, danas, naslov, prije, poslije, dani, kartice, bezDatuma, redovi, brojke, greska, lansiranje }) {
  const router = useRouter();
  const [otvorena, postavi] = useState(null);
  const otvarac = useRef(null);
  const otvori = (k) => {
    if (k) otvarac.current = document.activeElement;
    else if (otvarac.current instanceof HTMLElement) setTimeout(() => otvarac.current?.focus(), 0);
    postavi(k);
  };
  if (greska) return <p className="mono p-6 text-[13px] normal-case text-[color:var(--a-mute)]">{greska}</p>;
  const zaDan = (dan) => kartice.filter((k) => k.dan === dan).sort((a, b) => Number(gotova(a)) - Number(gotova(b)) || Number(b.kasni) - Number(a.kasni) || a.redoslijed - b.redoslijed);
  const nova = (dan, red = "ti") => otvori({ red, dan, stanje: "todo", moja: true });
  const seg = (kljuc, ime) => (
    <Link key={kljuc} href={url(kljuc, d)} aria-current={v === kljuc ? "page" : undefined} className={`chip mono flex min-h-11 items-center px-3.5 text-[12px] ${v === kljuc ? "bg-[color:var(--a-live)] font-bold text-[#04140a]" : "text-[color:var(--a-mute)]"}`}>{ime}</Link>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-[clamp(10px,1.2vw,24px)]">
      <div inert={otvorena ? true : undefined} className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Traka: Danas ‹ › naslov · Mjesec Tjedan Dan · brojke */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-1.5">
            <Link href={url(v, danas)} className="chip mono flex min-h-11 items-center rounded-[var(--r-md)] border border-[color:var(--a-line)] px-3.5 text-[12px]">Danas</Link>
            <Link href={url(v, prije)} aria-label="Prethodno" className="chip mono flex size-11 items-center justify-center rounded-full border border-[color:var(--a-line)] text-[16px]">‹</Link>
            <Link href={url(v, poslije)} aria-label="Sljedeće" className="chip mono flex size-11 items-center justify-center rounded-full border border-[color:var(--a-line)] text-[16px]">›</Link>
          </div>
          <h1 className="num text-[clamp(1.5rem,2.4vw,3rem)] uppercase leading-none">{naslov}</h1>
          <div className="ml-auto flex overflow-hidden rounded-[var(--r-md)] border border-[color:var(--a-line)]">{seg("mjesec", "Mjesec")}{seg("tjedan", "Tjedan")}{seg("dan", "Dan")}</div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          {[["Otvoreno", brojke.otvoreno, ""], ["Čeka tebe", brojke.tebe, "text-[#7dd3fc]"], ["Kasni", brojke.kasni, brojke.kasni ? "down" : ""], ["Gotovo danas", brojke.danas, "up"]].map(([o, n, c]) => (
            <span key={o} className="flex items-baseline gap-2"><span className={LBL}>{o}</span><span className={`num text-[clamp(1.1rem,1.4vw,1.8rem)] ${c}`}>{n}</span></span>
          ))}
          <span className="flex items-baseline gap-2"><span className={LBL}>Do 1. 12.</span>{lansiranje}</span>
          <span className="ml-auto flex flex-wrap gap-3">{redovi.map(([r, ime]) => <span key={r} className="mono flex items-center gap-1.5 text-[11px] normal-case text-[color:var(--a-mute)]"><span aria-hidden="true" className="inline-block size-2.5 rounded-full" style={{ background: BOJA_RED[r] }} />{ime}</span>)}</span>
        </div>

        <div className={`grid min-h-0 flex-1 gap-3 ${v === "mjesec" ? "" : "lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)]"}`}>
          {v === "mjesec" && (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--r-lg)] border border-[color:var(--a-line)]">
              <div className="grid grid-cols-7 border-b border-[color:var(--a-line)] bg-[#0a0a0a]">{DANI_KRATKO.map((n) => <p key={n} className={`${LBL} px-2 py-2 text-center`}>{n}</p>)}</div>
              <div className="grid flex-1 grid-cols-7" style={{ gridAutoRows: "minmax(clamp(64px,11vh,150px), 1fr)" }}>
                {dani.map((x) => {
                  const lista = zaDan(x.id);
                  return (
                    <div key={x.id} onClick={() => router.push(url("dan", x.id))} className={`group relative flex min-w-0 cursor-pointer flex-col gap-1 border-b border-r border-[color:var(--a-line)] p-1 sm:p-1.5 ${x.uMjesecu ? "" : "bg-[rgb(255_255_255/0.015)] opacity-55"} ${x.danas ? "bg-[rgb(74_222_128/0.05)]" : ""}`}>
                      <Link href={url("dan", x.id)} onClick={(e) => e.stopPropagation()} aria-label={`${x.dan}, ${x.broj}.`} className={`num flex size-8 items-center justify-center self-start rounded-full text-[clamp(13px,1vw,18px)] leading-none ${x.danas ? "bg-[color:var(--a-live)] text-[#04140a]" : x.vikend ? "text-[color:var(--a-mute)]" : ""}`}>{x.broj}</Link>
                      {/* Mobitel: točkice; veći ekran: stavke (najviše 3) i „+N“. */}
                      <div className="flex flex-wrap gap-1 sm:hidden">{lista.slice(0, 4).map((k) => <span key={k.id} className="size-1.5 rounded-full" style={{ background: k.kasni ? "var(--a-alarm)" : BOJA_RED[k.red], opacity: gotova(k) ? 0.4 : 1 }} />)}</div>
                      <div className="hidden min-w-0 flex-col gap-1 sm:flex">
                        {lista.slice(0, 3).map((k) => <Cip key={k.id} k={k} otvori={otvori} />)}
                        {lista.length > 3 && <Link href={url("dan", x.id)} onClick={(e) => e.stopPropagation()} className="mono px-2 text-[11px] text-[color:var(--a-mute)] hover:text-[color:var(--a-fg)]">+{lista.length - 3} više</Link>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {v === "tjedan" && (
            <div className="min-h-0 overflow-auto rounded-[var(--r-lg)] border border-[color:var(--a-line)]">
              {/* Mobitel: dani jedan ispod drugog; od md naviše 7 stupaca kao u Google kalendaru. */}
              <div className="grid grid-cols-1 md:min-h-full md:grid-cols-7">
                {dani.map((x) => (
                  <div key={x.id} className={`flex min-w-0 flex-col border-b border-[color:var(--a-line)] md:border-b-0 md:border-r ${x.danas ? "bg-[rgb(74_222_128/0.04)]" : ""}`}>
                    <Link href={url("dan", x.id)} className="flex items-center gap-2 border-b border-[color:var(--a-line)] bg-[#0a0a0a] px-3 py-2.5 md:sticky md:top-0 md:z-10">
                      <span className={LBL}>{DANI_KRATKO[(new Date(`${x.id}T12:00:00Z`).getUTCDay() + 6) % 7]}</span>
                      <span className={`num flex size-9 items-center justify-center rounded-full text-[clamp(1rem,1.3vw,1.6rem)] ${x.danas ? "bg-[color:var(--a-live)] text-[#04140a]" : ""}`}>{x.broj}</span>
                    </Link>
                    <div className="grid content-start gap-1.5 p-2">
                      {zaDan(x.id).map((k) => <Cip key={k.id} k={k} otvori={otvori} veliki />)}
                      <button type="button" onClick={() => nova(x.id)} className="chip mono min-h-11 rounded-[var(--r-md)] border border-dashed border-[color:var(--a-line)] text-[11px] text-[color:var(--a-mute)] opacity-70 hover:opacity-100">+ bilješka</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {v === "dan" && (
            <div className="grid content-start gap-4">
              {redovi.map(([r, ime]) => {
                const lista = zaDan(d).filter((k) => k.red === r);
                return (
                  <section key={r} className="grid gap-2">
                    <h2 className="flex items-center gap-2"><span aria-hidden="true" className="inline-block size-2.5 rounded-full" style={{ background: BOJA_RED[r] }} /><span className={LBL}>{ime} · {lista.length}</span></h2>
                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">{lista.map((k) => <Kartica key={k.id} k={k} otvori={otvori} />)}</div>
                    <button type="button" onClick={() => nova(d, r)} className="chip mono min-h-11 justify-self-start rounded-[var(--r-md)] border border-dashed border-[color:var(--a-line)] px-4 text-[11px] text-[color:var(--a-mute)]">+ bilješka</button>
                  </section>
                );
              })}
            </div>
          )}

          {v !== "mjesec" && (
            <aside className="grid content-start gap-2 rounded-[var(--r-lg)] border border-[color:var(--a-line)] p-3" aria-label="Bez datuma">
              <h2 className={LBL}>Bez datuma · {bezDatuma.length}</h2>
              {bezDatuma.map((k) => <Cip key={k.id} k={k} otvori={otvori} veliki />)}
              <button type="button" onClick={() => nova(null)} className="chip mono min-h-11 rounded-[var(--r-md)] border border-dashed border-[color:var(--a-line)] text-[11px] text-[color:var(--a-mute)]">+ bilješka</button>
            </aside>
          )}
        </div>
        {v === "mjesec" && bezDatuma.length > 0 && (
          <details className="rounded-[var(--r-lg)] border border-[color:var(--a-line)] p-3">
            <summary className={`${LBL} cursor-pointer`}>Bez datuma · {bezDatuma.length}</summary>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">{bezDatuma.map((k) => <Cip key={k.id} k={k} otvori={otvori} veliki />)}</div>
          </details>
        )}
      </div>
      {otvorena && <Ladica key={otvorena.id ?? `nova-${otvorena.dan}-${otvorena.red}`} k={otvorena} redovi={redovi} zatvori={() => otvori(null)} />}
    </div>
  );
}
