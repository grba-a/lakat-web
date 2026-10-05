import { Home } from "@/components/home";

// Svaku minutu svjež HTML, da prvi prikaz timera i prelazak na store gumbe
// u podne 1. 12. ne čekaju novi deploy.
export const revalidate = 60;

export default function Page() {
  return <Home />;
}
