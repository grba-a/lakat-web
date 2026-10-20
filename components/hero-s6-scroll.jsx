"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { StoreButtons } from "./store";
import { StoreQR } from "./store-qr";
import { TimerTalk } from "./timer-talk";

// Hero S6 „Tri petka" (Petar, 20. 10., runda 5): skrolom prolaze tri petka na kauču, četvrti Krigla skoči i ode,
// a ekipa se kucne za šankom. Klipovi su Higgsfield (Kling, Codex Job 30). Skrol bira korak, a klip korak odigra
// sam u punih 24 fps (Petar 21. 10.: niz sličica je „šekao“ i bio mutan). Svaki korak ima mirnu sliku kraja:
// ostaje kad klip završi, kad se skrola unatrag, u Low Power Modeu i uz smanjeno kretanje.
const CLIPS = [
  { at: 0, id: "c1", start: "petak-1", end: "petak-2" },
  { at: 0.13, id: "c2", start: "petak-2", end: "petak-3" },
  { at: 0.28, id: "c3a", start: "petak-3", end: "mobitel" },
  { at: 0.4, id: "c3b", start: "mobitel", end: "skok" },
  // c3c je rezerva prekinuta prije nego Krigla izađe preko ruba; na kraju se pretopi u praznu sobu s otvorenim vratima.
  { at: 0.53, id: "c3c", start: "skok", end: "prazan", endPos: "100% 100%" },
  { at: 0.66, id: "c4", start: "sank-a", end: "sank-b", wide: true },
];
const LAST = "end";
const TEXT = [
  [0, "1. petak", ["Prvi", "petak."]],
  [0.13, "2. petak", ["Drugi", "petak."]],
  [0.2, "3. petak", ["Treći", "petak."]],
  [0.28, "4. petak", ["Četvrti", "petak."]],
  [0.56, "4. petak", ["Kauč je", "prazan."]],
  [0.66, null, ["Ekipa je", "na okupu."]],
  [0.84, null, LAST],
];
const PUSHES = [
  [0.04, 0.12, "LAKAT", "Ante je vani."],
  [0.15, 0.24, "LAKAT", "Ante i Iva su vani."],
  [0.29, 0.38, "KRIGLA", "Svi su vani. Di si ti?"],
];
const PUSH_MARKS = PUSHES.flatMap(([a, b]) => [a, b]);

const still = (n) => `/img/s6/${n}.webp`;
const clip = (id) => `/video/s6/${id}.mp4`;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
// TEXT su nizovi (Array ima metodu .at, pa se granica čita iz [0]), CLIPS su objekti s poljem at.
const indexAt = (list, p) => list.reduce((k, item, i) => (p >= (Array.isArray(item) ? item[0] : item.at) ? i : k), 0);

