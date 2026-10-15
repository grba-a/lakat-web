"use client";

import { track } from "@vercel/analytics";
import { useEffect, useId, useRef, useState } from "react";
import { razinaObrasca } from "@/lib/krigla-slike";
import { play } from "@/lib/sfx";
import { referrer, shareLakat, source, spremiMojRef } from "@/lib/share";
import { ImeUzivoMali, ImeUzivoVeliki } from "./ime-uzivo";

// Rezervacija imena (Petar 15. 10.: c-rezervacija-imena, j-forma-dva-koraka, j-ime-uzivo, obrazac A).
// Samo @ime, mail i obavezna kvačica; grad i kvart se pitaju tek na /potvrdeno. Gumb je iza svih polja,
// provjera ide prije slanja, a „na listi si“ tek kad je mail potvrđen (potvrda-upisa).
// E-mail ide na potvrdu (double opt-in). `prefix` razlikuje obrazac u sekciji od onog u listu odozdo.
export const SIGNED_KEY = "lakat-upisan";
const POSLANO_KEY = "lakat-poslano";
// Rezervacija imena radi tek kad radi baza liste (bez nje ostaje samo mail).
const PRO = process.env.NEXT_PUBLIC_LISTA_PRO === "1";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const IME = /^[a-z0-9_.]{3,20}$/;

function mailLink(email) {
  const d = email.split("@")[1] || "";
  if (/^(gmail|googlemail)\./.test(d)) return "https://mail.google.com/mail/u/0/#search/LAKAT";
  if (/^(outlook|hotmail|live)\./.test(d)) return "https://outlook.live.com/mail/0/";
  if (/^(icloud|me|mac)\./.test(d)) return "https://www.icloud.com/mail";
  return "";
}

// č → c, š → s… pa tek onda sve što nije dopušteno van: tko upiše „ivić“ dobije „ivic“, ne „ivi“.
function cistoIme(v) {
  return v
    .toLowerCase()
    .replace(/[čć]/g, "c")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9_.]/g, "")
    .slice(0, 20);
}

