import { notFound } from "next/navigation";
import { KriglaTyping } from "@/components/krigla-typing";
import { APP_STORE, storeLink } from "@/lib/launch";
import { procitaj } from "@/lib/izazov";

// Izazov iz igre u aplikaciji (lakat-ios val 5d, „Ruši me, pajdo"): /z/kula/26?od=petar.
// Tko ima app, otvori ga (lakat://z/…) baš na toj igri s brojem na vrhu; ostali dobiju store ili
// listu. Osobno i beskonačno, pa ne ide u indeks. Ime se ne sklanja (stoji u nominativu).
export async function generateMetadata({ params, searchParams }) {
  const z = procitaj(await params, await searchParams);
  if (!z) return { robots: { index: false, follow: false } };
  const naslov = `${z.naziv}: ${z.od} ima ${z.broj}. Sruši to.`;
  const opis = "Igra iz LAKTA, aplikacije za druženje s ekipom. Rekord vide samo pajdaši.";
  // Pretpregled u chatu nosi rekord, ne opću najavu stranice (layout openGraph se ovdje zamjenjuje cijeli).
  // Slika je ruta, ne opengraph-image: ta ne vidi ?od=, a ime je pola poruke.
  const slika = `/z/${z.igra}/${z.broj}/slika?od=${encodeURIComponent(z.od)}`;
  return {
    title: `${naslov} · LAKAT`,
    description: opis,
    robots: { index: false, follow: true },
    openGraph: {
      locale: "hr_HR",
      type: "website",
      siteName: "LAKAT",
      title: naslov,
      description: opis,
      images: [{ url: slika, width: 1200, height: 630, alt: naslov }],
    },
    twitter: { card: "summary_large_image", title: naslov, description: opis, images: [slika] },
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
