"use client";

import { track } from "@vercel/analytics";
import { useEffect, useRef, useState } from "react";
import { INSTAGRAM } from "@/lib/launch";
import { play } from "@/lib/sfx";
import { GRADOVI } from "@/lib/gradovi";
import { referrer, shareLakat, source } from "@/lib/share";
import { KriglaSays } from "./brand";
import { KriglaTyping } from "./krigla-typing";

// Lista čekanja kao razgovor s Kriglom (varijanta D + Petar k2, w15, w19, w20, w25).
// E-mail ide u Brevo s potvrdom (double opt-in). `prefix` razlikuje formu u sekciji od one u sheetu.
export const SIGNED_KEY = "lakat-upisan";
// Grad, kvart i rezervacija imena (w07, w09) pale se tek kad radi baza liste.
const PRO = process.env.NEXT_PUBLIC_LISTA_PRO === "1";

function mailLink(email) {
  const d = email.split("@")[1] || "";
  if (/^(gmail|googlemail)\./.test(d)) return "https://mail.google.com/mail/u/0/#search/LAKAT";
  if (/^(outlook|hotmail|live)\./.test(d)) return "https://outlook.live.com/mail/0/";
  if (/^(icloud|me|mac)\./.test(d)) return "https://www.icloud.com/mail";
  return "";
}

