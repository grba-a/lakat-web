// TV način /admin/tv (Petar 11. 11.: „mora biti detaljniji; prazan je"): gust zid umjesto praznih ekrana.
// Lijevo sada (aktivni, radar, vani), sredina 30 dana s prošlim razdobljem i 7-dnevne pločice, desno
// fokus koji se izmjenjuje + uzbune, dolje telemetrija. Ista prijava kao /admin; samo zbrojevi.
import { notFound, redirect } from "next/navigation";
import { adminUkljucen, baza, dnevno, jesamLiAdmin, pregled } from "@/lib/admin";
import { ascPregled } from "@/lib/asc";
import { instagram } from "@/lib/instagram";
import { LAUNCH } from "@/lib/launch";
import { provjere } from "@/lib/upozorenja";
import { IGRE } from "../odjeljci";
import { Iskra } from "../ui";
import { Broj, Odbrojavanje, Radar } from "../zivo";
import { Fokus, Sat, TvOkvir } from "./vrtnja";

export const metadata = { title: "TV · LAKAT", robots: { index: false, follow: false } };

const broj = (n) => (n == null ? "—" : new Intl.NumberFormat("hr-HR").format(n));
const zarez = (n) => String(n ?? "—").replace(".", ",");
const LBL = "lbl text-[clamp(10px,0.75vw,16px)]";

function Ploca({ naslov, desno, children, className = "" }) {
  return (
    <section className={`tv-ploca flex min-h-0 flex-col gap-[1.2vh] p-[clamp(12px,1.1vw,24px)] ${className}`}>
      <header className="flex items-center justify-between gap-3">
        <h2 className={LBL}>{naslov}</h2>
        {desno && <span className={LBL}>{desno}</span>}
      </header>
      {children}
    </section>
  );
}

// 30 dana aktivnih, isprekidano = 30 dana prije. Os bez brojeva osim vrha i zadnje vrijednosti.
function Graf({ sad, prije }) {
  const W = 1000, H = 300;
  const max = Math.max(1, ...sad.map((d) => d.aktivni), ...prije.map((d) => d.aktivni));
  const put = (niz) => niz.map((d, k) => `${k ? "L" : "M"}${((k * W) / Math.max(1, niz.length - 1)).toFixed(1)},${(H - 8 - (d.aktivni / max) * (H - 24)).toFixed(1)}`).join(" ");
  const t = put(sad);
  const zadnji = sad.at(-1)?.aktivni ?? 0;
  return (
    <div className="relative min-h-[22vh] flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="none" role="img" aria-label="Aktivni po danu, 30 dana prema 30 prije">
        {[0.25, 0.5, 0.75].map((y) => (
          <line key={y} x1="0" x2={W} y1={H * y} y2={H * y} stroke="var(--a-line)" vectorEffect="non-scaling-stroke" />
        ))}
        {prije.length > 1 && <path d={put(prije)} fill="none" stroke="var(--a-mute)" strokeWidth="1.5" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />}
        {sad.length > 1 && <path d={`${t} L${W},${H} L0,${H} Z`} fill="color-mix(in srgb, var(--a-live) 12%, transparent)" />}
        {sad.length > 1 && <path className="crta" d={t} fill="none" stroke="var(--a-live)" strokeWidth="3" vectorEffect="non-scaling-stroke" pathLength="1" />}
      </svg>
      <span className={`${LBL} absolute left-0 top-0`}>vrh {broj(max)}</span>
      <span className="num up absolute right-0 top-0 text-[clamp(1.4rem,2.2vw,3rem)]">{broj(zadnji)}</span>
    </div>
  );
}

