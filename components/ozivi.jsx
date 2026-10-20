"use client";

import { useEffect } from "react";

// Krigle u sekcijama ožive kad sekcija dođe na ekran (Petar 20. 10., runda 3 „duo“: CSS sad, Higgsfield možda kasnije).
// Svaka slika s data-ozivi="nagib|skok|slavi|mahni" dobije klasu .ozivi-on dok je vidljiva; izađe li s ekrana,
// klasa se makne pa se pokret ponovi kad se vrati (kao Duolingo). Pokreti su u globals.css; reduced motion ih gasi.
export function Ozivi() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.target.classList.toggle("ozivi-on", e.isIntersecting)),
      { threshold: 0.6 }
    );
    document.querySelectorAll("[data-ozivi]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
