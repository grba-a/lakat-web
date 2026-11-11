"use client";

// Graf kroz vrijeme: puna zelena linija = sad, isprekidana siva = isto razdoblje prije (duh).
// Okomita crta prati miš / prst / strelice; klik ili Enter otvara ladicu s detaljima dana.
// Graf mjeri svoju širinu (ResizeObserver), pa su oznake iste veličine na mobitelu i na širokom ekranu.
import { useEffect, useRef, useState, useTransition } from "react";
import { detaljiDana } from "./actions";

const fmt = (n) => (n == null ? "—" : new Intl.NumberFormat("hr-HR").format(n));
const dm = (iso) => {
  const [, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  return `${d}. ${m}.`;
};
const DANI = ["ned", "pon", "uto", "sri", "čet", "pet", "sub"];
const danUTjednu = (iso) => DANI[new Date(`${iso}T12:00:00Z`).getUTCDay()];

export function Vrijeme({ sad, prije, mjere, pocetna, igre, push }) {
  const okvir = useRef(null);
  const [w, setW] = useState(0);
  const [mjera, setMjera] = useState(pocetna && mjere.some(([k]) => k === pocetna) ? pocetna : mjere[0][0]);
  const [i, setI] = useState(null);
  const [ladica, setLadica] = useState(null);
  const [ucitava, startTransition] = useTransition();

  useEffect(() => {
    const el = okvir.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!ladica) return;
    const esc = (e) => e.key === "Escape" && setLadica(null);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [ladica]);

  const n = sad.length;
  const H = w >= 700 ? 260 : 200;
  const L = 34, R = 12, T = 14, B = 24;
  const v = (r) => (r ? Number(r[mjera] ?? 0) : null);
  const max = Math.max(1, ...sad.map(v), ...prije.map(v));
  const korak = Math.max(1, Math.ceil(max / 4));
  const vrh = korak * 4;
  const x = (k) => L + (n <= 1 ? 0 : (k * (w - L - R)) / (n - 1));
  const y = (val) => T + (H - T - B) * (1 - val / vrh);
  const linija = (niz) => niz.map((r, k) => `${k ? "L" : "M"}${x(k).toFixed(1)},${y(v(r)).toFixed(1)}`).join(" ");
  const svakih = Math.max(1, Math.ceil(n / Math.max(2, Math.floor((w - L) / 64))));

  const odaberi = (clientX) => {
    const r = okvir.current.getBoundingClientRect();
    const k = Math.round(((clientX - r.left - L) / Math.max(1, w - L - R)) * (n - 1));
    return Math.min(n - 1, Math.max(0, k));
  };
  const otvori = (k) => {
    const dan = sad[k]?.dan;
    if (!dan) return;
    setLadica({ dan, podaci: null });
    startTransition(async () => {
      const r = await detaljiDana(dan);
      setLadica((s) => (s?.dan === dan ? { dan, podaci: r.podaci, greska: r.greska } : s));
    });
  };

  const ime = mjere.find(([k]) => k === mjera)?.[1] ?? mjera;
  const tren = i != null ? sad[i] : null;
  const duh = i != null ? prije[i] : null;
  const razlika = tren && duh ? v(tren) - v(duh) : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap" role="group" aria-label="Što prikazati">
          {mjere.map(([k, t]) => (
            <button
              key={k}
              type="button"
              onClick={() => setMjera(k)}
              aria-pressed={k === mjera}
              className="filtar mono -ml-px flex h-9 items-center border border-[color:var(--a-line)] px-3 text-[11px] text-[color:var(--a-mute)] first:ml-0"
            >
              {t}
            </button>
          ))}
        </div>
        <div className="lbl flex items-center gap-3" aria-hidden="true">
          <span className="flex items-center gap-1.5"><span className="inline-block h-[2px] w-4 bg-[color:var(--a-live)]" /> sad</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-4 border-t border-dashed border-[color:var(--a-mute)]" /> prije</span>
        </div>
      </div>

      <div
        ref={okvir}
        className="relative w-full touch-pan-y select-none outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-[color:var(--a-fg)]"
        style={{ height: H }}
        tabIndex={0}
        role="img"
        aria-label={`${ime} po danu, zadnjih ${n} dana, s prethodnim razdobljem. Strelice biraju dan, Enter otvara detalje.`}
        onPointerMove={(e) => e.pointerType !== "touch" && setI(odaberi(e.clientX))}
        onPointerLeave={(e) => e.pointerType !== "touch" && setI(null)}
        onPointerDown={(e) => {
          const k = odaberi(e.clientX);
          if (e.pointerType === "touch" && i !== k) setI(k);
          else otvori(k);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setI((k) => Math.min(n - 1, (k ?? -1) + 1));
          else if (e.key === "ArrowLeft") setI((k) => Math.max(0, (k ?? n) - 1));
          else if (e.key === "Enter" && i != null) otvori(i);
          else return;
          e.preventDefault();
        }}
      >
        {w > 0 && n > 0 && (
          <svg width={w} height={H} className="block" style={{ fontFamily: "var(--a-mono)" }} aria-hidden="true">
            {[0, 1, 2, 3, 4].map((g) => (
              <g key={g}>
                <line x1={L} x2={w - R} y1={y(g * korak)} y2={y(g * korak)} stroke="var(--a-line)" strokeDasharray={g ? "2 4" : undefined} />
                <text x={L - 6} y={y(g * korak)} dy="0.32em" textAnchor="end" fontSize="10" fill="var(--a-mute)">
                  {g * korak}
                </text>
              </g>
            ))}
            {sad.map((r, k) =>
              (n - 1 - k) % svakih === 0 ? (
                <text key={r.dan} x={x(k)} y={H - 6} textAnchor={k === n - 1 ? "end" : k === 0 ? "start" : "middle"} fontSize="10" fill="var(--a-mute)">
                  {dm(r.dan)}
                </text>
              ) : null
            )}
            {prije.length > 0 && <path d={linija(prije)} fill="none" stroke="var(--a-mute)" strokeWidth="1.5" strokeDasharray="4 4" />}
            <path
              d={`${linija(sad)} L${x(n - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`}
              fill="color-mix(in srgb, var(--a-live) 10%, transparent)"
            />
            <path className="crta" d={linija(sad)} fill="none" stroke="var(--a-live)" strokeWidth="2" strokeLinejoin="round" pathLength="1" />
            {/* Danas još traje: šuplja točka. */}
            <rect x={x(n - 1) - 3.5} y={y(v(sad[n - 1])) - 3.5} width="7" height="7" fill="var(--a-bg)" stroke="var(--a-live)" strokeWidth="1.5" />
            {i != null && (
              <g>
                <line x1={x(i)} x2={x(i)} y1={T} y2={H - B} stroke="var(--a-fg)" strokeOpacity="0.5" />
                {duh && <rect x={x(i) - 3} y={y(v(duh)) - 3} width="6" height="6" fill="var(--a-mute)" />}
                <rect x={x(i) - 4} y={y(v(tren)) - 4} width="8" height="8" fill="var(--a-live)" />
              </g>
            )}
          </svg>
        )}
        {tren && (
          <div
            className="mono pointer-events-none absolute top-0 z-10 border border-[color:var(--a-fg)] bg-[color:var(--a-panel)] px-2.5 py-1.5 text-[11px] normal-case tracking-[0.02em]"
            style={{ left: Math.min(Math.max(x(i) - 80, 0), Math.max(0, w - 168)), width: 168 }}
          >
            <div className="text-[color:var(--a-fg)]">
              {danUTjednu(tren.dan)} {dm(tren.dan)}
              {i === n - 1 ? " · u tijeku" : ""}
            </div>
            <div>
              <span className="up">{ime}: {fmt(v(tren))}</span>
            </div>
            {duh && (
              <div className="text-[color:var(--a-mute)]">
                prije ({dm(duh.dan)}): {fmt(v(duh))}
                {razlika != null && razlika !== 0 ? <span className={razlika > 0 ? "up" : "down"}> {razlika > 0 ? "+" : "−"}{fmt(Math.abs(razlika))}</span> : null}
              </div>
            )}
            <div className="lbl mt-0.5">klik = detalji dana</div>
          </div>
        )}
      </div>

      {ladica && <Ladica ladica={ladica} ucitava={ucitava} igre={igre} push={push} zatvori={() => setLadica(null)} />}
    </div>
  );
}

