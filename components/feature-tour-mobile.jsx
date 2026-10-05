"use client";

import { useEffect, useRef, useState } from "react";
import { FEATURES } from "@/lib/features";
import { Punct } from "./brand";
import { Phone } from "./phone";

// Tura na mobitelu (Petar w02): velik mobitel u sredini, čitljivi ekrani, Krigla stiže
// kao push u mobitelu, a naslov je ispod. Svaki ekran ima jedan živi sloj.
// Desktop zadržava slalom (feature-tour.jsx).
const PHONE_W = "clamp(150px, min(64vw, calc((100svh - 360px) / 2.17)), 290px)";

// Slojevi su pozicionirani u postotcima originalnog ekrana (640×1317).
function Live({ id, on }) {
  if (id === "karta")
    return (
      <>
        {[
          ["A", "52%", "17%"],
          ["E", "36%", "29%"],
        ].map(([l, x, y], i) => (
          <span key={l} className={`hero-pin ${on ? "on" : ""}`} style={{ left: x, top: y, transitionDelay: `${250 + i * 160}ms` }}>
            {l}
          </span>
        ))}
      </>
    );
  if (id === "runda")
    return (
      <img
        src="/img/live-kotac.webp"
        alt=""
        width={472}
        height={472}
        loading="lazy"
        className={`absolute ${on ? "wheel-spin" : ""}`}
        style={{ left: "13.125%", top: "26.73%", width: "73.75%" }}
      />
    );
  if (id === "ekipe")
    return (
      <div className="absolute overflow-hidden" style={{ left: "6.25%", top: "47.84%", width: "87.5%", height: "18.37%", background: "#0b0d12" }}>
        <img
          src="/img/live-podij.webp"
          alt=""
          width={560}
          height={242}
          loading="lazy"
          className={`absolute inset-0 h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${on ? "translate-y-0 delay-300" : "translate-y-full"}`}
        />
      </div>
    );
  if (id === "krigla")
    return (
      <span
        className={`absolute font-display text-amber transition-[opacity,translate] duration-700 ${on ? "-translate-y-[180%] opacity-0 delay-500" : "translate-y-0 opacity-0"}`}
        style={{ left: "78%", top: "8%", fontSize: "calc(var(--w) * 0.09)" }}
      >
        +5
      </span>
    );
  if (id === "igra") return <span className={`absolute rounded-full ${on ? "btn-glow" : ""}`} style={{ left: "11.5%", top: "34.7%", width: "76.8%", height: "6.6%" }} />;
  return null;
}

// Tura na mobitelu (Petar, 2026-10-05): natrag na skrolanje, ali fluidno i čisto.
// Skrol je nativni (bez Lenisa); animacija samo prati skrol i meko ga dostiže (lerp),
// pa ekrani klize unutar mobitela točno uz prst, a naslovi se pretapaju.
const STEP = 0.72; // visina jednog koraka u visinama ekrana

