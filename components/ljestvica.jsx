"use client";

import { track } from "@/lib/korak";
import { useCallback, useEffect, useRef, useState } from "react";
import { todayKey } from "@/lib/daily";

// Javna ljestvica igre dana (Petar, 15. 10.): nadimak + službeni (prvi) rezultat dana.
// Dok baza nema docs/supabase-igra1.sql, API vraća 503 i ova komponenta ne crta ništa.
const POSLAN_KEY = "lakat-ljestvica-dan";

export function Ljestvica({ rezultat = 0 }) {
  const box = useRef(null);
  const [lista, setLista] = useState(null); // null = ne znamo ili nema ljestvice
  const [ime, setIme] = useState("");
  const [stanje, setStanje] = useState("idle"); // idle | saljem | greska
  const [poruka, setPoruka] = useState("");
  const [poslan, setPoslan] = useState(false);

  const ucitaj = useCallback(async () => {
    try {
      const r = await fetch("/api/igra");
      if (!r.ok) return setLista(null);
      const d = await r.json();
      setLista(Array.isArray(d.lista) ? d.lista : null);
    } catch {
      setLista(null);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        setPoslan(localStorage.getItem(POSLAN_KEY) === todayKey());
      } catch {}
    }, 0);
    const el = box.current;
    if (!el) return () => clearTimeout(t);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        ucitaj();
      },
      { rootMargin: "300px 0px" }
    );
    io.observe(el);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, [ucitaj]);

  async function posalji(e) {
    e.preventDefault();
    setStanje("saljem");
    setPoruka("");
    try {
      const r = await fetch("/api/igra", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ime, rezultat, web: e.currentTarget.elements.web?.value || "" }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok) {
        try {
          localStorage.setItem(POSLAN_KEY, todayKey());
        } catch {}
        track("ljestvica_upis", { r: rezultat });
        setPoslan(true);
        setStanje("idle");
        return ucitaj();
      }
      setPoruka(d.poruka || "Ljestvica je zapela. Probaj kasnije.");
      setStanje("greska");
    } catch {
      setPoruka("Nema veze s mrežom. Probaj opet.");
      setStanje("greska");
    }
  }

  return (
    <div ref={box} className="w-full max-w-[320px] text-left">
      {lista && (
        <div className="grid gap-3 rounded-2xl border border-line bg-surface p-4">
          <h3 className="font-display text-[24px] leading-none uppercase">
            Ljestvica dana<span className="text-accent">.</span>
          </h3>
          {lista.length ? (
            <ol className="grid gap-1.5 text-[15px]">
              {lista.map((r, i) => (
                <li key={`${r.ime}-${i}`} className="grid grid-cols-[24px_1fr_auto] items-baseline gap-2">
                  <span className="font-display text-[16px] text-muted tabular-nums">{i + 1}</span>
                  <span className="truncate">{r.ime}</span>
                  <b className="font-display text-[18px] font-normal text-accent tabular-nums">{r.rezultat}</b>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-[14px] text-muted">Danas još nitko. Budi prvi.</p>
          )}
          {rezultat > 0 && !poslan && (
            <form onSubmit={posalji} className="grid gap-2 border-t border-line pt-3">
              <label htmlFor="ljestvica-ime" className="text-[13px] text-soft">
                Tvoj rezultat danas je <b className="text-fg">{rezultat}</b>. Ostavi nadimak:
              </label>
              <div className="flex gap-2">
                <input
                  id="ljestvica-ime"
                  value={ime}
                  onChange={(e) => setIme(e.target.value.slice(0, 16))}
                  minLength={2}
                  maxLength={16}
                  required
                  autoComplete="nickname"
                  placeholder="nadimak"
                  aria-describedby={poruka ? "ljestvica-greska" : undefined}
                  className="min-h-[44px] w-full min-w-0 rounded-xl border border-line bg-bg px-3 text-[16px] text-fg placeholder:text-muted focus-visible:border-accent focus-visible:outline-none"
                />
                <input name="web" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                <button
                  type="submit"
                  disabled={stanje === "saljem" || ime.trim().length < 2}
                  className="min-h-[44px] shrink-0 rounded-full bg-accent px-4 text-[14px] font-bold text-[#052e16] transition-[scale,opacity] active:scale-[0.97] disabled:opacity-50"
                >
                  {stanje === "saljem" ? "…" : "Upiši"}
                </button>
              </div>
              {poruka && (
                <p id="ljestvica-greska" role="alert" className="text-[13px] font-semibold text-amber">
                  {poruka}
                </p>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
