// Zajednički dijelovi /admin ploče: Tactical Telemetry (tvrda mreža, monospace oznake, Anton brojevi).
// Server komponente; jedini klijentski dio je <Broj> koji odbroji vrijednost.
import { Broj } from "./zivo";

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
  return `${v.day}. ${MJ[Number(v.month) - 1]} ${v.hour}:${v.minute}`;
};

export function Upozorenje({ children }) {
  return (
    <p className="mono boot border border-[color:var(--a-warn)] px-4 py-3 text-[12px] text-[color:var(--a-warn)]">
      <span className="mr-2">!!</span>
      {children}
    </p>
  );
}

// Naslov odjeljka: rub u boji skupine, [ 02 ] + znak, Anton naslov, golemi obrisni broj desno (Codex 11. 11.).
export function Naslov({ children, pod, broj: rb, znak }) {
  const ime = String(children).replace(/\.$/, "");
  return (
    <div className="cross boot flex items-end justify-between gap-4 border-t border-[color:var(--a-line)] pt-5">
      <div className="min-w-0 border-l-[3px] pl-3" style={{ borderColor: "var(--odj, var(--a-line))" }}>
        <p className="lbl">
          <span className="znak">{znak ?? "—"}</span> [ {rb ?? "—"} ] {"///"} {ime}
        </p>
        <h2 className="num mt-1.5 text-[clamp(2.1rem,8vw,3.6rem)] uppercase">
          {ime}
          <span className="up">.</span>
        </h2>
        {pod && <p className="mono mt-2 max-w-[70ch] text-[11.5px] leading-relaxed text-[color:var(--a-mute)] normal-case tracking-[0.03em]">{pod}</p>}
      </div>
      <span className="obris num shrink-0 text-[clamp(3.6rem,12vw,6.5rem)] leading-none" aria-hidden="true">
        {rb}
      </span>
    </div>
  );
}

// Mini graf (sparkline): fiksne veličine, bez osi; zadnja točka naglašena. Prazan niz = ništa.
export function Iskra({ niz, oznaka }) {
  const v = (niz ?? []).map((x) => Number(x) || 0);
  if (v.length < 2) return null;
  const W = 76, H = 24;
  const max = Math.max(1, ...v);
  const t = v.map((x, k) => [(k * (W - 4)) / (v.length - 1) + 2, H - 3 - (x / max) * (H - 6)]);
  const [lx, ly] = t[t.length - 1];
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0" role="img" aria-label={`${oznaka}: trend zadnjih ${v.length} dana`}>
      <polyline points={t.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")} fill="none" stroke="var(--a-fg)" strokeOpacity="0.7" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x={lx - 2} y={ly - 2} width="4" height="4" fill="var(--a-live)" />
    </svg>
  );
}

export function Plocica({ oznaka, vrijednost, ispod, ton, mala, i = 0, trend }) {
  return (
    <div className="boot flex min-w-0 flex-col gap-2 px-3.5 py-3.5" style={{ "--i": i }}>
      <p className="lbl truncate">{oznaka}</p>
      <div className="flex items-end justify-between gap-2">
        <p className={`num ${mala ? "text-[1.7rem]" : "text-[clamp(2.4rem,9vw,3.4rem)]"} ${ton ?? ""}`}>
          <Broj v={vrijednost} />
        </p>
        {trend && <Iskra niz={trend} oznaka={oznaka} />}
      </div>
      {ispod && <p className="mono text-[10.5px] normal-case tracking-[0.04em] text-[color:var(--a-mute)]">{ispod}</p>}
    </div>
  );
}

// Mreža pločica s linijama od 1px.
export function Plocice({ children, stupaca = 4 }) {
  return <div className={`grid-lines grid-cols-2 ${stupaca === 4 ? "md:grid-cols-4" : stupaca === 3 ? "md:grid-cols-3" : ""}`}>{children}</div>;
}

