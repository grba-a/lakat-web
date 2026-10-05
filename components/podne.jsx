"use client";

import { useEffect, useRef, useState } from "react";
import { HuntKrigla } from "./hunt";

// „Podne“ (Petar w11): svaki dan u 12:00 po Zagrebu razvije se jedna polaroid fotka s nečim
// iz aplikacije čega nema u turi. Prije podneva je negativ i odbrojava se do razvijanja.
const ITEMS = [
  { id: "ankete", cap: "Ankete o ekipi", line: "Tko uvijek ima plan B kad kafić zatvori? Glasa ekipa." },
  { id: "zovi", cap: "Zovi narod", line: "Gdje i kad. Tko diže, taj i stiže." },
  { id: "vani", cap: "Vani sam", line: "Jedan tap i ekipa zna da si vani." },
  { id: "izabrao", cap: "Netko te izabrao", line: "Za što? Vidjet ćeš 1. 12." },
  { id: "vodic", cap: "Krigla te vodi", line: "Kroz cijelu aplikaciju. I usput prigovara." },
];
const START = Date.UTC(2026, 9, 5); // dan 0

function zagreb(now) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(now)
      .map((x) => [x.type, x.value])
  );
  return { day: Date.UTC(+p.year, +p.month - 1, +p.day), h: +p.hour, m: +p.minute };
}

export function Podne() {
  const ref = useRef(null);
  const [t, setT] = useState(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const tick = () => setT(zagreb(new Date()));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 30000);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => {
      clearTimeout(first);
      clearInterval(id);
      io.disconnect();
    };
  }, []);

  const n = t ? Math.max(0, Math.round((t.day - START) / 864e5)) : 0;
  const item = ITEMS[n % ITEMS.length];
  const developed = t ? t.h >= 12 : false;
  const left = t && !developed ? (12 - t.h - 1) * 60 + (60 - t.m) : 0;
  const leftText = left >= 60 ? `${Math.floor(left / 60)} h ${left % 60} min` : `${left} min`;

  return (
    <section ref={ref} data-krigla="Svaki dan u podne nešto novo." className="relative mx-auto grid max-w-6xl justify-items-center gap-8 px-5 py-24 text-center md:grid-cols-2 md:items-center md:text-left">
      <HuntKrigla id="podne" size={22} className="bottom-8 left-3" />
      <div className="grid justify-items-center gap-4 md:justify-items-start">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Svaki dan u 12:00</span>
        <h2 className="font-display text-[clamp(40px,11vw,52px)] leading-[0.95] uppercase text-balance md:text-[clamp(56px,5.6vw,84px)]">
          {developed ? "Danas se razvilo" : "Danas se razvija"}
          <span className="text-accent">…</span>
        </h2>
        <p className="max-w-[34ch] text-[15px] text-soft text-pretty md:text-[17px]">
          {developed ? item.line : "Kao Film večeri: dok ne kucne podne, nitko ne vidi što je na fotki."}
        </p>
      </div>

      <figure className="relative w-[min(78vw,320px)] rotate-[-3deg] rounded-[4px] bg-[#f3f1ea] p-3 pb-14 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)]">
        <img
          src={`/img/podne-${item.id}.webp`}
          alt={developed ? item.cap : ""}
          width={600}
          height={750}
          loading="lazy"
          className="block aspect-[4/5] w-full object-cover"
          style={{
            filter: developed && seen ? "none" : "invert(1) sepia(0.6) contrast(0.8) brightness(0.55) blur(6px)",
            transition: "filter 2.6s ease 0.2s",
          }}
        />
        <figcaption className="absolute inset-x-3 bottom-3 flex items-end justify-between font-mono text-[11px] text-[#333]">
          <span>{developed ? item.cap : "Razvija se…"}</span>
          <span>{developed ? "sutra u 12 nova" : t ? `za ${leftText}` : "u 12:00"}</span>
        </figcaption>
      </figure>
    </section>
  );
}
