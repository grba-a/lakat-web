// Apple Analytics za /admin (Petar 11.–18. 11.): App Store prikazi i posjeti stranici, instalacije po kanalu,
// kasnije preuzimanja i sesije (kad aplikacija izađe 1. 12.). Čita se Sales ključem koji je već u Vercelu; zahtjev za
// izvještaje (ONGOING) je jednom napravio Admin ključ s Petrova Maca 11. 11. i on ostaje samo tamo.
// Apple daje dnevne datoteke (gzip TSV); svaka ponovno pokriva zadnja dva–tri dana, pa za svaki datum vrijedi
// NAJNOVIJA datoteka (zbrajanjem bi se brojke duplale). Rezultat se pamti sat vremena: ploča se osvježava svake minute.
import { gunzipSync } from "node:zlib";
import { ascGet, ascReady, ascToken } from "@/lib/asc";

const ZAHTJEV = "29f70416-017d-4b54-8ead-437b7f8a9071";
const IZVJESTAJI = {
  trgovina: `r14-${ZAHTJEV}`, // App Store Discovery and Engagement Standard
  instalacije: `r194-${ZAHTJEV}`, // Platform App Installs
  preuzimanja: `r3-${ZAHTJEV}`, // App Downloads Standard (prazno do izlaska)
  sesije: `r8-${ZAHTJEV}`, // App Sessions Standard (prazno do izlaska)
};
const DANA = 14;
const SAT = 60 * 60 * 1000;
let spremljeno = { at: 0, podaci: null };

function tsv(buf) {
  const [zag, ...redovi] = gunzipSync(buf).toString("utf8").trim().split("\n");
  const k = zag.split("\t");
  return redovi.map((r) => Object.fromEntries(r.split("\t").map((v, i) => [k[i], v])));
}

// Svi redovi jednog izvještaja, po datumu iz najnovije dnevne datoteke koja ga sadrži.
async function izvjestaj(jwt, id, stupacDatuma) {
  const inst = await ascGet(`/v1/analyticsReports/${id}/instances?filter[granularity]=DAILY&limit=200`, jwt);
  const popis = (inst.data ?? []).map((x) => ({ id: x.id, dan: x.attributes?.processingDate })).sort((a, b) => a.dan.localeCompare(b.dan)).slice(-(DANA + 3));
  // Datoteke se skidaju usporedno, a slažu redom (novija pobjeđuje), da prvo otvaranje u satu ne traje predugo.
  const datoteke = await Promise.all(
    popis.map(async (i) => {
      const seg = await ascGet(`/v1/analyticsReportInstances/${i.id}/segments`, jwt);
      const redovi = [];
      for (const s of seg.data ?? []) {
        const res = await fetch(s.attributes.url, { cache: "no-store" });
        if (!res.ok) throw new Error(`Apple datoteka ${res.status}`);
        redovi.push(...tsv(Buffer.from(await res.arrayBuffer())));
      }
      return redovi;
    })
  );
  const poDatumu = new Map();
  for (const redovi of datoteke) {
    const ovdje = new Map();
    for (const r of redovi) {
      const d = r[stupacDatuma];
      if (!ovdje.has(d)) ovdje.set(d, []);
      ovdje.get(d).push(r);
    }
    for (const [d, rr] of ovdje) poDatumu.set(d, rr); // novija datoteka zamijeni stariju za isti datum
  }
  return [...poDatumu.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-DANA);
}

const zbroj = (redovi, polje, uvjet = () => true) => redovi.filter(uvjet).reduce((s, r) => s + (Number(r[polje]) || 0), 0);

async function izracunaj() {
  const jwt = ascToken();
  const [trg, ins] = await Promise.all([
    izvjestaj(jwt, IZVJESTAJI.trgovina, "Date"),
    izvjestaj(jwt, IZVJESTAJI.instalacije, "Install Day"),
  ]);
  const dani = trg.map(([dan, rr]) => ({
    dan,
    prikazi: zbroj(rr, "Counts", (r) => r.Event === "Impression"),
    posjeti: zbroj(rr, "Counts", (r) => r.Event === "Page view"),
  }));
  const izvori = new Map();
  for (const [, rr] of trg) for (const r of rr) if (r.Event === "Page view") izvori.set(r["Source Type"] || "ostalo", (izvori.get(r["Source Type"] || "ostalo") ?? 0) + (Number(r.Counts) || 0));
  const instalacije = ins.map(([dan, rr]) => ({
    dan,
    testflight: zbroj(rr, "Installs", (r) => r.Channel === "TestFlight"),
    trgovina: zbroj(rr, "Installs", (r) => r.Channel !== "TestFlight"),
    prve: zbroj(rr, "Installs", (r) => /first/i.test(r["Install Type"] || "")),
  }));
  return { dani, izvori: [...izvori.entries()].sort((a, b) => b[1] - a[1]), instalacije, at: new Date().toISOString() };
}

export async function appleAnalitika() {
  if (!ascReady()) return { greska: "Apple ključ nije u Vercelu." };
  if (spremljeno.podaci && Date.now() - spremljeno.at < SAT) return spremljeno.podaci;
  try {
    const podaci = await izracunaj();
    spremljeno = { at: Date.now(), podaci };
    return podaci;
  } catch (e) {
    return { greska: String(e.message || e).slice(0, 120) };
  }
}
