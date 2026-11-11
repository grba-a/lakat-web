"use client";

import { useActionState } from "react";
import { prijava } from "./actions";

export function Prijava() {
  const [stanje, posalji, salje] = useActionState(prijava, null);
  return (
    <form action={posalji} className="mt-8 flex w-full flex-col gap-3">
      <label htmlFor="lozinka" className="text-[11px] font-bold uppercase tracking-widest text-muted">
        Šifra
      </label>
      <input
        id="lozinka"
        name="lozinka"
        type="password"
        autoComplete="current-password"
        required
        autoFocus
        className="h-12 rounded-xl border border-line bg-surface px-4 text-[16px] text-fg outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={salje}
        className="h-12 rounded-xl bg-accent font-display text-lg uppercase tracking-wide text-[#052e16] disabled:opacity-60"
      >
        {salje ? "Provjeravam…" : "Uđi"}
      </button>
      <p role="status" className="min-h-5 text-sm text-amber">
        {stanje?.greska ?? ""}
      </p>
    </form>
  );
}
