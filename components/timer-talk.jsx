"use client";

import { useState } from "react";
import { remaining } from "@/lib/launch";
import { play } from "@/lib/sfx";
import { Countdown } from "./countdown";
import { KriglaTyping } from "./krigla-typing";

// Tap na timer i Krigla prokomentira koliko je ostalo (Petar k7).
function dana(d) {
  return d % 10 === 1 && d % 100 !== 11 ? "dan" : "dana";
}
function line(d, n) {
  const lines =
    d > 30
      ? [`Još ${d} ${dana(d)}. Taman da skupiš ekipu.`, "Brojiš sa mnom? Slatko.", "Ne gledaj u sat, gledaj tko će s tobom."]
      : d > 7
        ? [`Još ${d} ${dana(d)}. Počni zagrijavati pajdaše.`, "Polako se puni. Ja i šank."]
        : d > 1
          ? [`Još ${d} ${dana(d)}. Ne planiraj ništa za 1. 12.`, "Skoro. Napuni mobitel."]
          : d === 1
            ? ["Sutra u podne. Spavaj, trebat će ti snage."]
            : ["Danas u podne. Drži mobitel napunjen."];
  return lines[n % lines.length];
}

export function TimerTalk({ initial, className }) {
  const [n, setN] = useState(-1);
  const text = n < 0 ? "" : line(remaining().d, n);

  return (
    <div className="grid justify-items-center gap-3 md:justify-items-start">
      <button
        type="button"
        onClick={() => {
          play("zvecka");
          setN((k) => k + 1);
        }}
        className="cursor-pointer rounded-2xl"
      >
        <Countdown initial={initial} className={className} />
        <span className="sr-only">Tapni timer, Krigla nešto kaže</span>
      </button>
      {n >= 0 && <KriglaTyping key={n} text={text} size={36} onView={false} trigger={n} className="chat-in max-w-[320px]" />}
    </div>
  );
}
