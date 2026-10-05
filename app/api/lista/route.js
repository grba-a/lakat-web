// Lista čekanja → Brevo, s potvrdom e-maila (double opt-in, Petar g5 2026-10-04).
// Ključevi su samo u env varijablama (lokalno .env.local, na Vercelu u projektu), nikad u repou.
//   BREVO_API_KEY, BREVO_LIST_ID, BREVO_DOI_TEMPLATE_ID, (opcionalno) BREVO_DOI_REDIRECT
//   BREVO_ATTRS=1 kad u Brevu postoje atributi PLATFORMA i IZVOR (w20, w24); bez toga ih ne šaljemo.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ poruka: "Neispravan zahtjev." }, { status: 400 });
  }

  // Bot je ispunio skriveno polje: pravimo se da je prošlo.
  if (body?.web) return Response.json({ ok: true });

  const email = String(body?.email || "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 200) {
    return Response.json({ poruka: "Ta adresa ne izgleda kao e-mail." }, { status: 400 });
  }
  if (body?.privola !== true) {
    return Response.json({ poruka: "Kvačica je obavezna, inače ti ne smijemo pisati." }, { status: 400 });
  }

  const key = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);
  const templateId = Number(process.env.BREVO_DOI_TEMPLATE_ID);
  if (!key || !listId || !templateId) {
    return Response.json({ poruka: "Lista još nije spojena." }, { status: 503 });
  }

  const origin = new URL(request.url).origin;
  const res = await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
    method: "POST",
    headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      email,
      includeListIds: [listId],
      templateId,
      redirectionUrl: process.env.BREVO_DOI_REDIRECT || `${origin}/potvrdeno`,
      ...(process.env.BREVO_ATTRS === "1" && {
        attributes: {
          PLATFORMA: body?.platforma === "android" ? "android" : "iphone",
          IZVOR: String(body?.izvor || "direkt").replace(/[^a-z0-9-]/gi, "").slice(0, 40),
        },
      }),
    }),
  });

  if (res.ok) return Response.json({ ok: true });
  const err = await res.json().catch(() => ({}));
  // Već je na listi: za korisnika je to uspjeh.
  if (res.status === 400 && /exist/i.test(err?.message || "")) return Response.json({ ok: true });
  console.error("brevo", res.status, err?.code);
  return Response.json({ poruka: "Nešto je puklo kod nas. Probaj za minutu." }, { status: 502 });
}
