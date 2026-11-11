// Zajednički dijelovi /admin ploče (server komponente, bez biblioteka).
import { Punct } from "@/components/brand";

export const broj = (n) => (n == null ? "—" : new Intl.NumberFormat("hr-HR").format(n));
export const posto = (a, b) => (b ? `${Math.round((a / b) * 100)} %` : "—");
export const MJ = ["sij", "velj", "ožu", "tra", "svi", "lip", "srp", "kol", "ruj", "lis", "stu", "pro"];
// Datumi se slažu ručno, ne preko Intl: Node i Safari imaju različit ICU za hrvatski (hydration #418).
export const datum = (iso) => {
  const [g, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  return g ? `${d}. ${m}.` : "—";
};
export const vrijeme = (iso) => {
  const d = new Date(iso);
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", hour: "2-digit", minute: "2-digit", day: "numeric", month: "numeric" }).formatToParts(d);
  const v = Object.fromEntries(p.map((x) => [x.type, x.value]));
  return `${v.day}. ${MJ[Number(v.month) - 1]} u ${v.hour}:${v.minute}`;
};

export function Upozorenje({ children }) {
  return <p className="rounded-xl border border-amber/40 bg-amber/5 px-4 py-3 text-sm text-amber">{children}</p>;
}

export function Naslov({ children, pod }) {
  return (
    <div>
      <h2 className="font-display text-3xl uppercase leading-none">
        <Punct>{children}</Punct>
      </h2>
      {pod && <p className="mt-1.5 text-sm text-muted">{pod}</p>}
    </div>
  );
}

export function Plocica({ oznaka, vrijednost, ispod, ton, mala }) {
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-surface px-4 py-3.5">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted">{oznaka}</p>
      <p className={`mt-1 font-display leading-none tabular-nums ${mala ? "text-2xl" : "text-4xl"} ${ton ?? "text-fg"}`}>{vrijednost}</p>
      {ispod && <p className="mt-1.5 text-xs text-muted tabular-nums">{ispod}</p>}
    </div>
  );
}

export function Kartica({ naslov, pod, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-line bg-surface p-4">
      <h3 className="font-bold">{naslov}</h3>
      {pod && <p className="mt-0.5 text-xs text-muted">{pod}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

// Stupci po danu, crtani na serveru: bez biblioteke, širi se s karticom (viewBox + 100 %).
export function Trake({ redovi }) {
  const max = Math.max(1, ...redovi.map((r) => r.v));
  return (
    <ul className="flex flex-col gap-2">
      {redovi.map((r) => (
        <li key={r.k} className="grid grid-cols-[minmax(0,8.5rem)_1fr] items-center gap-3 text-sm">
          <span className="truncate text-soft">{r.k}</span>
          <span className="flex min-w-0 items-center gap-2">
            <span className="h-3 rounded-sm bg-accent" style={{ width: `${Math.max(2, (r.v / max) * 70)}%` }} />
            <span className="shrink-0 tabular-nums text-muted">
              {broj(r.v)}
              {r.n ? <span className="text-muted/70"> · {r.n}</span> : null}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Stupci({ redovi, polje, oznaka }) {
  const W = 360, H = 150, L = 24, B = 18;
  const max = Math.max(1, ...redovi.map((r) => r[polje]));
  const korak = Math.max(1, Math.ceil(max / 4));
  const vrh = korak * 4;
  const sir = (W - L) / redovi.length;
  const y = (v) => H - B - ((H - B - 8) * v) / vrh;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${oznaka} po danu, zadnjih ${redovi.length} dana`} className="block">
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <line x1={L} x2={W} y1={y(i * korak)} y2={y(i * korak)} stroke="var(--color-line)" strokeWidth="1" />
          <text x={L - 6} y={y(i * korak)} dy="0.32em" textAnchor="end" fontSize="11" fill="var(--color-muted)">
            {i * korak}
          </text>
        </g>
      ))}
      {redovi.map((r, i) => {
        const zadnji = i === redovi.length - 1;
        return (
          <g key={r.dan}>
            <rect
              x={L + i * sir + sir * 0.15}
              width={sir * 0.7}
              y={y(r[polje])}
              height={Math.max(0, H - B - y(r[polje]))}
              rx="2"
              fill="var(--color-accent)"
              opacity={zadnji ? 1 : 0.55}
            >
              <title>{`${datum(r.dan)}: ${r[polje]}`}</title>
            </rect>
            {(redovi.length - 1 - i) % 7 === 0 && (
              <text x={zadnji ? W : L + i * sir + sir / 2} y={H - 5} textAnchor={zadnji ? "end" : "middle"} fontSize="11" fill="var(--color-muted)">
                {datum(r.dan)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
