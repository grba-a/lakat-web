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
  const [best, setBest] = useState(0);
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
      onBod: (n) => {
        last.current = n;
        setScore(n);
      },
      onKraj: () => {
        saveDaily(last.current);
        setDaily(readDaily());
        setBest((b) => Math.max(b, last.current));
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
    if (st === "kraj") {
      setScore(0);
      make();
      game.current.kreni();
      setState("trci");
      return;
    }
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

  return (
    <div className="grid justify-items-center gap-4">
      <Phone width="clamp(240px, 70vw, 320px)">
        <div className="absolute inset-0 flex flex-col justify-center gap-3 bg-bg">
          <div className="flex items-end justify-between px-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {daily ? `Danas ${daily.score} · trening` : "Igra dana · 1 pokušaj"}
            </span>
            <span className="font-display text-[44px] leading-none text-accent tabular-nums">{score}</span>
          </div>
          <canvas
            ref={canvas}
            className="block w-full touch-none select-none"
            style={{ height: 190 }}
            onPointerDown={down}
            onPointerUp={up}
            onPointerCancel={up}
            aria-label="Igra: tapni za skok, drži dulje za viši skok"
          />
          <p className="min-h-[3em] px-5 text-center text-[13px] leading-snug text-soft" aria-live="polite">
            {state === "spreman" && "Tapni za start."}
            {state === "trci" && "Drži dulje za viši skok."}
            {state === "kraj" && "Tapni za novu."}
          </p>
        </div>
      </Phone>
      {/* Krigla komentira rezultat (Petar k5); izazov pajdaša (w10). */}
      {state === "kraj" && (
        <KriglaTyping
          key={rounds}
          text={
            challenge !== null && score > challenge
              ? `${score}! Pobijedio si pajdaša. Javi mu.`
              : `${presuda(score)} Još jednom?`
          }
          size={44}
          onView={false}
          trigger={rounds}
          className="chat-in max-w-[320px]"
        />
      )}
      {daily && (
        <button
          type="button"
          onClick={challengeFriend}
          className="inline-flex min-h-[48px] items-center rounded-full bg-accent px-5 text-[15px] font-bold text-[#052e16] active:scale-[0.98]"
        >
          {shared === "copied" ? "Link kopiran" : `Izazovi pajdaša · ${daily.score}`}
        </button>
      )}
    </div>
  );
}
