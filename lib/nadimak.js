// Provjera nadimka za javnu ljestvicu igre. Psovke su u aplikaciji dopuštene, ali ova ljestvica stoji na
// javnoj početnoj stranici, pa ovdje ne prolaze ni psovke ni mržnja. Baza još pita i filter aplikacije
// (filter_blokira), ako postoji. Normalizacija kao u lakat-ios supabase-filter1.sql: kvačice, 0→o, 3→e, ponavljanja.
const DOPUSTENO = /^[A-Za-z0-9ČĆŠĐŽčćšđž ._-]{2,16}$/;

const ZABRANJENO = [
  "kurac", "kurc", "kurv", "picka", "pick", "pizd", "jeb", "jebe", "drolj", "peder", "pedercin", "govn", "sranj",
  "seronj", "kreten", "debil", "mamu ti", "mater", "fuck", "fuk", "shit", "cunt", "dick", "cock", "pussy", "bitch",
  "whore", "slut", "nigg", "nigga", "fag", "porn", "sex", "rape", "nazi", "hitler", "ustas", "cetnik", "ubij",
  "zakolj", "klati", "isis", "boga ti", "bogati", "isusa", "sveca",
];

function normaliziraj(t) {
  return String(t || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[0134578@$]/g, (c) => ({ 0: "o", 1: "i", 3: "e", 4: "a", 5: "s", 7: "t", 8: "b", "@": "a", $: "s" })[c])
    .replace(/[^a-z ]+/g, "")
    .replace(/([a-z])\1+/g, "$1");
}

export function cistiNadimak(t) {
  return String(t || "").replace(/\s+/g, " ").trim();
}

// Vraća poruku greške ili "" ako je nadimak u redu.
export function provjeriNadimak(t) {
  const ime = cistiNadimak(t);
  if (!DOPUSTENO.test(ime)) return "Nadimak: 2 do 16 slova, brojki, razmaka, točke ili crtice.";
  const n = normaliziraj(ime);
  const spojeno = n.replace(/ /g, "");
  if (ZABRANJENO.some((r) => n.includes(r) || spojeno.includes(r.replace(/ /g, "")))) return "Taj nadimak ne ide na ljestvicu. Probaj drugi.";
  return "";
}