export function Waitlist({ prefix = "", android = false, inputRef }) {
  const [status, setStatus] = useState("idle"); // idle | sending | ok | error | off
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");
  const [email, setEmail] = useState("");
  const [platform, setPlatform] = useState(android ? "android" : "iphone");
  const [shared, setShared] = useState("");
  const [ime, setIme] = useState("");
  const [imeOk, setImeOk] = useState(null); // null | true | false
  const [already, setAlready] = useState(false);

  useEffect(() => {
    if (!PRO || ime.length < 3) return;
    const t = setTimeout(async () => {
      try {
        const r = await (await fetch(`/api/lista/ime?u=${encodeURIComponent(ime)}`)).json();
        setImeOk(r.slobodno);
      } catch {
        setImeOk(null);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [ime]);
  const ownRef = useRef(null);
  const ref = inputRef || ownRef;

  useEffect(() => {
    if (android) return;
    // Unaprijed odabrano po uređaju (w20).
    const t = setTimeout(() => {
      if (/android/i.test(navigator.userAgent)) setPlatform("android");
    }, 0);
    return () => clearTimeout(t);
  }, [android]);

  async function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const value = String(form.get("email") || "").trim();
    if (!value) {
      setError("Upiši mail, inače ti nemam kamo javiti.");
      setStatus("error");
      return;
    }
    if (form.get("privola") !== "on") {
      setError("Kvačica je obavezna, inače ti ne smijem pisati.");
      setStatus("error");
      return;
    }
    setSent(value);
    setStatus("sending");
    setError("");
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
          grad: form.get("grad") || "",
          kvart: form.get("kvart") || "",
          ime: PRO ? ime : "",
          web: form.get("web") || "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setAlready(Boolean(data.potvrdeno));
        play("kasa");
        track("form_ok", { platforma: platform });
        try {
          localStorage.setItem(SIGNED_KEY, "1");
        } catch {}
        window.dispatchEvent(new Event(SIGNED_KEY));
        return setStatus("ok");
      }
      track("form_error", { code: res.status });
      if (res.status === 503) return setStatus("off");
      setError(data.poruka || "Nešto je puklo. Probaj opet.");
      setStatus("error");
    } catch {
      setError("Nema veze s mrežom. Probaj opet.");
      setStatus("error");
    }
  }

  function fix() {
    setStatus("idle");
    setEmail(sent);
    setTimeout(() => ref.current?.focus(), 0);
  }

  const ok = status === "ok";
  const say = status === "error" ? error : status === "off" ? "Lista se još spaja. Do tada me prati na Instagramu." : "";
  const open = ok ? mailLink(sent) : "";

  return (
    <div className="grid gap-3" aria-live="polite">
      <KriglaSays size={64}>{android ? "Android stiže iza iPhonea. Di da ti javim?" : "Di da ti javim kad otvorimo šank?"}</KriglaSays>

      {sent && status !== "idle" && status !== "error" && (
        <p className="chat-in max-w-[85%] justify-self-end rounded-[18px] rounded-br-md bg-accent px-4 py-2.5 text-[15px] font-semibold break-all text-[#052e16]">
          {sent}
        </p>
      )}
      {status === "sending" && <KriglaTyping key="s" text="…" size={40} onView={false} trigger={0} className="chat-in" />}
      {say && <KriglaTyping key={say} text={say} size={40} onView={false} trigger={2} tone="text-amber" className="chat-in max-w-[88%]" />}

      {/* Uspjeh (w15): najzagrijaniji trenutak, pa odmah sljedeći korak. */}
      {ok && (
        <div className="grid gap-3">
          <KriglaTyping
            key="ok"
            text={
              already
                ? "Ti si već na listi. Vidimo se 1. 12."
                : `Poslao sam potvrdu na ${sent}. Klikni je ili te ne upišem.${PRO ? " Nakon potvrde te čeka ulaznica." : ""}${platform === "android" ? " Javim ti kad Android stigne." : ""}`
            }
            size={40}
            onView={false}
            trigger={1}
            className="chat-in max-w-[88%]"
          />
          <p className="chat-in pl-[50px] text-[13px] text-muted">
            Nema ga? Pogledaj Promocije ili neželjenu poštu.{" "}
            <button type="button" onClick={fix} className="underline underline-offset-2">
              Krivi mail? Ispravi.
            </button>
          </p>
          <div className="chat-in flex flex-wrap gap-2 pl-[50px]">
            {open && (
              <a href={open} target="_blank" rel="noopener" className="inline-flex min-h-[44px] items-center rounded-full border border-line px-4 text-[14px] font-semibold">
                Otvori mail
              </a>
            )}
            <button
              type="button"
              onClick={async () => setShared(await shareLakat())}
              className="inline-flex min-h-[44px] items-center rounded-full bg-accent px-4 text-[14px] font-bold text-[#052e16]"
            >
              {shared === "copied" ? "Link kopiran" : "Pošalji ekipi"}
            </button>
            <a href="/api/kalendar" onClick={() => track("ics_download")} className="inline-flex min-h-[44px] items-center rounded-full border border-line px-4 text-[14px] font-semibold">
              Dodaj u kalendar
            </a>
            <a href={INSTAGRAM} target="_blank" rel="noopener" onClick={() => track("ig_tap", { gdje: "uspjeh" })} className="inline-flex min-h-[44px] items-center rounded-full border border-line px-4 text-[14px] font-semibold">
              @lakat_app
            </a>
          </div>
          <p className="chat-in pl-[50px] text-[13px] font-semibold text-soft">LAKAT bez ekipe je prazna karta.</p>
        </div>
      )}

      {!ok && (
        <form onSubmit={submit} noValidate className="mt-2 grid gap-3">
          {!android && (
            <div className="flex gap-2" role="radiogroup" aria-label="Mobitel">
              {[
                ["iphone", "iPhone"],
                ["android", "Android"],
              ].map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={platform === v}
                  onClick={() => setPlatform(v)}
                  className="min-h-[40px] rounded-full border border-line px-4 text-[14px] font-semibold text-muted aria-checked:border-accent aria-checked:text-fg"
                >
                  {l}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 rounded-full border border-line bg-surface p-1.5 pl-5 focus-within:border-accent">
            <label htmlFor={`${prefix}email`} className="sr-only">
              E-mail
            </label>
            <input
              ref={ref}
              id={`${prefix}email`}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="tvoj@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-[44px] w-full min-w-0 bg-transparent text-[16px] text-fg outline-none placeholder:text-[#7a7a84] focus-visible:outline-none"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              aria-label="Javi mi prvi"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-[#052e16] transition-[opacity,scale] active:scale-95 disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
          {PRO && (
            <div className="grid gap-2">
              <div className="grid grid-cols-2 gap-2">
                <label className="sr-only" htmlFor={`${prefix}grad`}>Grad</label>
                <select id={`${prefix}grad`} name="grad" defaultValue="" className="min-h-[46px] rounded-2xl border border-line bg-surface px-3 text-[15px] text-fg">
                  <option value="">Grad (nije obavezno)</option>
                  {GRADOVI.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <label className="sr-only" htmlFor={`${prefix}kvart`}>Kvart</label>
                <input id={`${prefix}kvart`} name="kvart" maxLength={40} placeholder="Kvart" className="min-h-[46px] rounded-2xl border border-line bg-surface px-3 text-[15px] text-fg placeholder:text-[#7a7a84]" />
              </div>
              <label className="sr-only" htmlFor={`${prefix}ime`}>Rezerviraj ime</label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">@</span>
                <input
                  id={`${prefix}ime`}
                  value={ime}
                  onChange={(e) => {
                    setIme(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 20));
                    setImeOk(null);
                  }}
                  placeholder="rezerviraj ime za aplikaciju"
                  className="min-h-[46px] w-full rounded-2xl border border-line bg-surface pr-24 pl-7 text-[15px] text-fg placeholder:text-[#7a7a84]"
                />
                {ime.length >= 3 && imeOk !== null && (
                  <span className={`absolute top-1/2 right-3 -translate-y-1/2 text-[12px] font-bold ${imeOk ? "text-accent" : "text-[#f87171]"}`}>
                    {imeOk ? "slobodno" : "zauzeto"}
                  </span>
                )}
              </div>
            </div>
          )}
          {/* Zamka za botove: ljudi je ne vide. */}
          <input name="web" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <label className="flex items-start gap-3 px-1 text-left text-[13px] leading-snug text-muted">
            <input name="privola" type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[#4ade80]" />
            <span>
              Imam 18+. Pošaljite mi potvrdu i jedan mail kad LAKAT izađe. Ništa više.{" "}
              <a href="/privatnost" className="relative underline underline-offset-2 after:absolute after:-inset-x-2 after:-inset-y-3">
                Privatnost
              </a>
            </span>
          </label>
        </form>
      )}
    </div>
  );
}
