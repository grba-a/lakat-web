"use client";

// Zid plana: mreža dan × red, kartice s trakom stanja. Dodir kartice = ladica (stanje, dan, red, bilješka),
// „+“ u ćeliji = tvoja bilješka. Sprema se odmah (akcije), zid se osvježi. Pokret samo transform/opacity.
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { STANJA } from "@/lib/plan";
import { dodajKarticu, obrisiKarticu, spremiKarticu } from "./actions";

const BOJA = { todo: "var(--a-mute)", radim: "var(--a-warn)", spremno: "#7dd3fc", gotovo: "var(--a-live)", ne: "#55595c" };
const LBL = "lbl text-[clamp(10px,0.72vw,15px)]";

function Kartica({ k, otvori }) {
  const gotova = k.stanje === "gotovo" || k.stanje === "ne";
  return (
    <button
      type="button"
      onClick={() => otvori(k)}
      className={`relative grid w-full gap-1.5 rounded-[var(--r-md)] border py-2.5 pl-4 pr-3 text-left transition-[transform,border-color] duration-150 active:scale-[0.98] ${k.moja ? "border-transparent bg-[#f3e27a] text-[#1e1a05]" : "border-[color:var(--a-line)] bg-[rgb(255_255_255/0.03)]"} ${gotova ? "opacity-55" : ""}`}
      style={{ minHeight: 44 }}
    >
      <span aria-hidden="true" className="absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-r" style={{ background: BOJA[k.stanje] }} />
      <span className={`text-[clamp(13px,0.95vw,19px)] font-semibold leading-snug normal-case ${gotova ? "line-through decoration-[color:var(--a-mute)]" : ""}`}>{k.naslov}</span>
      {(k.napomena || k.biljeska) && (
        <span className={`text-[clamp(11px,0.8vw,15px)] leading-snug normal-case ${k.moja ? "text-[#5b5214]" : "text-[color:var(--a-mute)]"}`}>{k.biljeska || k.napomena}</span>
      )}
      <span className="flex flex-wrap gap-1.5">
        {k.kasni && <span className="mono rounded-full border border-[color:var(--a-alarm)] px-2 text-[11px] text-[color:var(--a-alarm)]">KASNI</span>}
        <span className="mono rounded-full border px-2 text-[11px]" style={{ color: BOJA[k.stanje], borderColor: BOJA[k.stanje] }}>{STANJA.find(([s]) => s === k.stanje)?.[1]}</span>
        {(k.tko ?? "").split(",").filter(Boolean).map((t) => (
          <span key={t} className={`mono rounded-full border border-[color:var(--a-line)] px-2 text-[11px] ${t === "ti" ? "text-[#7dd3fc]" : "text-[color:var(--a-mute)]"}`}>{t}</span>
        ))}
      </span>
    </button>
  );
}

function Ladica({ k, stupci, redovi, zatvori }) {
  const router = useRouter();
  const [nacrt, setNacrt] = useState(k);
  const [tekst, setTekst] = useState(k.id ? k.biljeska ?? "" : "");
  const [greska, setGreska] = useState("");
  const [radi, start] = useTransition();
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && zatvori();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [zatvori]);
  const izbor = (polje, v) => setNacrt((n) => ({ ...n, [polje]: v }));
  const spremi = () =>
    start(async () => {
      const dan = nacrt.stupac === "kasnije" ? null : nacrt.stupac;
      const r = k.id
        ? await spremiKarticu(k.id, { stanje: nacrt.stanje, red: nacrt.red, dan, biljeska: tekst })
        : tekst.trim()
          ? await dodajKarticu({ naslov: tekst, red: nacrt.red, dan, stanje: "todo" })
          : { ok: true };
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
      <section role="dialog" aria-modal="true" aria-label={k.id ? k.naslov : "Nova bilješka"} className="fixed inset-x-0 bottom-0 z-50 mx-auto grid max-h-[86dvh] max-w-[640px] gap-3 overflow-y-auto rounded-t-[20px] border-t border-[color:var(--a-line)] bg-[#121413] p-4" style={{ paddingBottom: "max(18px, env(safe-area-inset-bottom))" }}>
        <h3 className="text-[18px] font-extrabold normal-case">{k.id ? (k.moja ? "Tvoja bilješka" : k.naslov) : "Nova bilješka"}</h3>
        <label className="sr-only" htmlFor="plan-tekst">{k.id && !k.moja ? "Napomena za Claudea" : "Tekst bilješke"}</label>
        <textarea id="plan-tekst" value={tekst} onChange={(e) => setTekst(e.target.value)} placeholder={k.id && !k.moja ? "Napomena za Claudea…" : "Napiši bilješku…"} className="min-h-16 w-full rounded-[var(--r-md)] border border-[color:var(--a-line)] bg-[#0d0f0e] p-3 text-[15px] normal-case text-[color:var(--a-fg)]" />
        {k.id && (
          <>
            <p className="lbl">Stanje</p>
            <div className="flex flex-wrap gap-2">{STANJA.map(([s, ime]) => <button key={s} type="button" className={gumb(nacrt.stanje === s)} onClick={() => izbor("stanje", s)}>{ime}</button>)}</div>
          </>
        )}
        <p className="lbl">Dan</p>
        <div className="flex flex-wrap gap-2">{stupci.map((s) => <button key={s.id} type="button" className={gumb(nacrt.stupac === s.id)} onClick={() => izbor("stupac", s.id)}>{s.naslov} {s.pod !== "bez datuma" ? s.pod : ""}</button>)}</div>
        <p className="lbl">Područje</p>
        <div className="flex flex-wrap gap-2">{redovi.map(([r, ime]) => <button key={r} type="button" className={gumb(nacrt.red === r)} onClick={() => izbor("red", r)}>{ime}</button>)}</div>
        {greska && <p className="mono text-[12px] text-[color:var(--a-alarm)]">{greska}</p>}
        <div className="flex justify-between gap-2">
          {k.id && k.moja ? <button type="button" disabled={radi} onClick={obrisi} className="chip mono min-h-11 rounded-[var(--r-md)] border border-[color:var(--a-alarm)] px-4 text-[12px] text-[color:var(--a-alarm)]">Obriši</button> : <span />}
          <button type="button" disabled={radi} onClick={spremi} className="chip mono min-h-11 rounded-[var(--r-md)] bg-[color:var(--a-live)] px-5 text-[12px] font-bold text-[#04140a]">{radi ? "Spremam…" : "Spremi"}</button>
        </div>
      </section>
    </>
  );
}

