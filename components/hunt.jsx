"use client";

import { useEffect, useState } from "react";
import { play } from "@/lib/sfx";

// Lov na Krigle (Petar n5): pet malih Krigli skriveno je po stranici.
// Kad nađeš svih pet, Krigla otkrije tajnu repliku. Napredak ostaje u pregledniku.
const KEY = "lakat-lov";
export const SAY = "lakat-say";
const TOTAL = 5;

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function say(text) {
  window.dispatchEvent(new CustomEvent(SAY, { detail: text }));
}

export function HuntKrigla({ id, className = "", size = 26 }) {
  const [found, setFound] = useState(false);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFound(read().includes(id)), 0);
    return () => clearTimeout(t);
  }, [id]);

  function grab() {
    if (found) return;
    const list = [...new Set([...read(), id])];
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {}
    setPop(true);
    setTimeout(() => setFound(true), 450);
    play(list.length === TOTAL ? "kasa" : "zvecka");
    say(list.length === TOTAL ? "Našao si svih pet. Pravi lovac. Sad znaš više od šefa." : `Našao si me. ${list.length} od ${TOTAL}.`);
  }

  if (found) return null;
  return (
    <button
      type="button"
      onClick={grab}
      aria-label="Skrivena Krigla"
      className={`absolute z-[3] grid place-items-center rounded-full p-2 opacity-60 transition-[opacity,scale] hover:opacity-100 ${pop ? "scale-150 opacity-0 duration-500" : ""} ${className}`}
    >
      <img src="/img/krigla-lik.webp" alt="" width={size} height={size} style={{ width: size, height: size }} className="rotate-[-12deg] object-contain" />
    </button>
  );
}
