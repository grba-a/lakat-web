"use client";

import { useState } from "react";
import { play } from "@/lib/sfx";
import { KriglaSays } from "./brand";

// Lista čekanja (varijanta D: Krigla pita). E-mail ide u Brevo s potvrdom (double opt-in).
export function Waitlist() {
  const [status, setStatus] = useState("idle"); // idle | sending | ok | error | off
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/lista", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          privola: form.get("privola") === "on",
          web: form.get("web") || "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        play("kasa");
        return setStatus("ok");
      }
      if (res.status === 503) return setStatus("off");
      setError(data.poruka || "Nešto je puklo. Probaj opet.");
      setStatus("error");
    } catch {
      setError("Nema veze s mrežom. Probaj opet.");
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <KriglaSays size={64}>
        Provjeri mail i klikni potvrdu. Bez toga te ne pišem.
      </KriglaSays>
    );
  }

  return (
    <div className="grid gap-5">
      <KriglaSays size={64}>Di da ti javim kad otvorimo šank?</KriglaSays>
      <form onSubmit={submit} className="grid gap-3" noValidate={false}>
        <label htmlFor="email" className="sr-only">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="tvoj@mail.com"
          className="min-h-[52px] w-full rounded-2xl border border-line bg-surface px-4 text-[16px] text-fg placeholder:text-[#7a7a84] focus:border-accent focus:outline-none"
        />
        {/* Zamka za botove: ljudi je ne vide. */}
        <input name="web" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <label className="flex items-start gap-3 text-left text-[13px] leading-snug text-muted">
          <input name="privola" type="checkbox" required className="mt-0.5 size-5 shrink-0 accent-[#4ade80]" />
          <span>
            Pošaljite mi jedan mail kad LAKAT izađe. Više ništa.{" "}
            <a href="https://laktarenje.com/privatnost" className="underline underline-offset-2">
              Privatnost
            </a>
          </span>
        </label>
        <button
          type="submit"
          disabled={status === "sending"}
          className="min-h-[52px] rounded-full bg-accent text-[16px] font-bold text-[#052e16] transition-[opacity,scale] active:scale-[0.98] disabled:opacity-60"
        >
          {status === "sending" ? "Šaljem…" : "Javi mi prvi"}
        </button>
        <p className="min-h-[1.5em] text-[13px]" aria-live="polite">
          {status === "error" && <span className="text-[#f87171]">{error}</span>}
          {status === "off" && <span className="text-amber">Lista se još spaja. Do tada nas prati na Instagramu.</span>}
        </p>
      </form>
    </div>
  );
}
