import { ConfirmedActions } from "@/components/confirmed-actions";
import { KvartRat } from "@/components/kvart-rat";
import { NapuniteKriglu } from "@/components/napunite-kriglu";
import { Tapete } from "@/components/tapete";
import { Ticket } from "@/components/ticket";
import { Upisan } from "@/components/upisan";
import { KRIGLA_RAZINE } from "@/lib/krigla-slike";
import { mjestoNaUlaznici } from "@/lib/gradovi";
import { dbReady, poRefu, pozvani } from "@/lib/lista";
import { stranica } from "@/lib/seo";

export const metadata = stranica({
  naslov: "Na listi si · LAKAT",
  opis: "Potvrdio si mail i na listi si za LAKAT.",
  put: "/potvrdeno",
  indeks: false,
});
export const dynamic = "force-dynamic";

function Krigla({ src, children }) {
  return (
    <div className="grid grid-cols-[112px_1fr] items-end gap-3">
      <img src={src} alt="" width={360} height={360} className="size-[112px] object-contain" />
      <p className="mb-3 rounded-[18px] rounded-bl-md border border-line bg-surface-2 px-3.5 py-2.5 text-[15px] leading-snug">{children}</p>
    </div>
  );
}

// Stranica nakon klika na potvrdu u mailu (Petar w16): druga prilika za dijeljenje, ulaznica s osobnim linkom
// (w05, w06), a od 15. 10. i sve što je s početne selilo ovamo: kvart, Napunite Kriglu, tapete.
// Krigla je ovdje pun (razina 100, obrazac A).
export default async function Potvrdeno({ searchParams }) {
  const sp = await searchParams;
  if (sp?.greska) {
    return (
      <main className="mx-auto grid min-h-dvh max-w-md content-center gap-8 px-5 py-16">
        <h1 className="font-display text-[48px] leading-[0.95] uppercase">
          Link ne radi<span className="text-accent">.</span>
        </h1>
        <Krigla src={KRIGLA_RAZINE.prazna}>Ovaj link je istekao ili je već iskorišten. Upiši se ponovo na početnoj.</Krigla>
      </main>
    );
  }
  const row = sp?.r && dbReady() ? await poRefu(sp.r).catch(() => null) : null;
  const doveo = row ? await pozvani(row.ref_kod).catch(() => 0) : 0;
  const android = row?.platforma === "android";

  return (
    <main className="mx-auto grid min-h-dvh max-w-md content-start gap-14 px-5 py-16">
      <Upisan refKod={row?.ref_kod} />
      <div className="grid gap-6">
        <h1 className="font-display text-[56px] leading-[0.95] uppercase">
          Na listi si<span className="text-accent">.</span>
        </h1>
        <Krigla src={KRIGLA_RAZINE.puna}>
          {row?.ime ? `@${row.ime} je tvoje. ` : ""}
          {android ? "Javim ti kad Android stigne, u siječnju 2027." : "Javim ti 1. 12. u podne."} Do tada ništa, obećajem.
        </Krigla>
        {row && <Ticket refKod={row.ref_kod} ime={row.ime} mjesto={mjestoNaUlaznici(row.grad)} doveo={doveo} />}
        <ConfirmedActions refKod={row?.ref_kod} />
      </div>
      <KvartRat imaKvart={Boolean(row?.kvart)} mozeUpisati={Boolean(row)} />
      <NapuniteKriglu />
      <Tapete />
    </main>
  );
}
