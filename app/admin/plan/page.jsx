// /admin/plan (Petar 18. 11.: „po danima kao kalendar za svaki mjesec, klikabilno; 30 dana, 7 dana, dan; kao Google kalendar“).
// Prikazi: ?v=mjesec|tjedan|dan i ?d=GGGG-MM-DD. Kartice stoje na svom datumu (zaostale su crveno označene), bez datuma = popis sa strane.
// Ista prijava kao /admin; kartice iz admin_plan (docs/supabase-admin15.sql).
import { notFound, redirect } from "next/navigation";
import { adminUkljucen, jesamLiAdmin } from "@/lib/admin";
import { LAUNCH } from "@/lib/launch";
import { REDOVI, planKartice } from "@/lib/plan";
import { Odbrojavanje } from "../zivo";
import { Sat, TvOkvir } from "../tv/vrtnja";
import { Kalendar } from "./kalendar";

export const metadata = { title: "Plan · LAKAT", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const MJ = ["siječanj", "veljača", "ožujak", "travanj", "svibanj", "lipanj", "srpanj", "kolovoz", "rujan", "listopad", "studeni", "prosinac"];
const MJ_GEN = ["siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja", "srpnja", "kolovoza", "rujna", "listopada", "studenoga", "prosinca"];
const DANI = ["nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"];
const DAN = 864e5;
const iso = (t) => new Date(t).toISOString().slice(0, 10);
const t12 = (d) => Date.parse(`${d}T12:00:00Z`);
// Samo stvaran datum između 2020. i 2100. (Codex 18. 11.: 2026-13-01 je rušio stranicu, 0099 je postajao 1999).
const praviDan = (v) => {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const god = Number(v.slice(0, 4)), t = t12(v);
  return god >= 2020 && god <= 2100 && Number.isFinite(t) && iso(t) === v;
};
const ponedjeljak = (t) => t - ((new Date(t).getUTCDay() + 6) % 7) * DAN;

export default async function PlanPage({ searchParams }) {
  if (!adminUkljucen()) notFound();
  if (!(await jesamLiAdmin())) redirect("/admin");

  const sp = (await searchParams) ?? {};
  const danas = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zagreb" }).format(new Date());
  const v = ["mjesec", "tjedan", "dan"].includes(sp.v) ? sp.v : "mjesec";
  const d = praviDan(sp.d) ? sp.d : danas;
  const td = t12(d);
  const dt = new Date(td);

  // Raspon prikaza, naslov i susjedni datumi za ‹ ›.
  let od, doo, naslov, prije, poslije;
  if (v === "mjesec") {
    const prvi = Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), 1, 12);
    const zadnji = Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 0, 12);
    od = ponedjeljak(prvi);
    doo = ponedjeljak(zadnji) + 6 * DAN;
    naslov = `${MJ[dt.getUTCMonth()]} ${dt.getUTCFullYear()}.`;
    prije = iso(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() - 1, 1, 12));
    poslije = iso(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 1, 12));
  } else if (v === "tjedan") {
    od = ponedjeljak(td);
    doo = od + 6 * DAN;
    const a = new Date(od), b = new Date(doo);
    naslov = a.getUTCMonth() === b.getUTCMonth() ? `${a.getUTCDate()}.–${b.getUTCDate()}. ${MJ_GEN[b.getUTCMonth()]}` : `${a.getUTCDate()}. ${MJ_GEN[a.getUTCMonth()]} – ${b.getUTCDate()}. ${MJ_GEN[b.getUTCMonth()]}`;
    prije = iso(td - 7 * DAN);
    poslije = iso(td + 7 * DAN);
  } else {
    od = doo = td;
    naslov = `${DANI[dt.getUTCDay()]}, ${dt.getUTCDate()}. ${MJ_GEN[dt.getUTCMonth()]}`;
    prije = iso(td - DAN);
    poslije = iso(td + DAN);
  }
  const mjesec = dt.getUTCMonth();
  const dani = [];
  for (let t = od; t <= doo; t += DAN) {
    const x = new Date(t);
    dani.push({ id: iso(t), broj: x.getUTCDate(), dan: DANI[x.getUTCDay()], uMjesecu: x.getUTCMonth() === mjesec, danas: iso(t) === danas, vikend: [0, 6].includes(x.getUTCDay()) });
  }

  const { kartice, greska } = await planKartice();
  const svi = (kartice ?? []).map((k) => ({ ...k, kasni: !!k.dan && k.dan < danas && k.stanje !== "gotovo" && k.stanje !== "ne" }));
  const uRasponu = svi.filter((k) => k.dan && k.dan >= iso(od) && k.dan <= iso(doo));
  const bezDatuma = svi.filter((k) => !k.dan);
  const otvoreno = svi.filter((k) => k.stanje !== "gotovo" && k.stanje !== "ne");
  const brojke = {
    otvoreno: otvoreno.length,
    tebe: otvoreno.filter((k) => (k.tko ?? "").includes("ti") || k.stanje === "spremno").length,
    kasni: svi.filter((k) => k.kasni).length,
    danas: svi.filter((k) => k.stanje === "gotovo" && k.zavrseno && new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zagreb" }).format(new Date(k.zavrseno)) === danas).length,
  };

  return (
    <TvOkvir sat={<Sat />} oznaka="PLAN">
      <Kalendar
        v={v}
        d={d}
        danas={danas}
        naslov={naslov}
        prije={prije}
        poslije={poslije}
        dani={dani}
        kartice={uRasponu}
        bezDatuma={bezDatuma}
        redovi={REDOVI}
        brojke={brojke}
        greska={greska}
        lansiranje={<Odbrojavanje cilj={LAUNCH} className="num up block text-[clamp(1.2rem,1.8vw,2.4rem)]" />}
      />
    </TvOkvir>
  );
}
