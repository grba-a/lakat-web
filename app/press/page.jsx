import Link from "next/link";
import { KriglaSays } from "@/components/brand";
import { FEATURES, JOS, TURA_11 } from "@/lib/features";
import { LAKAT_11, isLive, isPreorder } from "@/lib/launch";
import { mrvice } from "@/lib/jsonld";
import { KAD, MREZE, ODLOMAK, kadSad } from "@/lib/opis";
import { jsonLd, stranica } from "@/lib/seo";

export const metadata = stranica({
  naslov: "Press · LAKAT",
  opis: "LAKAT za medije: opis aplikacije, ekrani, najava, Krigla i kontakt.",
  put: "/press",
});

// Press kit (Petar n7): sve što novinar ili influencer treba na jednom mjestu. Samo potvrđene činjenice.
// Krigla u novim pozama, prozirna pozadina (kartica „stojelakat“: Press). Izvori: lakat-hero/out, lakat-krigla-poze-2/-3.
const POZE = [
  ["pokazuje", "Krigla pokazuje i smije se"],
  ["zvono", "Krigla zvoni zvoncem"],
  ["ulaznica", "Krigla drži ulaznicu"],
  ["plese", "Krigla pleše"],
  ["slavi", "Krigla slavi"],
  ["duh", "Krigla kao duh"],
];

export const revalidate = 3600;

export default function Press() {
  const live = isLive();
  const preorder = !live && isPreorder();
  return (
    <main className="mx-auto grid max-w-5xl gap-14 px-5 py-14 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(mrvice("Press", "/press"))} />
      <header className="grid gap-5">
        <Link href="/" className="font-display text-[22px] leading-none">
          LAKAT<span className="text-accent">.</span>
        </Link>
        <h1 className="font-display text-[clamp(52px,13vw,104px)] leading-[0.92] uppercase">
          Press<span className="text-accent">.</span>
        </h1>
        <KriglaSays size={56}>Pišeš o nama? Ovdje je sve. Ako fali nešto, javi se.</KriglaSays>
      </header>

      <section className="grid gap-4 md:grid-cols-[1fr_1.2fr] md:gap-10">
        <h2 className="font-display text-[34px] leading-none uppercase">Ukratko</h2>
        <div className="grid gap-3 text-[16px] text-soft">
          <p>{ODLOMAK.join(" ")}</p>
          <p>{KAD[kadSad(live, preorder)]}</p>
          <p>
            Sve činjenice na jednom mjestu:{" "}
            <Link href="/sto-je-lakat" className="text-accent underline underline-offset-4">
              Što je LAKAT
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="grid gap-5">
        <h2 className="font-display text-[34px] leading-none uppercase">Funkcije</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {[...FEATURES, ...(LAKAT_11 ? TURA_11 : []), ...JOS].filter((f) => f.scr).map((f) => (
            <a key={f.id} href={`/img/scr-${f.id}.webp`} download className="grid content-start gap-2 rounded-2xl border border-line bg-surface p-3 transition-colors hover:border-[#3f3f46]">
              <img src={`/img/scr-${f.id}.webp`} alt={f.alt} width={640} height={1317} loading="lazy" className="aspect-[9/16] w-full rounded-xl object-cover object-top" />
              <b className="font-display text-[20px] leading-none font-normal uppercase">{f.name}</b>
              <span className="text-[13px] text-muted">{f.line}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <a href="/video/najava.mp4" download className="grid gap-2 rounded-2xl border border-line bg-surface p-5 hover:border-[#3f3f46]">
          <b className="font-display text-[24px] leading-none font-normal uppercase">Najava · 0:49</b>
          <span className="text-[14px] text-muted">Video 9:16, MP4. Preuzmi.</span>
        </a>
        <a href="/img/krigla/puna.webp" download className="grid grid-cols-[64px_1fr] items-center gap-4 rounded-2xl border border-line bg-surface p-5 hover:border-[#3f3f46]">
          <img src="/img/krigla/puna.webp" alt="Krigla" width={64} height={64} className="size-16 object-contain" />
          <span className="grid gap-1">
            <b className="font-display text-[24px] leading-none font-normal uppercase">Krigla</b>
            <span className="text-[14px] text-muted">Maskota, WebP s prozirnom pozadinom.</span>
          </span>
        </a>
      </section>

      <section className="grid gap-5">
        <h2 className="font-display text-[34px] leading-none uppercase">Krigla u pozama</h2>
        <div className="grid grid-cols-2 gap-3 min-[560px]:grid-cols-3">
          {POZE.map(([id, alt]) => (
            <a key={id} href={`/img/press/krigla-${id}.webp`} download className="grid content-start gap-2 rounded-2xl border border-line bg-surface p-3 transition-colors hover:border-[#3f3f46]">
              <img src={`/img/press/krigla-${id}-320.webp`} alt={alt} width={320} height={320} loading="lazy" className="aspect-square w-full object-contain" />
              <span className="text-[13px] text-muted">{alt} · WebP 1024 px, prozirno</span>
            </a>
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="font-display text-[34px] leading-none uppercase">Kontakt</h2>
        <div className="flex flex-wrap gap-2">
          <a href="mailto:support@laktarenje.com" className="inline-flex min-h-[48px] items-center rounded-full border border-line px-5 text-[15px] font-semibold">
            support@laktarenje.com
          </a>
          {MREZE.map((m) => (
            <a key={m.id} href={m.href} target="_blank" rel="noopener" className={`inline-flex min-h-[48px] items-center rounded-full px-5 text-[15px] font-bold ${m.id === "instagram" ? "ig-btn text-white" : "border border-line text-fg"}`}>
              {m.ime}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