export function Kartica({ naslov, pod, children, id }) {
  return (
    <section id={id} className="panel boot min-w-0">
      <header className="flex items-baseline justify-between gap-3 border-b border-[color:var(--a-line)] px-3.5 py-2.5">
        <h3 className="mono text-[12px] font-bold text-[color:var(--a-fg)]">{naslov}</h3>
        <span className="lbl shrink-0" aria-hidden="true">
          {">>>"}
        </span>
      </header>
      {pod && <p className="mono px-3.5 pt-2.5 text-[10.5px] normal-case leading-relaxed tracking-[0.03em] text-[color:var(--a-mute)]">{pod}</p>}
      <div className="p-3.5">{children}</div>
    </section>
  );
}

export function Trake({ redovi }) {
  const max = Math.max(1, ...redovi.map((r) => r.v));
  return (
    <ul className="flex flex-col">
      {redovi.map((r, i) => (
        <li
          key={`${r.k}-${i}`}
          tabIndex={0}
          data-tip={`${r.k}: ${broj(r.v)}${r.n ? ` · ${r.n}` : ""}`}
          className="row grid grid-cols-[minmax(0,8.5rem)_1fr] items-center gap-3 border-b border-[color:var(--a-line)] py-1.5 outline-none last:border-0 focus-visible:bg-[#161a17]"
        >
          <span className="mono truncate text-[11px] text-[color:var(--a-fg)] normal-case tracking-[0.03em]">{r.k}</span>
          <span className="flex min-w-0 items-center gap-2">
            <span className={`bar ${i ? "dim" : ""}`} style={{ width: `${Math.max(2, (r.v / max) * 68)}%`, "--i": i }} />
            <span className="mono shrink-0 text-[11px] tabular-nums text-[color:var(--a-fg)]">
              {broj(r.v)}
              {r.n ? <span className="text-[color:var(--a-mute)]"> · {r.n}</span> : null}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

// Stupci po danu, crtani na serveru: bez biblioteke, širi se s karticom (viewBox + 100 %).
export function Stupci({ redovi, polje, oznaka }) {
  const W = 360, H = 150, L = 24, B = 18;
  const max = Math.max(1, ...redovi.map((r) => r[polje]));
  const korak = Math.max(1, Math.ceil(max / 4));
  const vrh = korak * 4;
  const sir = (W - L) / redovi.length;
  const y = (v) => H - B - ((H - B - 8) * v) / vrh;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${oznaka} po danu, zadnjih ${redovi.length} dana`} className="block" style={{ fontFamily: "var(--a-mono)" }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <line x1={L} x2={W} y1={y(i * korak)} y2={y(i * korak)} stroke="var(--a-line)" strokeWidth="1" strokeDasharray={i ? "2 3" : undefined} />
          <text x={L - 5} y={y(i * korak)} dy="0.32em" textAnchor="end" fontSize="9" fill="var(--a-mute)">
            {i * korak}
          </text>
        </g>
      ))}
      {redovi.map((r, i) => {
        const zadnji = i === redovi.length - 1;
        return (
          <g key={r.dan}>
            <rect
              className="colbar"
              style={{ "--i": i }}
              x={L + i * sir + sir * 0.12}
              width={sir * 0.76}
              y={y(r[polje])}
              height={Math.max(0, H - B - y(r[polje]))}
              fill={zadnji ? "var(--a-live)" : "color-mix(in srgb, var(--a-live) 45%, transparent)"}
            >
            </rect>
            <rect
              x={L + i * sir}
              width={sir}
              y={8}
              height={H - B - 8}
              fill="transparent"
              tabIndex={0}
              data-tip={`${datum(r.dan)} · ${oznaka}: ${broj(r[polje])}`}
              aria-label={`${datum(r.dan)}: ${r[polje]}`}
              className="outline-none focus:fill-[color:var(--a-line)]"
            />
            {(redovi.length - 1 - i) % 7 === 0 && (
              <text x={zadnji ? W : L + i * sir + sir / 2} y={H - 4} textAnchor={zadnji ? "end" : "middle"} fontSize="9" fill="var(--a-mute)">
                {datum(r.dan)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
