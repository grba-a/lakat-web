import { LAKAT_11 } from "./launch";

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

// 1.1 (Petar 5. 11., kartica „tura“, „sve novo da“): u turi Karta i Runda ustupaju mjesto „Vani sam“ uživo i
// „Stižem za“; Sad ili nikad, Krigla i Film ostaju. Tekst je usklađen s appom (Core/Vani.swift, SankSaziv.swift).
// Ekrani su zasad iz simulatora s DEV testnim podacima (lakat-ios/shots vani-3, sinoc-2); prije objave ide čista snimka.
export const TURA_11 = [
  {
    id: "vani",
    name: "Vani sam",
    title: "Vani sam uživo.",
    line: "Upališ „Vani sam“ i pajdaši te vide na karti uživo, dok ne kažeš „Doma sam“.",
    krigla: "Mare je vani u Gružu. Ti si još na kauču.",
    alt: "LAKAT 1.1, karta s upaljenim „Vani sam“: pajdaši vide tvoj pin dok si vani",
    scr: true,
  },
  {
    id: "stizem",
    name: "Stižem za",
    title: "Stižem za 20.",
    line: "Netko zove van? Jedan dodir, „Stižem za 10, 20 ili 30“, i ekipa zna kad dolaziš.",
    krigla: "Cvitan stiže za 20. A ti?",
    alt: "LAKAT 1.1, Šank s pozivom van i gumbom „Stižem“",
    scr: true,
  },
];

// Što tura prikazuje: s 1.1 prva dva ekrana su nova.
export const TURA = LAKAT_11 ? [...TURA_11, ...FEATURES.slice(2)] : FEATURES;

// „Još u 1.1“ (kartica jos11): šest ostalih novosti, svaka u jednom retku. Provjereno uz BUMP-PLAN i kod appa
// (KriglaNaKarti, Gledali, LakatSignal + LakatUzivo, Pokazi, SinocPrica, SankDemo).
export const JOS_11 = [
  { id: "globus", name: "Krigla na globusu", line: "Odzumiraš i negdje u svijetu stoji. Svaki dan drugdje, tap otvara igre." },
  { id: "gledali", name: "Tko te gledao", line: "Koliko ti je pajdaša danas otvorilo pin. Imena nikad." },
  { id: "lakat", name: "Daj lakat", line: "Tap je mali lakat, držiš za veliki. Uživo kad ste oboje vani, na 100 m." },
  { id: "pokazi", name: "Pokaži se", line: "Tražiš pajdaša da se pokaže. Ima 2 sata da objavi rundu." },
  { id: "sinoc", name: "Sinoć ukratko", line: "Ujutro kratka priča od sinoćnjih rundi ekipe." },
  { id: "demo", name: "Probaj prije prijave", line: "Šank koji diraš prije nego se upišeš." },
];
