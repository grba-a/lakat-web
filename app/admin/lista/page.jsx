// Lista čekanja /admin/lista (faza 3b, Petar 12. 11.): tko je na listi, tražilica, filteri i izvoz POTVRĐENIH za mail o izlasku.
// Mailovi su samo ovdje (iza šifre i 2FA), nikad na glavnoj ploči ni TV-u. Svrha je ona iz Privatnosti: mail o izlasku.
import { notFound, redirect } from "next/navigation";
import { adminUkljucen, jesamLiAdmin, listaCekanja } from "@/lib/admin";
import { ListaTablica } from "./tablica";

export const metadata = { title: "Lista · LAKAT", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ListaPage() {
  if (!adminUkljucen()) notFound();
  if (!(await jesamLiAdmin())) redirect("/admin");
  const { redovi, greska } = await listaCekanja();
  return (
    <main
      className="mx-auto flex max-w-[1200px] flex-col gap-6 pb-24 pt-6 lg:px-8"
      style={{ paddingLeft: "max(16px, env(safe-area-inset-left))", paddingRight: "max(16px, env(safe-area-inset-right))" }}
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="lbl">[ LKT / LISTA ] {"///"} osobni podaci {"///"} samo za mail o izlasku</span>
          <h1 className="num text-[clamp(2.4rem,8vw,4rem)] uppercase leading-[0.9]">
            Lista čekanja<span className="up">.</span>
          </h1>
        </div>
        <a href="/admin" className="chip mono flex h-11 items-center rounded-[var(--r-sm)] border border-[color:var(--a-line)] px-4 text-[11px] text-[color:var(--a-mute)]">
          [ PLOČA ]
        </a>
      </header>
      {greska ? (
        <p className="mono text-[12px] normal-case text-[color:var(--a-alarm)]">Lista se nije učitala: {greska}</p>
      ) : (
        <ListaTablica redovi={redovi} />
      )}
    </main>
  );
}
