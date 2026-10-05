"use client";

import { useEffect } from "react";
import { LAUNCH } from "@/lib/launch";

function pad(n) {
  return String(n).padStart(2, "0");
}

// Kad posjetitelj prebaci na drugu karticu, naslov ga zove natrag (Petar k6).
// Zadnja 24 sata prije lansiranja naslov je živi timer (n4).
export function TabTitle() {
  useEffect(() => {
    const base = document.title;
    function render() {
      if (document.hidden) {
        document.title = "Hej, šank je ovdje.";
        return;
      }
      const ms = LAUNCH - Date.now();
      if (ms > 0 && ms < 864e5) {
        const s = Math.floor(ms / 1000);
        document.title = `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)} · LAKAT.`;
      } else document.title = base;
    }
    render();
    const id = setInterval(render, 1000);
    document.addEventListener("visibilitychange", render);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", render);
      document.title = base;
    };
  }, []);
  return null;
}
