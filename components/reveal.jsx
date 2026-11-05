"use client";

import { useEffect } from "react";

// Ulazi sekcija (Petar 5. 11.: „web treba biti fora s dosta animacija (ne previše); mora biti brz na mobitelu").
// Bez JS-a i sa smanjenim kretanjem sve stoji vidljivo. Skripta sakrije samo ono što je još ispod ekrana (rv-wait),
// pa to uđe kad dođe na ekran (rv-on), jednom. Samo opacity i transform (globals.css).
// [data-uzivo] dobije .uzivo dok je na ekranu: petlje (zvono, prsteni) se vrte samo kad ih netko gleda.
export function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const vh = window.innerHeight;
    const ulaz = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("rv-on");
          ulaz.unobserve(e.target);
        }),
      { rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      if (el.getBoundingClientRect().top < vh) return;
      el.classList.add("rv-wait");
      ulaz.observe(el);
    });
    const petlje = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("uzivo", e.isIntersecting)));
    document.querySelectorAll("[data-uzivo]").forEach((el) => petlje.observe(el));
    return () => {
      ulaz.disconnect();
      petlje.disconnect();
    };
  }, []);
  return null;
}
