import { Home } from "@/components/home";
import { faqZa } from "@/lib/faq";
import { faqGraf, pocetnaGraf } from "@/lib/jsonld";
import { isLive } from "@/lib/launch";
import { jsonLd } from "@/lib/seo";

// Svaku minutu svjež HTML, da prvi prikaz timera i prelazak na store gumbe
// u podne 1. 12. ne čekaju novi deploy.
export const revalidate = 60;

export default function Page() {
  const live = isLive();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(pocetnaGraf(live))} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqGraf(faqZa(live)))} />
      <Home />
    </>
  );
}
