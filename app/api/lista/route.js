// Lista čekanja → Brevo, s potvrdom e-maila (double opt-in, Petar g5 2026-10-04).
// Ključevi su samo u env varijablama (lokalno .env.local, na Vercelu u projektu), nikad u repou.
//   BREVO_API_KEY, BREVO_LIST_ID, BREVO_DOI_TEMPLATE_ID, (opcionalno) BREVO_DOI_REDIRECT
//   BREVO_ATTRS=1 kad u Brevu postoje atributi PLATFORMA i IZVOR (w20, w24); bez toga ih ne šaljemo.
import { GRADOVI } from "@/lib/gradovi";
import { dbReady, imeSlobodno, mailReady, posaljiPotvrdu, upis } from "@/lib/lista";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v, n) => String(v || "").replace(/[<>"`]/g, "").trim().slice(0, n);

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

  // Vlastita lista u Supabaseu + mail za potvrdu preko Brevoa (q1/q2, 2026-10-05).
  if (dbReady() && mailReady()) {
    const platforma = body?.platforma === "android" ? "android" : "iphone";
    const izvor = clean(body?.izvor || "direkt", 40).replace(/[^a-z0-9-]/gi, "") || "direkt";
    const grad = GRADOVI.includes(body?.grad) ? body.grad : null;
    const kvart = clean(body?.kvart, 40) || null;
    const pozvao = /^[A-Z2-9]{6}$/.test(body?.pozvao || "") ? body.pozvao : null;
    let ime = clean(body?.ime, 20).toLowerCase() || null;
    if (ime && !/^[a-z0-9_.]{3,20}$/.test(ime)) {
      return Response.json({ poruka: "Ime: 3 do 20 slova, brojki, točka ili donja crta." }, { status: 400 });
    }
    try {
      if (ime && !(await imeSlobodno(ime))) {
        return Response.json({ poruka: `Ime ${ime} je već zauzeto. Probaj drugo.` }, { status: 409 });
      }
      const r = await upis({ email, platforma, izvor, grad, kvart, ime, pozvao });
      if (r.already) return Response.json({ ok: true, potvrdeno: true, ref: r.ref });
      const origin = new URL(request.url).origin;
      await posaljiPotvrdu(email, `${origin}/potvrdi?t=${r.token}`);
      return Response.json({ ok: true, ref: r.ref });
    } catch (e) {
      console.error("lista", String(e).slice(0, 200));
      return Response.json({ poruka: "Nešto je puklo kod nas. Probaj za minutu." }, { status: 502 });
    }
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
