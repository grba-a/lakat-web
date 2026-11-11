"use client";

import { useActionState } from "react";
import { prijava } from "./actions";

export function Prijava() {
  const [stanje, posalji, salje] = useActionState(prijava, null);
  return (
    <form action={posalji} className="boot mt-8 flex w-full flex-col gap-3" style={{ "--i": 2 }}>
      <label htmlFor="lozinka" className="lbl">
        {">"} Šifra
      </label>
      <input
        id="lozinka"
        name="lozinka"
        type="password"
        autoComplete="current-password"
        required
        autoFocus
        className="h-12 border border-[color:var(--a-line)] bg-[color:var(--a-panel)] px-4 font-[family-name:var(--a-mono)] text-[16px] tracking-[0.2em] text-[color:var(--a-fg)] outline-none focus:border-[color:var(--a-live)]"
      />
      <button
        type="submit"
        disabled={salje}
        className="chip mono h-12 bg-[color:var(--a-live)] text-[13px] font-bold text-[#05140a] disabled:opacity-60"
      >
        {salje ? "[ PROVJERAVAM… ]" : "[ UĐI ]"}
      </button>
      <p role="status" className="mono min-h-5 text-[11px] normal-case text-[color:var(--a-alarm)]">
        {stanje?.greska ?? ""}
      </p>
    </form>
  );
}
