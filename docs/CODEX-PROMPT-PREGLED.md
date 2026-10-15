Codex, pregled stranice laktarenje.com za LAKAT (ista sesija kao Krigline poze). Samo čitaš, gledaš i pišeš izvještaj —
ne mijenjaj kod, ne commitaj, ne pushaj, ne deployaj.

## Što je LAKAT i što stranica radi
LAKAT je hrvatska iOS aplikacija za izlaske s ekipom: pajdaši objave „rundu" (slika iz kafića), samo prihvaćeni pajdaši je
vide, „Sad ili nikad" je dnevno zvono, Krigla je maskota (muško), ton je zajebantski ali gramatički točan. Lansiranje
**1. 12. 2026. samo iPhone** (Android u siječnju), predaja Appleu do 20. 11. LAKAT je o druženju s ekipom, NE o alkoholu
(Apple 1.4.3). laktarenje.com je landing s odbrojavanjem do 1. 12. i listom čekanja na kojoj ljudi rezerviraju ime.
Instagram @lakat_app, Facebook https://web.facebook.com/profile.php?id=61595344256488, TikTok https://www.tiktok.com/@lakat_app.

## Materijal
- Živa stranica: https://laktarenje.com (i sve podstranice iz sitemapa).
- Kod: `~/Projects/lakat-web` (Next.js + Tailwind, Vercel). Prvo pročitaj `CLAUDE.md`, `AGENTS.md`, `docs/PLAN.md`
  (Petrove odluke o stranici) i `README.md`.
- Petrova pravila: `~/vault/AGENTS.md` (mobile first, provjera na 360/390/430 u pravom WebKitu, bez Lenisa, hero animacije
  u CSS-u a ne GSAP-u, nikad izmišljena cijena/broj/recenzija/tvrdnja, KISSS: najjednostavnije što radi + jedan smion element).

## Pravila
- **NE šalji formulare** (lista čekanja, rezervacija imena, kontakt) — to su pravi podaci i pravi mailovi. Formu samo
  pregledaj: validacija u pregledniku, poruke grešaka, pristupačnost, bez slanja.
- Ne otvaraj ništa u `~/.config/` i ne prepisuj ključeve.

## Što pregledati (kao CEO kojem stranica mora napuniti listu čekanja i App Store 1. 12.)
1. Prvi dojam na mobitelu (360/390/430 WebKit) i desktopu: je li u 5 sekundi jasno što je LAKAT i što da napravim.
2. Konverzija: put do rezervacije imena, tekstovi gumba, prepreke, povjerenje (privatnost, tko stoji iza).
3. Tekst: hrvatski, ton, gramatika, padeži („na LAKTU", nikad „LAKAT-u"), Krigla u muškom rodu, ništa što slavi pijenje.
4. Brzina i tehnika: LCP/CLS na mobitelu, slike, fontovi, JS, konzola, 404, meta/OG slike za dijeljenje, favicon,
   sitemap/robots, structured data, pristupačnost (kontrast, fokus, alt), sigurnosni headeri.
5. Lansiranje: što se mora promijeniti 1. 12. (odbrojavanje → App Store gumb, Android lista „u siječnju", linkovi na
   Facebook i TikTok kojih možda još nema, poziv pajdaša /f/KOD i reset lozinke koji se prosljeđuju na staru app).
6. Nove ideje koje bi dovele ljude (bez izmišljenih brojki).

## Izlaz (strogo ovako, da ga Claude složi u artifact)
Mapa `~/Projects/lakat-web/docs/codex-pregled-2026-10-15/`:
- `snimke/` — snimke ekrana stanja koje kritiziraš (PNG, ime = id stavke, npr. `hero-cta.png`; mobitel 390 px osim ako
  stavka traži drugo).
- `stavke.json` — niz 10–20 stavki, svaka:
  `{"id":"kratki-id","vrsta":"popravak|bolje|novo","naslov":"do 5 riječi","recenica":"jedna rečenica do 30 riječi, za
  dizajnera a ne programera","dokaz":"URL, file:line ili izmjereni broj","prijedlog":"što točno napraviti (2–3 rečenice)",
  "ucinak":1-3,"trud":"S|M|L","snimka":"snimke/x.png ili null","preporuka":"Da|Ne|Možda"}`
- `PREGLED.md` — na hrvatskom, najviše 600 riječi: ocjena danas i nakon popravaka (1–10), tri najvažnije stvari prije
  1. 12., što si izmjerio (brojevi s alatom kojim si mjerio).
Zatim napravi handoff `~/vault/00-Inbox/handoff-codex-2026-10-15-laktarenje-pregled.md` po pravilima iz `~/vault/AGENTS.md`
i reci Petru da je red na Claudeu.
