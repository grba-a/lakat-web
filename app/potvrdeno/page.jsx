import { KriglaSays } from "@/components/brand";
import { ConfirmedActions } from "@/components/confirmed-actions";
import { Ticket } from "@/components/ticket";
import { mjestoNaUlaznici } from "@/lib/gradovi";
import { dbReady, poRefu, pozvani } from "@/lib/lista";

export const metadata = { title: "Na listi si. LAKAT" };
export const dynamic = "force-dynamic";

// Stranica nakon klika na potvrdu u mailu (Petar w16): druga prilika za dijeljenje,
// a s bazom liste i ulaznica s osobnim linkom (w05, w06).
export default async function Potvrdeno({ searchParams }) {
  const sp = await searchParams;
  if (sp?.greska) {
    return (
      <main className="mx-auto grid min-h-dvh max-w-md content-center gap-8 px-5 py-16">
        <h1 className="font-display text-[48px] leading-[0.95] uppercase">
          Link ne radi<span className="text-accent">.</span>
        </h1>
        <KriglaSays size={72}>Ovaj link je istekao ili je već iskorišten. Upiši se ponovo na početnoj.</KriglaSays>
      </main>
    );
  }
  const row = sp?.r && dbReady() ? await poRefu(sp.r).catch(() => null) : null;
  const doveo = row ? await pozvani(row.ref_kod).catch(() => 0) : 0;

  return (
    <main className="mx-auto grid min-h-dvh max-w-md content-center gap-8 px-5 py-16">
      <h1 className="font-display text-[56px] leading-[0.95] uppercase">
        Na listi si<span className="text-accent">.</span>
      </h1>
      <KriglaSays size={72}>Javim ti 1. 12. u podne. Do tada ništa, obećajem.</KriglaSays>
      {row && <Ticket refKod={row.ref_kod} ime={row.ime} mjesto={mjestoNaUlaznici(row.grad)} doveo={doveo} />}
      <ConfirmedActions refKod={row?.ref_kod} />
    </main>
  );
}
