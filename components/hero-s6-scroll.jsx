"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { StoreButtons } from "./store";
import { StoreQR } from "./store-qr";
import { TimerTalk } from "./timer-talk";

// Hero S6 (Petar, 20. 10., runda 5), od 21. 10. priča „Ima li koga?" (artifact ATyTy35YNNAkqVk3GJG4wP, priča A): Krigla
// pita grupu, nitko ne odgovara, LAKAT javi tko je vani, on skoči i ode, a ekipa se kucne za šankom. Bez petka. Klipovi su Higgsfield (Kling, Codex Job 30), bez mahanja na vratima (c5, Petar 21. 10.).
// Skrol vrti video naprijed i natrag (Petar 21. 10.: „napravi scrolling mehaniku"). Kauč je jedan spojeni video
// (c1 · c2 · c3a · c3b · c3c, svi cijeli: Krigla trči kroz vrata), šank drugi; oba grade scripts/build-s6-scrub.sh. Videi se povuku cijeli
// (blob) tek nakon prve slike, da skok na bilo koju sličicu bude trenutan. Dok nisu tu (ili uz Save-Data) skrol mijenja
// mirne slike. Uz smanjeno kretanje nema ni videa ni dugog skrola, samo završna scena s timerom.

// Skrol u jedinicama → [scena, sekunda u videu]. Mirni dijelovi dobiju malo skrola, radnja više; c2 se izobliči
// oko 6,9–8 s (Codex README) pa kroz to skrol prođe brzo, prve 2 s c3a su mirne, a šanku piće nestane oko 1,3–1,9 s.
const KEYS = [
  [0, "k", 0], [0.9, "k", 5.04],
  [1.3, "k", 6.5], [1.7, "k", 8.4], [2.2, "k", 10.08],
  [2.45, "k", 12.1], [3.1, "k", 15.13], [4.3, "k", 20.17], [5.3, "k", 25.2],
  [5.6, "s", 0], [6.2, "s", 1.2], [6.35, "s", 1.9], [7.4, "s", 5.0],
];
const UNITS = 7.9;
const END_U = 7.4;

// Tekst ide uz dio priče, ne uz piksel skrola. Obavijesti su stvarne funkcije aplikacije (FOMO, Zovi narod), u pristojnoj
// verziji koju je Petar odabrao, s „Grad" umjesto kvarta.
const BEATS = [
  { u: 0, chip: "20:14", lines: ["Ima li", "koga?"], who: "EKIPA · VIĐENO: 6", text: "Ima li koga večeras?" },
  { u: 0.75, chip: "20:51", lines: ["Nitko."] },
  { u: 1.95, chip: "21:02", lines: ["Nitko."] },
  { u: 2.35, chip: "21:02", lines: ["LAKAT", "javi."], who: "LAKAT", text: "5 tvojih pajdaša je vani, a ti doma ko papuča." },
  { u: 3.1, chip: "21:02", lines: ["LAKAT", "javi."], who: "LAKAT", text: "📣 Iva zove: Grad, 21:30. Stižeš?" },
  { u: 4.3, lines: ["LAKAT", "javi."] },
  { u: 5.45, lines: ["Ekipa je", "na okupu."] },
];

// Mirne slike za trenutak prije nego stigne video: najbliža po vremenu.
const STILLS = {
  k: [[0, "petak-1"], [5.04, "petak-2"], [10.08, "petak-3"], [15.13, "mobitel"], [20.17, "skok"], [25.2, "prazan"]],
  s: [[0, "sank-a"], [5, "sank-b"]],
};
const SRC = { k: "/video/s6/kauc.mp4", s: "/video/s6/sank.mp4" };

const still = (n) => `/img/s6/${n}.webp`;
const clamp01 = (x) => Math.min(1, Math.max(0, x));

