// Jedan opis LAKTA, isti svugdje: naslov, meta opis, JSON-LD, podnožje, /sto-je-lakat, /press, llms.txt
// (SEO pregled 15. 10.: entitet-mreze, rijeci-namjere). Petar: „aplikacija za druženje (i izlaske) s ekipom“,
// prvo DRUŽENJE, bez tvrdnji koje se ne mogu dokazati. Mijenja se samo ovdje.

export const DOMENA = "https://laktarenje.com";

export const JEDNA_RECENICA = "LAKAT je hrvatska iPhone aplikacija za druženje i izlaske s ekipom.";

// Naslovi i opisi za tražilice i dijeljenje: prije i poslije 1. 12. u podne (lansiranje-seo).
export const NASLOV = {
  prije: "LAKAT – aplikacija za druženje s ekipom · iPhone 1. 12.",
  poslije: "LAKAT – aplikacija za druženje s ekipom · preuzmi za iPhone",
};
export const OPIS = {
  prije:
    "LAKAT je hrvatska iPhone aplikacija za druženje (i izlaske) s ekipom. Vidiš tko je vani, objaviš rundu, a vide te samo pajdaši. Stiže 1. 12. u podne.",
  poslije:
    "LAKAT je hrvatska iPhone aplikacija za druženje (i izlaske) s ekipom. Vidiš tko je vani, objaviš rundu, a vide te samo pajdaši. Sad na iPhoneu.",
};

// Odlomak „Što je LAKAT“ (jsonld.md §5), običnim riječima, bez gomilanja ključnih riječi.
export const ODLOMAK = [
  JEDNA_RECENICA,
  "Na karti vidiš tko je od pajdaša vani i objaviš rundu, fotku s mjesta gdje se družite. Vide je samo pajdaši koje prihvatiš, a javno samo kad to sam upališ.",
  "Krigla, tvoj lik u aplikaciji, daje zadatke i pamti večeri.",
];
export const KAD = {
  prije: "Izlazi 1. 12. 2026. u podne na iPhoneu. Android stiže u siječnju 2027.",
  poslije: "Na iPhoneu je od 1. 12. 2026. Android stiže u siječnju 2027.",
};

// Službene mreže (Petar, 15. 10.). Iste adrese idu u podnožje, sekciju mreža i JSON-LD sameAs.
export const MREZE = [
  { id: "instagram", ime: "Instagram", href: "https://www.instagram.com/lakat_app", rucka: "@lakat_app" },
  { id: "tiktok", ime: "TikTok", href: "https://www.tiktok.com/@lakat_app", rucka: "@lakat_app" },
  { id: "facebook", ime: "Facebook", href: "https://web.facebook.com/profile.php?id=61595344256488", rucka: "LAKAT" },
];
