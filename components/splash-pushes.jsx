"use client";

import { useEffect, useRef, useState } from "react";

// Prave LAKAT obavijesti iz najave padaju na splash u heroju (Petar k3).
// Kreću nakon intra, vrte se dok je hero na ekranu i stanu kad ode.
const PUSHES = [
  "Ante je za šankom. Miči guzicu.",
  "Ena je za šankom, a ti skrolaš mobitel. Sramota.",
  "Bepo je objavio rundu. Tko časti?",
  "Krigla: Nula rundi ovaj tjedan. Vidiš kako sam prazna?",
];

export function SplashPushes() {
  const box = useRef(null);
  const [i, setI] = useState(-1);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => {
        setI(0);
        setShown(true);
      }, 0);
      return () => clearTimeout(t);
    }
    let timers = [];
    let visible = true;
    let k = 0;
    function cycle() {
      if (!visible) return;
      setI(k % PUSHES.length);
      setShown(true);
      timers.push(setTimeout(() => setShown(false), 3000));
      timers.push(setTimeout(() => {
        k += 1;
        cycle();
      }, 4200));
    }
    const io = new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was) cycle();
      if (!visible) {
        timers.forEach(clearTimeout);
        timers = [];
        setShown(false);
      }
    });
    io.observe(el);
    timers.push(setTimeout(cycle, 1800));
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div ref={box} className="pointer-events-none absolute inset-x-[5%] top-[7%] z-[4]" aria-live="off">
      <div
        className={`grid grid-cols-[auto_1fr] items-center gap-2 rounded-[14px] border border-white/5 bg-[#26262c]/95 px-2.5 py-2 text-left shadow-lg transition-[translate,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          shown ? "translate-y-0 opacity-100" : "-translate-y-[130%] opacity-0"
        }`}
        style={{ fontSize: "calc(var(--w) * 0.046)" }}
      >
        <span
          className="grid place-items-center rounded-[22%] bg-bg font-display leading-none"
          style={{ width: "calc(var(--w) * 0.12)", height: "calc(var(--w) * 0.12)", fontSize: "calc(var(--w) * 0.04)" }}
        >
          L<span className="text-accent">.</span>
        </span>
        <span className="leading-snug">
          <b className="flex justify-between font-semibold">
            LAKAT <span className="font-normal text-muted">sada</span>
          </b>
          {i >= 0 ? PUSHES[i] : PUSHES[0]}
        </span>
      </div>
    </div>
  );
}