export default async function TvPage() {
  if (!adminUkljucen()) notFound();
  if (!(await jesamLiAdmin())) redirect("/admin");

  const danas = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zagreb" }).format(new Date());
  const od = new Date(Date.parse(`${danas}T12:00:00Z`) - 59 * 864e5).toISOString().slice(0, 10);
  const [pr, asc, bz, nz, ig] = await Promise.all([pregled(7), ascPregled(), baza(), dnevno(od, danas), instagram()]);
  const p = pr.podaci;
  const u = p?.ukupno ?? {};
  const k = p?.kpi ?? {};
  const uzbune = provjere({ pregled: pr, asc, baza: bz });
  const niz = nz.podaci ?? [];
  const sad = niz.slice(-30), prije = niz.slice(-60, -30);
  const zadnjih14 = (polje) => niz.slice(-14).map((d) => d[polje]);
  const pn = asc?.prednarudzbe;
  const igre = (p?.igre ?? []).filter((g) => IGRE[g.igra]).slice(0, 6);
  const najIgra = Math.max(1, igre[0]?.partije ?? 1);
  const b = bz?.podaci;

  const fokus = [
    {
      naslov: "Igre · partije 7 d",
      sadrzaj: (
        <ul className="flex flex-col gap-[1.1vh]">
          {igre.map((g, n) => (
            <li key={g.igra} className="grid grid-cols-[minmax(0,max-content)_minmax(4rem,1fr)_auto] items-center gap-3">
              <span className="mono truncate text-[clamp(12px,0.95vw,20px)] normal-case">{IGRE[g.igra]}</span>
              <span className="bar h-[1.4vh] rounded-full" style={{ width: `${Math.max(3, (g.partije / najIgra) * 100)}%`, "--i": n }} />
              <span className="num text-[clamp(1.2rem,1.8vw,2.6rem)]">{broj(g.partije)}</span>
            </li>
          ))}
          {igre.length === 0 && <li className="mono normal-case text-[color:var(--a-mute)]">Nema partija ovaj tjedan.</li>}
        </ul>
      ),
    },
    {
      naslov: "App Store",
      sadrzaj: (
        <div className="grid grid-cols-2 gap-[1.5vw]">
          <div>
            <p className={LBL}>Prednarudžbe</p>
            <p className="num up text-[clamp(2.4rem,4.5vw,6rem)]"><Broj v={pn?.ok ? broj(pn.ukupno - pn.otkazano) : "—"} /></p>
            {pn?.ok && <p className="mono text-[clamp(10px,0.8vw,16px)] normal-case text-[color:var(--a-mute)]">{broj(pn.ukupno)} naručilo · {broj(pn.otkazano)} otkazalo</p>}
          </div>
          <div>
            <p className={LBL}>Do izlaska</p>
            <Odbrojavanje cilj={LAUNCH} className="num block text-[clamp(1.6rem,2.6vw,3.6rem)]" />
            <p className="mono text-[clamp(10px,0.8vw,16px)] normal-case text-[color:var(--a-mute)]">1. 12. u podne</p>
          </div>
        </div>
      ),
    },
    {
      naslov: "Instagram @lakat_app",
      sadrzaj: ig?.profil ? (
        <div className="flex flex-col gap-[1.2vh]">
          <div className="flex items-end gap-[1.5vw]">
            <div>
              <p className={LBL}>Pratitelji</p>
              <p className="num up text-[clamp(2.4rem,4.5vw,6rem)]"><Broj v={broj(ig.profil.pratitelji)} /></p>
            </div>
            <div>
              <p className={LBL}>Objave</p>
              <p className="num text-[clamp(1.6rem,2.6vw,3.6rem)]">{broj(ig.profil.objave)}</p>
            </div>
          </div>
          <ul className="flex flex-col gap-1">
            {ig.objave.slice(0, 3).map((o) => (
              <li key={o.id} className="mono flex justify-between gap-3 text-[clamp(10px,0.8vw,16px)] normal-case text-[color:var(--a-mute)]">
                <span className="truncate">{o.vrsta} · {o.opis || "bez opisa"}</span>
                <span className="shrink-0 text-[color:var(--a-fg)]">♥ {broj(o.lajkovi)} · {broj(o.komentari)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mono normal-case text-[color:var(--a-mute)]">{ig?.greska ?? "Instagram nije spojen."}</p>
      ),
    },
  ];

  const telemetrija = [
    ["AKTIVNI DANAS", broj(u.aktivni_danas)],
    ["VANI SAD", broj(u.vani_sad)],
    ["PROFILI", broj(u.profili)],
    ["PAJDAŠTVA", broj(u.pajdastva)],
    ["iOS PUSH", broj(u.ios_push)],
    ["RUNDE 7D", broj(k.runde?.sad)],
    ["PARTIJE 7D", broj(k.partije?.sad)],
    ["PRIJAVE ČEKAJU", broj(p?.moderacija?.cekaju)],
    ["BAZA SPAJANJA", b ? `${b.spajanja}/${b.spajanja_max}` : "—"],
    ["CACHE", b?.cache_pct != null ? `${zarez(b.cache_pct)} %` : "—"],
    ["IG PRATITELJI", broj(ig?.profil?.pratitelji)],
  ];

  return (
    <TvOkvir sat={<Sat />}>
      <div className="grid flex-1 grid-cols-1 gap-[clamp(10px,0.9vw,20px)] px-[clamp(12px,1.6vw,32px)] py-[clamp(10px,1.4vh,24px)] lg:min-h-0 lg:grid-cols-[1fr_1.55fr_1.05fr]">
        {/* SADA */}
        <div className="flex min-h-0 flex-col gap-[clamp(10px,0.9vw,20px)]">
          <Ploca naslov={<><span className="live-dot mr-2 align-middle" aria-hidden="true" />Aktivni danas</>} desno={`${broj(u.profili)} profila`} className="flex-1">
            <div className="flex flex-1 items-center justify-between gap-4">
              <p className="num up text-[clamp(5rem,12vw,19rem)] leading-[0.85]"><Broj v={broj(u.aktivni_danas)} /></p>
              <Radar broj={u.vani_sad} velicina={220} />
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-[color:var(--a-line)] pt-[1.2vh]">
              <div>
                <p className={LBL}>Vani sad</p>
                <p className="num text-[clamp(2rem,3.4vw,4.5rem)]"><Broj v={broj(u.vani_sad)} /></p>
              </div>
              <div>
                <p className={LBL}>Prosjek 7 d</p>
                <p className="num text-[clamp(2rem,3.4vw,4.5rem)]">{zarez(k.dau?.sad)}</p>
              </div>
            </div>
          </Ploca>
          <Ploca naslov="Mreža">
            <div className="grid grid-cols-3 gap-3">
              {[["Pajdaštva", u.pajdastva], ["iOS push", u.ios_push], ["Prijave", p?.moderacija?.cekaju]].map(([t, v]) => (
                <div key={t}>
                  <p className={LBL}>{t}</p>
                  <p className="num text-[clamp(1.4rem,2.2vw,3rem)]">{broj(v)}</p>
                </div>
              ))}
            </div>
          </Ploca>
        </div>

        {/* TREND */}
        <div className="flex min-h-0 flex-col gap-[clamp(10px,0.9vw,20px)]">
          <Ploca naslov="Aktivni po danu · 30 d" desno="— sad   - - prije" className="flex-1">
            <Graf sad={sad} prije={prije} />
          </Ploca>
          <div className="grid grid-cols-2 gap-[clamp(10px,0.9vw,20px)] xl:grid-cols-4">
            {[["aktivni", "Aktivni 7 d", "aktivni"], ["runde", "Runde", "runde"], ["partije", "Partije", "partije"], ["pajdastva", "Pajdaštva", "pajdastva"]].map(([kl, t, polje]) => {
              const r = (k[kl]?.sad ?? 0) - (k[kl]?.prije ?? 0);
              return (
                <Ploca key={kl} naslov={t}>
                  <p className="num text-[clamp(2rem,3vw,4.2rem)]"><Broj v={broj(k[kl]?.sad)} /></p>
                  <div className="flex items-end justify-between gap-2">
                    <span className={`mono text-[clamp(11px,0.85vw,17px)] ${r >= 0 ? "up" : "down"}`}>{r >= 0 ? "▲ +" : "▼ −"}{broj(Math.abs(r))}</span>
                    <Iskra niz={zadnjih14(polje)} oznaka={t} />
                  </div>
                </Ploca>
              );
            })}
          </div>
        </div>

        {/* FOKUS + UZBUNE */}
        <div className="flex min-h-0 flex-col gap-[clamp(10px,0.9vw,20px)]">
          <Fokus ploce={fokus} />
          <Ploca naslov="Dnevnik · 7 d" desno="aktivni · runde · partije">
            <ul className="mono flex flex-col text-[clamp(11px,0.85vw,17px)] tabular-nums">
              {niz.slice(-7).reverse().map((d, n) => (
                <li key={d.dan} className={`grid grid-cols-[1fr_repeat(3,5ch)] gap-2 border-b border-[color:var(--a-line)] py-[0.5vh] last:border-0 ${n ? "text-[color:var(--a-mute)]" : ""}`}>
                  <span>{n ? `${d.dan.slice(8, 10)}. ${d.dan.slice(5, 7)}.` : "> danas"}</span>
                  <span className={`text-right ${n ? "" : "up"}`}>{d.aktivni}</span>
                  <span className="text-right">{d.runde}</span>
                  <span className="text-right">{d.partije}</span>
                </li>
              ))}
            </ul>
          </Ploca>
          <Ploca naslov="Stanje sustava" desno={uzbune.length ? `${uzbune.length} uzbun${uzbune.length === 1 ? "a" : uzbune.length < 5 ? "e" : "a"}` : "OK"} className="flex-1">
            {uzbune.length === 0 ? (
              <p className="num up text-[clamp(2rem,3.4vw,4.5rem)]">Sve radi.</p>
            ) : (
              <ul className="flex min-h-0 flex-col gap-[1vh] overflow-hidden">
                {uzbune.slice(0, 4).map((x) => {
                  const boja = x.razina === "kriticno" ? "var(--a-alarm)" : x.razina === "vazno" ? "var(--a-warn)" : "var(--a-mute)";
                  return (
                    <li key={x.kljuc} className="rounded-[var(--r-sm)] border-l-2 bg-black/30 px-3 py-2" style={{ borderColor: boja }}>
                      <p className="mono text-[clamp(10px,0.75vw,15px)] font-bold" style={{ color: boja }}>
                        !! {x.razina === "kriticno" ? "KRITIČNO" : x.razina === "vazno" ? "VAŽNO" : "INFO"}
                      </p>
                      <p className="num text-[clamp(1.1rem,1.6vw,2.2rem)]">{x.naslov}</p>
                      <p className="mono text-[clamp(10px,0.8vw,16px)] normal-case text-[color:var(--a-mute)]">{x.detalj}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </Ploca>
        </div>
      </div>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((kopija) => (
            <div key={kopija} className="flex">
              {telemetrija.map(([oz, v]) => (
                <span key={oz} className="ticker-item mono text-[clamp(11px,0.8vw,16px)] text-[color:var(--a-mute)]">
                  {oz} <span className="text-[color:var(--a-fg)]">{v}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </TvOkvir>
  );
}
