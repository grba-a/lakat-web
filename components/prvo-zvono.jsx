import { isLive, isPreorder } from "@/lib/launch";
import { AppStoreBadge } from "./app-store-badge";
import { Punct } from "./brand";

// Prvo zvono (Petar 5. 11., kartica „zvono“: „animiraj ovo; web treba biti fora s dosta animacija (ne previše);
// mora biti brz na mobitelu“). Traka između ture i privatnosti, do kraja petka 4. 12. (home.jsx).
// Scena je složena kao slika iz mape „LAKAT Prvo zvono“ (Krigla u zelenim krugovima), ali živa: prsteni zvuka
// izlaze iz zvonca i Krigla zazvoni. Sve u CSS-u (transform/opacity), vrti se samo dok je na ekranu ([data-uzivo]).
// Sat zvona ne pišemo dok In-App Event nije predan i sat odlučen.
export function PrvoZvono() {
  const live = isLive();
  const preorder = !live && isPreorder();
  return (
    <section aria-labelledby="zvono-naslov" data-krigla="Petak. Zapamti. Ja zvonim." className="mx-auto grid max-w-6xl gap-8 px-5 py-20 md:grid-cols-2 md:items-center md:gap-16 md:py-28">
      <div data-uzivo className="relative isolate mx-auto aspect-square w-full max-w-[420px] overflow-hidden rounded-[32px] border border-line bg-[radial-gradient(closest-side,#173d27_0%,#0d1f15_55%,#09090b_100%)] md:order-2">
        {/* Mirni krugovi kao na slici događaja. */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[repeating-radial-gradient(circle_at_50%_50%,transparent_0_46px,rgb(74_222_128/0.12)_46px_48px)]" />
        <div aria-hidden="true" className="absolute inset-0">
          <span className="zv-prsten" />
          <span className="zv-prsten" />
          <span className="zv-prsten" />
        </div>
        <img
          src="/img/zvono/krigla-zvono-400.webp"
          srcSet="/img/zvono/krigla-zvono-400.webp 400w, /img/zvono/krigla-zvono-640.webp 640w"
          sizes="(min-width: 768px) 290px, 68vw"
          alt="Krigla zvoni zvoncem na šanku"
          width={640}
          height={759}
          loading="lazy"
          decoding="async"
          className="zv-krigla absolute inset-x-0 bottom-[6%] mx-auto h-auto w-[68%]"
        />
        <span aria-hidden="true" className="zv-ding absolute top-[13%] left-[12%] -rotate-12 font-display text-[clamp(22px,7vw,30px)] text-accent uppercase">
          Ding!
        </span>
      </div>
      <div className="grid justify-items-start gap-4">
        <span data-reveal className="font-mono text-[12px] tracking-[0.16em] text-accent uppercase">Petak, 4. 12.</span>
        <h2 id="zvono-naslov" data-reveal style={{ "--rv-d": "80ms" }} className="font-display text-[clamp(52px,15vw,72px)] leading-[0.92] uppercase md:text-[clamp(72px,7vw,112px)]">
          <Punct>Prvo zvono.</Punct>
        </h2>
        <p data-reveal style={{ "--rv-d": "160ms" }} className="max-w-[34ch] text-[17px] leading-snug text-soft text-pretty md:text-[19px]">
          Prvi „Sad ili nikad“ ikad. Svima zazvoni u istoj sekundi, dvije minute da slikaš gdje si.
        </p>
        {(preorder || live) && (
          <div data-reveal style={{ "--rv-d": "240ms" }} className="grid justify-items-start gap-3 pt-2">
            <p className="text-[15px] font-semibold text-fg">{preorder ? "Prednaruči da ga ne propustiš." : "Skini LAKAT da ga ne propustiš."}</p>
            <AppStoreBadge ct="web-zvono" height={48} label={preorder ? "Prednaruči LAKAT na App Storeu" : "Skini LAKAT na App Storeu"} />
          </div>
        )}
      </div>
    </section>
  );
}
