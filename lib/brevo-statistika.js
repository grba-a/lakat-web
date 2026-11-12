// Brevo statistika transakcijskih mailova za /admin (Petar 11. 11., faza 2): samo zbrojevi, ništa o primateljima.
// Isti ključ kao lista čekanja (BREVO_API_KEY, Vercel + .env.local, nikad u repo). Bez ključa vraća null.
export async function mailovi(dana = 30) {
  if (!process.env.BREVO_API_KEY) return null;
  try {
    const res = await fetch(`https://api.brevo.com/v3/smtp/statistics/aggregatedReport?days=${Math.min(90, Math.max(1, dana))}`, {
      headers: { "api-key": process.env.BREVO_API_KEY, accept: "application/json", "User-Agent": "lakat-web/1.0" },
      cache: "no-store",
    });
    if (!res.ok) return { greska: `Brevo ${res.status}` };
    const j = await res.json();
    const n = (k) => Number(j[k] ?? 0);
    return {
      poslano: n("requests"),
      isporuceno: n("delivered"),
      otvoreno: n("uniqueOpens"),
      klikova: n("uniqueClicks"),
      odbijeno: n("hardBounces") + n("softBounces") + n("blocked") + n("invalid"),
      spam: n("spamReports"),
    };
  } catch (e) {
    return { greska: String(e.message || e).slice(0, 100) };
  }
}
