import Link from "next/link";
import { KriglaSays } from "@/components/brand";

export const metadata = { title: "Potvrđeno. LAKAT" };

export default function Potvrdeno() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-md content-center gap-8 px-5 py-16">
      <h1 className="font-display text-[56px] leading-[0.95] uppercase">
        Na listi si<span className="text-accent">.</span>
      </h1>
      <KriglaSays size={72}>Javim ti 1. 12. u podne. Do tada ništa, obećajem.</KriglaSays>
      <Link href="/" className="justify-self-start text-[15px] text-soft underline underline-offset-4">
        Natrag na odbrojavanje
      </Link>
    </main>
  );
}
