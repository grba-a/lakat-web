// TV način /admin/tv (Petar 11. 11.): ključne brojke i uzbune preko cijelog ekrana, sami se izmjenjuju.
// Ista prijava kao /admin; bez nje preusmjerava na prijavu. Samo zbrojevi.
import { notFound, redirect } from "next/navigation";
import { adminUkljucen, baza, dnevno, jesamLiAdmin, pregled } from "@/lib/admin";
import { ascPregled } from "@/lib/asc";
import { provjere } from "@/lib/upozorenja";
import { IGRE } from "../odjeljci";
import { Broj } from "../zivo";
import { Vrtnja } from "./vrtnja";

export const metadata = { title: "TV · LAKAT", robots: { index: false, follow: false } };

const broj = (n) => (n == null ? "—" : new Intl.NumberFormat("hr-HR").format(n));
const zarez = (n) => String(n ?? "—").replace(".", ",");

function Golemo({ oznaka, v, ton, ispod }) {
  return (
    <div className="flex min-w-0 flex-col gap-[1vh]">
      <p className="lbl text-[clamp(11px,1.2vw,18px)]">{oznaka}</p>
      <p className={`num text-[clamp(4rem,14vw,16rem)] ${ton ?? ""}`}>
        <Broj v={v} />
      </p>
      {ispod && <p className="mono text-[clamp(11px,1.1vw,18px)] normal-case text-[color:var(--a-mute)]">{ispod}</p>}
    </div>
  );
}

function Crta({ niz }) {
  const W = 1000, H = 300;
  const max = Math.max(1, ...niz.map((d) => d.aktivni));
  const t = niz.map((d, k) => `${k ? "L" : "M"}${((k * W) / Math.max(1, niz.length - 1)).toFixed(1)},${(H - 10 - (d.aktivni / max) * (H - 20)).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[45vh] w-full" preserveAspectRatio="none" aria-label="Aktivni po danu" role="img">
      <path d={`${t} L${W},${H} L0,${H} Z`} fill="color-mix(in srgb, var(--a-live) 12%, transparent)" />
      <path className="crta" d={t} fill="none" stroke="var(--a-live)" strokeWidth="3" vectorEffect="non-scaling-stroke" pathLength="1" />
    </svg>
  );
}

export default async function TvPage() {
  if (!adminUkljucen()) notFound();
  if (!(await jesamLiAdmin())) redirect("/admin");

  const danas = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zagreb" }).format(new Date());
  const od = new Date(Date.parse(`${danas}T12:00:00Z`) - 29 * 864e5).toISOString().slice(0, 10);
  const [pr, asc, bz, nz] = await Promise.all([pregled(7), ascPregled(), baza(), dnevno(od, danas)]);
  const p = pr.podaci;
  const uzbune = provjere({ pregled: pr, asc, baza: bz });
  const k = p?.kpi ?? {};
  const pn = asc?.prednarudzbe;

  const ekrani = [
    <div key="sad" className="grid grid-cols-1 gap-[4vw] md:grid-cols-[2fr_1fr]">
      <Golemo oznaka="● Aktivni danas" v={broj(p?.ukupno?.aktivni_danas)} ton="up" ispod={`${broj(p?.ukupno?.profili)} profila ukupno`} />
      <Golemo oznaka="Vani sad" v={broj(p?.ukupno?.vani_sad)} ispod="„Vani sam“ upaljen" />
    </div>,
    <div key="tjedan" className="flex flex-col gap-[3vh]">
      <p className="lbl text-[clamp(11px,1.2vw,18px)]">Zadnjih 7 dana prema 7 prije</p>
      <div className="grid grid-cols-2 gap-[3vw] lg:grid-cols-4">
        {[["aktivni", "Aktivni"], ["runde", "Runde"], ["partije", "Partije"], ["pajdastva", "Pajdaštva"]].map(([key, t]) => {
          const r = (k[key]?.sad ?? 0) - (k[key]?.prije ?? 0);
          return (
            <div key={key} className="flex flex-col gap-[1vh]">
              <p className="lbl text-[clamp(11px,1.1vw,16px)]">{t}</p>
              <p className="num text-[clamp(3rem,8vw,9rem)]"><Broj v={broj(k[key]?.sad)} /></p>
              <p className={`mono text-[clamp(11px,1.1vw,18px)] ${r >= 0 ? "up" : "down"}`}>{r >= 0 ? "▲ +" : "▼ −"}{broj(Math.abs(r))}</p>
            </div>
          );
        })}
      </div>
    </div>,
    <div key="graf" className="flex flex-col gap-[2vh]">
      <p className="lbl text-[clamp(11px,1.2vw,18px)]">Aktivni po danu · 30 dana · zadnjih 7 d prosječno {zarez(k.dau?.sad)} / dan</p>
      <Crta niz={nz.podaci ?? []} />
    </div>,
    <div key="uzbune" className="flex flex-col gap-[2vh]">
      <p className="lbl text-[clamp(11px,1.2vw,18px)]">Stanje sustava</p>
      {uzbune.length === 0 ? (
        <p className="num up text-[clamp(3rem,10vw,10rem)]">Sve radi.</p>
      ) : (
        uzbune.map((u) => (
          <div key={u.kljuc} className="flex flex-col gap-[0.5vh]">
            <p className="mono text-[clamp(12px,1.3vw,20px)] font-bold" style={{ color: u.razina === "kriticno" ? "var(--a-alarm)" : u.razina === "vazno" ? "var(--a-warn)" : "var(--a-mute)" }}>
              !! {u.razina === "kriticno" ? "KRITIČNO" : u.razina === "vazno" ? "VAŽNO" : "INFO"}
            </p>
            <p className="num text-[clamp(2rem,5vw,5rem)]">{u.naslov}</p>
            <p className="mono text-[clamp(12px,1.3vw,20px)] normal-case text-[color:var(--a-mute)]">{u.detalj}</p>
          </div>
        ))
      )}
    </div>,
    <div key="igre" className="flex flex-col gap-[2vh]">
      <p className="lbl text-[clamp(11px,1.2vw,18px)]">Igre · partije u 7 dana</p>
      {(p?.igre ?? []).filter((g) => IGRE[g.igra]).slice(0, 5).map((g, n, arr) => (
        <div key={g.igra} className="flex items-center gap-[2vw]">
          <span className="mono w-[28vw] truncate text-[clamp(14px,2vw,32px)] normal-case">{IGRE[g.igra]}</span>
          <span className="bar h-[2.2vh]" style={{ width: `${Math.max(2, (g.partije / Math.max(1, arr[0].partije)) * 50)}vw`, "--i": n }} />
          <span className="num text-[clamp(1.5rem,3vw,3.5rem)]">{broj(g.partije)}</span>
        </div>
      ))}
    </div>,
    <div key="trgovina" className="grid grid-cols-1 gap-[4vw] md:grid-cols-2">
      <Golemo oznaka="Prednarudžbe" v={pn?.ok ? broj(pn.ukupno - pn.otkazano) : "—"} ton="up" ispod={pn?.ok ? `${broj(pn.ukupno)} naručilo · ${broj(pn.otkazano)} otkazalo` : null} />
      <Golemo oznaka="Izlazak na App Store" v={String(Math.max(0, Math.round((Date.parse("2026-12-01T00:00:00Z") - Date.parse(`${danas}T00:00:00Z`)) / 864e5)))} ispod="dana do 1. 12. 2026." />
    </div>,
  ];

  return <Vrtnja ekrani={ekrani} />;
}
