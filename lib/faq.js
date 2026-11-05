import { APP_STORE, isPreorder } from "./launch";

// „Pitaš se?“ (j-faq-praznine + faq-u-html): odgovori za skeptika, u HTML-u sa servera, isti tekst ide u FAQPage JSON-LD.
// Samo ono što Petar potvrdio: nije app za pijenje (ekipa, „Kava se isto računa“), tko te vidi, besplatan (Uvjeti),
// Android u siječnju 2027. Bez cijena i brojki.
export const FAQ = [
  ["Što je LAKAT?", "Aplikacija za druženje s ekipom. Vidiš tko je od pajdaša vani, objaviš rundu i nađete se."],
  ["Je li ovo app za pijenje?", "Nije. Bitna je ekipa, ne čaša. Kava se isto računa."],
  ["Tko me vidi?", "Samo pajdaši koje prihvatiš. Javnu rundu vide i ljudi u krugu od 1 km, ali samo kad je sam upališ, i samo 24 sata."],
  ["Je li besplatan?", "Je. LAKAT je besplatan."],
  ["Kad izlazi?", "1. 12. 2026. u podne, na iPhoneu."],
  ["Imam Android. Što sad?", "Android stiže u siječnju 2027. Ostavi mail i javim ti kad stigne."],
  ["Zašto ime rezervirati sad?", "Jedno ime, jedan vlasnik. Tko ga prvi upiše, njegovo je."],
  // Ispravak 5. 11.: u appu je Apple prvi gumb, a @ime i lozinka su ispod njega.
  ["Što je s mojim računom s weba?", "Ostaje. U appu se prijaviš istim @imenom i lozinkom i sve te čeka."],
  ["Zašto ne mogu u web app?", "Web je bio proba i bio je solidan. Tek sada dolazi nešto što para gaće."],
];

// Prednarudžba (Petar 5. 11., kartica „faq“): pitanje o prednarudžbi i 27 zemalja EU, a „Kad izlazi?“ kaže da se već
// može prednaručiti. Rezervacije imena na stranici više nema (lista je Androidova), pa ni tog pitanja.
const PREDNARUDZBA = ["Što je prednarudžba?", "Klikneš „Prednaruči“ na App Storeu i gotovo. 1. 12. u podne LAKAT se sam skine."];
const EU = ["Ima ga i izvan Hrvatske?", "Ima. Na App Storeu je u svih 27 zemalja EU."];

// Nakon lansiranja: datum postaje „već je vani“, a rezervacija imena više nema smisla.
export function faqZa(live, preorder = !live && isPreorder()) {
  if (preorder) {
    return FAQ.filter(([q]) => q !== "Zašto ime rezervirati sad?").flatMap((r) => {
      if (r[0] === "Što je LAKAT?") return [r, PREDNARUDZBA];
      if (r[0] === "Kad izlazi?") return [[r[0], "1. 12. 2026. u podne, na iPhoneu. Prednaručiti možeš već sad."], EU];
      return [r];
    });
  }
  if (!live) return FAQ;
  return FAQ.filter(([q]) => q !== "Zašto ime rezervirati sad?").flatMap(([q, a]) =>
    q === "Kad izlazi?"
      ? [[q, "Već je vani, na iPhoneu. Android stiže u siječnju 2027."], ...(APP_STORE ? [EU] : [])]
      : q === "Što je s mojim računom s weba?"
        ? [[q, "Ostaje. Prijaviš se u aplikaciji istim podacima i sve te čeka."]]
        : [[q, a]]
  );
}
