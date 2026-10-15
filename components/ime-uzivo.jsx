import { KRIGLA_RAZINE } from "@/lib/krigla-slike";
import { Phone } from "./phone";

// Tvoje @ime uživo u Kriglinom pushu (j-ime-uzivo) i jedna Krigla koja se puni kroz obrazac (obrazac A).
// To je jedini veliki element stranice. Sve slike razina stoje jedna na drugoj i pretapaju se,
// pa promjena razine nikad ne čeka mrežu.
function Push({ ime, style, velik = false }) {
  return (
    <div
      className={`grid grid-cols-[auto_1fr] items-center gap-3 rounded-[18px] border bg-[#26262c]/95 text-left transition-[border-color,box-shadow] duration-300 ${
        velik ? "px-3.5 py-3" : "px-3 py-2.5"
      } ${ime ? "border-accent/30 shadow-[0_14px_36px_-16px_rgb(74_222_128/0.45)]" : "border-white/5 shadow-[0_14px_32px_-14px_rgb(0_0_0/0.85)]"}`}
      style={style}
    >
      <span className={`grid place-items-center rounded-[22%] bg-bg font-display leading-none ${velik ? "size-10 text-[14px]" : "size-9 text-[13px]"}`}>
        L<span className="text-accent">.</span>
      </span>
      <span className={`min-w-0 leading-snug ${velik ? "text-[15px]" : "text-[14px]"}`}>
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

// Mali prikaz (mobitel i list odozdo), jedini istaknuti element obrasca: Krigla stoji na pushu,
// a opis je iznad pusha s lijeve strane, pa push s tvojim @imenom ostaje u sredini pažnje.
export function ImeUzivoMali({ ime, razina }) {
  return (
    <figure className="grid">
      <div className="flex items-end justify-between gap-3">
        <figcaption className="max-w-[24ch] pb-5 text-[13px] leading-snug text-muted text-balance">Ovo dobiju tvoji pajdaši kad izađeš.</figcaption>
        <Krigla razina={razina} className="relative z-[1] -mb-4 mr-2 w-[92px] shrink-0" />
      </div>
      <Push ime={ime} velik />
    </figure>
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
