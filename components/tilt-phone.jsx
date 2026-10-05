"use client";

import { useEffect, useRef, useState } from "react";
import { play } from "@/lib/sfx";
import { Phone, Splash } from "./phone";
import { SplashPushes } from "./splash-pushes";

const REST = { x: 7, y: -16, z: 2 };
// Pajdaši na karti u heroju (izmišljena imena kao u najavi).
const PINS = [
  { l: "A", x: "52%", y: "17%" },
  { l: "E", x: "36%", y: "29%" },
  { l: "B", x: "64%", y: "36%" },
];

// Mobitel prati miš (desktop) ili prst (povlačenje po mobitelu), a kad ga
// pustiš, vrati se u mirni nagib. Pet brzih tapova = Krigla izviri.
export function TiltPhone({ width, live = false }) {
  const wrap = useRef(null);
  const target = useRef({ ...REST });
  const cur = useRef({ ...REST });
  const raf = useRef(0);
  const taps = useRef([]);
  const [krigla, setKrigla] = useState(false);
  // Hero se „upali“ (Petar w01): splash, pa uklizi karta s pajdašima.
  const [booted, setBooted] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setBooted(true), reduce ? 0 : 1300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function loop() {
      const c = cur.current;
      const t = target.current;
      c.x += (t.x - c.x) * 0.12;
      c.y += (t.y - c.y) * 0.12;
      c.z += (t.z - c.z) * 0.12;
      el.style.transform = `perspective(1000px) rotateX(${c.x}deg) rotateY(${c.y}deg) rotateZ(${c.z}deg)`;
      const done =
        Math.abs(t.x - c.x) < 0.05 && Math.abs(t.y - c.y) < 0.05 && Math.abs(t.z - c.z) < 0.05;
      raf.current = done ? 0 : requestAnimationFrame(loop);
    }
    function kick() {
      if (!raf.current) raf.current = requestAnimationFrame(loop);
    }
    function aim(clientX, clientY, strength) {
      const r = el.getBoundingClientRect();
      const px = Math.max(-1, Math.min(1, (clientX - (r.left + r.width / 2)) / (r.width * 1.5)));
      const py = Math.max(-1, Math.min(1, (clientY - (r.top + r.height / 2)) / (r.height * 1.2)));
      target.current = { x: REST.x - py * 14 * strength, y: REST.y + px * 34 * strength, z: REST.z };
      kick();
    }
    function rest() {
      target.current = { ...REST };
      kick();
    }

    el.style.transform = `perspective(1000px) rotateX(${REST.x}deg) rotateY(${REST.y}deg) rotateZ(${REST.z}deg)`;
    if (reduce) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const onMove = (e) => aim(e.clientX, e.clientY, 1);
    const onDown = (e) => {
      if (e.pointerType === "mouse") return;
      aim(e.clientX, e.clientY, 1.3);
    };
    const onTouchMove = (e) => {
      if (e.pointerType === "mouse") return;
      aim(e.clientX, e.clientY, 1.3);
    };
    if (fine) window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onTouchMove);
    el.addEventListener("pointerup", rest);
    el.addEventListener("pointercancel", rest);
    el.addEventListener("pointerleave", rest);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onTouchMove);
      el.removeEventListener("pointerup", rest);
      el.removeEventListener("pointercancel", rest);
      el.removeEventListener("pointerleave", rest);
    };
  }, []);

  function tap() {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 1800), now];
    if (taps.current.length >= 5) {
      taps.current = [];
      setKrigla(true);
      play("kasa");
      setTimeout(() => setKrigla(false), 3200);
    }
  }

  return (
    <div className="relative" style={{ touchAction: "pan-y" }}>
      <div ref={wrap} onClick={tap} className="will-change-transform select-none">
        <Phone width={width} className="cursor-grab">
          {live ? (
            <img src="/img/scr-karta.webp" alt="" width={640} height={1317} className="absolute inset-0 h-full w-full object-cover object-top" />
          ) : (
            <>
              <div
                className={`absolute inset-0 z-[1] transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  booted ? "translate-y-0" : "translate-y-full"
                }`}
              >
                <img src="/img/hero-karta.webp" alt="" width={420} height={864} className="h-full w-full object-cover object-top" />
                {PINS.map((p, i) => (
                  <span
                    key={p.l}
                    className={`hero-pin ${booted ? "on" : ""}`}
                    style={{ left: p.x, top: p.y, transitionDelay: `${700 + i * 180}ms` }}
                  >
                    {p.l}
                  </span>
                ))}
              </div>
              <div className={`absolute inset-0 transition-opacity duration-500 ${booted ? "opacity-0" : "opacity-100"}`}>
                <Splash />
              </div>
              <SplashPushes start={booted} />
            </>
          )}
          {krigla && (
            <div className="absolute inset-x-0 bottom-0 z-[5] grid justify-items-center gap-2 pb-6">
              <p className="peek rounded-2xl border border-line bg-surface-2 px-3 py-2 text-center text-[13px] leading-snug">
                {live ? "Što me bockaš? Skini me već jednom." : "Što me bockaš? Strpi se do 1. 12."}
              </p>
              <img src="/img/krigla-lik.webp" alt="" className="peek w-[46%]" />
            </div>
          )}
        </Phone>
      </div>
    </div>
  );
}
