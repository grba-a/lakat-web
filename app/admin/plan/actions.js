"use server";

// Akcije /admin/plan: svaka prvo provjeri admin prijavu (lozinka + 2FA), zatim čisti ulaz (lib/plan.js).
import { revalidatePath } from "next/cache";
import { jesamLiAdmin } from "@/lib/admin";
import { ocisti, planPisi } from "@/lib/plan";

const ID = /^[a-z0-9-]{1,64}$/;

export async function spremiKarticu(id, promjene) {
  if (!(await jesamLiAdmin())) return { greska: "Prijava je istekla." };
  if (typeof id !== "string" || !ID.test(id)) return { greska: "Kriva kartica." };
  try {
    await planPisi("PATCH", id, ocisti(promjene ?? {}));
    revalidatePath("/admin/plan");
    return { ok: true };
  } catch (e) {
    return { greska: String(e.message || e).slice(0, 80) };
  }
}

export async function dodajKarticu(polja) {
  if (!(await jesamLiAdmin())) return { greska: "Prijava je istekla." };
  try {
    await planPisi("POST", null, { ...ocisti(polja ?? {}, true), tko: "ti" });
    revalidatePath("/admin/plan");
    return { ok: true };
  } catch (e) {
    return { greska: String(e.message || e).slice(0, 80) };
  }
}

// Brisati se mogu samo Petrove bilješke (moja = true); zadatke ne briše nitko slučajno.
export async function obrisiKarticu(id) {
  if (!(await jesamLiAdmin())) return { greska: "Prijava je istekla." };
  if (typeof id !== "string" || !ID.test(id)) return { greska: "Kriva kartica." };
  try {
    await planPisi("DELETE", id, null, true);
    revalidatePath("/admin/plan");
    return { ok: true };
  } catch (e) {
    return { greska: String(e.message || e).slice(0, 80) };
  }
}
