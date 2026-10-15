# Pregled laktarenje.com — 15. 10. 2026.

**Danas: 6/10. Nakon prioritetnih popravaka: procjena 8/10.** Ovo je procjena jasnoće, konverzijskog puta i spremnosti, bez izmjerenog rasta prijava ili jamstva Appleova odobrenja.

Vizualni identitet, Krigla i stalni gumb daju stranici karakter. U pet sekundi, međutim, ne piše što je LAKAT, kome služi ni da mogu rezervirati ime. Obrazac se otvara jednim dodirom, ali strelica dolazi prije imena i privole. Voditelj obrade i kontakt postoje u pravnim stranicama; privatnost već pokriva Brevo i listu, premda PLAN to još vodi kao otvoreno.

Tri prioriteta prije 1. 12.:

1. **Objasniti proizvod i prodati ime.** Zadržati odabrani hero, dodati jednu jasnu rečenicu i poziv „Rezerviraj svoje ime”; runda treba biti razumljiva kao fotka druženja.
2. **Dovršiti prijavni put.** Gumb iza privole, pravila uz polja, fokus unutar obrasca i odvojena stanja poslane i potvrđene prijave. Osobni referral već postoji: povezati ga na preostale gumbe.
3. **Zatvoriti lansiranje do predaje Appleu 20. 11.** Provjeriti pravi App Store link, službeni badge, tekstove nakon izlaska i Android u siječnju 2027.; uvježbati prijelaz 1. 12. u 12:00 i zadržati potrebne proxy rute starog appa.

Lighthouse **13.5.0 / Chrome 155**, tri učitavanja bez prethodnog cachea, 390×844, DPR 1, simulirani mobilni profil: RTT 150 ms, 1.638 kbit/s, CPU ×4:

| Prolaz | Performanse /100 | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: |
| 1 | 55 | 4,037 s | 0 | 2.222,5 ms |
| 2 | 90 | 3,439 s | 0 | 38,5 ms |
| 3 | 91 | 3,398 s | 0,000082 | 92,5 ms |

Medijan LCP-a je **3,439 s**; [preporučeni cilj je 2,5 s](https://web.dev/articles/vitals). Prvi prolaz znatno odstupa po blokiranju; uzrok nije izoliran. To su laboratorijski rezultati, a ne terenski Safari/CrUX podaci. LCP element je dekorativna obala, već prioritetno učitana. Početni prijenos: približno **682 kB**, od toga slike 362, JS 174 i fontovi 102 kB; procijenjene slikovne uštede 234 KiB vrijede za testirani DPR.

**Playwright 1.63.0, pravi WebKit 26.6:** početna 360×640, 390×844, 430×844 i 1440×900; sve četiri stranice sitemapa dodatno 390/1440. Nema vodoravnog prelijevanja ni JavaScript grešaka. Smanjeno kretanje: 0 aktivnih animacija. Fokus izlazi iz otvorenog obrasca u pozadinski mail. Axe-core 4.13.0 na početnoj: 0 automatskih prekršaja, ali 39 neriješenih provjera kontrasta; to nije potvrda pune pristupačnosti. Ručni sRGB izračun placeholdera daje **4,3663:1**, ispod [4,5:1](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

HTTP/Playwright: sve stranice sitemapa, robots, OG i deklarirane PNG ikone vraćaju 200; canonicali koriste pravu domenu. `/favicon.ico` vraća 404, ali postoje deklarirane PNG ikone. JSON-LD nema. Prvi OG prikaz imao je 49 dana uz STALE cache, sljedeći ispravnih 46. HSTS, nosniff, SAMEORIGIN i Referrer-Policy postoje; CSP i Permissions-Policy nedostaju.

`/zaboravio-lozinku` radi prikaz; `/reset-lozinka` bez tokena nakon 12 s još provjerava link. Namjerno nevaljan `/f/KOD` daje 404: valjan poziv nije provjeren. Izračun datuma prelazi točno na 11:00 UTC, ali cijeli budući prijelaz nije izvršen. Hero je CSS; Lenis/GSAP nisu pronađeni. Postoje ženski opisi Krigle. [Apple 1.4.3](https://developer.apple.com/app-store/review/guidelines/#physical-harm) zabranjuje poticanje prekomjernog pijenja; maskota sama ne dokazuje povredu.

Nijedan obrazac nije poslan. Uspjeh, dostava maila i rezervacija nisu potvrđeni; njihove poruke pregledane su u kodu. Kod, commitovi, push i deploy ostali su netaknuti. Novi pokusi u JSON-u: prikaz dnevnog zvona i QR dolazak iz dogovorenog lokala. Učinak 3 je najveći; S/M/L označuju relativni trud, a preporuke nisu nalog za implementaciju.