const RM = "(prefers-reduced-motion: reduce)";
function subscribeReduce(cb) {
  const mq = matchMedia(RM);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getReduce = () => matchMedia(RM).matches;

export function S6Scroll({ live, initial }) {
  const track = useRef(null);
  const videos = useRef([]);
  const prev = useRef(-1);
  const [k, setK] = useState(0);
  const [t, setT] = useState(0);
  const [pushAt, setPushAt] = useState(0);
  const [done, setDone] = useState({});
  const [started, setStarted] = useState(false);
  const reduce = useSyncExternalStore(subscribeReduce, getReduce, () => false);

  // Skrol mijenja stanje samo kad se prijeđe granica koraka, teksta ili poruke, ne na svaki piksel.
  useEffect(() => {
    let raf = 0;
    const run = () => {
      raf = 0;
      const el = track.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const max = r.height - innerHeight;
      const p = max > 0 ? clamp01(-r.top / max) : 0;
      setK(indexAt(CLIPS, p));
      setT(indexAt(TEXT, p));
      setPushAt(PUSH_MARKS.filter((m) => p >= m).length);
    };
    const go = () => { if (!raf) raf = requestAnimationFrame(run); };
    addEventListener("scroll", go, { passive: true });
    addEventListener("resize", go);
    run();
    return () => {
      removeEventListener("scroll", go);
      removeEventListener("resize", go);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Ulaz u korak naprijed pusti njegov klip od početka; unatrag pokaže kraj. Idući klip se učita unaprijed.
  useEffect(() => {
    const from = prev.current;
    prev.current = k;
    const v = videos.current[k];
    const next = videos.current[k + 1];
    if (next && next.preload !== "auto") { next.preload = "auto"; next.load(); }
    if (!v) return;
    videos.current.forEach((o, i) => { if (o && i !== k) o.pause(); });
    const finish = () => setDone((d) => ({ ...d, [k]: true }));
    if (reduce || k < from) {
      finish();
      return;
    }
    setDone((d) => ({ ...d, [k]: false }));
    if (v.preload !== "auto") { v.preload = "auto"; v.load(); }
    try { v.currentTime = 0; } catch {}
    const played = v.play();
    if (played) played.catch(finish);
  }, [k, reduce]);

  const step = TEXT[t];
  const lines = step[2] === LAST ? (live ? ["Šank je", "otvoren."] : ["Šank se", "otvara za…"]) : step[2];
  const end = t === TEXT.length - 1;
  const atTop = k === 0 && t === 0 && pushAt === 0;

  return (
    <div ref={track} className="relative h-[560svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-10 md:mx-auto md:max-w-6xl md:px-5">
        {/* Scena: na mobitelu cijeli ekran, na računalu uspravni panel desno. */}
        <div className="absolute inset-0 bg-bg md:relative md:inset-auto md:col-start-2 md:h-[min(84svh,820px)] md:aspect-[3/4] md:overflow-hidden md:rounded-[28px] md:border md:border-line">
          {CLIPS.map((c, i) => {
            const on = i === k;
            const fit = c.wide
              ? "absolute inset-x-0 top-[56%] h-auto w-full -translate-y-1/2"
              : "absolute inset-0 h-full w-full object-cover object-bottom";
            return (
              <div key={c.id} className={`absolute inset-0 transition-opacity duration-500 ${on ? "opacity-100" : "opacity-0"}`} aria-hidden={!on}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={still(c.end)} alt="" loading={i === 0 ? "eager" : "lazy"} className={fit}
                  style={c.endPos ? { objectPosition: c.endPos } : undefined} />
                <video
                  ref={(el) => { videos.current[i] = el; }}
                  src={clip(c.id)}
                  poster={still(c.start)}
                  muted
                  playsInline
                  preload={i === 0 ? "auto" : "none"}
                  onEnded={() => setDone((d) => ({ ...d, [i]: true }))}
                  onPlaying={i === 0 ? () => setStarted(true) : undefined}
                  className={`${fit} transition-opacity duration-500 ${done[i] ? "opacity-0" : "opacity-100"}`}
                />
              </div>
            );
          })}
          {/* LCP: prva slika stoji odmah, prije nego se ijedan video učita; nestane kad krene prvi klip. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={still("petak-1")} alt="Krigla petkom navečer sam na kauču s mobitelom u ruci" fetchPriority="high"
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover object-bottom transition-opacity duration-500 ${started || k > 0 || done[0] ? "opacity-0" : "opacity-100"}`} />
          {step[1] && (
            <span className="absolute left-4 top-[34%] rounded-full border border-line bg-bg/75 px-3 py-1.5 font-display text-[18px] leading-none text-amber uppercase md:top-5">
              {step[1]}
            </span>
          )}
          {PUSHES.map(([, , who, text], i) => {
            const on = pushAt === i * 2 + 1;
            return (
              <div key={text} aria-hidden={!on}
                className={`absolute left-4 right-4 top-[40%] md:top-16 grid grid-cols-[34px_1fr_auto] items-center gap-2.5 rounded-[20px] bg-[rgba(38,38,44,.88)] p-3 backdrop-blur-md transition duration-300 ${on ? "opacity-100" : "-translate-y-4 opacity-0"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/apple-icon.png" alt="" className="h-[34px] w-[34px] rounded-[9px]" />
                <div className="text-left leading-tight">
                  <b className="block text-[11px] tracking-[0.04em]">{who}</b>
                  <span className="block text-[14px]">{text}</span>
                </div>
                <em className="self-start text-[11px] not-italic text-muted">sada</em>
              </div>
            );
          })}
        </div>

        {/* Naslov i timer: na mobitelu preko scene (gore naslov, dolje timer), na računalu lijevi stupac. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 grid justify-items-center bg-gradient-to-b from-bg/90 to-transparent px-5 pt-[max(64px,calc(env(safe-area-inset-top)+56px))] pb-12 text-center md:pointer-events-auto md:relative md:col-start-1 md:row-start-1 md:justify-items-start md:bg-none md:p-0 md:text-left">
          <p key={lines.join("|")} aria-live="polite"
            className="swap-in font-display text-[clamp(48px,14vw,62px)] leading-[0.93] uppercase md:text-[clamp(64px,7.4vw,112px)]">
            {lines.map((l) => (
              <span key={l} className="block whitespace-nowrap">
                {l.endsWith("…") || l.endsWith(".") ? (
                  <>
                    {l.slice(0, -1)}
                    <span className="text-accent">{l.slice(-1)}</span>
                  </>
                ) : l}
              </span>
            ))}
          </p>
          <div className={`mt-6 hidden transition-opacity duration-500 md:block ${end ? "opacity-100" : "pointer-events-none opacity-0"}`}>
            {live ? (
              <div className="grid gap-4"><StoreButtons /><StoreQR /></div>
            ) : (
              <TimerTalk initial={initial} className="md:justify-start md:[--cw:46px]" />
            )}
          </div>
        </div>
        <div className={`absolute inset-x-0 bottom-0 grid justify-items-center bg-gradient-to-t from-bg via-bg/80 to-transparent px-5 pt-16 pb-32 transition-opacity duration-500 md:hidden ${end ? "opacity-100" : "pointer-events-none opacity-0"}`}>
          {live ? (
            <div className="grid gap-4"><StoreButtons /><StoreQR /></div>
          ) : (
            <TimerTalk initial={initial} className="[--cw:38px] [@media(max-height:700px)]:[--cw:30px]" />
          )}
        </div>
        {!reduce && atTop && (
          <span className="nudge pointer-events-none absolute left-1/2 top-[56%] -translate-x-1/2 rounded-full border border-accent bg-bg/75 px-4 py-2 text-[14px] font-extrabold">
            Skrolaj ↓
          </span>
        )}
      </div>
    </div>
  );
}
