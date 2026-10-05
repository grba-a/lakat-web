import Link from "next/link";
import { KriglaTyping } from "@/components/krigla-typing";

export const metadata = { title: "Nema ničega. LAKAT" };

// 404 s Kriglom (Petar k8).
export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-md content-center gap-8 px-5 py-16">
      <h1 className="font-display text-[64px] leading-[0.92] uppercase">
        Krivi šank<span className="text-accent">.</span>
      </h1>
      <KriglaTyping size={72} text="Ovdje nema ni šanka ni Krigle. Čekaj, ja sam tu. Ali šanka nema." />
      <Link
        href="/"
        className="inline-flex min-h-[52px] items-center justify-center justify-self-start rounded-full bg-accent px-6 text-[16px] font-bold text-[#052e16]"
      >
        Natrag na odbrojavanje
      </Link>
    </main>
  );
}
