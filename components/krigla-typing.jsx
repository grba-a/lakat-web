"use client";

import { useEffect, useRef, useState } from "react";

function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduce;
}

// Ispis slovo po slovo, a do tada tri točke. `run` pokreće ispočetka kad se promijeni.
export function useTypewriter(text, run, armed = false) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState("done"); // done | dots | typing
  const [n, setN] = useState(text.length);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!run || reduce) return;
    let typing = 0;
    const t0 = setTimeout(() => {
      setCycle(run);
      setPhase("dots");
      setN(0);
    }, 0);
    const t1 = setTimeout(() => {
      setPhase("typing");
      const step = Math.max(10, Math.min(22, 900 / text.length));
      typing = setInterval(() => {
        setN((k) => {
          if (k >= text.length) {
            clearInterval(typing);
            setPhase("done");
            return k;
          }
          return k + 1;
        });
      }, step);
    }, 380 + Math.min(300, text.length * 4));
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearInterval(typing);
    };
  }, [run, reduce, text]);

  // Naoružan, a još nije pokrenut: oblačić čeka s točkama da ne bljesne gotov tekst.
  if (!reduce && ((armed && !run) || (run && cycle !== run))) return { phase: "dots", shown: "" };
  return { phase, shown: reduce ? text : text.slice(0, phase === "done" ? text.length : n) };
}

export function Dots() {
  return (
    <span className="flex h-[21px] items-center gap-1" aria-label="Krigla piše">
      <i className="typing-dot" />
      <i className="typing-dot [animation-delay:.15s]" />
      <i className="typing-dot [animation-delay:.3s]" />
    </span>
  );
}

// Kriglin oblačić koji „otipka“ tekst kad dođe na ekran (Petar k1) ili kad se `trigger` promijeni.
// Bez JS-a i sa smanjenim kretanjem tekst je odmah tu.
export function KriglaTyping({ text, size = 40, className = "", trigger, onView = true, tone = "" }) {
  const ref = useRef(null);
  const [run, setRun] = useState(0);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!onView) return;
    const el = ref.current;
    if (!el) return;
    // Ako je oblačić ispod ekrana, sakrij tekst dok ne dođe na red.
    if (el.getBoundingClientRect().top > window.innerHeight * 0.9) {
      setTimeout(() => setArmed(true), 0);
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRun((r) => r + 1);
          io.disconnect();
        }
      },
      { threshold: 0.7 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onView, text]);

  useEffect(() => {
    if (trigger === undefined) return;
    const t = setTimeout(() => setRun((r) => r + 1), 0);
    return () => clearTimeout(t);
  }, [trigger]);

  const { phase, shown } = useTypewriter(text, run, armed);

  return (
    <div ref={ref} className={`flex items-end gap-2.5 ${className}`}>
      <img src="/img/krigla-lik.webp" alt="" width={size} height={size} className="shrink-0 object-contain" style={{ width: size, height: size }} loading="lazy" />
      <p
        className={`relative min-h-[42px] rounded-[18px] rounded-bl-md border border-line bg-surface-2 px-3.5 py-2.5 text-left text-[14px] leading-snug md:text-[15px] ${tone || "text-fg"}`}
      >
        {phase === "dots" ? <Dots /> : <span aria-hidden="true">{shown}</span>}
        <span className="sr-only">{text}</span>
      </p>
    </div>
  );
}
