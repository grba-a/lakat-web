// /admin/plan (Petar 18. 11.: „želim da je kao TV način ili ratna soba“): plan rada kao kalendar na zidu.
// Stupci = danas i idućih 6 dana + „Kasnije“; redovi = aplikacija, web i server, Instagram i TikTok, ti.
// Nedovršeno iz prošlih dana prelazi u današnji stupac s oznakom KASNI. Ista prijava kao /admin.
import { notFound, redirect } from "next/navigation";
import { adminUkljucen, jesamLiAdmin } from "@/lib/admin";
import { LAUNCH } from "@/lib/launch";
import { REDOVI, planKartice } from "@/lib/plan";
import { Odbrojavanje } from "../zivo";
import { Sat, TvOkvir } from "../tv/vrtnja";
import { Ploca } from "./ploca";

export const metadata = { title: "Plan · LAKAT", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const DANI = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];

export default async function PlanPage() {
  if (!adminUkljucen()) notFound();
  if (!(await jesamLiAdmin())) redirect("/admin");

  const danas = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zagreb" }).format(new Date());
  const t0 = Date.parse(`${danas}T12:00:00Z`);
  const stupci = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(t0 + i * 864e5);
    const iso = d.toISOString().slice(0, 10);
    return { id: iso, naslov: i === 0 ? "Danas" : DANI[d.getUTCDay()], pod: `${d.getUTCDate()}. ${d.getUTCMonth() + 1}.`, danas: i === 0 };
  });
  stupci.push({ id: "kasnije", naslov: "Kasnije", pod: "bez datuma" });
  const zadnji = stupci[6].id;

  const { kartice, greska } = await planKartice();
  const svi = kartice ?? [];
  // Gdje kartica stoji na zidu: bez dana ili iza prozora = Kasnije; prošla i nedovršena = Danas (kasni); prošla i gotova = ne prikazuje se.
  const raspored = svi
    .map((k) => {
      const zavrsena = k.stanje === "gotovo" || k.stanje === "ne";
      if (!k.dan || k.dan > zadnji) return { ...k, stupac: "kasnije" };
      if (k.dan < danas) return zavrsena ? null : { ...k, stupac: danas, kasni: true };
      return { ...k, stupac: k.dan };
    })
    .filter(Boolean);
  const otvoreno = raspored.filter((k) => k.stanje !== "gotovo" && k.stanje !== "ne");
  const brojke = {
    otvoreno: otvoreno.length,
    tebe: otvoreno.filter((k) => (k.tko ?? "").includes("ti") || k.stanje === "spremno").length,
    kasni: raspored.filter((k) => k.kasni).length,
    danas: svi.filter((k) => k.stanje === "gotovo" && k.zavrseno && new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zagreb" }).format(new Date(k.zavrseno)) === danas).length,
  };

  return (
    <TvOkvir sat={<Sat />} oznaka="PLAN">
      <Ploca stupci={stupci} redovi={REDOVI} kartice={raspored} greska={greska} brojke={brojke} lansiranje={<Odbrojavanje cilj={LAUNCH} className="num up block text-[clamp(1.3rem,2vw,2.6rem)]" />} />
    </TvOkvir>
  );
}
