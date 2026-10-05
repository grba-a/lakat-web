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

const STEP_MS = 5200;

// Tura na mobitelu kao Instagram story (Petar, 2026-10-05: skrolanje 01–06 mu se nije svidjelo).
// Jedan ekran: trake napretka gore, tap desno = dalje, lijevo = natrag, drži = pauza, swipe radi.
// Vrti se samo dok je na ekranu. Live sloj po ekranu ostaje (kotač, pinovi, podij, film).
export function FeatureTourMobile() {
  const root = useRef(null);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0); // restart trake kad se ručno promijeni
  const touch = useRef(null);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.55 });
    io.observe(root.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % FEATURES.length), STEP_MS);
    return () => clearTimeout(t);
  }, [active, visible, paused, cycle]);

  function go(d) {
    setActive((a) => (a + d + FEATURES.length) % FEATURES.length);
    setCycle((c) => c + 1);
  }
  function onDown(e) {
    touch.current = { x: e.clientX, t: Date.now() };
    setPaused(true);
  }
  function onUp(e) {
    setPaused(false);
    const s = touch.current;
    touch.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 40) return go(dx < 0 ? 1 : -1); // swipe
    if (Date.now() - s.t > 350) return; // držanje = samo pauza
    const r = e.currentTarget.getBoundingClientRect();
    go(e.clientX - r.left > r.width * 0.33 ? 1 : -1);
  }

  const f = FEATURES[active];
  const run = visible && !paused;

  return (
    <section ref={root} className="relative md:hidden" aria-label="Što stiže" data-krigla="Gle, to sam ja na ekranu.">
      <div className="flex min-h-[100svh] flex-col items-center justify-center gap-5 px-5 pt-14 pb-[118px]">
        <div
          className="float relative touch-pan-y select-none"
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerCancel={() => setPaused(false)}
          role="group"
          aria-roledescription="story"
          aria-label={`${active + 1} od ${FEATURES.length}: ${f.name}`}
        >
          <Phone width={PHONE_W}>
            {FEATURES.map((x, k) => (
              <div
                key={x.id}
                className={`absolute inset-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  k === active ? "translate-x-0 scale-100 opacity-100" : k < active ? "-translate-x-[6%] scale-[0.96] opacity-0" : "translate-x-[6%] scale-[0.96] opacity-0"
                }`}
              >
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
            {/* Trake napretka kao u storyju. */}
            <div className="absolute inset-x-[6%] top-[3.2%] z-[5] flex gap-1">
              {FEATURES.map((x, k) => (
                <span key={x.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
                  <span
                    key={k === active ? `${active}-${cycle}` : k}
                    className="block h-full rounded-full bg-white"
                    style={
                      k < active
                        ? { width: "100%" }
                        : k > active
                          ? { width: "0%" }
                          : { width: "0%", animation: `story-bar ${STEP_MS}ms linear forwards`, animationPlayState: run ? "running" : "paused" }
                    }
                  />
                </span>
              ))}
            </div>
            {!["krigla", "ekipe"].includes(f.id) && (
              <div
                key={active}
                className="push-drop absolute inset-x-[5%] top-[7.5%] z-[4] grid grid-cols-[auto_1fr] items-center gap-2 rounded-[14px] border border-white/5 bg-[#26262c]/95 px-2.5 py-2 text-left shadow-lg"
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

        <div key={`c${active}`} className="caption-in grid gap-2 text-center" aria-live="polite">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            0{active + 1} · {f.name}
          </span>
          <h2 className="font-display text-[clamp(28px,8.4vw,36px)] leading-[0.95] uppercase text-balance">
            <Punct>{f.title}</Punct>
          </h2>
          <p className="mx-auto max-w-[34ch] text-[14px] text-soft text-pretty">{f.line}</p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted/70">Tapni mobitel za dalje</p>
      </div>
    </section>
  );
}
