"use client";

import { useState } from "react";
import { play } from "@/lib/sfx";

// Tajna (Petar k4), sad u podnožju (isto-dvaput): Krigla koja maše ispod „Vidimo se za šankom.“
// Svaki tap otkrije još komadić, a onda „šef“ prekine. Ništa se stvarno ne otkriva — sedma funkcija još ne postoji.
const LINES = [
  "Ima još nešto, ali ako ti rečem, šef će me razbiti.",
  "Dobro, samo malo… Ima veze s…",
  "…s onim kad se ujutro probudiš i…",
  "…i shvatiš da je cijela ekipa…",
];
const BOSS = "KRIGLAAAA!!!";

export function SecretKrigla() {
  const [n, setN] = useState(0);
  const [squish, setSquish] = useState(0);
  const boss = n === LINES.length;

  function tap() {
    play(n + 1 === LINES.length ? "kasa" : "zvecka");
    setSquish((k) => k + 1);
    setN((k) => (k >= LINES.length ? 0 : k + 1));
  }

  return (
    <div className="grid justify-items-center gap-4">
      <button type="button" onClick={tap} aria-label="Stisni Kriglu, ima tajnu" className="relative grid place-items-center rounded-full py-2">
        {/* Sjaj je samo gradijent: drop-shadow i blur na mobitelu WebKit iscrta kao zeleni kvadrat (Petar, 2026-10-05). */}
        <span className="krigla-glow pointer-events-none absolute inset-[-25%]" aria-hidden="true" />
        <span className="float">
          <img
            key={squish}
            src={boss ? "/img/krigla/sok.webp" : "/img/krigla/mase.webp"}
            alt=""
            width={480}
            height={480}
            loading="lazy"
            className={`relative w-[clamp(150px,42vw,220px)] object-contain ${squish ? "squish" : ""}`}
          />
        </span>
      </button>
      <p className="font-display text-[30px] leading-none uppercase">
        Vidimo se za šankom<span className="text-accent">.</span>
      </p>
      <p
        key={n}
        aria-live="polite"
        className={`chat-in max-w-[30ch] rounded-[18px] border px-3.5 py-2.5 text-[15px] leading-snug ${
          boss ? "border-amber/50 bg-amber/10 font-semibold text-amber" : "border-line bg-surface-2 text-fg"
        }`}
      >
        {boss ? (
          <>
            <span className="block font-mono text-[10px] tracking-[0.16em]">ŠEF</span>
            <span className="font-display text-[26px] leading-none tracking-wide">{BOSS}</span>
          </>
        ) : (
          LINES[n]
        )}
      </p>
      <span className="text-[12px] text-muted">{n === 0 ? "Stisni Kriglu." : boss ? "Tapni za ispočetka." : "Još malo…"}</span>
    </div>
  );
}
