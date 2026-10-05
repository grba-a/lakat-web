"use client";

import { useEffect, useRef, useState } from "react";
import { FEATURES } from "@/lib/features";
import { Punct } from "./brand";
import { Phone } from "./phone";

// Tura na mobitelu (Petar w02): velik mobitel u sredini, čitljivi ekrani, Krigla stiže
// kao push u mobitelu, a naslov je ispod. Svaki ekran ima jedan živi sloj.
// Desktop zadržava slalom (feature-tour.jsx).
const PHONE_W = "clamp(150px, min(68vw, calc((100svh - 330px) / 2.17)), 290px)";

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

export function FeatureTourMobile() {
  const root = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const items = [...root.current.querySelectorAll("[data-step]")];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number(e.target.dataset.step));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const f = FEATURES[active];

  return (
    <section ref={root} className="relative md:hidden" aria-label="Što stiže">
      <div className="pointer-events-none sticky top-0 z-0 flex h-[100svh] justify-center pt-[max(44px,env(safe-area-inset-top))]" aria-hidden="true">
        <div className="float">
          <Phone width={PHONE_W}>
            {FEATURES.map((x, k) => (
              <div
                key={x.id}
                className={`absolute inset-0 transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  k === active ? "translate-y-0 scale-100 opacity-100" : k < active ? "-translate-y-[4%] scale-[0.94] opacity-0" : "translate-y-[8%] scale-[0.96] opacity-0"
                }`}
              >
                <div className="absolute top-0 left-1/2 h-full -translate-x-1/2" style={{ aspectRatio: "640 / 1317" }}>
                  <img
                    src={`/img/scr-${x.id}.webp`}
                    alt=""
                    width={640}
                    height={1317}
                    loading={k < 2 ? "eager" : "lazy"}
                    className={`h-full w-full ${x.id === "film" ? `develop ${k === active ? "on" : ""}` : ""}`}
                  />
                  <Live id={x.id} on={k === active} />
                </div>
              </div>
            ))}
            {/* Krigla stiže kao push u mobitelu (osim gdje ekran već ima njezinu karticu). */}
            {!["krigla", "ekipe"].includes(f.id) && (
            <div key={active} className="push-drop absolute inset-x-[5%] top-[7%] z-[4] grid grid-cols-[auto_1fr] items-center gap-2 rounded-[14px] border border-white/5 bg-[#26262c]/95 px-2.5 py-2 text-left shadow-lg" style={{ fontSize: "calc(var(--w) * 0.048)" }}>
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
        <div key={`c${active}`} className="caption-in absolute inset-x-0 bottom-[112px] grid gap-2 px-5 text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            0{active + 1} · {f.name}
          </span>
          <p className="font-display text-[clamp(28px,8.4vw,36px)] leading-[0.95] uppercase text-balance">
            <Punct>{f.title}</Punct>
          </p>
          <p className="mx-auto max-w-[34ch] text-[14px] text-soft text-pretty">{f.line}</p>
          <div className="mt-1 flex justify-center gap-1.5">
            {FEATURES.map((x, k) => (
              <i key={x.id} className={`h-1 rounded-full transition-[width,background-color] duration-300 ${k === active ? "w-5 bg-accent" : "w-1.5 bg-line"}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Koraci su samo razmak za skrolanje; tekst je u sticky sloju, a ovdje ostaje za čitače ekrana. */}
      <div className="relative -mt-[100svh]">
        {FEATURES.map((x, k) => (
          <article key={x.id} data-step={k} className="h-[75svh] first:h-[100svh] last:h-[110svh]">
            <h2 className="sr-only">{x.title}</h2>
            <p className="sr-only">{x.line}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
