import { JetBrains_Mono } from "next/font/google";
import "./admin.css";

// Monospace samo za /admin (telemetrija); javni web ga ne učitava.
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin", "latin-ext"], weight: ["400", "700"] });

export default function AdminLayout({ children }) {
  return <div className={`adm ${mono.variable}`}>{children}</div>;
}
