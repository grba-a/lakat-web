import Link from "next/link";
import { KriglaSays } from "@/components/brand";
import { FEATURES } from "@/lib/features";
import { INSTAGRAM } from "@/lib/launch";

export const metadata = {
  title: "Press. LAKAT",
  description: "LAKAT za medije: opis, ekrani, najava i kontakt.",
  alternates: { canonical: "/press" },
};

// Press kit (Petar n7): sve što novinar ili influencer treba na jednom mjestu. Samo potvrđene činjenice.
export default function Press() {
  return (
    <main className="mx-auto grid max-w-5xl gap-14 px-5 py-14 md:py-20">
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
          <p>
            LAKAT je hrvatska društvena aplikacija za izlaske s ekipom. Na karti vidiš tko je od pajdaša vani, objaviš rundu, a Krigla,
            tvoj lik u aplikaciji, daje zadatke i pamti večeri.
          </p>
          <p>Izlazi 1. 12. 2026. u 12:00 na iPhoneu. Android stiže poslije.</p>
          <p>Tebe vide samo pajdaši koje prihvatiš. Javno objavljuješ samo kad ti to uključiš.</p>
        </div>
      </section>

      <section className="grid gap-5">
        <h2 className="font-display text-[34px] leading-none uppercase">Funkcije</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {FEATURES.map((f) => (
            <a key={f.id} href={`/img/scr-${f.id}.webp`} download className="grid content-start gap-2 rounded-2xl border border-line bg-surface p-3 transition-colors hover:border-[#3f3f46]">
              <img src={`/img/scr-${f.id}.webp`} alt={f.name} width={640} height={1317} loading="lazy" className="aspect-[9/16] w-full rounded-xl object-cover object-top" />
              <b className="font-display text-[20px] leading-none font-normal uppercase">{f.name}</b>
              <span className="text-[13px] text-muted">{f.line}</span>
            </a>
          ))}
        </div>
        <p className="text-[13px] text-muted">Ekrani su iz verzije u izradi. Dizajn se do 1. 12. još može promijeniti.</p>
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

      <section className="grid gap-3">
        <h2 className="font-display text-[34px] leading-none uppercase">Kontakt</h2>
        <div className="flex flex-wrap gap-2">
          <a href="mailto:support@laktarenje.com" className="inline-flex min-h-[48px] items-center rounded-full border border-line px-5 text-[15px] font-semibold">
            support@laktarenje.com
          </a>
          <a href={INSTAGRAM} target="_blank" rel="noopener" className="ig-btn inline-flex min-h-[48px] items-center rounded-full px-5 text-[15px] font-bold text-white">
            @lakat_app
          </a>
        </div>
      </section>
    </main>
  );
}
