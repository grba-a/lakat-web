import { FeatureTour } from "@/components/feature-tour";
import { Hero } from "@/components/hero";
import { Faq, Film, Footer, Instagram, PlayGame, Privacy, Secret, WaitlistSection } from "@/components/sections";
import { StickyCta } from "@/components/sticky-cta";
import { isLive } from "@/lib/launch";

// Svaku minutu svjež HTML, da prvi prikaz timera i prelazak na store gumbe
// u podne 1. 12. ne čekaju novi deploy.
export const revalidate = 60;

export default function Home() {
  const live = isLive();
  return (
    <>
      <main className="overflow-x-clip">
        <Hero live={live} />
        <FeatureTour />
        <Secret live={live} />
        <PlayGame />
        <Film />
        <Privacy />
        {!live && <WaitlistSection />}
        <Instagram live={live} />
        <Faq live={live} />
      </main>
      <Footer />
      <StickyCta live={live} />
    </>
  );
}
