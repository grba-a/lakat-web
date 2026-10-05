import { potvrdi, uListu } from "@/lib/lista";

// Link iz maila za potvrdu: označi upis potvrđenim, doda kontakt u Brevo listu i vodi na ulaznicu.
export async function GET(request) {
  const url = new URL(request.url);
  const row = await potvrdi(url.searchParams.get("t")).catch(() => null);
  if (!row) return Response.redirect(new URL("/potvrdeno?greska=1", url), 302);
  await uListu(row).catch((e) => console.error("brevo lista", String(e).slice(0, 200)));
  return Response.redirect(new URL(`/potvrdeno?r=${row.ref_kod}`, url), 302);
}
