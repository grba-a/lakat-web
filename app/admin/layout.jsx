import { JetBrains_Mono } from "next/font/google";
import "./admin.css";
import { KisaZnakova } from "./zivo";

// Monospace samo za /admin (telemetrija); javni web ga ne učitava.
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin", "latin-ext"], weight: ["400", "700"] });

export default function AdminLayout({ children }) {
  return (
    <div className={`adm ${mono.variable}`}>
      <KisaZnakova />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
