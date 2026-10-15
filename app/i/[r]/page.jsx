import { notFound } from "next/navigation";
import { Home } from "@/components/home";
import { parseScore } from "@/lib/daily";

// Izazov iz igre (Petar w10): /i/37 → „Pajdaš ima 37. Možeš li bolje?“, s vlastitom slikom za dijeljenje.
export const revalidate = 60;

export async function generateMetadata({ params }) {
  const r = parseScore((await params).r);
  // Izazovi su beskonačni i osobni: ne idu u indeks (SEO pregled osobne-stranice-noindex).
  if (r === null) return { robots: { index: false, follow: false } };
  return {
    title: `Pajdaš ima ${r}. Možeš li bolje? · LAKAT`,
    description: "Igra dana na LAKTU: ista staza za sve. 1. 12. stiže cijela aplikacija za druženje s ekipom.",
    robots: { index: false, follow: true },
  };
}

export default async function Challenge({ params }) {
  const r = parseScore((await params).r);
  if (r === null) notFound();
  return <Home challenge={r} />;
}
