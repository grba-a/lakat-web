import { FeatureTour } from "@/components/feature-tour";
import { FeatureTourMobile } from "@/components/feature-tour-mobile";
import { Hero } from "@/components/hero";
import { Faq, Film, Footer, Instagram, PlayGame, Privacy, Secret, WaitlistSection } from "@/components/sections";
import { StickyCta } from "@/components/sticky-cta";
import { APP_STORE, isLive } from "@/lib/launch";

// Svaku minutu svjež HTML, da prvi prikaz timera i prelazak na store gumbe
// u podne 1. 12. ne čekaju novi deploy.
export const revalidate = 60;

export default function Home() {
  const live = isLive();
  return (
    <>
      <main className="overflow-x-clip">
        <Hero live={live} />
        <FeatureTourMobile />
        <FeatureTour />
        <Secret live={live} />
        <PlayGame />
        <Film />
        <Privacy />
        <WaitlistSection live={live && Boolean(APP_STORE)} />
        <Instagram live={live} />
        <Faq live={live} />
      </main>
      <Footer />
      <StickyCta live={live} />
    </>
  );
}
