"use client";

import { useEffect } from "react";

// Kad posjetitelj prebaci na drugu karticu, naslov ga zove natrag (Petar k6).
export function TabTitle() {
  useEffect(() => {
    let original = document.title;
    function onVis() {
      if (document.hidden) {
        original = document.title;
        document.title = "Hej, šank je ovdje.";
      } else {
        document.title = original;
      }
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  return null;
}
