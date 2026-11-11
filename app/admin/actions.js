"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { KOLACIC, TRAJANJE_S, adminUkljucen, noviKolacic, tocnaLozinka } from "@/lib/admin";

export async function prijava(_prije, formData) {
  if (!adminUkljucen()) redirect("/");
  const unos = String(formData.get("lozinka") || "");
  if (!tocnaLozinka(unos)) {
    // Kriva šifra čeka sekundu i pol: pogađanje postaje sporo, a Petru to ne smeta.
    await new Promise((r) => setTimeout(r, 1500));
    return { greska: "Kriva šifra." };
  }
  (await cookies()).set(KOLACIC, noviKolacic(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: TRAJANJE_S,
  });
  redirect("/admin");
}

export async function odjava() {
  (await cookies()).delete({ name: KOLACIC, path: "/admin" });
  redirect("/admin");
}
