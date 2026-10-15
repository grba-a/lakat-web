// „Pitaš se?“ kao chat (Petar, 2026-10-04), sad bez JS-a (faq-u-html): svako pitanje je <details>,
// pa su odgovori u HTML-u za tražilice i AI, a tap i dalje izgleda kao poruka kojoj Krigla odgovara.
// Prvi odgovor je otvoren (j-faq-praznine).
const OPENER = "Pitaj me nešto. Ne grizem.";
const OUTRO = "Ostalo piši na support@laktarenje.com.";

function Avatar() {
  return <img src="/img/krigla-lik-128.webp" alt="" width={36} height={36} loading="lazy" className="size-9 shrink-0 object-contain" />;
}

function KriglaBubble({ children }) {
  return (
    <div className="flex max-w-[88%] items-end gap-2.5">
      <Avatar />
      <p className="rounded-[18px] rounded-bl-md border border-line bg-surface-2 px-3.5 py-2.5 text-left text-[15px] leading-snug">{children}</p>
    </div>
  );
}

export function FaqChat({ items }) {
  return (
    <div className="grid gap-3">
      <KriglaBubble>{OPENER}</KriglaBubble>
      {items.map(([q, a], i) => (
        <details key={q} className="faq group grid" open={i === 0}>
          <summary className="ml-auto w-fit max-w-[85%] cursor-pointer list-none rounded-[18px] border border-accent/50 px-4 py-2.5 text-[15px] font-semibold text-accent transition-[background-color,color] duration-200 hover:bg-accent/10 group-open:rounded-br-md group-open:bg-accent group-open:text-[#052e16] [&::-webkit-details-marker]:hidden">
            {q}
          </summary>
          <div className="chat-in mt-3">
            <KriglaBubble>{a}</KriglaBubble>
          </div>
        </details>
      ))}
      <p className="pt-2 text-[14px] text-muted">
        {OUTRO.split("support@laktarenje.com")[0]}
        <a href="mailto:support@laktarenje.com" className="font-semibold text-soft underline underline-offset-2">
          support@laktarenje.com
        </a>
      </p>
    </div>
  );
}
