// „Pitaš se?“ (j-faq-praznine + faq-u-html): odgovori za skeptika, u HTML-u sa servera, isti tekst ide u FAQPage JSON-LD.
// Samo ono što Petar potvrdio: nije app za pijenje (ekipa, „Kava se isto računa“), tko te vidi, besplatan (Uvjeti),
// Android u siječnju 2027. Bez cijena i brojki.
export const FAQ = [
  ["Što je LAKAT?", "Hrvatska iPhone aplikacija za druženje s ekipom. Vidiš tko je od pajdaša vani, objaviš rundu i nađete se."],
  ["Je li ovo app za pijenje?", "Nije. Bitna je ekipa, ne čaša. Kava se isto računa."],
  ["Tko me vidi?", "Samo pajdaši koje prihvatiš. Javnu rundu vide i ljudi u krugu od 1 km, ali samo kad je sam upališ, i samo 24 sata."],
  ["Je li besplatan?", "Je. LAKAT je besplatan."],
  ["Kad izlazi?", "1. 12. 2026. u podne, na iPhoneu."],
  ["Imam Android. Što sad?", "Android stiže u siječnju 2027. Ostavi mail i javim ti kad stigne."],
  ["Zašto ime rezervirati sad?", "Jedno ime, jedan vlasnik. Tko ga prvi upiše, njegovo je."],
  ["Što je s mojim računom s weba?", "Ostaje. 1. 12. se samo prijaviš u aplikaciji i sve te čeka."],
  ["Zašto ne mogu u web app?", "Web je bio proba i bio je solidan. Tek sada dolazi nešto što para gaće."],
];

// Nakon lansiranja: datum postaje „već je vani“, a rezervacija imena više nema smisla.
export function faqZa(live) {
  if (!live) return FAQ;
  return FAQ.filter(([q]) => q !== "Zašto ime rezervirati sad?").map(([q, a]) =>
    q === "Kad izlazi?" ? [q, "Već je vani, na iPhoneu. Android stiže u siječnju 2027."] : q === "Što je s mojim računom s weba?" ? [q, "Ostaje. Prijaviš se u aplikaciji istim podacima i sve te čeka."] : [q, a]
  );
}
