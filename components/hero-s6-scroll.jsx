"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { StoreButtons } from "./store";
import { StoreQR } from "./store-qr";
import { TimerTalk } from "./timer-talk";

// Hero S6 „Tri petka" (Petar, 20. 10., runda 5): skrolom prolaze tri petka na kauču, četvrti Krigla skoči i ode,
// a ekipa se kucne za šankom. Klipovi su Higgsfield (Kling, Codex Job 30). Skrol bira korak, a klip korak odigra
// sam u punih 24 fps (Petar 21. 10.: niz sličica je „šekao“ i bio mutan). Svaki korak ima mirnu sliku kraja:
// ostaje kad klip završi, kad se skrola unatrag i u Low Power Modeu. Uz smanjeno kretanje nema ni klipova ni
// dugog skrola, samo završna scena s timerom.
//
// Naslov, oznaka petka i poruka idu uz klip (početak/kraj), ne uz piksel skrola, da tekst ne bježi slici.
const CLIPS = [
  { at: 0, id: "c1", start: "petak-1", end: "petak-2",
    on: ["1. petak", ["Prvi", "petak."], "LAKAT", "Ante je vani."],
    off: ["2. petak", ["Drugi", "petak."], "LAKAT", "Ante i Iva su vani."] },
  { at: 0.14, id: "c2", start: "petak-2", end: "petak-3",
    on: ["2. petak", ["Drugi", "petak."]],
    off: ["3. petak", ["Treći", "petak."]] },
  { at: 0.28, id: "c3a", start: "petak-3", end: "mobitel",
    on: ["4. petak", ["Četvrti", "petak."], "KRIGLA", "Svi su vani. Di si ti?"],
    off: ["4. petak", ["Četvrti", "petak."], "KRIGLA", "Svi su vani. Di si ti?"] },
  { at: 0.42, id: "c3b", start: "mobitel", end: "skok",
    on: ["4. petak", ["Četvrti", "petak."]],
    off: ["4. petak", ["Četvrti", "petak."]] },
  // c3c je rezerva prekinuta prije nego Krigla izađe preko ruba; na kraju se pretopi u praznu sobu s otvorenim vratima.
  { at: 0.54, id: "c3c", start: "skok", end: "prazan", endPos: "100% 100%",
    on: ["4. petak", ["Četvrti", "petak."]],
    off: ["4. petak", ["Kauč je", "prazan."]] },
  { at: 0.68, id: "c4", start: "sank-a", end: "sank-b", wide: true,
    on: [null, ["Ekipa je", "na okupu."]],
    off: [null, ["Ekipa je", "na okupu."]] },
];
const END_AT = 0.84;

const still = (n) => `/img/s6/${n}.webp`;
const clip = (id) => `/video/s6/${id}.mp4`;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const clipAt = (p) => CLIPS.reduce((k, c, i) => (p >= c.at ? i : k), 0);

