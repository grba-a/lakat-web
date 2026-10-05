"use client";

import { useState } from "react";
import { play } from "@/lib/sfx";

// Tajna (Petar k4): svaki tap na Kriglu otkrije još komadić, a onda „šef“ prekine.
// Ništa se stvarno ne otkriva — sedma funkcija još ne postoji.
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
  const text = boss ? BOSS : LINES[n];

  function tap() {
    play(n + 1 === LINES.length ? "kasa" : "zvecka");
    setSquish((k) => k + 1);
    setN((k) => (k >= LINES.length ? 0 : k + 1));
  }

  return (
    <div className="grid justify-items-center gap-2 md:justify-items-start">
      <div className="flex items-end gap-2.5">
        <button
          type="button"
          onClick={tap}
          aria-label="Stisni Kriglu"
          className="shrink-0 rounded-full"
        >
          <img
            key={squish}
            src={boss ? "/img/krigla/sok.webp" : "/img/krigla/psst.webp"}
            alt=""
            width={72}
            height={72}
            className={`size-[72px] object-contain ${squish ? "squish" : ""}`}
          />
        </button>
        <p
          key={n}
          className={`chat-in rounded-[18px] rounded-bl-md border px-3.5 py-2.5 text-left text-[15px] leading-snug ${
            boss ? "border-amber/50 bg-amber/10 font-semibold text-amber" : "border-line bg-surface-2 text-fg"
          }`}
          aria-live="polite"
        >
          {boss ? (
            <>
              <span className="block font-mono text-[10px] tracking-[0.16em]">ŠEF</span>
              <span className="font-display text-[26px] leading-none tracking-wide">{text}</span>
            </>
          ) : (
            text
          )}
        </p>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        {n === 0 ? "Stisni Kriglu" : boss ? "Tapni za ispočetka" : "Još malo…"}
      </span>
    </div>
  );
}
