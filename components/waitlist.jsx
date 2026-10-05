"use client";

import { useState } from "react";
import { play } from "@/lib/sfx";
import { KriglaSays } from "./brand";
import { KriglaTyping } from "./krigla-typing";

// Lista čekanja kao razgovor s Kriglom (varijanta D + Petar k2). E-mail ide u Brevo s potvrdom (double opt-in).
export function Waitlist() {
  const [status, setStatus] = useState("idle"); // idle | sending | ok | error | off
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");

  async function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSent(String(form.get("email") || "").trim());
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

  const ok = status === "ok";
  const say =
    status === "error" ? error : status === "off" ? "Lista se još spaja. Do tada me prati na Instagramu." : "";

  return (
    <div className="grid gap-3" aria-live="polite">
      <KriglaSays size={64}>Di da ti javim kad otvorimo šank?</KriglaSays>

      {sent && status !== "idle" && (
        <p className="chat-in max-w-[85%] justify-self-end rounded-[18px] rounded-br-md bg-accent px-4 py-2.5 text-[15px] font-semibold break-all text-[#052e16]">
          {sent}
        </p>
      )}
      {status === "sending" && (
        <KriglaTyping key="s" text="…" size={40} onView={false} trigger={0} className="chat-in" />
      )}
      {ok && (
        <KriglaTyping
          key="ok"
          text={`Zapisala sam. Sad provjeri mail i klikni potvrdu, bez toga te ne pišem.`}
          size={40}
          onView={false}
          trigger={1}
          className="chat-in max-w-[88%]"
        />
      )}
      {say && <KriglaTyping key={say} text={say} size={40} onView={false} trigger={2} tone="text-amber" className="chat-in max-w-[88%]" />}

      {!ok && (
        <form onSubmit={submit} className="mt-2 grid gap-3">
          <div className="flex items-center gap-2 rounded-full border border-line bg-surface p-1.5 pl-5 focus-within:border-accent">
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
              className="min-h-[44px] w-full min-w-0 bg-transparent text-[16px] text-fg placeholder:text-[#7a7a84] focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              aria-label="Javi mi prvi"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-[#052e16] transition-[opacity,scale] active:scale-95 disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
          {/* Zamka za botove: ljudi je ne vide. */}
          <input name="web" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <label className="flex items-start gap-3 px-1 text-left text-[13px] leading-snug text-muted">
            <input name="privola" type="checkbox" required className="mt-0.5 size-5 shrink-0 accent-[#4ade80]" />
            <span>
              Pošaljite mi jedan mail kad LAKAT izađe. Više ništa.{" "}
              <a href="https://laktarenje.com/privatnost" className="underline underline-offset-2">
                Privatnost
              </a>
            </span>
          </label>
        </form>
      )}
    </div>
  );
}
