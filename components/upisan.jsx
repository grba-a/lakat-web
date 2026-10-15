"use client";

import { useEffect } from "react";
import { spremiMojRef } from "@/lib/share";
import { SIGNED_KEY } from "./waitlist";

// Poslužitelj je potvrdio upis (/potvrdeno): tek sad preglednik pamti „na listi si“ (potvrda-upisa)
// i moj osobni kod, pa svaki „Pošalji ekipi“ dalje nosi ?ref= (referral-kod).
export function Upisan({ refKod }) {
  useEffect(() => {
    try {
      localStorage.setItem(SIGNED_KEY, "1");
      localStorage.removeItem("lakat-poslano");
    } catch {}
    spremiMojRef(refKod);
  }, [refKod]);
  return null;
}
