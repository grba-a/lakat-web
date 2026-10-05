import { KriglaSays } from "@/components/brand";
import { ConfirmedActions } from "@/components/confirmed-actions";

export const metadata = { title: "Na listi si. LAKAT" };

// Stranica nakon klika na potvrdu u mailu (Petar w16): druga prilika za dijeljenje.
export default function Potvrdeno() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-md content-center gap-8 px-5 py-16">
      <h1 className="font-display text-[56px] leading-[0.95] uppercase">
        Na listi si<span className="text-accent">.</span>
      </h1>
      <KriglaSays size={72}>Javim ti 1. 12. u podne. Do tada ništa, obećajem.</KriglaSays>
      <ConfirmedActions />
    </main>
  );
}
