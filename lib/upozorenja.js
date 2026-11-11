// Uzbune /admin ploče: iz već dohvaćenih podataka izračuna što ne štima.
// Razine: kriticno (app ili baza ne radi), vazno (treba pogledati danas), info (zanimljivo).
// Isti popis kasnije koristi i cron koji šalje mail i push (docs/PLAN-ADMIN.md).
const MB = 1024 * 1024;

export function provjere({ pregled, asc, baza }) {
  const u = [];
  const dodaj = (razina, kljuc, naslov, detalj) => u.push({ razina, kljuc, naslov, detalj });

  if (pregled?.greska) dodaj("kriticno", "baza-pregled", "Brojke aplikacije se ne učitavaju", pregled.greska);
  if (baza?.greska) dodaj("kriticno", "baza-zdravlje", "Baza ne odgovara", baza.greska);
  if (asc?.greska) dodaj("vazno", "apple-kljuc", "Apple ključ ne radi", asc.greska);

  const p = pregled?.podaci;
  const b = baza?.podaci;

  if (b) {
    const udio = b.spajanja_max ? b.spajanja / b.spajanja_max : 0;
    if (udio >= 0.8) dodaj("vazno", "baza-spajanja", "Baza blizu limita spajanja", `${b.spajanja} od ${b.spajanja_max}`);
    if (b.najduzi_upit_s >= 60) dodaj("vazno", "baza-spori-upit", "Spori upit u bazi", `traje ${b.najduzi_upit_s} s`);
    if (b.admin_promasaji_1h >= 5) dodaj("vazno", "admin-pogadanje", "Netko pogađa admin šifru", `${b.admin_promasaji_1h} promašaja u zadnjem satu`);
    if (b.cache_pct != null && Number(b.cache_pct) < 95) dodaj("info", "baza-cache", "Baza čita s diska", `cache ${String(b.cache_pct).replace(".", ",")} %`);
  }

  if (p) {
    const z = p.zdravlje ?? {};
    if (z.push_greske >= 10 && z.push_greske > 3 * (z.push_greske_prije || 0))
      dodaj("vazno", "push-greske", "Skok push grešaka", `${z.push_greske} u ${p.dana} d (prije ${z.push_greske_prije ?? 0})`);
    if (p.moderacija?.cekaju > 0) dodaj("vazno", "prijave", "Prijava čeka tvoju odluku", `${p.moderacija.cekaju} otvorenih`);
    const dau = p.kpi?.dau;
    if (dau && Number(dau.prije) >= 4 && Number(dau.sad) < 0.5 * Number(dau.prije))
      dodaj("vazno", "pad-aktivnih", "Nagli pad aktivnih", `${String(dau.sad).replace(".", ",")} / dan prema ${String(dau.prije).replace(".", ",")}`);
  }

  const st = asc?.verzija?.stanje;
  if (st === "REJECTED" || st === "METADATA_REJECTED" || st === "INVALID_BINARY")
    dodaj("kriticno", "apple-odbijeno", "Apple je odbio verziju", `${asc.verzija.verzija}: ${st}`);
  if (st === "PENDING_DEVELOPER_RELEASE") dodaj("vazno", "apple-ceka", "Verzija čeka tvoje puštanje", asc.verzija.verzija);

  const red = { kriticno: 0, vazno: 1, info: 2 };
  return u.sort((a, c) => red[a.razina] - red[c.razina]);
}

export const mb = (b) => {
  if (b == null) return "—";
  if (b >= 1024 * MB) return `${(b / (1024 * MB)).toFixed(2).replace(".", ",")} GB`;
  if (b >= MB) return `${Math.round(b / MB)} MB`;
  return `${Math.max(1, Math.round(b / 1024))} kB`;
};
