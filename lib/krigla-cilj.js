// Napunite Kriglu (Petar, 2026-10-05, db krigla_cilj/): ljestve 100 → 250 → 500 → 1000 potvrđenih upisa.
// Na svakom pragu Krigla otkrije jedan trag o sedmoj funkciji. Sedma funkcija još nije smišljena,
// pa su tragovi namjerno neodređeni — Petar ih mijenja ovdje kad je smisli.
export const PRAGOVI = [100, 250, 500, 1000];
export const TRAGOVI = [
  "Prvi trag: kad je vidiš, pitat ćeš se zašto to prije nije postojalo.",
  "Drugi trag: bez ekipe ne radi.",
  "Treći trag: najbolja je kad se najmanje nadaš.",
  "Zadnji trag: 1. 12. Više ni riječi, šef gleda.",
];
// Broj upisa pokazujemo tek kad prijeđe prvi prag (k3), da mala brojka ne izgleda prazno.
export const BROJ_OD = PRAGOVI[0];

export function stanje(n) {
  const i = PRAGOVI.findIndex((p) => n < p);
  const korak = i === -1 ? PRAGOVI.length : i; // koliko je pragova prijeđeno
  const cilj = i === -1 ? PRAGOVI[PRAGOVI.length - 1] : PRAGOVI[i];
  const pct = Math.min(100, Math.floor((n / cilj) * 100));
  const razina = pct >= 85 ? "puna" : pct >= 40 ? "pola" : "prazna";
  return { n, korak, cilj, pct, razina, tragovi: TRAGOVI.slice(0, korak), sljedeci: TRAGOVI[korak] ? cilj : null };
}
