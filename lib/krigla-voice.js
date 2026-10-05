// Krigla zna koliko je sati (Petar n3) i tko te poslao (n2). Bez poticanja na pijenje.
export function hourInZagreb(d = new Date()) {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", hour: "2-digit", hourCycle: "h23" }).format(d));
}

export function moodLine(h = hourInZagreb()) {
  if (h < 6) return "Još si budan? Ekipa je vani.";
  if (h < 11) return "Dobro jutro. Kava se isto računa.";
  if (h < 14) return "Podne je. Negdje se nešto razvija.";
  if (h < 18) return "Popodne je. Tko je za kavu?";
  if (h < 22) return "Večer je. Pogledaj tko je vani.";
  return "Još si budan? Ekipa je vani.";
}

export function greeting(src) {
  if (src === "share") return "Pajdaš te poslao. Dobar izbor.";
  if (src === "izazov") return "Pajdaš te izazvao. Pokaži mu.";
  return "";
}
