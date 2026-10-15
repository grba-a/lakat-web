# Petrova checklista: LAKAT u Googleu i Bingu

Treba ti: pristup Namecheapu (tamo je DNS za laktarenje.com) i Google račun. Oko 20 minuta.
Ništa od ovoga ne mijenja kod ni stranicu.

## Google Search Console (jednom)

1. Otvori https://search.google.com/search-console → **Dodaj svojstvo** → lijevo **Domena** → upiši `laktarenje.com` → Nastavi.
2. Google pokaže redak koji počinje s `google-site-verification=…`. Kopiraj ga cijelog.
3. Namecheap → **Domain List** → kod laktarenje.com **Manage** → kartica **Advanced DNS** → **Add New Record**:
   - Type: **TXT Record**, Host: **@**, Value: zalijepi redak iz koraka 2, TTL: Automatic → kvačica (spremi).
   - **Ne briši** postojeće TXT zapise (`brevo-code…` i `v=spf1…`): o njima ovise mailovi s liste.
4. Vrati se u Search Console → **Potvrdi**. Ako ne prođe odmah, pričekaj 15–60 min i probaj opet.
   Domena pokriva i www, http i api.laktarenje.com.
5. Lijevo **Sitemapovi** → upiši `sitemap.xml` → **Pošalji**. Status treba biti „Uspjeh”.
6. Gore u traku upiši `https://laktarenje.com` → **Testiraj objavljeni URL** → kad prođe, **Zatraži indeksiranje**.
   Ponovi za `https://laktarenje.com/press`.

## Bing Webmaster Tools (za Bing, Copilot i AI pretrage koje se oslanjaju na Bing)

7. Otvori https://www.bing.com/webmasters → prijava → **Import from Google Search Console** → odaberi laktarenje.com → Import.
8. Lijevo **URL Submission** → zalijepi `https://laktarenje.com` → Submit.

## Provjera nakon 3–7 dana

9. Search Console → **Stranice**: početna mora biti pod „Indeksirano”. Ako piše „Otkriveno, trenutačno nije indeksirano”, samo čekaj.
10. U Googleu upiši `site:laktarenje.com`. Ako se pojavi **api.laktarenje.com** („Veliki update dolazi”), javi Claudeu:
    prvo ide noindex (stavka api-subdomena), a tek onda Search Console → **Uklanjanja** → Novi zahtjev.
11. Probaj „LAKAT aplikacija” u Googleu, ChatGPT-u (pretraga uključena) i Perplexityju. Zapiši što piše, da imamo usporedbu.

## Profili (jednom)

12. Instagram, Facebook i TikTok: ime **LAKAT**, ista rečenica opisa i link **laktarenje.com**.
    Na Facebooku link ide u polje Website (Uredi detalje stranice).

## 1. 12. u podne (s Claudeom)

13. App Store link upisuješ u Vercel (`NEXT_PUBLIC_APP_STORE_URL`); Claude radi redeploy tek na tvoju riječ.
    Bez novog deploya Smart App Banner i gumbi ne vide link.
14. Search Console → početna → **Zatraži indeksiranje** opet. Bing → **URL Submission** opet.
15. App Store link dodaj u bio na Instagramu, Facebooku i TikToku (uz laktarenje.com).
