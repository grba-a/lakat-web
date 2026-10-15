# SEO i AI pregled laktarenje.com, 15. 10. 2026.

**Danas: 4/10. Nakon stavki s „Da”: procjena 8/10.** Ocjena spremnosti, ne izmjereni promet: bez alata
ne znam volumen pretraga, a Search Console još ne postoji.

**Osnova je dobra.** HTTPS, http/www → apex (308), `/press/` → `/press`, `lang="hr"`, canonical na pravu domenu,
otvoren robots.txt, ispravan sitemap, 404 s noindex. Hreflang ne treba. Googlebot, bingbot, GPTBot,
OAI-SearchBot, ClaudeBot i PerplexityBot dobivaju 200.

**Što koči:**
- U DNS-u nema verifikacije Search Consolea.
- Stari app na **api.laktarenje.com** otvoren je za indeksiranje („Veliki update dolazi … pjaniji”).
- Naslov, H1 i tekst ne kažu „aplikacija za izlaske”, „druženje” ni „prijatelji”. „Lakat” je i dio tijela.
- Odgovori u „Pitaš se?” stižu tek na dodir; crawleri vide samo pitanja.
- Nema JSON-LD-a ni stranice s činjenicama koju bi AI citirao.

## Top 3

1. **Search Console + Bing** (CHECKLISTA.md) i **noindex** na api.laktarenje.com i proxyjanim rutama.
2. **Reci tražilici što je LAKAT:** naslov, opis, H1, jedan odlomak, odgovori FAQ-a u HTML-u. Izgled ostaje isti.
3. **/sto-je-lakat + JSON-LD** (jsonld.md) i ista rečenica opisa na webu, mrežama i u Storeu.

## Ključne riječi (prijedlog, bez volumena)

- `/`: LAKAT aplikacija, LAKAT app, laktarenje, aplikacija za izlaske s ekipom
- `/sto-je-lakat`: što je LAKAT, aplikacija za druženje s prijateljima, gdje su mi prijatelji večeras
- nakon 1. 12.: LAKAT iPhone, LAKAT App Store, LAKAT Android

„BeReal Hrvatska” drže veliki strani članci; najviše jedna činjenična rečenica usporedbe, bez tuđeg imena u naslovu.

## AI pretraga

- Google: AI Overviews i AI Mode ne traže posebnu optimizaciju, samo indeksiranu stranicu sa snippetom.
- robots.txt ostaje otvoren i trening botovima: novom brendu više vrijedi da ga modeli znaju.
- llms.txt: Google ga ne koristi, studije ne nalaze učinak. Opcionalno.
- Wikidata tek kad postoje neovisni članci, nakon lansiranja.

## Codexove stavke koje vrijede i za SEO

**mobilni-lcp** (za SEO se računaju terenski CrUX podaci, kojih još nema; u `<head>` je 8 preloadova slika, namjeran
je samo hero.jsx:20), **og-odbrojavanje**, **metapodaci-lansiranje**, **lansiranje-store**, **mreze**, **ton-druzenja**.
`/favicon.ico` 404 nije SEO problem: Google koristi deklariranu ikonu 192×192.

Kod nije diran, obrazac nije poslan, nema commita ni deploya.

## Izvori

- Google: AI features and your website; Software App structured data (8. 9. 2026.); Build a sitemap (8. 7. 2026.)
- Google Search Central blog: HowTo and FAQ rich results (8. 8. 2023.)
- OpenAI: Overview of OpenAI Crawlers; Anthropic: support.claude.com/en/articles/8896518 (oba pristupljena 15. 10. 2026.)
- SE Ranking, llms.txt studija (2026.); Search Engine Land, Google o llms.txt (lipanj 2026.)
- eseospace.com, Bing Webmaster Tools i IndexNow za AI pretragu (2026.)
- Apple: Smart App Banners; Next.js 16.3.8 docs, json-ld.md
