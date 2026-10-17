import { notFound } from "next/navigation";
import { KriglaTyping } from "@/components/krigla-typing";
import { APP_STORE, storeLink } from "@/lib/launch";

// Izazov iz igre u aplikaciji (lakat-ios val 5d, „Ruši me, pajdo"): /z/kula/26?od=petar.
// Tko ima app, otvori ga (lakat://z/…) baš na toj igri s brojem na vrhu; ostali dobiju store ili
// listu. Osobno i beskonačno, pa ne ide u indeks. Ime se ne sklanja (stoji u nominativu).
const IGRE = {
  kula: "Kula od krigli",
  burek_u_cetiri: "Burek u četiri",
  sankerov_lakat: "Šankerov lakat",
  zlatni_tocionik: "Zlatni točionik",
  ravna_crta: "Ravna crta",
  do_krigle: "Do Krigle",
  konobar: "Konobar",
};

function procitaj(params, searchParams) {
  const naziv = IGRE[params.igra];
  const broj = Number.parseInt(params.broj, 10);
  if (!naziv || !Number.isInteger(broj) || broj < 0 || broj > 999 || String(broj) !== params.broj) return null;
  const od = (searchParams?.od ?? "").toString().trim().slice(0, 24) || "Pajdaš";
  return { igra: params.igra, naziv, broj, od };
}

export async function generateMetadata({ params, searchParams }) {
  const z = procitaj(await params, await searchParams);
  if (!z) return { robots: { index: false, follow: false } };
  return {
    title: `${z.naziv}: ${z.od} ima ${z.broj}. Sruši to. · LAKAT`,
    description: "Igra iz LAKTA, aplikacije za druženje s ekipom. Rekord vide samo pajdaši.",
    robots: { index: false, follow: true },
  };
}

export default async function Izazov({ params, searchParams }) {
  const z = procitaj(await params, await searchParams);
  if (!z) notFound();
  const app = `lakat://z/${z.igra}/${z.broj}?od=${encodeURIComponent(z.od)}`;
  const store = APP_STORE ? storeLink("izazov") : "/?src=izazov#lista";

  return (
    <main className="mx-auto grid min-h-dvh max-w-md content-center gap-8 px-5 py-16">
      <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-accent">{z.naziv}</p>
      <h1 className="font-display text-[64px] leading-[0.92] uppercase">
        {z.od} ima {z.broj}
        <span className="text-accent">.</span>
      </h1>
      <KriglaTyping size={72} text="Sruši to. Jedan prst, bez kraja, na rekord. I na WC-u se broji." />
      <a
        href={app}
        className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-accent px-6 text-[17px] font-bold text-[#052e16]"
      >
        Imam LAKAT, otvori igru
      </a>
      <a href={store} className="inline-flex min-h-11 items-center justify-center text-[15px] font-bold text-accent underline underline-offset-4">
        {APP_STORE ? "Skini LAKAT" : "Javi mi kad izađe"}
      </a>
    </main>
  );
}