function sceneAt(u) {
  if (u <= KEYS[0][0]) return { scene: "k", t: 0 };
  for (let i = 1; i < KEYS.length; i++) {
    const [u1, s1, t1] = KEYS[i];
    if (u > u1) continue;
    const [u0, s0, t0] = KEYS[i - 1];
    if (s0 !== s1) return u < (u0 + u1) / 2 ? { scene: s0, t: t0 } : { scene: s1, t: t1 };
    return { scene: s0, t: t0 + ((u - u0) / (u1 - u0)) * (t1 - t0) };
  }
  const [, s, t] = KEYS[KEYS.length - 1];
  return { scene: s, t };
}
// Na uskom mobitelu kadar se reže sa strane, a vrata su na desnom rubu: dok Krigla ide prema njima, kadar klizne udesno.
const panAt = (t) => 50 + 50 * Math.min(1, Math.max(0, (t - 20.6) / 2.2));
const beatAt = (u) => BEATS.reduce((k, b, i) => (u >= b.u ? i : k), 0);
const stillAt = (scene, t) =>
  STILLS[scene].reduce((best, s) => (Math.abs(s[0] - t) < Math.abs(best[0] - t) ? s : best))[1];

const RM = "(prefers-reduced-motion: reduce)";
function subscribeReduce(cb) {
  const mq = matchMedia(RM);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getReduce = () => matchMedia(RM).matches;

export function S6Scroll({ live, initial, children }) {
  const track = useRef(null);
  const vids = useRef({});
  const kImg = useRef(null);
  const [beat, setBeat] = useState(0);
  const [scene, setScene] = useState("k");
  const [stillName, setStillName] = useState({ k: "petak-1", s: "sank-a" });
  const [ready, setReady] = useState({});
  const [nearEnd, setNearEnd] = useState(false);
  const [armed, setArmed] = useState(false);
  const reduce = useSyncExternalStore(subscribeReduce, getReduce, () => false);

  // Cijeli videi kao blob, jedan za drugim, kad stranica stane (ili na prvi skrol). Bez Save-Data.
  useEffect(() => {
    if (reduce || navigator.connection?.saveData) return;
    let dead = false;
    const urls = [];
    const pull = async () => {
      for (const k of ["k", "s"]) {
        try {
          const r = await fetch(SRC[k], { priority: "low" });
          if (!r.ok) return;
          const url = URL.createObjectURL(await r.blob());
          urls.push(url);
          if (dead) return;
          const v = vids.current[k];
          if (v) { v.src = url; v.load(); }
        } catch { return; }
      }
    };
    let started = false;
    const go = () => {
      if (started) return;
      started = true;
      removeEventListener("scroll", go);
      pull();
    };
    addEventListener("scroll", go, { passive: true, once: true });
    const idle = setTimeout(go, document.readyState === "complete" ? 1200 : 2500);
    return () => {
      dead = true;
      clearTimeout(idle);
      removeEventListener("scroll", go);
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [reduce]);

  // iOS ne iscrta premotanu sličicu videa koji nikad nije krenuo: na prvi dodir ga kratko pokrene i zaustavi.
  useEffect(() => {
    if (reduce) return;
    const wake = () => {
      Object.values(vids.current).forEach((v) => {
        if (!v?.src) return;
        const t = v.currentTime;
        v.play()?.then(() => { v.pause(); v.currentTime = t; }).catch(() => {});
      });
    };
    addEventListener("touchstart", wake, { passive: true, once: true });
    return () => removeEventListener("touchstart", wake);
  }, [reduce]);

  // Skrol → cilj; rAF ga glatko sustiže i premotava video. React stanje se mijenja samo na granicama.
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    let target = 0;
    let cur = -1;
    let last = 0;
    const read = () => {
      const el = track.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const max = r.height - innerHeight;
      target = (max > 0 ? clamp01(-r.top / max) : 0) * UNITS;
    };
    const frame = (now) => {
      raf = 0;
      const dt = Math.min(64, now - (last || now));
      last = now;
      cur = cur < 0 ? target : cur + (target - cur) * (1 - Math.pow(0.82, dt / 16.7));
      if (Math.abs(target - cur) < 0.002) cur = target;
      const { scene: sc, t } = sceneAt(cur);
      const v = vids.current[sc];
      if (sc === "k") {
        const pos = `${panAt(t).toFixed(1)}% 100%`;
        if (vids.current.k) vids.current.k.style.objectPosition = pos;
        if (kImg.current) kImg.current.style.objectPosition = pos;
      }
      if (v && v.readyState >= 1 && !v.seeking && Math.abs(v.currentTime - t) > 1 / 48) {
        try { v.currentTime = Math.min(t, (v.duration || t) - 0.02); } catch {}
      }
      setScene(sc);
      setBeat(beatAt(cur));
      setNearEnd(cur >= END_U);
      const sn = stillAt(sc, t);
      setStillName((s) => (s[sc] === sn ? s : { ...s, [sc]: sn }));
      if (cur !== target || (v && v.seeking)) raf = requestAnimationFrame(frame);
      else last = 0;
    };
    const kick = () => {
      read();
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onScroll = () => {
      setArmed(true);
      kick();
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", kick);
    kick();
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", kick);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  const b = reduce ? BEATS[BEATS.length - 1] : BEATS[beat];
  const sc = reduce ? "s" : scene;
  const end = reduce || nearEnd;
  const lines = end ? (live ? ["Šank je", "otvoren."] : ["Šank se", "otvara za…"]) : b.lines;
  const atTop = !reduce && !armed && beat === 0;

  // Kauč puni ekran (scena je u donjem dijelu kadra); šank je 16:10, malo povećan da tamni rubovi odu, a sve tri Krigle ostanu.
  const fit = {
    k: "absolute inset-0 h-full w-full object-cover object-bottom",
    s: "absolute left-1/2 top-[52%] h-auto w-[112%] max-w-none -translate-x-1/2 -translate-y-1/2",
  };

  return (
    <div ref={track} className={reduce ? "relative h-[100svh]" : "relative h-[740svh]"}>
      <div className="sticky top-0 h-[100svh] overflow-hidden md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-10 md:mx-auto md:max-w-6xl md:px-5">
        {/* Scena: na mobitelu cijeli ekran, na računalu uspravni panel desno. */}
        <div className="absolute inset-0 bg-bg md:relative md:inset-auto md:col-start-2 md:h-[min(84svh,820px)] md:aspect-[3/4] md:overflow-hidden md:rounded-[28px] md:border md:border-line">
          {["k", "s"].map((k) => {
            if (reduce && k !== "s") return null;
            const on = k === sc;
            const name = reduce ? "sank-b" : stillName[k];
            return (
              <div key={k} className={`absolute inset-0 transition-opacity duration-500 ${on ? "opacity-100" : "opacity-0"}`} aria-hidden={!on}>
                {/* Prva slika kauča je LCP i stoji odmah; ostale mirne slike samo dok video nije spreman. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={k === "k" ? kImg : undefined}
                  src={still(name)}
                  alt={k === "k" ? "Krigla navečer sam na kauču s mobitelom u ruci" : "Tri Krigle se kucnu za šankom"}
                  fetchPriority={k === "k" ? "high" : undefined}
                  loading={k === "k" ? "eager" : "lazy"}
                  className={fit[k]}
                />
                {!reduce && (
                  <video
                    ref={(el) => { vids.current[k] = el; }}
                    muted
                    playsInline
                    preload="auto"
                    disablePictureInPicture
                    onLoadedData={() => setReady((r) => ({ ...r, [k]: true }))}
                    className={`${fit[k]} transition-opacity duration-300 ${ready[k] ? "opacity-100" : "opacity-0"}`}
                  />
                )}
              </div>
            );
          })}
          {b.chip && !end && (
            <span className="absolute left-4 top-[33%] rounded-full border border-line bg-bg/75 px-3 py-1.5 font-display text-[18px] leading-none text-amber uppercase md:top-5">
              {b.chip}
            </span>
          )}
          {b.text && !end && (
            <div key={b.text} className="swap-in absolute left-4 right-4 top-[41%] md:top-16 grid grid-cols-[34px_1fr_auto] items-center gap-2.5 rounded-[20px] bg-[rgba(38,38,44,.88)] p-3 backdrop-blur-md">
              {b.who === "LAKAT" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/apple-icon.png" alt="" className="h-[34px] w-[34px] rounded-[9px]" />
              ) : (
                // Poruka iz grupnog chata, ne od LAKTA: avatar grupe umjesto ikone aplikacije.
                <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[#1f7a4a] text-[15px] font-extrabold">E</span>
              )}
              <div className="text-left leading-tight">
                <b className="block text-[11px] tracking-[0.04em]">{b.who}</b>
                <span className="block text-[14px]">{b.text}</span>
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
                  {l.endsWith("…") || l.endsWith(".") || l.endsWith("?") ? (
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
