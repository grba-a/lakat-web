// Tura funkcija (Petar g4 „prodaja“, 2026-10-04; skraćeno 15. 10.).
// Svaka ideja samo jednom (isto-dvaput): Igra dana živi u sekciji igre ispod, a Ekipe je zamijenilo
// dnevno zvono „Sad ili nikad“ (c-sad-ili-nikad). Runda je objašnjena kao fotka, bez „tko časti“ (Apple 1.4.3).
// `scr` = snimka ekrana iz aplikacije; bez nje se ekran crta u CSS-u (components/zvono-ekran.jsx).
export const FEATURES = [
  {
    id: "karta",
    name: "Karta",
    title: "Vidiš tko je vani.",
    line: "Ekipa na karti uživo, dok tebe vide samo tvoji pajdaši.",
    krigla: "Ante je vani u Gružu. Ti si još na kauču.",
    alt: "LAKAT, ekran Karta: pajdaši koji su vani",
    scr: true,
  },
  {
    id: "runda",
    name: "Runda",
    title: "Jedan klik i svi znaju.",
    line: "Runda je fotka s mjesta gdje ste. Objaviš je i ekipa zna di si.",
    krigla: "Bepo je objavio rundu. Ideš?",
    alt: "LAKAT, ekran Runda: objava fotke s mjesta gdje se ekipa druži",
    scr: true,
  },
  {
    id: "zvono",
    name: "Sad ili nikad",
    title: "Zvoni jednom dnevno.",
    line: "Između 18 i 23 h svima zazvoni u istoj sekundi. Dvije minute da slikaš gdje si, a ekipu vidiš tek kad objaviš svoje.",
    krigla: "Krigla zvoni. Di si? Dokaži. Imaš 2 minute.",
    alt: "LAKAT, primjer dnevnog zvona Sad ili nikad: dvije minute za fotku",
    scr: false,
  },
  {
    id: "krigla",
    name: "Krigla",
    title: "Upoznaj Kriglu.",
    line: "Tvoj lik koji pamti svaku večer, daje zadatke i ne prašta kad ostaneš doma.",
    krigla: "To sam ja. Tjedan bez ekipe i vidiš kako sam prazan.",
    alt: "LAKAT, ekran Krigla: tvoj lik u aplikaciji i njegovi zadaci",
    scr: true,
  },
  {
    id: "film",
    name: "Film večeri",
    title: "Sutra u 12.",
    line: "Fotke iz večeri razviju se tek sutra u podne. Do tada ih nitko ne vidi, pa čak ni ti.",
    krigla: "Film je razvijen. Sjećaš li se ovoga?",
    alt: "LAKAT, ekran Film večeri: fotke koje se razviju sutra u podne",
    scr: true,
  },
];

// Funkcije koje nisu u turi (ne ponavljamo ih na početnoj), ali idu na /press i /sto-je-lakat.
export const JOS = [
  {
    id: "igra",
    name: "Igra dana",
    title: "Budi jedan od najboljih.",
    line: "Svaki dan nova igra, isti uvjeti za sve. Ti i pajdaši ste na istoj ljestvici.",
    alt: "LAKAT, ekran Igra dana: ista staza za sve",
    scr: true,
  },
  {
    id: "ekipe",
    name: "Ekipe",
    title: "Neka kafanski ratovi započnu.",
    line: "Skupi ekipu, skupljajte bodove i penjite se kroz lige.",
    alt: "LAKAT, ekran Ekipe: lige i bodovi ekipe",
    scr: true,
  },
];
