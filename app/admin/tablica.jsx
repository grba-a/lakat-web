"use client";

// Tablica /admin ploče: klik na zaglavlje sortira (strelica pokazuje smjer), gumb izvozi CSV.
// Ćelija je tekst ili { t: prikaz, v: vrijednost za sortiranje, h: 0–1 jačina zelene (toplinska tablica) }.
import { useMemo, useState } from "react";

// Pet stalnih stupnjeva (Codex 11. 11.): plava ljestvica, jer zelena znači stanje, ne količinu.
const TOPLINA = ["#171717", "#253247", "#365273", "#527ba6", "#7dd3fc"];

const tekst = (c) => (c != null && typeof c === "object" ? c.t : c);

// Iz prikazanog teksta izvuče broj: "2.321" → 2321, "9 %" → 9, "356 kB" → 356000, "< 3" → 2,5, "—" → najmanje.
function vrijednost(c) {
  if (c != null && typeof c === "object" && c.v !== undefined) return c.v;
  const s = String(tekst(c) ?? "").trim();
  if (s === "" || s === "—" || s === "skriveno") return -Infinity;
  if (s.startsWith("<")) return 2.5;
  const datum = s.match(/^(\d{1,2})\. (\d{1,2})\.$/);
  if (datum) return Number(datum[2]) * 100 + Number(datum[1]);
  const m = s.match(/^-?[\d.]+(,\d+)?/);
  if (!m) return s.toLowerCase();
  const n = Number(m[0].replace(/\./g, "").replace(",", "."));
  const jed = s.match(/\b(kB|MB|GB)\b/);
  return jed ? n * { kB: 1e3, MB: 1e6, GB: 1e9 }[jed[1]] : n;
}

export function Tablica({ stupci, redovi, naziv = "tablica" }) {
  const [sort, setSort] = useState(null); // { i, smjer: 1 | -1 }
  const poredani = useMemo(() => {
    if (!sort) return redovi;
    return [...redovi].sort((a, b) => {
      const x = vrijednost(a[sort.i]);
      const y = vrijednost(b[sort.i]);
      if (typeof x === "number" && typeof y === "number") return (x - y) * sort.smjer;
      return String(x).localeCompare(String(y), "hr") * sort.smjer;
    });
  }, [redovi, sort]);

  const klik = (i) =>
    setSort((s) => (s?.i === i ? (s.smjer === -1 ? { i, smjer: 1 } : null) : { i, smjer: i === 0 ? 1 : -1 }));

  const izvoz = () => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [stupci, ...poredani.map((r) => r.map(tekst))].map((r) => r.map(esc).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `lakat-${naziv}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto">
        <table className="mono w-full text-[11px] normal-case tabular-nums tracking-[0.03em]">
          <thead>
            <tr className="lbl text-left">
              {stupci.map((s, i) => {
                const aktivan = sort?.i === i;
                return (
                  <th
                    key={s}
                    aria-sort={aktivan ? (sort.smjer === 1 ? "ascending" : "descending") : "none"}
                    className={`border-b border-[color:var(--a-fg)] p-0 font-normal ${i ? "text-right" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => klik(i)}
                      className={`chip inline-flex min-h-9 w-full items-center gap-1 py-1.5 pr-3 ${i ? "justify-end" : ""} ${aktivan ? "up" : ""}`}
                    >
                      {s}
                      <span aria-hidden="true" className={aktivan ? "" : "opacity-30"}>
                        {aktivan ? (sort.smjer === 1 ? "▲" : "▼") : "↕"}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {poredani.map((r) => (
              <tr key={r.map(tekst).join("|")} className="row border-b border-[color:var(--a-line)]">
                {r.map((c, i) => {
                  const h = c != null && typeof c === "object" ? c.h : undefined;
                  return (
                    <td
                      key={i}
                      className={`py-2 pr-3 ${i ? "text-right" : ""}`}
                      style={h != null ? { background: TOPLINA[Math.min(4, Math.floor(h * 5))], color: h >= 0.8 ? "#0a0a0a" : undefined } : undefined}
                    >
                      {tekst(c)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={izvoz} className="chip mono self-end border border-[color:var(--a-line)] px-2.5 py-1.5 text-[10.5px] text-[color:var(--a-mute)]">
        [ ↓ CSV ]
      </button>
    </div>
  );
}
