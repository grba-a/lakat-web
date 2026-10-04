"use client";

import { useEffect, useRef, useState } from "react";
import { play } from "@/lib/sfx";

// „Pitaš se?“ kao chat (Petar, 2026-10-04): tapneš predloženo pitanje, ono ode kao
// tvoja poruka, Krigla „tipka“ pa ispiše odgovor. Samo potvrđene činjenice.
const OPENER = "Pitaj me nešto. Ne grizem.";
const OUTRO = "To je sve što smijem reći. Ostalo piši na support@laktarenje.com.";

function Avatar() {
  return <img src="/img/krigla-lik.webp" alt="" width={36} height={36} className="size-9 shrink-0 object-contain" />;
}

function KriglaBubble({ text, typing, reduce }) {
  const [shown, setShown] = useState(reduce ? text.length : 0);
  useEffect(() => {
    if (typing || reduce) return;
    // Ispis slovo po slovo, brže za dulje odgovore da nijedan ne traje dulje od ~1,3 s.
    const step = Math.max(12, Math.min(28, 1300 / text.length));
    const id = setInterval(() => {
      setShown((n) => {
        if (n >= text.length) {
          clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, step);
    return () => clearInterval(id);
  }, [typing, reduce, text]);

  return (
    <div className="chat-in flex max-w-[88%] items-end gap-2.5">
      <Avatar />
      <p className="relative min-h-[42px] rounded-[18px] rounded-bl-md border border-line bg-surface-2 px-3.5 py-2.5 text-left text-[15px] leading-snug">
        {typing ? (
          <span className="flex h-[21px] items-center gap-1" aria-label="Krigla piše">
            <i className="typing-dot" />
            <i className="typing-dot [animation-delay:.15s]" />
            <i className="typing-dot [animation-delay:.3s]" />
          </span>
        ) : (
          <>
            <span aria-hidden="true">{text.slice(0, shown)}</span>
            <span className="sr-only">{text}</span>
          </>
        )}
      </p>
    </div>
  );
}

export function FaqChat({ items }) {
  const [log, setLog] = useState([]); // [{q, a, typing}]
  const [busy, setBusy] = useState(false);
  const [reduce, setReduce] = useState(false);
  const end = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    mq.addEventListener("change", sync);
    sync();
    return () => mq.removeEventListener("change", sync);
  }, []);

  const asked = new Set(log.map((m) => m.q));
  const left = items.filter(([q]) => !asked.has(q));
  const done = left.length === 0 && !busy;

  function ask(q, a) {
    if (busy) return;
    setBusy(true);
    play("zvecka");
    setLog((l) => [...l, { q, a, typing: true }]);
    const wait = reduce ? 0 : 650 + Math.min(700, a.length * 8);
    setTimeout(() => {
      setLog((l) => l.map((m) => (m.q === q ? { ...m, typing: false } : m)));
      setBusy(false);
    }, wait);
  }

  useEffect(() => {
    if (!log.length) return;
    end.current?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [log, reduce]);

  return (
    <div className="grid gap-3" aria-live="polite">
      <KriglaBubble text={OPENER} typing={false} reduce />
      {log.map((m) => (
        <div key={m.q} className="grid gap-3">
          <p className="chat-in max-w-[80%] justify-self-end rounded-[18px] rounded-br-md bg-accent px-4 py-2.5 text-[15px] font-semibold text-[#052e16]">
            {m.q}
          </p>
          <KriglaBubble text={m.a} typing={m.typing} reduce={reduce} />
        </div>
      ))}
      {done && <KriglaBubble text={OUTRO} typing={false} reduce={reduce} />}

      <div ref={end} className="flex flex-wrap justify-end gap-2 pt-3 scroll-mb-28">
        {left.map(([q, a]) => (
          <button
            key={q}
            type="button"
            onClick={() => ask(q, a)}
            disabled={busy}
            className="min-h-[44px] rounded-full border border-accent/50 px-4 text-[14px] font-semibold text-accent transition-[background-color,opacity] hover:bg-accent/10 active:scale-[0.98] disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