function citaj(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

const polje =
  "min-h-[48px] w-full rounded-2xl border bg-surface px-4 text-[16px] text-fg outline-none transition-colors placeholder:text-muted focus-visible:border-accent focus-visible:outline-none aria-invalid:border-[#f87171]";

// `aktivan` = list odozdo je bio otvoren: do tada Krigle ne crtamo, da se šest slika ne skida uz prvi prikaz stranice.
export function Waitlist({ prefix = "", android: androidLive = false, firstRef, velik = false, naslov = null, aktivan = true }) {
  const id = useId();
  const [status, setStatus] = useState("idle"); // idle | sending | ok | already | error | off
  const [poruka, setPoruka] = useState("");
  const [greske, setGreske] = useState({}); // { ime, email, privola }
  const [email, setEmail] = useState("");
  const [ime, setIme] = useState("");
  const [imeOk, setImeOk] = useState(null); // null | true | false
  const [platform, setPlatform] = useState(androidLive ? "android" : "iphone");
  const [poslano, setPoslano] = useState(null); // { email, ime }
  const [shared, setShared] = useState("");
  const imeRef = useRef(null);
  const mailRef = useRef(null);
  const privolaRef = useRef(null);
  const statusRef = useRef(null);
  const sImenom = PRO && !androidLive;

  // Već poslano s ovog preglednika, a još nepotvrđeno: pokaži „provjeri mail“, ne prazan obrazac.
  useEffect(() => {
    const t = setTimeout(() => {
      const p = citaj(POSLANO_KEY);
      if (p?.email) {
        setPoslano(p);
        setStatus("ok");
      }
      if (!androidLive && /android/i.test(navigator.userAgent)) setPlatform("android");
    }, 0);
    return () => clearTimeout(t);
  }, [androidLive]);

  // Postojeća provjera na serveru (lista_ime_slobodno): gleda imena u aplikaciji i na listi, ne vraća ništa osim da/ne.
  useEffect(() => {
    if (!sImenom || !IME.test(ime)) return;
    const t = setTimeout(async () => {
      try {
        const r = await (await fetch(`/api/lista/ime?u=${encodeURIComponent(ime)}`)).json();
        setImeOk(typeof r.slobodno === "boolean" ? r.slobodno : null);
      } catch {
        setImeOk(null);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [ime, sImenom]);

  function provjeri(f = { ime, email, privola: privolaRef.current?.checked }) {
    const g = {};
    if (sImenom) {
      if (!f.ime) g.ime = "Upiši ime koje želiš.";
      else if (!IME.test(f.ime)) g.ime = "Treba barem 3 znaka.";
      else if (imeOk === false) g.ime = `@${f.ime} je već zauzeto. Probaj drugo.`;
    }
    const m = f.email.trim();
    if (!m) g.email = "Upiši mail, inače ti nemam kamo javiti.";
    else if (!EMAIL.test(m) || m.length > 200) g.email = "Ta adresa ne izgleda kao e-mail.";
    if (!f.privola) g.privola = "Kvačica je obavezna, inače ti ne smijem pisati.";
    return g;
  }

  async function submit(e) {
    e.preventDefault();
    const g = provjeri();
    setGreske(g);
    if (Object.keys(g).length) {
      (g.ime ? imeRef : g.email ? mailRef : privolaRef).current?.focus();
      track("form_invalid", { polje: Object.keys(g)[0] });
      return;
    }
    const value = email.trim();
    setStatus("sending");
    setPoruka("");
    track("form_submit", { platforma: platform });
    try {
      const res = await fetch("/api/lista", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: value,
          privola: true,
          platforma: platform,
          izvor: source(),
          pozvao: referrer(),
          ime: sImenom ? ime : "",
          web: e.currentTarget.elements.web?.value || "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        spremiMojRef(data.ref);
        play("kasa");
        track("form_ok", { platforma: platform });
        if (data.potvrdeno) {
          // Već potvrđen na listi: to je jedino stanje koje smije reći „na listi si“.
          try {
            localStorage.setItem(SIGNED_KEY, "1");
            localStorage.removeItem(POSLANO_KEY);
          } catch {}
          window.dispatchEvent(new Event(SIGNED_KEY));
          setStatus("already");
        } else {
          const p = { email: value, ime: sImenom ? ime : "" };
          try {
            localStorage.setItem(POSLANO_KEY, JSON.stringify(p));
          } catch {}
          setPoslano(p);
          setStatus("ok");
        }
        setTimeout(() => statusRef.current?.focus(), 0);
        return;
      }
      track("form_error", { code: res.status });
      if (res.status === 503) return setStatus("off");
      if (res.status === 409) {
        setImeOk(false);
        setGreske({ ime: data.poruka || "To ime je već zauzeto. Probaj drugo." });
        setStatus("idle");
        return imeRef.current?.focus();
      }
      setPoruka(data.poruka || "Nešto je puklo. Probaj opet.");
      setStatus("error");
    } catch {
      setPoruka("Nema veze s mrežom. Probaj opet.");
      setStatus("error");
    }
  }

  function ispravi() {
    if (poslano) {
      setEmail(poslano.email);
      if (poslano.ime) setIme(poslano.ime);
    }
    try {
      localStorage.removeItem(POSLANO_KEY);
    } catch {}
    setPoslano(null);
    setStatus("idle");
    setTimeout(() => mailRef.current?.focus(), 0);
  }

  const gotovo = status === "ok" || status === "already";
  const mailOk = EMAIL.test(email.trim());
  const razina = razinaObrasca({ ime, imeOk, mailOk, poslano: gotovo || status === "sending", pro: sImenom });
  const prikazIme = gotovo ? poslano?.ime || ime : ime;
  const open = poslano ? mailLink(poslano.email) : "";
  const err = (k) => (greske[k] ? `${id}-${k}-err` : undefined);
  const android = platform === "android";

  const obrazac = (
    <form onSubmit={submit} noValidate className="grid gap-4">
      {sImenom && (
        <div className="grid gap-1.5">
          <label htmlFor={`${prefix}ime`} className="text-[14px] font-semibold text-fg">
            Tvoje @ime u aplikaciji
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[16px] text-muted" aria-hidden="true">
              @
            </span>
            <input
              ref={(n) => {
                imeRef.current = n;
                if (firstRef) firstRef.current = n;
              }}
              id={`${prefix}ime`}
              name="ime"
              value={ime}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={20}
              placeholder="tvoje.ime"
              aria-invalid={Boolean(greske.ime)}
              aria-describedby={`${id}-ime-pravilo ${err("ime") || ""}`.trim()}
              onChange={(e) => {
                setIme(cistoIme(e.target.value));
                setImeOk(null);
                if (greske.ime) setGreske((g) => ({ ...g, ime: undefined }));
              }}
              className={`${polje} pr-24 pl-9 ${greske.ime ? "border-[#f87171]" : "border-line"}`}
            />
            {IME.test(ime) && imeOk !== null && (
              <span className={`absolute top-1/2 right-4 -translate-y-1/2 text-[13px] font-bold ${imeOk ? "text-accent" : "text-[#f87171]"}`} aria-live="polite">
                {imeOk ? "slobodno" : "zauzeto"}
              </span>
            )}
          </div>
          <p id={`${id}-ime-pravilo`} className="text-[13px] text-muted">
            3–20 znakova: slova bez kvačica, brojke, točka i donja crta.
          </p>
          {greske.ime && (
            <p id={err("ime")} className="text-[13px] font-semibold text-[#f87171]">
              {greske.ime}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-1.5">
        <label htmlFor={`${prefix}email`} className="text-[14px] font-semibold text-fg">
          {sImenom ? "Mail na koji ti stiže potvrda" : "Tvoj mail"}
        </label>
        <input
          ref={(n) => {
            mailRef.current = n;
            if (firstRef && !sImenom) firstRef.current = n;
          }}
          id={`${prefix}email`}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="tvoj@mail.com"
          value={email}
          aria-invalid={Boolean(greske.email)}
          aria-describedby={err("email")}
          onChange={(e) => {
            setEmail(e.target.value);
            if (greske.email) setGreske((g) => ({ ...g, email: undefined }));
          }}
          className={`${polje} ${greske.email ? "border-[#f87171]" : "border-line"}`}
        />
        {greske.email && (
          <p id={err("email")} className="text-[13px] font-semibold text-[#f87171]">
            {greske.email}
          </p>
        )}
      </div>

      {/* Zamka za botove: ljudi je ne vide. */}
      <input name="web" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid gap-1.5">
        <label className="flex items-start gap-3 text-left text-[13px] leading-snug text-soft">
          <input
            ref={privolaRef}
            name="privola"
            type="checkbox"
            aria-invalid={Boolean(greske.privola)}
            aria-describedby={err("privola")}
            onChange={() => greske.privola && setGreske((g) => ({ ...g, privola: undefined }))}
            className="mt-0.5 size-5 shrink-0 accent-[#4ade80]"
          />
          <span>
            Imam 18+. Pošaljite mi potvrdu i jedan mail kad LAKAT izađe{android ? " za Android" : ""}. Ništa više.{" "}
            <a href="/privatnost" className="relative underline underline-offset-2 after:absolute after:-inset-x-2 after:-inset-y-3">
              Privatnost
            </a>
          </span>
        </label>
        {greske.privola && (
          <p id={err("privola")} className="pl-8 text-[13px] font-semibold text-[#f87171]">
            {greske.privola}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="min-h-[54px] rounded-full bg-accent px-6 text-[17px] font-bold text-[#052e16] transition-[scale,opacity] duration-150 ease-out active:scale-[0.97] disabled:opacity-60"
      >
        {status === "sending" ? "Šaljem…" : sImenom ? (ime ? `Rezerviraj @${ime}` : "Rezerviraj @ime") : android ? "Javi mi za Android" : "Javi mi prvi"}
      </button>

      {(status === "error" || status === "off") && (
        <p role="alert" className="text-[14px] font-semibold text-amber">
          {status === "off" ? "Lista se još spaja. Do tada nas prati na Instagramu." : poruka}
        </p>
      )}

      {!androidLive && (
        <p className="text-[13px] text-muted">
          {android ? "Android stiže u siječnju 2027. Javim ti kad stigne. " : null}
          <button
            type="button"
            aria-pressed={android}
            onClick={() => setPlatform(android ? "iphone" : "android")}
            className="relative font-semibold text-soft underline underline-offset-2 after:absolute after:-inset-x-2 after:-inset-y-3"
          >
            {android ? "Ipak imam iPhone" : "Imaš Android?"}
          </button>
        </p>
      )}
    </form>
  );

  const zavrseno = (
    <div className="grid gap-3">
      <p ref={statusRef} tabIndex={-1} className="font-display text-[30px] leading-none uppercase outline-none">
        {status === "already" ? "Već si na listi" : "Provjeri mail"}
        <span className="text-accent">.</span>
      </p>
      <p className="text-[15px] text-soft text-pretty">
        {status === "already"
          ? "Taj mail je već potvrđen. Vidimo se 1. 12. u podne."
          : `Poslao sam potvrdu na ${poslano?.email}. Klikni link u mailu${poslano?.ime ? ` i @${poslano.ime} je tvoje` : " i na listi si"}.${android ? " Javim ti kad Android stigne." : ""}`}
      </p>
      {status === "ok" && (
        <p className="text-[13px] text-muted">
          Nema ga? Pogledaj Promocije ili neželjenu poštu.{" "}
          <button type="button" onClick={ispravi} className="relative font-semibold text-soft underline underline-offset-2 after:absolute after:-inset-2">
            Krivi mail? Ispravi.
          </button>
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {open && (
          <a href={open} target="_blank" rel="noopener" className="inline-flex min-h-[44px] items-center rounded-full border border-line px-4 text-[14px] font-semibold">
            Otvori mail
          </a>
        )}
        <button
          type="button"
          onClick={async () => setShared(await shareLakat())}
          className="inline-flex min-h-[44px] items-center rounded-full bg-accent px-4 text-[14px] font-bold text-[#052e16] active:scale-[0.97]"
        >
          {shared === "copied" ? "Link kopiran" : "Pošalji ekipi"}
        </button>
        <a href="/api/kalendar" onClick={() => track("ics_download")} className="inline-flex min-h-[44px] items-center rounded-full border border-line px-4 text-[14px] font-semibold">
          Dodaj u kalendar
        </a>
      </div>
    </div>
  );

  const sadrzaj = (
    <div className="grid gap-5">
      {naslov}
      {sImenom && aktivan && (
        <div className={velik ? "md:hidden" : ""}>
          <ImeUzivoMali ime={prikazIme} razina={razina} />
        </div>
      )}
      <div aria-live="polite">{gotovo ? zavrseno : obrazac}</div>
      {!androidLive && (
        <p className="border-t border-line pt-4 text-[13px] text-muted text-pretty">
          <b className="font-semibold text-soft">Već laktaš na webu?</b> Račun i ime ostaju tvoji. 1. 12. se samo prijaviš u aplikaciji.
        </p>
      )}
    </div>
  );

  if (!velik || !sImenom) return sadrzaj;
  return (
    <div className="grid gap-10 md:grid-cols-[1fr_1.05fr] md:items-center">
      <div className="hidden md:block">
        <ImeUzivoVeliki ime={prikazIme} razina={razina} />
      </div>
      {sadrzaj}
    </div>
  );
}
