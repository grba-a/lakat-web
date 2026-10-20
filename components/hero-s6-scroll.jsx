"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { StoreButtons } from "./store";
import { StoreQR } from "./store-qr";
import { TimerTalk } from "./timer-talk";

// Hero S6 „Tri petka" (Petar, 20. 10., runda 5): skrolom prolaze tri petka na kauču, četvrti Krigla skoči i ode,
// a ekipa se kucne za šankom. Sličice su Higgsfield klipovi (Kling, Codex Job 30) izrezani na ~6 u sekundi;
// canvas ih prelijeva jednu u drugu da skrol ne trza. Poster (prva sličica) je LCP i stoji sam dok se niz učitava.
const COUNT = 144;
// Odsječci niza i koliki dio skrola dobiva svaki (zbroj 0.92, zadnjih 8 % je stanka na šanku s timerom).
const SEGS = [
  { from: 0, to: 15, w: 0.12 }, // c1 prvi → drugi petak
  { from: 16, to: 46, w: 0.16 }, // c2 drugi → treći petak, licem u jastuk
  { from: 47, to: 65, w: 0.11 }, // c3a mobitel zazuji
  { from: 66, to: 96, w: 0.15 }, // c3b skok s kauča
  { from: 97, to: 111, w: 0.07 }, // c3c kreće prema vratima (rezerva, prekinuta prije ruba)
  { from: 112, to: 112, w: 0.08 }, // prazna soba, vrata otvorena (Petar 21. 10.: Krigla se na vratima ne vidi)
  { from: 113, to: 143, w: 0.23, wide: true }, // c4 tri Krigle se kucnu
];
const LAST = "end";
const STEPS = [
  [0, "1. petak", ["Prvi", "petak."]],
  [0.12, "2. petak", ["Drugi", "petak."]],
  [0.2, "3. petak", ["Treći", "petak."]],
  [0.28, "4. petak", ["Četvrti", "petak."]],
  [0.54, "4. petak", ["Kauč je", "prazan."]],
  [0.67, null, ["Ekipa je", "na okupu."]],
  [0.86, null, LAST],
];
const PUSHES = [
  [0.03, 0.1, "LAKAT", "Ante je vani."],
  [0.14, 0.22, "LAKAT", "Ante i Iva su vani."],
  [0.29, 0.38, "KRIGLA", "Svi su vani. Di si ti?"],
];

const src = (i) => `/img/s6/${String(i).padStart(3, "0")}.webp`;
const clamp01 = (x) => Math.min(1, Math.max(0, x));

// Skrol (0–1) → mjesto u nizu (s razlomkom za prelijevanje). Svaki odsječak se na kraju prelije u prvu sličicu
// idućeg, pa rezovi (c3c → prazna soba → šank) nisu tvrdi. Prazna soba stoji, a pretapa se tek u zadnjih 40 %.
function frameAt(p) {
  let a = 0;
  for (let k = 0; k < SEGS.length; k++) {
    const s = SEGS[k];
    const u = (p - a) / s.w;
    if (p < a + s.w) {
      if (s.from === s.to) return s.from + Math.max(0, (u - 0.6) / 0.4);
      const last = k === SEGS.length - 1;
      return s.from + u * (s.to - s.from + (last ? 0 : 1));
    }
    a += s.w;
  }
  return COUNT - 1;
}

