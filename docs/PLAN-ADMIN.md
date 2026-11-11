# LAKAT /admin — plan (Petar 11. 11. 2026)

Odluke: https://claude.ai/artifact/Ab6FjVQovojPA1uDbXhC1D (db `odluke/`). Pravila: samo zbrojevi gdje nije drugačije
dogovoreno; tajne samo u `~/.config/lakat/` i Vercel Sensitive; SQL samo service_role; Petar je jedini korisnik (Jan: Ne).
Deploy na laktarenje.com samo na Petrovu riječ (push radi on ili kaže „guraj").

## Stanje
- LIVE `1a9cb51` (11. 11. ~21 h): brojač pokušaja, faza 1, brutalistički Tactical Telemetry izgled s pokretom i auto-osvježavanjem.
- Lokalno, čeka push: tooltipi, traka uzbuna, odjeljak Baza, Codex popravci (SQL 4 i 5 te novi 3 već na PROD).

## Faza 1 — izgled i segmenti (sve „Da") — GOTOVO lokalno 11. 11. (`857f056`)
Odjeljci s izbornikom (Pregled, Rast, Angažman, Igre, Push, Akvizicija, App Store), razdoblje 7/30/90 + usporedba,
segmenti (platforma, izvor, grad, kvart; < 3 osobe = „manje od 3"), kohorte D1/D7/D30, lijevak (posjet → lista →
registracija → prva runda → prvi pajdaš), dan × sat. Iz baze: runde po kafiću, što se pije, viralnost (pozivni linkovi,
pajdaši po korisniku), korištenje značajki, zdravlje (push greške), prijave i blokade, bodovi i dućan.
SQL: `supabase-admin3.sql` (nova funkcija s parametrom razdoblja; stara ostaje dok novi kod ne ode van).

## Faza 2 — Apple, web, mail (sve „Da")
App Analytics (request 29f70416…, Sales ključ ga smije čitati): Discovery and Engagement, Downloads, Pre-orders po izvoru,
Sessions, Installs/Deletions, Crashes. Ocjena: javni iTunes lookup (country=hr). Posjete laktarenje.com: Vercel Web
Analytics API (treba Vercel token od Petra, Sensitive). Brevo statistika mailova (postojeći BREVO_API_KEY).

## Faza 3 — jača prijava, pa leadovi
2FA (TOTP, Passwords na iPhoneu) + zapis prijava. Tek onda leadovi: tablica liste čekanja, tražilica, filteri, izvoz za
mail o izlasku (samo ta svrha).

## Runda 2 — GOTOVO lokalno `52d24c7` (čeka push)
Artifact Gw9JmnJB3J1L9mE4KX3UQX (sve Da; identitet „oboje", bez previše boja) + Codex pregled dizajna:
znak + obrisni broj + 3 boje skupina, bijeli filteri, lijevi izbornik / 12 stupaca, glavna brojka, tražilica,
sortiranje + CSV, sparkline, graf s duhom + ladica dana (`supabase-admin6.sql`, PROD), dva lijevka, plava
toplinska tablica povratka, TV način `/admin/tv`. Odbijeno od Codexa: gašenje animacija i trake (Petar želi pokret).

## Faza U — uzbune (Petar 11. 11.: mail + push na grbaa, tihi sati 00–08, sve vrste)
- Lokalno gotovo: `lib/upozorenja.js` (kritično/važno/info) + traka na vrhu ploče + odjeljak Baza (`supabase-admin4.sql`, PROD).
- Raspored: Vercel Hobby smije cron samo dnevno, zato Supabase `pg_cron` + `pg_net` (oba već na PROD) svakih 5 min
  zove `POST laktarenje.com/api/admin/provjera` s tajnom (Supabase Vault + Vercel Sensitive `CRON_SECRET`).
- Ruta skuplja provjere, sprema snimku i incidente: `admin_uzbune(fingerprint, razina, stanje, prvi/zadnji put,
  broj, potvrdeno_at, rijeseno_at, detalj)` + `admin_isporuke(uzbuna, kanal, epizoda, stanje, pokusaja)` (Codex prijedlog 4).
  Jedna otvorena uzbuna po fingerprintu; poruka pri otvaranju, eskalaciji i oporavku.
- Mail: Brevo na Petrovu adresu (Vercel Sensitive `ADMIN_MAIL`, ne u repo). Push: mala ruta u lakat-pwa (api.laktarenje.com)
  šalje APNs samo `is_admin` profilima (grbaa) — novi kod u živoj aplikaciji, deploy samo na njegovu riječ.
- Vanjski otkucaj srca (Codex 3): besplatni uptime monitor na `/api/zdravlje`, jer pg_cron ne javlja ako je pala sama baza.
- Snimke Apple Analyticsa spremati dnevno (instance se brišu nakon 35 dana; Codex 9).

## Codex pregled 11. 11. (FAIL → popravljeno `c555ea4`)
- Medium 1 zajednička brava → maknuta (`supabase-admin5.sql`). Medium 2 male skupine → kohorte, kafići, skupni kvart.
- Prihvaćena ograničenja (Petar je jedini čitatelj i voditelj obrade): dnevni zbrojevi, dan × sat, pića, push i web
  brojači mogu biti od jedne osobe; Apple grupa „Petar" ima 1 člana (on sam).

## Faza 4 — tjedni sažetak mailom (ponedjeljak ujutro, samo Petru)

## Parkirano (Možda)
Pitanja Petru 11. 11.: 2FA „Da“? Rečenica o zbirnoj statistici u Privatnost? Tražilica korisnika i odlomak o adminu u Privatnosti. Rečenica o zbirnoj statistici: pitanje Petru.

## Odluke 11. 11. noć (artifact 2azobNDkVa4jmKKsynBz26)
Da: Instagram statistika (instagram_manage_insights + novi token, Petar dodaje), oglasi samo čitanje od 1. 12. (ads_read),
ratna soba za 1. 12., tjedni sažetak s Instagramom, špijunski efekti u kodu, Higgsfield pozadina „kao Matrix“ (skice prvo).
Ne: Facebook stranica, zvukovi (umjesto toga vizualni skočni prozor HITNO / NOVOST). Odmah osvježavanje pri povratku na karticu: Da.
Uzbune mailom + pushom na grbaa: Da (čeka Vercel tokene; push ruta u lakat-pwa na Petrovu riječ).
