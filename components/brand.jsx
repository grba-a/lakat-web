// Brend interpunkcija: završna . ! ? … u display fontu je zelena (kao app/brand-punct.jsx u aplikaciji).
export function Punct({ children }) {
  const text = String(children);
  const m = text.match(/^(.*?)([.!?…]+)$/s);
  if (!m) return text;
  return (
    <>
      {m[1]}
      <span className="text-accent">{m[2]}</span>
    </>
  );
}

// Krigla u oblačiću: maskota je glas stranice (sekcija funkcije, varijanta C).
export function KriglaSays({ children, size = 48, className = "" }) {
  return (
    <div className={`flex items-end gap-2.5 ${className}`}>
      <img src="/img/krigla-lik-128.webp" alt="" width={size} height={size} className="shrink-0 object-contain" style={{ width: size, height: size }} loading="lazy" />
      <p className="relative rounded-[18px] rounded-bl-md border border-line bg-surface-2 px-3.5 py-2.5 text-left text-[14px] leading-snug text-fg md:text-[15px]">
        {children}
      </p>
    </div>
  );
}
