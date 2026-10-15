"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GRADOVI } from "@/lib/gradovi";

// „Iz kojeg si kvarta?“ nakon potvrde maila (j-kvart-poslije). Nije obavezno; služi samo poretku kvartova.
export function KvartObrazac() {
  const router = useRouter();
  const [stanje, setStanje] = useState("idle"); // idle | saljem | ok | greska
  const [poruka, setPoruka] = useState("");

  async function posalji(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setStanje("saljem");
    try {
      const res = await fetch("/api/lista/kvart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ grad: f.get("grad"), kvart: f.get("kvart") }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setStanje("ok");
        router.refresh();
        return;
      }
      setPoruka(d.poruka || "Nešto je puklo. Probaj opet.");
      setStanje("greska");
    } catch {
      setPoruka("Nema veze s mrežom. Probaj opet.");
      setStanje("greska");
    }
  }

  if (stanje === "ok") return <p className="text-[15px] font-semibold text-accent">Upisano. Sad dovedi ekipu iz kvarta.</p>;
  return (
    <form onSubmit={posalji} className="grid gap-3 rounded-2xl border border-line bg-surface p-4">
      <p className="text-[15px] font-semibold">Iz kojeg si kvarta? Nije obavezno.</p>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
        <label className="grid gap-1 text-[13px] text-soft">
          Grad
          <select name="grad" required defaultValue="" className="min-h-[48px] w-full min-w-0 rounded-xl border border-line bg-bg px-3 text-[16px] text-fg">
            <option value="" disabled>
              Odaberi
            </option>
            {GRADOVI.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-[13px] text-soft">
          Kvart
          <input name="kvart" required minLength={2} maxLength={40} placeholder="npr. Gruž" className="min-h-[48px] w-full min-w-0 rounded-xl border border-line bg-bg px-3 text-[16px] text-fg placeholder:text-muted" />
        </label>
      </div>
      <button type="submit" disabled={stanje === "saljem"} className="min-h-[48px] rounded-full border border-accent/60 text-[15px] font-bold text-accent transition-[scale] active:scale-[0.97] disabled:opacity-60">
        {stanje === "saljem" ? "Šaljem…" : "Upiši kvart"}
      </button>
      {stanje === "greska" && (
        <p role="alert" className="text-[14px] font-semibold text-amber">
          {poruka}
        </p>
      )}
    </form>
  );
}
