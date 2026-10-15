import { KRIGLA_RAZINE } from "@/lib/krigla-slike";
import { Phone } from "./phone";

// Tvoje @ime uživo u Kriglinom pushu (j-ime-uzivo) i jedna Krigla koja se puni kroz obrazac (obrazac A).
// To je jedini veliki element stranice. Sve slike razina stoje jedna na drugoj i pretapaju se,
// pa promjena razine nikad ne čeka mrežu.
function Push({ ime, style }) {
  return (
    <div
      className="grid grid-cols-[auto_1fr] items-center gap-2.5 rounded-[16px] border border-white/5 bg-[#26262c]/95 px-3 py-2.5 text-left shadow-[0_12px_30px_-12px_rgb(0_0_0/0.8)]"
      style={style}
    >
      <span className="grid size-9 place-items-center rounded-[22%] bg-bg font-display text-[13px] leading-none">
        L<span className="text-accent">.</span>
      </span>
      <span className="min-w-0 text-[14px] leading-snug">
        <b className="flex justify-between font-semibold">
          KRIGLA <span className="font-normal text-muted">sada</span>
        </b>
        <span className="block break-words">
          <b className={ime ? "text-accent" : "text-muted"}>@{ime || "tvoje.ime"}</b> je vani. Ti si još na kauču.
        </span>
      </span>
    </div>
  );
}

// Položaj (relative ili absolute) daje pozivatelj: zajednički `relative` bi pobijedio `absolute` bez greške.
function Krigla({ razina, className = "relative" }) {
  return (
    <div className={`aspect-square ${className}`} aria-hidden="true">
      {Object.entries(KRIGLA_RAZINE).map(([k, src]) => (
        <img
          key={k}
          src={src}
          alt=""
          width={360}
          height={360}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-contain transition-[opacity,scale] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            k === razina ? "scale-100 opacity-100" : "scale-[0.96] opacity-0"
          }`}
        />
      ))}
    </div>
  );
}

// Mali prikaz (mobitel i list odozdo): Krigla lijevo, push desno, uvijek blizu polja.
export function ImeUzivoMali({ ime, razina }) {
  return (
    <div className="grid grid-cols-[88px_1fr] items-end gap-2">
      <Krigla razina={razina} className="relative w-[88px]" />
      <div className="grid gap-1.5 pb-2">
        <Push ime={ime} />
        <p className="pl-1 text-[12px] text-muted">Ovo dobiju tvoji pajdaši kad izađeš.</p>
      </div>
    </div>
  );
}

// Veliki prikaz (desktop, sekcija s obrascem): mobitel s pushem, Krigla stoji ispred njega.
export function ImeUzivoVeliki({ ime, razina }) {
  return (
    <div className="mx-auto grid w-fit gap-4">
      <div className="relative pr-20">
        <Phone width="clamp(220px, 22vw, 270px)">
          <img src="/img/hero-karta.webp" alt="" width={420} height={864} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top opacity-45" />
          <div className="absolute inset-x-[5%] top-[7%] z-[4]">
            <Push ime={ime} />
          </div>
        </Phone>
        <Krigla razina={razina} className="absolute right-0 -bottom-4 w-[62%]" />
      </div>
      <p className="max-w-[30ch] text-[13px] text-muted">Ovo dobiju tvoji pajdaši kad izađeš.</p>
    </div>
  );
}
