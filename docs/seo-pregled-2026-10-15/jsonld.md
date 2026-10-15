# JSON-LD za laktarenje.com (prijedlog, 15. 10. 2026.)

Ništa od ovoga još nije u kodu. Sve što nije potvrđeno označeno je kao `[[POTVRDI: …]]`. Takva vrijednost
**ne smije** otići na produkciju: ili je Petar potvrdi, ili se cijelo svojstvo briše.

**Kako ugraditi (Next 16):** prema `node_modules/next/dist/docs/01-app/02-guides/json-ld.md` blok ide kao
`<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />`
u `app/page.jsx` (početna) odnosno na stranicu kojoj pripada. Ne u `layout.jsx`, jer bi ga onda dobile i 404 i /potvrdeno.

**Provjera:** https://validator.schema.org/ (sintaksa) i https://search.google.com/test/rich-results (Google).
Rich Results Test za aplikaciju javit će da fali `aggregateRating`/`review`: Google ga traži za prikaz zvjezdica
(dokumentacija ažurirana 8. 9. 2026.). Ocjena još nema i **ne izmišljamo ih**; podaci služe za prepoznavanje
entiteta i imena stranice, ne za rich result.

Svi blokovi ispod prošli su `json.loads` (ispravan JSON).

---

## 1. Početna (`/`) prije lansiranja: Organization + WebSite + MobileApplication

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://laktarenje.com/#organization",
      "name": "LAKAT",
      "alternateName": ["LAKAT aplikacija", "LAKAT app"],
      "url": "https://laktarenje.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://laktarenje.com/apple-icon.png",
        "width": 180,
        "height": 180
      },
      "email": "support@laktarenje.com",
      "sameAs": [
        "https://www.instagram.com/lakat_app/",
        "https://www.facebook.com/profile.php?id=61595344256488",
        "https://www.tiktok.com/@lakat_app"
      ],
      "founder": {
        "@type": "Person",
        "name": "[[POTVRDI: smije li ime 'Petar Grbić' stajati ovdje? Inače obriši cijeli 'founder'.]]"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://laktarenje.com/#website",
      "url": "https://laktarenje.com",
      "name": "LAKAT",
      "alternateName": "laktarenje.com",
      "inLanguage": "hr-HR",
      "publisher": { "@id": "https://laktarenje.com/#organization" }
    },
    {
      "@type": "MobileApplication",
      "@id": "https://laktarenje.com/#app",
      "name": "LAKAT",
      "description": "LAKAT je hrvatska društvena aplikacija za izlaske s ekipom. Na karti vidiš tko je od pajdaša vani, objaviš rundu, a vide te samo pajdaši koje prihvatiš. Izlazi 1. 12. 2026. u 12:00 na iPhoneu.",
      "operatingSystem": "iOS",
      "applicationCategory": "SocialNetworkingApplication",
      "inLanguage": "hr",
      "url": "https://laktarenje.com",
      "image": "https://laktarenje.com/apple-icon.png",
      "publisher": { "@id": "https://laktarenje.com/#organization" }
    }
  ]
}
```

Napomene:
- `founder` je jedino nepotvrđeno polje. Ime i adresa već stoje na /privatnost i /uvjeti (app/pravno.jsx:8-10),
  ali adresu u JSON-LD **ne** stavljamo.
- Bez `offers` prije lansiranja: aplikacija se još ne može preuzeti.
- `description` je doslovno sastavljen iz /press („Ukratko”, app/press/page.jsx:29-34).

## 2. Početna nakon lansiranja (1. 12. u 12:00): zamjena za MobileApplication

Isti `@graph`, samo MobileApplication postaje ovo, a App Store URL se doda i u `sameAs` organizacije.

```json
{
  "@type": "MobileApplication",
  "@id": "https://laktarenje.com/#app",
  "name": "LAKAT",
  "description": "LAKAT je hrvatska društvena aplikacija za izlaske s ekipom. Na karti vidiš tko je od pajdaša vani, objaviš rundu, a vide te samo pajdaši koje prihvatiš. Dostupna na iPhoneu.",
  "operatingSystem": "[[POTVRDI: najniža verzija iOS-a, npr. 'iOS 17.0 ili novije']]",
  "applicationCategory": "SocialNetworkingApplication",
  "inLanguage": "hr",
  "url": "https://laktarenje.com",
  "image": "https://laktarenje.com/apple-icon.png",
  "downloadUrl": "[[POTVRDI: https://apps.apple.com/hr/app/lakat/id… (NEXT_PUBLIC_APP_STORE_URL)]]",
  "installUrl": "[[POTVRDI: isti App Store link]]",
  "datePublished": "2026-12-01",
  "contentRating": "[[POTVRDI: dobna oznaka iz App Store Connecta, npr. '17+']]",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "url": "[[POTVRDI: isti App Store link]]"
  },
  "publisher": { "@id": "https://laktarenje.com/#organization" }
}
```

Napomene:
- `price: "0"` oslanja se na Uvjete („LAKAT je besplatan”, app/uvjeti/page.jsx:96). **Potvrdi** to i za
  Dućan / sezonsku propusnicu: ako ima kupnji u aplikaciji, cijena preuzimanja je i dalje 0, ali opis ne smije
  reći „potpuno besplatno”.
- `aggregateRating` dodati **tek** kad App Store pokaže stvarne ocjene, i to s točnim brojevima iz Storea.
- Android: kad izađe, `operatingSystem` postaje „iOS, Android” i dodaje se Google Play link. Mjesec (siječanj 2027.)
  ne stavljati u podatke dok ga Petar ne objavi javno (vidi Codex android-sijecanj).

## 3. FAQPage (samo na stranici gdje su odgovori vidljivi u HTML-u)

Google FAQ rich result od kolovoza 2023. prikazuje samo vladinim i zdravstvenim stranicama. Oznaka i dalje
pomaže da tražilice i AI alati prepoznaju pitanje i odgovor. Pravilo: tekst u JSON-LD mora biti **isti** kao
vidljivi tekst na stranici. Danas su odgovori skriveni iza dodira (stavka faq-u-html), pa ovo ide tek kad
odgovori postanu vidljivi. Odgovori ispod su doslovno iz components/sections.jsx:143-149 i /press.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "inLanguage": "hr",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Što je LAKAT?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "LAKAT je hrvatska društvena aplikacija za izlaske s ekipom. Na karti vidiš tko je od pajdaša vani, objaviš rundu, a Krigla, tvoj lik u aplikaciji, daje zadatke i pamti večeri."
      }
    },
    {
      "@type": "Question",
      "name": "Kad izlazi LAKAT?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "1. 12. 2026. u podne. Prvo na iPhoneu, Android uskoro iza."
      }
    },
    {
      "@type": "Question",
      "name": "Imam Android. Što sad?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Stiže iza iPhonea. Ostavi mail i javim ti kad stigne."
      }
    },
    {
      "@type": "Question",
      "name": "Tko me vidi na karti?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Samo pajdaši koje prihvatiš. Javno samo ako ti to uključiš."
      }
    },
    {
      "@type": "Question",
      "name": "Što je s mojim računom s weba?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ostaje. Prijaviš se u aplikaciji i sve te čeka."
      }
    }
  ]
}
```

