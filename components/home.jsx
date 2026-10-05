import { FeatureTour } from "./feature-tour";
import { FeatureTourMobile } from "./feature-tour-mobile";
import { Hero } from "./hero";
import { Faq, Film, Footer, Instagram, PlayGame, Privacy, Secret, WaitlistSection } from "./sections";
import { StickyCta } from "./sticky-cta";
import { APP_STORE, isLive } from "@/lib/launch";

// Cijela stranica. `challenge` = rezultat pajdaša kad netko dođe preko izazova (/i/37).
export function Home({ challenge = null }) {
  const live = isLive();
  return (
    <>
      <main className="overflow-x-clip">
        <Hero live={live} />
        <FeatureTourMobile />
        <FeatureTour />
        <Secret live={live} />
        <PlayGame challenge={challenge} />
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