function Ladica({ ladica, ucitava, igre, push, zatvori }) {
  const d = ladica.podaci;
  const zatvoriGumb = useRef(null);
  useEffect(() => zatvoriGumb.current?.focus(), []);
  const sati = Array.from({ length: 24 }, (_, h) => d?.sati?.find((s) => s.h === h)?.n ?? 0);
  const maxSat = Math.max(1, ...sati);
  const vrhSat = sati.indexOf(Math.max(...sati));
  const pulsD = Object.fromEntries((d?.push ?? []).map((p) => [p.kljuc, p.broj]));
  const pushRedovi = Object.entries(push)
    .map(([k, t]) => [t, pulsD[`push.poslano.${k}`] ?? 0, pulsD[`push.otvoreno.${k}`] ?? 0])
    .filter(([, a, b]) => a || b);
  return (
    <div className="fixed inset-0 z-[65] flex items-end justify-end bg-black/60 lg:items-stretch" onPointerDown={(e) => e.target === e.currentTarget && zatvori()}>
      <aside
        role="dialog"
        aria-label={`Detalji ${dm(ladica.dan)}`}
        className="ladica flex max-h-[85dvh] w-full flex-col overflow-y-auto border-t border-[color:var(--a-fg)] bg-[color:var(--a-panel)] lg:max-h-none lg:w-[420px] lg:border-l lg:border-t-0"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <header className="sticky top-0 flex items-center justify-between border-b border-[color:var(--a-line)] bg-[color:var(--a-panel)] px-4 py-3">
          <div>
            <p className="lbl">[ DAN ] {"///"} {danUTjednu(ladica.dan)}</p>
            <p className="num text-[2rem]">{dm(ladica.dan)}</p>
          </div>
          <button ref={zatvoriGumb} type="button" onClick={zatvori} className="chip mono h-11 border border-[color:var(--a-line)] px-3 text-[11px] text-[color:var(--a-mute)]">
            [ ESC ]
          </button>
        </header>
        {!d && !ladica.greska && <p className="mono p-4 text-[11px] text-[color:var(--a-mute)]">{ucitava ? "Učitavam…" : "—"}</p>}
        {ladica.greska && <p className="mono p-4 text-[11px] down">{ladica.greska}</p>}
        {d && (
          <div className="flex flex-col gap-4 p-4">
            <div className="grid-lines grid-cols-3">
              {[["Runde", d.runde], ["Partije", d.partije], ["Novi", d.novi], ["Reakcije", d.reakcije], ["Komentari", d.komentari], ["Pajdaštva", d.pajdastva]].map(([t, val]) => (
                <div key={t} className="flex flex-col gap-1 p-2.5">
                  <span className="lbl">{t}</span>
                  <span className="num text-[1.6rem]">{fmt(val)}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="lbl mb-2">Po satu (runde i partije){Math.max(...sati) ? ` · vrh ${vrhSat}–${vrhSat + 1} h` : ""}</p>
              <div className="flex h-16 items-end gap-[2px]">
                {sati.map((s, h) => (
                  <span
                    key={h}
                    data-tip={`${h}–${h + 1} h: ${s}`}
                    className="flex-1"
                    style={{ height: `${Math.max(2, (s / maxSat) * 100)}%`, background: s ? "var(--a-live)" : "var(--a-line)" }}
                  />
                ))}
              </div>
              <div className="lbl mt-1 flex justify-between"><span>0</span><span>6</span><span>12</span><span>18</span><span>23</span></div>
            </div>
            {(d.igre ?? []).length > 0 && (
              <div>
                <p className="lbl mb-1">Igre</p>
                <ul className="mono text-[12px] normal-case">
                  {d.igre.map((g) => (
                    <li key={g.igra} className="flex justify-between border-b border-[color:var(--a-line)] py-1.5">
                      <span>{igre[g.igra] ?? g.igra}</span>
                      <span className="tabular-nums">{fmt(g.partije)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {pushRedovi.length > 0 && (
              <div>
                <p className="lbl mb-1">Push (poslano / otvoreno)</p>
                <ul className="mono text-[12px] normal-case">
                  {pushRedovi.map(([t, a, b]) => (
                    <li key={t} className="flex justify-between border-b border-[color:var(--a-line)] py-1.5">
                      <span>{t}</span>
                      <span className="tabular-nums">{fmt(a)} / {fmt(b)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