Pitanja koja vrijedi dodati **tek s Petrovim odgovorom** (ljudi ih pitaju, AI ih pita):
- „Je li LAKAT besplatan?” → `[[POTVRDI]]` (Uvjeti kažu besplatan; što s kupnjama u aplikaciji?)
- „Je li LAKAT aplikacija za alkohol?” → `[[POTVRDI]]` (smjer: druženje, „Kava se isto računa”)
- „Što je runda?” → `[[POTVRDI]]`
- „Što je Sad ili nikad?” → `[[POTVRDI: je li zvono u verziji 1. 12.?]]`
- „Koliko godina moram imati?” → `[[POTVRDI: 18+ kao na listi ili dobna oznaka Storea]]`

## 4. BreadcrumbList (opcionalno, podstranice)

Stranica je plitka, pa je korist mala. Ako se radi, primjer za /press (isti obrazac za /sto-je-lakat):

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "LAKAT", "item": "https://laktarenje.com" },
    { "@type": "ListItem", "position": 2, "name": "Press", "item": "https://laktarenje.com/press" }
  ]
}
```

## 5. Odlomak „Što je LAKAT” (za stranicu, llms.txt, bio i press)

Jedan tekst, isti svugdje, da ga AI alati citiraju doslovno. Činjenice su s /press; objašnjenje runde (fotka kad ste vani) je iz Petrova opisa proizvoda, pa ga on potvrđuje prije objave:

> LAKAT je hrvatska društvena aplikacija za izlaske s ekipom. Na karti vidiš tko je od pajdaša vani, objaviš
> rundu, fotku s mjesta gdje se družite, a tebe vide samo pajdaši koje prihvatiš. Krigla, tvoj lik u aplikaciji,
> daje zadatke i pamti večeri. LAKAT izlazi 1. 12. 2026. u 12:00 na iPhoneu, a Android stiže poslije.

Kad Petar potvrdi, dodati rečenicu o dnevnom zvonu „Sad ili nikad” i mjesec za Android.
