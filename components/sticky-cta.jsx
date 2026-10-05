"use client";

import { useEffect, useState } from "react";
import { APP_STORE } from "@/lib/launch";
import { play } from "@/lib/sfx";

// Gumb „Javi mi prvi“ stoji na dnu ekrana cijelo vrijeme (hero B) i nestane
// kad je lista čekanja na ekranu, da ne stoje dva ista gumba jedan ispod drugog.
// position: fixed, ne sticky: sticky s negativnom marginom bježi (zamka iz vaulta).
export function StickyCta({ live: launched = false }) {
  // Bez App Store linka i nakon lansiranja ostaje lista čekanja, nikad mrtvi „#“.
  const live = launched && Boolean(APP_STORE);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (live) return;
    const target = document.getElementById("lista");
    if (!target) return;
    const io = new IntersectionObserver(([e]) => setHidden(e.isIntersecting), {
      rootMargin: "0px 0px -20% 0px",
    });
    io.observe(target);
    return () => io.disconnect();
  }, [live]);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 px-5 pt-8 pb-[max(16px,env(safe-area-inset-bottom))] transition-[opacity,translate] duration-300 ${
        hidden ? "translate-y-4 opacity-0" : "opacity-100"
      }`}
      style={{ background: "linear-gradient(transparent, rgb(9 9 11 / 0.92) 45%)" }}
    >
      <a
        href={live ? APP_STORE : "#lista"}
        onClick={() => play("zvecka")}
        tabIndex={hidden ? -1 : 0}
        aria-hidden={hidden}
        className="pointer-events-auto mx-auto flex min-h-[52px] w-full max-w-sm items-center justify-center rounded-full bg-accent text-[16px] font-bold text-[#052e16] shadow-[0_10px_30px_-10px_rgb(74_222_128/0.6)] active:scale-[0.98] md:max-w-xs"
      >
        {live ? "Skini LAKAT" : "Javi mi prvi"}
      </a>
    </div>
  );
}
