"use client";

import { useEffect, useRef } from "react";
import { FEATURES } from "@/lib/features";
import { Punct } from "./brand";
import { KriglaTyping } from "./krigla-typing";
import { Phone } from "./phone";

// Kretanje mobitela, varijanta A „slalom“ (Petar, 2026-10-04; ako mu se ne svidi,
// probamo B „okret“). Jedan mobitel ostaje na ekranu kroz svih šest funkcija:
// između sekcija prelazi na drugu stranu, okreće se i mijenja ekran.
//
// Tekst je uvijek vidljiv i bez JS-a; skripta samo pomiče mobitel. Sticky sloj je
// prvi, a negativna margina je na listi ispod njega, ne na sticky elementu
// (sticky s negativnom marginom bježi iz svog bloka — zamka iz vaulta).
const PHONE_W = "clamp(136px, 38vw, 290px)";

function ease(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function FeatureTour() {
  const root = useRef(null);
  const phone = useRef(null);
  const screens = useRef([]);

  useEffect(() => {
    const el = root.current;
    const ph = phone.current;
    if (!el || !ph) return;
    const blocks = [...el.querySelectorAll("[data-feature]")];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let shown = -1;

    function update() {
      raf = 0;
      const vh = window.innerHeight;
      const vw = el.clientWidth;
      const pw = ph.offsetWidth;
      const mid = vh / 2;
      // Položaj = indeks sekcije čiji je centar najbliži sredini ekrana, s udjelom prema idućoj.
      const centers = blocks.map((b) => {
        const r = b.getBoundingClientRect();
        return r.top + r.height / 2;
      });
      let p = 0;
      if (mid <= centers[0]) p = 0;
      else if (mid >= centers[centers.length - 1]) p = centers.length - 1;
      else {
        for (let i = 0; i < centers.length - 1; i++) {
          if (mid >= centers[i] && mid < centers[i + 1]) {
            p = i + (mid - centers[i]) / (centers[i + 1] - centers[i]);
            break;
          }
        }
      }
      const i = Math.floor(p);
      const t = p - i;
      // Prijelaz se događa u srednjoj polovici puta, a oko sekcije mobitel miruje.
      const e = reduce ? (t < 0.5 ? 0 : 1) : ease(Math.min(1, Math.max(0, (t - 0.25) / 0.5)));
      const side = (k) => (k % 2 === 0 ? 1 : -1); // parna sekcija: mobitel desno
      const edge = vw / 2 - pw / 2 - 14;
      const reach = vw < 768 ? edge : Math.min(vw * 0.25, edge);
      const a = side(i);
      const b = side(Math.min(i + 1, blocks.length - 1));
      const s = a + (b - a) * e;
      const lift = Math.sin(Math.PI * e) * -18;
      ph.style.transform = `translate3d(${s * reach}px, ${lift}px, 0) perspective(1000px) rotateX(6deg) rotateY(${-s * 20}deg) rotateZ(${s * 6}deg)`;

      const want = e >= 0.5 ? Math.min(i + 1, blocks.length - 1) : i;
      if (want !== shown) {
        shown = want;
        screens.current.forEach((img, k) => img && (img.style.opacity = k === want ? "1" : "0"));
      }
    }
    function onScroll() {
      if (!raf) raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={root} id="funkcije" className="relative" aria-label="Što stiže">
      <div className="pointer-events-none sticky top-0 z-0 grid h-[100svh] place-items-center" aria-hidden="true">
        <div ref={phone} className="will-change-transform">
          <Phone width={PHONE_W}>
            {FEATURES.map((f, k) => (
              <img
                key={f.id}
                ref={(n) => (screens.current[k] = n)}
                src={`/img/scr-${f.id}.webp`}
                alt=""
                width={640}
                height={1317}
                loading={k === 0 ? "eager" : "lazy"}
                className="absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-300"
                style={{ opacity: k === 0 ? 1 : 0 }}
              />
            ))}
          </Phone>
        </div>
      </div>

      <div className="relative z-10 -mt-[100svh]">
        {FEATURES.map((f, k) => {
          const textLeft = k % 2 === 0; // mobitel desno, tekst lijevo
          return (
            <article
              key={f.id}
              data-feature={f.id}
              className={`mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-5 py-16 ${
                textLeft ? "items-start" : "items-end"
              }`}
            >
              <div
                className={`grid w-[52%] gap-4 md:w-[min(44%,460px)] ${
                  textLeft ? "text-left" : "justify-items-end text-right"
                }`}
              >
                <KriglaTyping size={40} text={f.krigla} />
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted md:text-[11px]">
                  0{k + 1} · {f.name}
                </span>
                <h2 className="font-display text-[clamp(32px,9vw,40px)] leading-[0.95] uppercase text-balance md:text-[clamp(48px,5vw,72px)]">
                  <Punct>{f.title}</Punct>
                </h2>
                <p className="text-[14px] text-soft text-pretty md:text-[17px]">{f.line}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