export function FeatureTourMobile() {
  const root = useRef(null);
  const phone = useRef(null);
  const screens = useRef([]);
  const captions = useRef([]);
  const fill = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = root.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const n = FEATURES.length;
    let shown = 0;
    let raf = 0;
    let running = false;
    let cur = 0;

    function target() {
      const r = el.getBoundingClientRect();
      const step = window.innerHeight * STEP;
      return Math.max(0, Math.min(n - 1, -r.top / step));
    }
    function paint(d, vel) {
      screens.current.forEach((node, k) => {
        if (!node) return;
        const o = k - d;
        const a = Math.min(Math.abs(o), 1);
        node.style.transform = `translate3d(0, ${o * 104}%, 0) scale(${1 - a * 0.08})`;
        node.style.opacity = String(1 - a * 0.6);
      });
      captions.current.forEach((node, k) => {
        if (!node) return;
        const o = k - d;
        // Oštrije pretapanje: na pola puta nijedan naslov nije vidljiv, pa se ne preklapaju.
        node.style.opacity = String(Math.max(0, 1 - Math.abs(o) * 2.3));
        node.style.transform = `translate3d(0, ${o * 40}px, 0)`;
      });
      if (fill.current) fill.current.style.transform = `scaleX(${(d + 1) / n})`;
      if (phone.current) phone.current.style.transform = `perspective(1000px) rotateX(${Math.max(-6, Math.min(6, vel * 40))}deg)`;
      const a = Math.round(d);
      if (a !== shown) {
        shown = a;
        setActive(a);
      }
    }
    function loop() {
      const t = target();
      const prev = cur;
      cur = reduce ? t : cur + (t - cur) * 0.14;
      if (Math.abs(t - cur) < 0.001) cur = t;
      paint(cur, cur - prev);
      if (cur !== t || Math.abs(cur - prev) > 0.0005) raf = requestAnimationFrame(loop);
      else running = false;
    }
    function kick() {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    }
    cur = target();
    paint(cur, 0);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, []);

  const f = FEATURES[active];

  return (
    <section
      ref={root}
      className="relative md:hidden"
      style={{ height: `calc(100svh + ${(FEATURES.length - 1) * STEP * 100}svh)` }}
      aria-label="Što stiže"
      data-krigla="Gle, to sam ja na ekranu."
    >
      {/* Nativni scroll-snap (bez biblioteke): skrol meko stane na svakoj funkciji. */}
      {FEATURES.map((x, k) => (
        <span key={x.id} aria-hidden="true" className="tour-snap pointer-events-none absolute left-0 h-px w-px" style={{ top: `${k * STEP * 100}svh` }} />
      ))}
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center gap-5 overflow-hidden px-5 pt-12 pb-[118px]">
        <div ref={phone} className="will-change-transform">
          <Phone width={PHONE_W}>
            {FEATURES.map((x, k) => (
              <div key={x.id} ref={(node) => (screens.current[k] = node)} className="absolute inset-0 will-change-transform">
                <div className="absolute top-0 left-1/2 h-full -translate-x-1/2" style={{ aspectRatio: "640 / 1317" }}>
                  <img
                    src={`/img/scr-${x.id}.webp`}
                    alt=""
                    width={640}
                    height={1317}
                    loading={k < 2 ? "eager" : "lazy"}
                    draggable={false}
                    className={`h-full w-full ${x.id === "film" ? `develop ${k === active ? "on" : ""}` : ""}`}
                  />
                  <Live id={x.id} on={k === active} />
                </div>
              </div>
            ))}
            {!["krigla", "ekipe"].includes(f.id) && (
              <div
                key={active}
                className="push-drop absolute inset-x-[5%] top-[7%] z-[4] grid grid-cols-[auto_1fr] items-center gap-2 rounded-[14px] border border-white/5 bg-[#26262c]/95 px-2.5 py-2 text-left shadow-lg"
                style={{ fontSize: "calc(var(--w) * 0.048)" }}
              >
                <img src="/img/krigla-lik.webp" alt="" width={48} height={48} className="object-contain" style={{ width: "calc(var(--w) * 0.13)", height: "calc(var(--w) * 0.13)" }} />
                <span className="leading-snug">
                  <b className="flex justify-between font-semibold">
                    KRIGLA <span className="font-normal text-muted">sada</span>
                  </b>
                  {f.krigla}
                </span>
              </div>
            )}
            {f.id === "film" && (
              <span className="absolute bottom-[25%] left-1/2 z-[4] -translate-x-1/2 rotate-[-4deg] rounded-md border-2 border-amber px-2 py-1 font-mono whitespace-nowrap text-amber uppercase" style={{ fontSize: "calc(var(--w) * 0.04)" }}>
                Razvija se sutra u 12:00
              </span>
            )}
          </Phone>
        </div>

        <div className="relative grid w-full max-w-[360px] text-center">
          {FEATURES.map((x, k) => (
            <div
              key={x.id}
              ref={(node) => (captions.current[k] = node)}
              className="col-start-1 row-start-1 grid content-start gap-2 will-change-transform"
              aria-hidden={k !== active}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                0{k + 1} · {x.name}
              </span>
              <h2 className="font-display text-[clamp(28px,8.4vw,36px)] leading-[0.95] uppercase text-balance">
                <Punct>{x.title}</Punct>
              </h2>
              <p className="mx-auto max-w-[34ch] text-[14px] text-soft text-pretty">{x.line}</p>
            </div>
          ))}
        </div>
        <div className="h-[3px] w-24 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <div ref={fill} className="h-full origin-left rounded-full bg-accent" style={{ transform: "scaleX(0.17)" }} />
        </div>
      </div>
    </section>
  );
}
