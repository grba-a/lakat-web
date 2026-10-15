# Jasnoća laktarenje.com: 15. 10. 2026.

**Jasnoća danas: 5/10. Nakon prijedloga: procjena 8/10.** Procjena, ne izmjeren rast. Nadovezuje se na Codexov pregled; njegove stavke (hero-cta, rezervacija-imena, redoslijed-obrasca, potvrda-upisa, referral-kod) se ne ponavljaju.

Metoda: Playwright 1.63, WebKit, 390×844, živa stranica. Nijedan obrazac nije poslan (`/api/lista` blokiran u skripti). Detektor impeccable: 0 nalaza.

## Put danas

| Korak | Gdje | Stanje |
|---|---|---|
| Prvi ekran | 0 px | Šank, timer i mobitel; ne piše što je LAKAT (hero-cta) |
| Razumijevanje | 813–4.695 px | Šest funkcija, gotovo pet ekrana, bez „kako radi” |
| Želja | 4.695–8.743 px | Tajna, Podne, igra, film, privatnost: zabavno, ali ništa ne vodi prema imenu |
| Rezervacija imena | 9.263 px | Sedam polja, ime je peto; nema razloga zašto baš sad |
| Potvrda maila | /potvrdeno | Ulaznica i link su dobri; Kvart i Krigla bi tu imali posao |
| Dijeljenje | /potvrdeno | Postoji, vidi referral-kod |

Stranica ima 12.592 px i 14 sekcija; obrazac počinje na 74 % visine.

## Gdje ljudi odustaju i zašto

- **22 godine, Split, link s Instagrama:** sviđa joj se ton, Krigla i timer, ali nakon tri ekrana ture još ne zna što će zapravo raditi. Donji gumb „Javi mi prvi” obećava mail, a ne ime. Izlazi tijekom ture.
- **Skeptik, 30:** traži odgovor je li ovo app za pijenje, tko to vidi i postoji li stvarno. Kotač „PIVA” ga potvrdi u sumnji, privatnost dolazi tek na 8.339 px, a jedina brojka, „16 % napunjeno” uz tužnu Kriglu, kaže da nema nikoga. Izlazi prije obrasca.
- **Korisnik web appa:** želi znati što se mijenja. Odgovor je treći chip u FAQ-u na 10.751 px. Ne zna treba li se upisivati, pa odustaje.

Uzroci: proizvod nigdje ne objašnjavaju ni rečenica ni tri koraka, pet ideja se ponavlja, obrazac je predaleko i predug, a „dokaz” radi protiv prijave.

## Što predlažem

Devet sekcija umjesto 14, svaka s jednim poslom (`nova-struktura`). Na početku su tri koraka, zatim tura od četiri ekrana, pa privatnost, a obrazac je peti, oko 4.500 px. Jedini veliki element: **tvoje @ime uživo u Kriglinom pushu** (`ime-uzivo`). Krigla, timer, igra, film i lov na Krigle ostaju; Napunite Kriglu, Kvart protiv kvarta i Tapete sele na /potvrdeno, gdje tjeraju na dijeljenje.

Otvoreno za Petra: dodjeljuje li aplikacija rezervirano ime 1. 12.; dobivaju li postojeći korisnici mail; smije li se na stranici spomenuti cijena ili broj korisnika weba.
