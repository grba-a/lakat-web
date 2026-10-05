"use client";

import Link from "next/link";
import { useState } from "react";
import { INSTAGRAM } from "@/lib/launch";
import { shareLakat } from "@/lib/share";

export function ConfirmedActions({ refKod }) {
  const [shared, setShared] = useState("");
  return (
    <div className="grid gap-3">
      <p className="text-[15px] font-semibold text-soft">LAKAT bez ekipe je prazna karta.</p>
      <button
        type="button"
        onClick={async () => setShared(await shareLakat(refKod))}
        className="min-h-[52px] rounded-full bg-accent text-[16px] font-bold text-[#052e16] active:scale-[0.98]"
      >
        {shared === "copied" ? "Link kopiran" : "Pošalji ekipi"}
      </button>
      <div className="flex flex-wrap gap-2">
        <a href="/api/kalendar" className="inline-flex min-h-[44px] items-center rounded-full border border-line px-4 text-[14px] font-semibold">
          Dodaj u kalendar
        </a>
        <a href={INSTAGRAM} target="_blank" rel="noopener" className="inline-flex min-h-[44px] items-center rounded-full border border-line px-4 text-[14px] font-semibold">
          @lakat_app
        </a>
        <Link href="/" className="inline-flex min-h-[44px] items-center px-2 text-[14px] text-muted underline underline-offset-4">
          Odbrojavanje
        </Link>
      </div>
    </div>
  );
}
