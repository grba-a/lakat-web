"use client";

import { useEffect, useRef, useState } from "react";
import { Phone } from "./phone";

// Promo film u mobitelu (varijanta A). Vrti se bez zvuka dok je na ekranu,
// tap pali zvuk. Učitava se tek kad se približi ekranu.
export function PromoVideo() {
  const video = useRef(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (v.preload !== "auto") v.preload = "auto";
          v.play().catch(() => {});
        } else v.pause();
      },
      { rootMargin: "200px 0px", threshold: 0.2 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  function toggle() {
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) v.play().catch(() => {});
  }

  return (
    <button type="button" onClick={toggle} className="group relative block">
      <Phone width="clamp(220px, 64vw, 300px)">
        <video
          ref={video}
          src="/video/najava.mp4"
          poster="/video/poster.jpg"
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full bg-black object-contain"
        />
        {/* Film je 9:16, a ekran uži: cijeli kadar stoji unutra, a crne trake gore i dolje
            postaju dio playera umjesto da rubovi filma bježe s ekrana (Petar, 2026-10-05). */}
        <span aria-hidden="true" className="absolute inset-x-0 top-[5%] z-[2] text-center font-mono tracking-[0.16em] text-muted uppercase" style={{ fontSize: "calc(var(--w) * 0.036)" }}>
          LAKAT<span className="text-accent">.</span> · najava · 0:49
        </span>
      </Phone>
      <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-2 text-[13px] font-bold whitespace-nowrap text-[#052e16] shadow-lg">
        {muted ? "Pusti zvuk" : "Ugasi zvuk"}
      </span>
    </button>
  );
}
