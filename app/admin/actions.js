"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { KOLACIC, TRAJANJE_S, adminUkljucen, jedanDan, jesamLiAdmin, noviKolacic, oznaciUspjeh, oznaciUspjeh2, otisak, pokusaj, tocnaLozinka } from "@/lib/admin";
import { dvaFaktora, provjeriKod } from "@/lib/totp";

export async function prijava(_prije, formData) {
  if (!adminUkljucen()) redirect("/");
  const h = await headers();
  // Vercel postavlja x-forwarded-for; prvi u nizu je posjetitelj.
  const o = otisak((h.get("x-forwarded-for") || h.get("x-real-ip") || "").split(",")[0].trim());
  const id = await pokusaj(o);
  if (id == null) {
    return { greska: "Previše pokušaja. Pričekaj 15 minuta." };
  }
  const unos = String(formData.get("lozinka") || "").slice(0, 200);
  // 2FA (faza 3): kad je ADMIN_TOTP postavljen, uz šifru treba i kod iz Passwords. Ne otkriva se što je krivo.
  const dva = dvaFaktora();
  const korak = dva ? provjeriKod(String(formData.get("kod") || "").slice(0, 12)) : null;
  if (!tocnaLozinka(unos) || (dva && korak == null)) {
    // Kriva šifra čeka sekundu i pol: pogađanje postaje sporo, a Petru to ne smeta.
    await new Promise((r) => setTimeout(r, 1500));
    return { greska: dva ? "Kriva šifra ili kod." : "Kriva šifra." };
  }
  if (dva) {
    if (!(await oznaciUspjeh2(id, korak))) return { greska: "Taj kod je već iskorišten. Pričekaj sljedeći." };
  } else {
    await oznaciUspjeh(id);
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

// Ladica dana: samo za prijavljenog admina, samo datum u obliku GGGG-MM-DD (ništa drugo ne ide u bazu).
export async function detaljiDana(dan) {
  if (!(await jesamLiAdmin())) return { greska: "Prijava je istekla." };
  if (typeof dan !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dan)) return { greska: "Neispravan datum." };
  try {
    return { podaci: await jedanDan(dan) };
  } catch {
    return { greska: "Dan se nije učitao." };
  }
}
