"use client";

import { useEffect, useState } from "react";
import { SOUND_EVENT, play, setSound, soundOn } from "@/lib/sfx";

export function SoundToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const sync = () => setOn(soundOn());
    sync();
    window.addEventListener(SOUND_EVENT, sync);
    return () => window.removeEventListener(SOUND_EVENT, sync);
  }, []);

  function toggle() {
    setSound(!on);
    if (!on) setTimeout(() => play("zvecka"), 0);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Ugasi zvuk" : "Upali zvuk"}
      className="-mr-2.5 grid size-11 place-items-center rounded-full text-muted transition-colors hover:text-fg aria-pressed:text-accent"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H3v6h3l5 4z" />
        {on ? (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </>
        ) : (
          <path d="m22 9-6 6m0-6 6 6" />
        )}
      </svg>
    </button>
  );
}
