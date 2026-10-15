// Strukturirani podaci (SEO pregled json-ld, docs/seo-pregled-2026-10-15/jsonld.md), sve potvrdio Petar 15. 10.:
// osnivač Petar Grbić (osnivac A), tri mreže, besplatan (Uvjeti), iOS 26.0+, dobna oznaka 18+.
// App Store link dolazi samo iz env varijable (NEXT_PUBLIC_APP_STORE_URL); bez nje ga nema nigdje. Ocjene se ne izmišljaju.
import { APP_STORE } from "./launch";
import { DOMENA, JEDNA_RECENICA, KAD, MREZE, ODLOMAK } from "./opis";

const ORG = `${DOMENA}/#organization`;

export function pocetnaGraf(live) {
  const store = live && APP_STORE ? APP_STORE : "";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG,
        name: "LAKAT",
        alternateName: ["LAKAT aplikacija", "LAKAT app"],
        url: DOMENA,
        description: JEDNA_RECENICA,
        logo: { "@type": "ImageObject", url: `${DOMENA}/apple-icon.png`, width: 180, height: 180 },
        email: "support@laktarenje.com",
        founder: { "@type": "Person", name: "Petar Grbić" },
        sameAs: [...MREZE.map((m) => m.href), ...(store ? [store] : [])],
      },
      {
        "@type": "WebSite",
        "@id": `${DOMENA}/#website`,
        url: DOMENA,
        name: "LAKAT",
        alternateName: "laktarenje.com",
        inLanguage: "hr-HR",
        publisher: { "@id": ORG },
      },
      {
        "@type": "MobileApplication",
        "@id": `${DOMENA}/#app`,
        name: "LAKAT",
        description: `${ODLOMAK.join(" ")} ${KAD[live ? "poslije" : "prije"]}`,
        operatingSystem: "iOS 26.0 ili novije",
        applicationCategory: "SocialNetworkingApplication",
        contentRating: "18+",
        inLanguage: "hr",
        url: DOMENA,
        image: `${DOMENA}/apple-icon.png`,
        ...(live ? { datePublished: "2026-12-01" } : {}),
        ...(store ? { downloadUrl: store, installUrl: store } : {}),
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
          ...(store ? { availability: "https://schema.org/InStock", url: store } : {}),
        },
        publisher: { "@id": ORG },
      },
    ],
  };
}

// FAQPage: isti tekst kao vidljivi odgovori na stranici (faq-u-html).
export function faqGraf(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "hr",
    mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}

export function mrvice(ime, put) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "LAKAT", item: DOMENA },
      { "@type": "ListItem", position: 2, name: ime, item: `${DOMENA}${put}` },
    ],
  };
}