const RM = "(prefers-reduced-motion: reduce)";
function subscribeReduce(cb) {
  const mq = matchMedia(RM);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getReduce = () => matchMedia(RM).matches;

export function S6Scroll({ live, initial }) {
  const track = useRef(null);
  const canvas = useRef(null);
  const frames = useRef([]);
  const [p, setP] = useState(0);
  const reduce = useSyncExternalStore(subscribeReduce, getReduce, () => false);

  // Niz se učitava redom, četiri odjednom, tek nakon prvog prikaza.
  useEffect(() => {
    let alive = true;
    const order = reduce ? [COUNT - 1] : Array.from({ length: COUNT }, (_, i) => i);
    let next = 0;
    const one = () => {
      if (!alive || next >= order.length) return;
      const i = order[next++];
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        frames.current[i] = img;
        draw();
        one();
      };
      img.onerror = one;
      img.src = src(i);
    };
    const start = () => [0, 1, 2, 3].forEach(one);
    const id = "requestIdleCallback" in window ? requestIdleCallback(start, { timeout: 1200 }) : setTimeout(start, 300);
    return () => {
      alive = false;
      "cancelIdleCallback" in window ? cancelIdleCallback(id) : clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  const pRef = useRef(0);
  function nearest(i, dir) {
    for (let k = i; k >= 0 && k < COUNT; k += dir) if (frames.current[k]) return frames.current[k];
    return null;
  }
  // Vrata su na desnom rubu sličice; na uskom ekranu cover ih odreže, pa od c3c do c5 kadar klizne udesno.
  function panAt(f) {
    if (f < 97) return 0.5;
    if (f < 112) return 0.5 + 0.5 * ((f - 97) / 15);
    return 1;
  }
  function paint(ctx, img, W, H, alpha, f) {
    if (!img) return;
    ctx.globalAlpha = alpha;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    if (iw > ih) {
      // Šank (16:9 s tamnim bočnim marginama): bez margina, cijela širina, ispod naslova.
      const sx = iw * 0.05, sw = iw * 0.9;
      const s = Math.min(W / sw, (H * 0.5) / ih);
      const w = sw * s, h = ih * s;
      ctx.drawImage(img, sx, 0, sw, ih, (W - w) / 2, H * 0.56 - h / 2, w, h);
      return;
    }
    // Uspravne sličice: cover, poravnato dolje (gornjih 30 % je tamno za naslov).
    const s = Math.max(W / iw, H / ih);
    const w = iw * s, h = ih * s;
    ctx.drawImage(img, (W - w) * panAt(f), H - h, w, h);
  }
  function draw() {
    const c = canvas.current;
    if (!c) return;
    const W = c.clientWidth, H = c.clientHeight;
    if (!W || !H) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (c.width !== Math.round(W * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const f = reduce ? COUNT - 1 : frameAt(pRef.current);
    const i = Math.floor(f), t = f - i;
    const a = frames.current[i] || nearest(i, -1);
    if (!a) return; // poster ispod još drži sliku
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, W, H);
    paint(ctx, a, W, H, 1, f);
    const b = frames.current[i + 1];
    if (t > 0.02 && b) paint(ctx, b, W, H, t, f);
    ctx.globalAlpha = 1;
    c.dataset.ready = "1";
  }

  useEffect(() => {
    let raf = 0;
    const run = () => {
      raf = 0;
      const el = track.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const max = r.height - innerHeight;
      const q = reduce ? 1 : max > 0 ? clamp01(-r.top / max) : 0;
      pRef.current = q;
      setP(q);
      draw();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  const step = STEPS.filter(([at]) => p >= at).pop();
  const lines = step[2] === LAST ? (live ? ["Šank je", "otvoren."] : ["Šank se", "otvara za…"]) : step[2];
  const end = p >= 0.86;

  return (
    <div ref={track} className={reduce ? "relative" : "relative h-[620svh]"}>
      <div className="sticky top-0 h-[100svh] overflow-hidden md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-10 md:mx-auto md:max-w-6xl md:px-5">
        {/* Scena: na mobitelu cijeli ekran, na računalu uspravni panel desno. */}
        <div className="absolute inset-0 md:relative md:inset-auto md:col-start-2 md:h-[min(84svh,820px)] md:aspect-[3/4] md:overflow-hidden md:rounded-[28px] md:border md:border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src(0)} alt="Krigla petkom navečer sam na kauču s mobitelom u ruci" fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-bottom" />
          <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-300 data-[ready=1]:opacity-100" />
          {step[1] && (
            <span className="absolute left-4 top-[34%] rounded-full border border-line bg-bg/75 px-3 py-1.5 font-display text-[18px] leading-none text-amber uppercase md:top-5">
              {step[1]}
            </span>
          )}
          {PUSHES.map(([a, b, who, text]) => {
            const on = p >= a && p < b;
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
        {!reduce && p < 0.02 && (
          <span className="nudge pointer-events-none absolute left-1/2 top-[56%] -translate-x-1/2 rounded-full border border-accent bg-bg/75 px-4 py-2 text-[14px] font-extrabold">
            Skrolaj ↓
          </span>
        )}
      </div>
    </div>
  );
}
