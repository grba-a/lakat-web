"use client";

// Tablica liste: tražilica (mail, ime, grad, kvart), filteri (stanje, platforma, grad) i izvoz CSV-a.
// Izvoz uzima SAMO potvrđene (dvostruka potvrda maila) jer samo njima smijemo poslati mail o izlasku.
import { useMemo, useState } from "react";

const datum = (iso) => (iso ? `${iso.slice(8, 10)}. ${iso.slice(5, 7)}.` : "—");
const PLATFORME = { iphone: "iPhone", android: "Android" };

function Gumb({ aktivan, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktivan}
      className={`chip mono h-11 shrink-0 rounded-[var(--r-sm)] border px-3.5 text-[11px] ${aktivan ? "border-[color:var(--a-live)] bg-[color:var(--a-live)] text-[#04140a]" : "border-[color:var(--a-line)] text-[color:var(--a-mute)]"}`}
    >
      {children}
    </button>
  );
}

function csv(redovi) {
  const polje = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const glava = ["email", "ime", "grad", "kvart", "platforma", "potvrdeno"];
  return "﻿" + [glava.join(","), ...redovi.map((r) => [r.email, r.ime, r.grad, r.kvart, r.platforma, r.potvrdeno?.slice(0, 10)].map(polje).join(","))].join("\n");
}

export function ListaTablica({ redovi }) {
  const [upit, setUpit] = useState("");
  const [stanje, setStanje] = useState("sve");
  const [platforma, setPlatforma] = useState("sve");
  const [grad, setGrad] = useState("sve");

  const gradovi = useMemo(() => [...new Set(redovi.map((r) => r.grad).filter(Boolean))].sort(), [redovi]);
  const potvrdeni = redovi.filter((r) => r.potvrdeno);

  const vidljivi = useMemo(() => {
    const q = upit.trim().toLowerCase();
    return redovi.filter((r) => {
      if (stanje === "potvrdeni" && !r.potvrdeno) return false;
      if (stanje === "nepotvrdeni" && r.potvrdeno) return false;
      if (platforma !== "sve" && r.platforma !== platforma) return false;
      if (grad !== "sve" && r.grad !== grad) return false;
      if (!q) return true;
      return [r.email, r.ime, r.grad, r.kvart].some((x) => String(x ?? "").toLowerCase().includes(q));
    });
  }, [redovi, upit, stanje, platforma, grad]);

  const izvoz = () => {
    const blob = new Blob([csv(potvrdeni)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `lakat-lista-potvrdeni-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid-lines grid-cols-2 sm:grid-cols-4">
        {[
          ["Na listi", redovi.length],
          ["Potvrdilo", potvrdeni.length],
          ["iPhone", redovi.filter((r) => r.platforma === "iphone").length],
          ["Gradova", gradovi.length],
        ].map(([t, v]) => (
          <div key={t} className="flex flex-col gap-1 bg-[color:var(--a-panel)] p-4">
            <span className="lbl">{t}</span>
            <span className="num text-[2.4rem]">{v}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="trazi-listu" className="lbl">{">"} Traži mail, ime, grad ili kvart</label>
        <input
          id="trazi-listu"
          type="search"
          value={upit}
          onChange={(e) => setUpit(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="h-12 rounded-[var(--r-sm)] border border-[color:var(--a-line)] bg-[color:var(--a-panel)] px-4 font-[family-name:var(--a-mono)] text-[16px] text-[color:var(--a-fg)] outline-none focus:border-[color:var(--a-live)]"
        />
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Stanje i platforma">
          {[["sve", "Sve"], ["potvrdeni", "Potvrđeni"], ["nepotvrdeni", "Nepotvrđeni"]].map(([k, t]) => (
            <Gumb key={k} aktivan={stanje === k} onClick={() => setStanje(k)}>{t}</Gumb>
          ))}
          <span className="mx-1 w-px shrink-0 self-stretch bg-[color:var(--a-line)]" aria-hidden="true" />
          {[["sve", "Sve platforme"], ["iphone", "iPhone"], ["android", "Android"]].map(([k, t]) => (
            <Gumb key={k} aktivan={platforma === k} onClick={() => setPlatforma(k)}>{t}</Gumb>
          ))}
        </div>
        {gradovi.length > 1 && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Grad">
            {["sve", ...gradovi].map((g) => (
              <Gumb key={g} aktivan={grad === g} onClick={() => setGrad(g)}>{g === "sve" ? "Svi gradovi" : g}</Gumb>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="mono text-[11px] normal-case text-[color:var(--a-mute)]">
          Prikazano {vidljivi.length} od {redovi.length}. Izvoz uzima samo {potvrdeni.length} potvrđenih, za mail o izlasku.
        </p>
        <button type="button" onClick={izvoz} disabled={!potvrdeni.length} className="chip mono h-11 rounded-[var(--r-sm)] border border-[color:var(--a-live)] px-4 text-[11px] text-[color:var(--a-live)] disabled:opacity-50">
          [ IZVOZ CSV · POTVRĐENI ]
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {vidljivi.map((r, i) => (
          <li key={`${r.email}-${i}`} className="panel grid grid-cols-1 gap-1 p-3.5 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.8fr)_10rem] sm:items-center sm:gap-4">
            <span className="mono break-all text-[13px] normal-case">{r.email}</span>
            <span className="mono text-[11px] normal-case text-[color:var(--a-mute)]">
              {r.ime ? <b className="text-[color:var(--a-fg)]">{r.ime}</b> : "bez imena"}
              {r.grad ? ` · ${r.grad}${r.kvart ? `, ${r.kvart}` : ""}` : ""}
            </span>
            <span className="mono text-[11px] normal-case text-[color:var(--a-mute)]">
              {PLATFORME[r.platforma] ?? r.platforma ?? "—"}{r.izvor ? ` · ${r.izvor}` : ""}
            </span>
            <span className="mono text-[11px] sm:text-right" style={{ color: r.potvrdeno ? "var(--a-live)" : "var(--a-warn)" }}>
              {r.potvrdeno ? `POTVRDIO ${datum(r.potvrdeno)}` : `ČEKA · ${datum(r.upisan)}`}
            </span>
          </li>
        ))}
        {!vidljivi.length && <li className="mono text-[12px] normal-case text-[color:var(--a-mute)]">Nitko ne odgovara.</li>}
      </ul>
    </div>
  );
}
