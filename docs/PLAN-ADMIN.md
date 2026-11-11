# LAKAT /admin — plan (Petar 11. 11. 2026)

Odluke: https://claude.ai/artifact/Ab6FjVQovojPA1uDbXhC1D (db `odluke/`). Pravila: samo zbrojevi gdje nije drugačije
dogovoreno; tajne samo u `~/.config/lakat/` i Vercel Sensitive; SQL samo service_role; Petar je jedini korisnik (Jan: Ne).
Deploy na laktarenje.com samo na Petrovu riječ (push radi on ili kaže „guraj").

## Stanje
- LIVE `1a9cb51` (11. 11. ~21 h): brojač pokušaja, faza 1, brutalistički Tactical Telemetry izgled s pokretom i auto-osvježavanjem.

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

## Faza 4 — tjedni sažetak mailom (ponedjeljak ujutro, samo Petru)

## Parkirano (Možda)
Pitanja Petru 11. 11.: 2FA „Da“? Rečenica o zbirnoj statistici u Privatnost? Tražilica korisnika i odlomak o adminu u Privatnosti. Rečenica o zbirnoj statistici: pitanje Petru.