const RM = "(prefers-reduced-motion: reduce)";
function subscribeReduce(cb) {
  const mq = matchMedia(RM);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getReduce = () => matchMedia(RM).matches;

export function S6Scroll({ live, initial, children }) {
  const track = useRef(null);
  const videos = useRef([]);
  const prev = useRef(-1);
  const [k, setK] = useState(0);
  const [nearEnd, setNearEnd] = useState(false);
  const [armed, setArmed] = useState(false);
  const [done, setDone] = useState({});
  const [started, setStarted] = useState(false);
  const reduce = useSyncExternalStore(subscribeReduce, getReduce, () => false);

  // Skrol mijenja stanje samo kad se prijeđe granica koraka, ne na svaki piksel.
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const run = () => {
      raf = 0;
      const el = track.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const max = r.height - innerHeight;
      const p = max > 0 ? clamp01(-r.top / max) : 0;
      setK(clipAt(p));
      setNearEnd(p >= END_AT);
    };
    const go = () => {
      setArmed(true);
      if (!raf) raf = requestAnimationFrame(run);
    };
    addEventListener("scroll", go, { passive: true });
    addEventListener("resize", go);
    run();
    return () => {
      removeEventListener("scroll", go);
      removeEventListener("resize", go);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  // Ulaz u korak naprijed pusti njegov klip od početka; unatrag pokaže kraj.
  useEffect(() => {
    const all = videos.current;
    if (getReduce()) {
      all.forEach((v) => v?.pause());
      return;
    }
    const from = prev.current;
    prev.current = k;
    all.forEach((v, i) => { if (v && i !== k) v.pause(); });
    const v = all[k];
    if (!v) return;
    if (k < from) {
      setDone((d) => ({ ...d, [k]: true }));
      return;
    }
    setDone((d) => ({ ...d, [k]: false }));
    if (v.preload !== "auto") { v.preload = "auto"; v.load(); }
    try { v.currentTime = 0; } catch {}
    const played = v.play();
    // Samo stvarna zabrana (Low Power Mode) prebacuje na mirnu sliku; AbortError od vlastitog pause() se ignorira.
    if (played) played.catch((e) => { if (e?.name === "NotAllowedError" && prev.current === k) setDone((d) => ({ ...d, [k]: true })); });
  }, [k, reduce]);

  // Idući klip se učitava tek kad posjetitelj krene skrolati ili kad prvi klip završi, ne odmah pri otvaranju.
  useEffect(() => {
    if (reduce || !(armed || done[0])) return;
    const next = videos.current[k + 1];
    if (next && next.preload !== "auto") { next.preload = "auto"; next.load(); }
  }, [k, armed, done, reduce]);

  const cur = reduce ? CLIPS.length - 1 : k;
  const c = CLIPS[cur];
  const isDone = reduce || done[cur];
  const [chip, lines0, who, text] = isDone ? c.off : c.on;
  const end = reduce || (cur === CLIPS.length - 1 && (nearEnd || done[cur]));
  const lines = end ? (live ? ["Šank je", "otvoren."] : ["Šank se", "otvara za…"]) : lines0;
  const atTop = !reduce && !armed && k === 0;

  return (
    <div ref={track} className={reduce ? "relative h-[100svh]" : "relative h-[560svh]"}>
      <div className="sticky top-0 h-[100svh] overflow-hidden md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-10 md:mx-auto md:max-w-6xl md:px-5">
        {/* Scena: na mobitelu cijeli ekran, na računalu uspravni panel desno. */}
        <div className="absolute inset-0 bg-bg md:relative md:inset-auto md:col-start-2 md:h-[min(84svh,820px)] md:aspect-[3/4] md:overflow-hidden md:rounded-[28px] md:border md:border-line">
          {CLIPS.map((s, i) => {
            // Samo dosadašnji koraci i idući imaju slike u stablu, da se ostale ne povuku pri otvaranju.
            if (!reduce && i > k + 1) return null;
            if (reduce && i !== cur) return null;
            const on = i === cur;
            const fit = s.wide
              ? "absolute inset-x-0 top-[52%] h-auto w-full -translate-y-1/2"
              : "absolute inset-0 h-full w-full object-cover object-bottom";
            return (
              <div key={s.id} className={`absolute inset-0 transition-opacity duration-500 ${on ? "opacity-100" : "opacity-0"}`} aria-hidden={!on}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={still(s.end)} alt="" className={fit} style={s.endPos ? { objectPosition: s.endPos } : undefined} />
                {!reduce && (
                  <video
                    ref={(el) => { videos.current[i] = el; }}
                    src={clip(s.id)}
                    poster={still(s.start)}
                    muted
                    playsInline
                    preload="none"
                    onEnded={() => setDone((d) => ({ ...d, [i]: true }))}
                    onPlaying={i === 0 ? () => setStarted(true) : undefined}
                    className={`${fit} transition-opacity duration-500 ${done[i] ? "opacity-0" : "opacity-100"}`}
                  />
                )}
              </div>
            );
          })}
          {/* LCP: prva slika stoji odmah, prije nego se ijedan video učita; nestane kad krene prvi klip. */}
          {!reduce && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={still("petak-1")} alt="Krigla petkom navečer sam na kauču s mobitelom u ruci" fetchPriority="high"
              className={`pointer-events-none absolute inset-0 h-full w-full object-cover object-bottom transition-opacity duration-500 ${started || k > 0 || done[0] ? "opacity-0" : "opacity-100"}`} />
          )}
          {chip && (
            <span className="absolute left-4 top-[33%] rounded-full border border-line bg-bg/75 px-3 py-1.5 font-display text-[18px] leading-none text-amber uppercase md:top-5">
              {chip}
            </span>
          )}
          {text && (
            <div key={text} className="swap-in absolute left-4 right-4 top-[41%] md:top-16 grid grid-cols-[34px_1fr_auto] items-center gap-2.5 rounded-[20px] bg-[rgba(38,38,44,.88)] p-3 backdrop-blur-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/apple-icon.png" alt="" className="h-[34px] w-[34px] rounded-[9px]" />
              <div className="text-left leading-tight">
                <b className="block text-[11px] tracking-[0.04em]">{who}</b>
                <span className="block text-[14px]">{text}</span>
              </div>
              <em className="self-start text-[11px] not-italic text-muted">sada</em>
            </div>
          )}
        </div>

        {children}

        {/* Naslov (i timer na računalu): na mobitelu preko scene, na računalu lijevi stupac. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 grid justify-items-center bg-gradient-to-b from-bg/90 to-transparent px-5 pt-[max(64px,calc(env(safe-area-inset-top)+56px))] pb-12 text-center md:pointer-events-auto md:relative md:col-start-1 md:row-start-1 md:justify-items-start md:bg-none md:p-0 md:text-left">
          <div aria-live="polite">
            <p key={lines.join("|")}
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
          </div>
          {atTop && (
            <span className="nudge mt-4 rounded-full border border-accent bg-bg/75 px-4 py-2 text-[14px] font-extrabold">
              Skrolaj ↓
            </span>
          )}
          {end && (
            <div className="swap-in mt-6 hidden md:block">
              {live ? (
                <div className="grid gap-4"><StoreButtons /><StoreQR /></div>
              ) : (
                <TimerTalk initial={initial} className="md:justify-start md:[--cw:46px]" />
              )}
            </div>
          )}
        </div>
        {end && (
          <div className="swap-in absolute inset-x-0 bottom-0 grid justify-items-center bg-gradient-to-t from-bg via-bg/80 to-transparent px-5 pt-16 pb-32 md:hidden">
            {live ? (
              <div className="grid gap-4"><StoreButtons /><StoreQR /></div>
            ) : (
              <TimerTalk initial={initial} className="[--cw:38px] [@media(max-height:700px)]:[--cw:30px]" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