export function Ploca({ stupci, redovi, kartice, greska, brojke, lansiranje }) {
  const [otvorena, setOtvorena] = useState(null);
  if (greska) return <p className="mono p-6 text-[13px] normal-case text-[color:var(--a-mute)]">{greska}</p>;
  const u = (red, stupac) => kartice.filter((k) => k.red === red && k.stupac === stupac).sort((a, b) => Number(!!b.kasni) - Number(!!a.kasni) || a.redoslijed - b.redoslijed);
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-[clamp(10px,1.2vw,24px)]">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--r-lg)] border border-[color:var(--a-line)] bg-[color:var(--a-line)] md:grid-cols-5">
        {[["Otvoreno", brojke.otvoreno], ["Čeka tebe", brojke.tebe], ["Kasni", brojke.kasni], ["Gotovo danas", brojke.danas]].map(([o, v], i) => (
          <div key={o} className="flex flex-col gap-1 bg-[#0d0f0e] px-4 py-3">
            <span className={LBL}>{o}</span>
            <span className={`num text-[clamp(1.6rem,2.4vw,3.2rem)] ${i === 2 && v ? "down" : i === 1 ? "" : "up"}`}>{v}</span>
          </div>
        ))}
        <div className="col-span-2 flex flex-col gap-1 bg-[#0d0f0e] px-4 py-3 md:col-span-1">
          <span className={LBL}>Do lansiranja</span>
          {lansiranje}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto rounded-[var(--r-lg)] border border-[color:var(--a-line)]" style={{ overscrollBehaviorX: "contain" }}>
        <div className="grid w-max min-w-full" style={{ gridTemplateColumns: `clamp(34px,2.4vw,48px) repeat(${stupci.length}, minmax(min(78vw,240px), 1fr))` }}>
          <div className="sticky left-0 top-0 z-20 bg-[#0a0a0a]" />
          {stupci.map((s) => (
            <div key={s.id} className={`sticky top-0 z-10 border-l border-[color:var(--a-line)] bg-[#0a0a0a] px-3 py-2.5 ${s.danas ? "text-[color:var(--a-live)]" : ""}`}>
              <p className="num text-[clamp(1.1rem,1.5vw,2rem)] uppercase leading-none">{s.naslov}</p>
              <p className={`${LBL} mt-1`}>{s.pod}</p>
            </div>
          ))}
          {redovi.map(([r, ime]) => (
            <div key={r} className="contents">
              <div className="sticky left-0 z-10 grid place-items-center border-t border-[color:var(--a-line)] bg-[#0a0a0a]">
                <span className={`${LBL} whitespace-nowrap`} style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{ime}</span>
              </div>
              {stupci.map((s) => (
                <div key={s.id} className={`grid content-start gap-2 border-l border-t border-[color:var(--a-line)] p-2 ${s.danas ? "bg-[rgb(74_222_128/0.035)]" : ""}`} style={{ minHeight: 96 }}>
                  {u(r, s.id).map((k) => <Kartica key={k.id} k={k} otvori={setOtvorena} />)}
                  <button type="button" onClick={() => setOtvorena({ red: r, stupac: s.id, stanje: "todo", moja: true })} className="chip mono min-h-9 rounded-[var(--r-md)] border border-dashed border-[color:var(--a-line)] text-[11px] text-[color:var(--a-mute)] opacity-70 hover:opacity-100">
                    + bilješka
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {otvorena && <Ladica k={otvorena} stupci={stupci} redovi={redovi} zatvori={() => setOtvorena(null)} />}
    </div>
  );
}
