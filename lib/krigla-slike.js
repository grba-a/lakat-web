// Krigla koja se puni kroz obrazac (Petar, 15. 10., j-krigla-16 / obrazac A, artifact 7ATL52rqhQ1BkA2ZDcXZQY).
// Izvor: ~/Projects/lakat-krigla-poze-4/odabrano/krigla-razina-*.png, poravnate po dnu i istoj visini
// (dvije serije imaju različit kadar). Druga slika za neki korak = zamijeni put ovdje, nigdje drugdje.
export const KRIGLA_RAZINE = {
  prazna: "/img/krigla/razine/krigla-000.webp", // obrazac otvoren
  kap: "/img/krigla/razine/krigla-015.webp", // počeo tipkati @ime
  cetvrt: "/img/krigla/razine/krigla-025.webp", // @ime ima 3+ znaka
  pola: "/img/krigla/razine/krigla-050.webp", // @ime je slobodno
  tri: "/img/krigla/razine/krigla-075.webp", // upisan ispravan mail / šaljem / provjeri mail
  puna: "/img/krigla/razine/krigla-100.webp", // mail potvrđen (/potvrdeno)
};

// Koja razina za koje stanje obrasca. `imeOk` je odgovor provjere imena (null = još ne znamo).
export function razinaObrasca({ ime = "", imeOk = null, mailOk = false, poslano = false, pro = true }) {
  if (poslano || mailOk) return "tri";
  if (!pro) return "prazna";
  if (ime.length >= 3 && imeOk === true) return "pola";
  if (ime.length >= 3) return "cetvrt";
  if (ime.length > 0) return "kap";
  return "prazna";
}

// „Laktarenje u tri koraka“ (Petar, druge B): po jedna mala Krigla uz svaki korak.
export const KRIGLA_KORACI = [
  "/img/krigla/koraci/krigla-1-mobitel.webp",
  "/img/krigla/koraci/krigla-2-kava.webp",
  "/img/krigla/koraci/krigla-3-slavi.webp",
];
