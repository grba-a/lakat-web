"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { readDaily, saveDaily, seeded, todayKey } from "@/lib/daily";
import { shareText } from "@/lib/share";
import { pokreniTrkac, presuda } from "@/lib/trkac";
import { KriglaTyping } from "./krigla-typing";
import { Phone } from "./phone";

// Igra u mobitelu (varijanta A). Prava jezgra trkača iz web aplikacije.
// Tap = skok, dulji tap = viši skok. Igra se pokreće tek kad je netko tapne.
export function Game({ challenge = null }) {
  const canvas = useRef(null);
  const game = useRef(null);
  const [state, setState] = useState("spreman"); // spreman | trci | kraj
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [daily, setDaily] = useState(null); // službeni rezultat dana
  const [shared, setShared] = useState("");

  const last = useRef(0);

  function make() {
    game.current?.stop();
    last.current = 0;
    game.current = pokreniTrkac(canvas.current, {
      reduciran: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      rng: seeded(todayKey()),
      tresi: false,
      onBod: (n) => {
        last.current = n;
        setScore(n);
      },
      onKraj: () => {
        saveDaily(last.current);
        setDaily(readDaily());
        setRounds((r) => r + 1);
        setState("kraj");
      },
    });
  }

  useEffect(() => {
    make();
    const t = setTimeout(() => setDaily(readDaily()), 0);
    return () => {
      clearTimeout(t);
      game.current?.stop();
    };
  }, []);

  async function challengeFriend() {
    const r = daily?.score ?? score;
    track("share_tap", { gdje: "igra", r });
    setShared(await shareText(`/i/${r}`, `Igra dana na LAKTU: imam ${r}. Možeš li bolje?`));
  }

  function down(e) {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const st = game.current?.stanje();
    // Na padu tap po igri ne radi ništa: nova partija samo preko „Probaj opet“ (Petar, 2026-10-05).
    if (st === "kraj") return;
    if (st === "spreman") {
      game.current.kreni();
      setState("trci");
      return;
    }
    game.current?.skoci();
  }
  function up() {
    game.current?.pusti();
  }
  function again() {
    setScore(0);
    make();
    game.current.kreni();
    setState("trci");
    track("game_start", { ponovo: true });
  }

  const verdict = challenge !== null && score > challenge ? `${score}! Pobijedio si pajdaša. Javi mu.` : `${presuda(score)} Još jednom?`;

  // Sve stoji unutar mobitela, pa se stranica ne pomiče kad padneš.
  return (
    <Phone width="clamp(240px, 70vw, 320px)">
      <div className="absolute inset-0 flex flex-col justify-center gap-3 bg-bg">
        <div className="flex items-end justify-between px-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            {daily ? `Danas ${daily.score} · trening` : "Igra dana · 1 pokušaj"}
          </span>
          <span className="font-display text-[44px] leading-none text-accent tabular-nums">{score}</span>
        </div>
        <div className="relative">
          <canvas
            ref={canvas}
            className="block w-full touch-none select-none"
            style={{ height: 190 }}
            onPointerDown={down}
            onPointerUp={up}
            onPointerCancel={up}
            aria-label="Igra: tapni za skok, drži dulje za viši skok"
          />
          {state === "kraj" && (
            <div className="chat-in absolute inset-0 grid place-items-center bg-bg/70 backdrop-blur-[2px]">
              <button
                type="button"
                onClick={again}
                className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-accent px-6 text-[16px] font-bold text-[#052e16] active:scale-[0.97]"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Probaj opet
              </button>
            </div>
          )}
        </div>
        <div className="grid min-h-[96px] content-start justify-items-center gap-2 px-4">
          {state === "spreman" && <p className="text-center text-[13px] text-soft">Tapni za start.</p>}
          {state === "trci" && <p className="text-center text-[13px] text-soft">Drži dulje za viši skok.</p>}
          {state === "kraj" && (
            <>
              <KriglaTyping key={rounds} text={verdict} size={30} onView={false} trigger={rounds} className="chat-in" />
              {daily && (
                <button type="button" onClick={challengeFriend} className="text-[13px] font-bold text-accent underline underline-offset-4">
                  {shared === "copied" ? "Link kopiran" : `Izazovi pajdaša · ${daily.score}`}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </Phone>
  );
}
