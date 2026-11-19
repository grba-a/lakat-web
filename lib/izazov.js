// Izazov iz igre (/z/[igra]/[broj]?od=…): zajedničko stranici i slici za pretpregled (slika/route.jsx).
// Nazivi i stropovi kao u aplikaciji (lakat-ios Igre.swift `sve`). Strop je PO IGRI: Spoji i Gajba idu do 99 999,
// Galeb do 9 999 — izazov iznad 999 prije je davao 404 (Petar 8. 11.: „svaki drugi korisnik naleti na limit od 999").
export const IGRE = {
  kula: { naziv: "Kula", max: 999 },
  burek_u_cetiri: { naziv: "Pekara", max: 999 },
  gajba: { naziv: "Gajba", max: 99999 },
  galeb: { naziv: "Galeb", max: 9999 },
  sankerov_lakat: { naziv: "Šanker", max: 200 },
  zlatni_tocionik: { naziv: "Točionik", max: 999 },
  do_krigle: { naziv: "Spoji", max: 99999 },
  konobar: { naziv: "Konobar", max: 999 },
  // Stare igre: linkovi iz ranijih buildova i dalje rade.
  ravna_crta: { naziv: "Ravna crta", max: 999 },
  gosti: { naziv: "Gosti na vratima", max: 9999 },
};

export function procitaj(params, searchParams) {
  const igra = IGRE[params.igra];
  const naziv = igra?.naziv;
  const broj = Number.parseInt(params.broj, 10);
  if (!igra || !Number.isInteger(broj) || broj < 0 || broj > igra.max || String(broj) !== params.broj) return null;
  const od = (searchParams?.od ?? "").toString().trim().slice(0, 24) || "Pajdaš";
  return { igra: params.igra, naziv, broj, od };
}
