"use client";

// Živi dijelovi /admin ploče: brojevi koji se odbroje do vrijednosti, auto-osvježavanje i aktivni odjeljak.
// Sve poštuje „smanji pokret": tada se brojevi odmah pokažu, a osvježavanje i dalje radi.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const useIsoLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;
const manjePokreta = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Prima već oblikovan tekst ("2.092", "11,6", "< 3"); odbroji samo ako je cijeli tekst broj.
export function Broj({ v, className }) {
  const tekst = String(v ?? "—");
  const ref = useRef(null);
  const prije = useRef(null);
  useIsoLayout(() => {
    const el = ref.current;
    const stari = prije.current;
    prije.current = tekst;
    if (!el || manjePokreta()) return;
    // Promjena pri osvježavanju: znamenke se „dekodiraju“ (nasumične pa prave) uz kratki bljesak.
    if (stari != null && stari !== tekst) {
      const kraj = performance.now() + 520;
      let id;
      el.classList.add("dekod");
      const mijesaj = () => {
        if (performance.now() >= kraj) {
          el.textContent = tekst;
          el.classList.remove("dekod");
          return;
        }
        el.textContent = tekst.replace(/\d/g, () => String(Math.floor(Math.random() * 10)));
        id = setTimeout(mijesaj, 45);
      };
      mijesaj();
      return () => {
        clearTimeout(id);
        el.textContent = tekst;
        el.classList.remove("dekod");
      };
    }
    if (stari != null) return;
    if (!/^-?[\d.]+(,\d+)?$/.test(tekst)) return;
    const decimala = tekst.includes(",") ? tekst.split(",")[1].length : 0;
    const cilj = Number(tekst.replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(cilj) || cilj === 0) return;
    const fmt = new Intl.NumberFormat("hr-HR", { minimumFractionDigits: decimala, maximumFractionDigits: decimala });
    const trajanje = 900;
    const t0 = performance.now();
    let id;
    const korak = (t) => {
      const x = Math.min(1, (t - t0) / trajanje);
      const e = 1 - Math.pow(1 - x, 4); // snažan ease-out
      el.textContent = fmt.format(cilj * e);
      if (x < 1) id = requestAnimationFrame(korak);
      else el.textContent = tekst;
    };
    el.textContent = fmt.format(0);
    id = requestAnimationFrame(korak);
    // Čišćenje uvijek vraća konačni broj: u razvoju React pokreće efekt dvaput, inače bi ostala nula.
    return () => {
      cancelAnimationFrame(id);
      el.textContent = tekst;
    };
  }, [tekst]);
  return (
    <span ref={ref} className={className}>
      {tekst}
    </span>
  );
}

// Svakih 60 s server ponovno izračuna brojke; pauza dok je kartica skrivena.
export function Osvjezi({ sekundi = 60 }) {
  const router = useRouter();
  const [ostalo, setOstalo] = useState(sekundi);
  useEffect(() => {
    // Povratak na karticu (ili otključan mobitel): osvježi odmah, ne čekaj do 60 s.
    const vidljivo = () => {
      if (!document.hidden) {
        router.refresh();
        setOstalo(sekundi);
      }
    };
    document.addEventListener("visibilitychange", vidljivo);
    return () => document.removeEventListener("visibilitychange", vidljivo);
  }, [router, sekundi]);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      setOstalo((s) => {
        if (s <= 1) {
          router.refresh();
          return sekundi;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [router, sekundi]);
  return (
    <span className="mono text-[11px] text-[color:var(--a-mute)]" aria-live="off">
      <span className="live-dot mr-2 align-middle" aria-hidden="true" />
      LIVE · SYNC {String(ostalo).padStart(2, "0")}s
    </span>
  );
}

// Označi odjeljak koji je trenutno na ekranu. Vodoravno (mobitel) ili okomito (lijevi izbornik na velikom ekranu).
const BOJE = { korisnici: "#7DD3FC", aktivnost: "#C4B5FD", tehnika: "#A7B4C6" };
export function Izbornik({ odjeljci, vertikalno = false }) {
  const [aktivan, setAktivan] = useState(odjeljci[0]?.[0]);
  useEffect(() => {
    const els = odjeljci.map(([id]) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (unosi) => {
        const vidljiv = unosi.filter((u) => u.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vidljiv) setAktivan(vidljiv.target.id);
      },
      { rootMargin: "-25% 0px -65% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [odjeljci]);
  return (
    <div className={vertikalno ? "flex flex-col" : "-mx-4 flex overflow-x-auto px-4 [scrollbar-width:none]"}>
      {odjeljci.map(([id, ime, znak, grupa], i) => (
        <a
          key={id}
          href={`#${id}`}
          aria-current={id === aktivan ? "true" : undefined}
          style={{ "--odj": BOJE[grupa] }}
          className={`odj chip mono flex h-10 shrink-0 items-center gap-2 border border-[color:var(--a-line)] px-3 text-[11px] text-[color:var(--a-mute)] ${vertikalno ? "-mt-px first:mt-0" : "-ml-px first:ml-0"}`}
        >
          <span className="opacity-60">{String(i + 1).padStart(2, "0")}</span>
          <span className="znak w-7">{znak}</span>
          {ime}
        </a>
      ))}
    </div>
  );
}

// Jedan tooltip za cijelu ploču: svaki element s data-tip pokaže vrijednost
// na prelazak mišem, na dodir (mobitel) i na fokus tipkovnicom. Grafovi ostaju server komponente.
export function Savjet() {
  const [tip, setTip] = useState(null);
  useEffect(() => {
    const nadji = (el) => (el && el.closest ? el.closest("[data-tip]") : null);
    const pokazi = (el, x, y) => {
      const t = nadji(el);
      if (!t) return false;
      const r = t.getBoundingClientRect();
      setTip({ text: t.getAttribute("data-tip"), x: x ?? r.left + r.width / 2, y: y ?? r.top });
      return true;
    };
    const preko = (e) => {
      if (e.pointerType === "touch") return;
      if (!pokazi(e.target, e.clientX, e.clientY)) setTip(null);
    };
    const pomak = (e) => {
      if (e.pointerType === "touch") return;
      if (nadji(e.target)) setTip((s) => (s ? { ...s, x: e.clientX, y: e.clientY } : s));
    };
    const dodir = (e) => {
      if (e.pointerType !== "touch") return;
      const t = nadji(e.target);
      if (t) {
        const r = t.getBoundingClientRect();
        pokazi(t, r.left + r.width / 2, r.top);
      } else setTip(null);
    };
    const fokus = (e) => pokazi(e.target);
    const van = () => setTip(null);
    const tipka = (e) => {
      if (e.key === "Escape") setTip(null);
    };
    document.addEventListener("keydown", tipka);
    document.addEventListener("pointerover", preko);
    document.addEventListener("pointermove", pomak, { passive: true });
    document.addEventListener("pointerdown", dodir);
    document.addEventListener("focusin", fokus);
    document.addEventListener("focusout", van);
    window.addEventListener("scroll", van, { passive: true });
    return () => {
      document.removeEventListener("keydown", tipka);
      document.removeEventListener("pointerover", preko);
      document.removeEventListener("pointermove", pomak);
      document.removeEventListener("pointerdown", dodir);
      document.removeEventListener("focusin", fokus);
      document.removeEventListener("focusout", van);
      window.removeEventListener("scroll", van);
    };
  }, []);
  if (!tip) return null;
  // Iznad pokazivača; uz rub ekrana se ne reže.
  const sirina = typeof window !== "undefined" ? window.innerWidth : 400;
  const x = Math.min(Math.max(tip.x, 90), sirina - 90);
  // Uz vrh ekrana (ispod ljepljivog izbornika) tooltip ide ispod točke, inače iznad.
  const ispod = tip.y < 150;
  return (
    <div
      role="status"
      className={`mono pointer-events-none fixed z-[80] max-w-[180px] -translate-x-1/2 ${ispod ? "" : "-translate-y-full"} border border-[color:var(--a-live)] bg-[color:var(--a-panel)] px-2.5 py-1.5 text-[11px] normal-case tracking-[0.03em] text-[color:var(--a-fg)] shadow-[0_0_0_1px_#000]`}
      style={{ left: x, top: ispod ? tip.y + 18 : tip.y - 10 }}
    >
      {tip.text}
    </div>
  );
}

// Tražilica po ploči: „/" ili ⌘K (Ctrl+K), ili gumb. Bez kvačica: „kafic" nađe „Kafić".
const sklopi = (s) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function Trazilica({ stavke }) {
  const [otvoreno, setOtvoreno] = useState(false);
  const [upit, setUpit] = useState("");
  const [oznacen, setOznacen] = useState(0);
  const ulaz = useRef(null);

  useEffect(() => {
    const otvori = () => {
      setUpit("");
      setOznacen(0);
      setOtvoreno(true);
    };
    const tipka = (e) => {
      const uPolju = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? "");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !uPolju)) {
        e.preventDefault();
        otvori();
      } else if (e.key === "Escape") setOtvoreno(false);
    };
    const gumb = () => otvori();
    document.addEventListener("keydown", tipka);
    window.addEventListener("adm-trazi", gumb);
    return () => {
      document.removeEventListener("keydown", tipka);
      window.removeEventListener("adm-trazi", gumb);
    };
  }, []);

  const rezultati = useMemo(() => {
    const q = sklopi(upit).trim();
    if (!q) return stavke.filter((s) => s.vrsta === "odjeljak");
    return stavke
      .map((s) => {
        const t = sklopi(s.t);
        const sve = sklopi(`${s.t} ${s.o} ${s.d ?? ""}`);
        const bod = t.startsWith(q) ? 3 : t.split(/\s+/).some((w) => w.startsWith(q)) ? 2 : sve.includes(q) ? 1 : 0;
        return { s, bod };
      })
      .filter((x) => x.bod)
      .sort((a, b) => b.bod - a.bod)
      .slice(0, 12)
      .map((x) => x.s);
  }, [upit, stavke]);

  const idi = (s) => {
    setOtvoreno(false);
    const el = document.getElementById(s.id);
    if (!el) return;
    el.scrollIntoView({ block: "start" });
    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");
  };

  if (!otvoreno) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/70 px-4 pt-[12vh]" onPointerDown={(e) => e.target === e.currentTarget && setOtvoreno(false)}>
      <div role="dialog" aria-label="Traži po ploči" className="trazi w-full max-w-xl border border-[color:var(--a-live)] bg-[color:var(--a-panel)]">
        <div className="flex items-center gap-2 border-b border-[color:var(--a-line)] px-3">
          <span className="mono up text-[13px]">/</span>
          <input
            ref={ulaz}
            autoFocus
            value={upit}
            onChange={(e) => {
              setUpit(e.target.value);
              setOznacen(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOznacen((i) => Math.min(i + 1, rezultati.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setOznacen((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter" && rezultati[oznacen]) idi(rezultati[oznacen]);
            }}
            placeholder="igra, push, kafić, baza…"
            aria-label="Traži"
            className="h-12 w-full bg-transparent font-[family-name:var(--a-mono)] text-[16px] text-[color:var(--a-fg)] outline-none placeholder:text-[color:var(--a-mute)]"
          />
          <kbd className="lbl">ESC</kbd>
        </div>
        <ul className="max-h-[55vh] overflow-y-auto">
          {rezultati.length === 0 && <li className="mono px-3 py-3 text-[11px] normal-case text-[color:var(--a-mute)]">Ništa za „{upit}“.</li>}
          {rezultati.map((s, i) => (
            <li key={`${s.id}-${s.t}`}>
              <button
                type="button"
                onClick={() => idi(s)}
                onPointerMove={() => setOznacen(i)}
                className={`flex min-h-11 w-full items-baseline justify-between gap-3 border-b border-[color:var(--a-line)] px-3 py-2 text-left ${i === oznacen ? "bg-[#161a17]" : ""}`}
              >
                <span className="mono text-[12px] normal-case tracking-[0.02em] text-[color:var(--a-fg)]">
                  {i === oznacen ? <span className="up">› </span> : null}
                  {s.t}
                  {s.d ? <span className="text-[color:var(--a-mute)]"> · {s.d}</span> : null}
                </span>
                <span className="lbl shrink-0">{s.o}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function TraziGumb({ className = "" }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("adm-trazi"))}
      className={`chip mono flex h-10 items-center gap-2 border border-[color:var(--a-line)] px-3 text-[11px] text-[color:var(--a-mute)] ${className}`}
    >
      <span className="up">/</span> TRAŽI
      <kbd className="hidden opacity-60 md:inline">⌘K</kbd>
    </button>
  );
}

// Radar uz „Vani sad“: kazaljka kruži, točka po osobi vani (raspored izmišljen, broj pravi). Bez lokacija.
export function Radar({ broj = 0, velicina = 64 }) {
  const n = Math.min(Number(broj) || 0, 12);
  const tocke = Array.from({ length: n }, (_, k) => {
    const kut = (k * 137.5 * Math.PI) / 180;
    const r = 0.3 + ((k * 0.37) % 0.6);
    return [50 + Math.cos(kut) * 42 * r, 50 + Math.sin(kut) * 42 * r];
  });
  return (
    <svg width={velicina} height={velicina} viewBox="0 0 100 100" className="radar shrink-0" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="none" stroke="var(--a-live)" strokeOpacity="0.35" />
      <circle cx="50" cy="50" r="28" fill="none" stroke="var(--a-live)" strokeOpacity="0.2" />
      <line x1="4" y1="50" x2="96" y2="50" stroke="var(--a-live)" strokeOpacity="0.12" />
      <line x1="50" y1="4" x2="50" y2="96" stroke="var(--a-live)" strokeOpacity="0.12" />
      <g className="radar-kazaljka">
        <path d="M50 50 L50 4 A46 46 0 0 1 82 17 Z" fill="var(--a-live)" fillOpacity="0.16" />
        <line x1="50" y1="50" x2="50" y2="4" stroke="var(--a-live)" strokeWidth="1.5" />
      </g>
      {tocke.map(([x, y], k) => (
        <rect key={k} x={x - 2.5} y={y - 2.5} width="5" height="5" fill="var(--a-live)" className="radar-tocka" style={{ "--i": k }} />
      ))}
    </svg>
  );
}

// Skočni prozor: HITNO za nove kritične/važne uzbune, NOVOST kad nešto naraste od zadnjeg pogleda.
// Pamti samo u ovom pregledniku (localStorage): ključeve viđenih uzbuna i zadnje brojeve. Bez zvuka (Petar 11. 11.).
export function Najave({ uzbune, brojke }) {
  const [poruka, setPoruka] = useState(null);
  // Efekt reagira samo na stvarnu promjenu sadržaja (ne na novi objekt pri svakom renderu), a poruku postavlja
  // odmah i ne poništava je: React u razvoju pokreće efekt dvaput, a drugi prolaz više ne vidi razliku.
  const kljuc = JSON.stringify([uzbune.map((u) => u.kljuc), brojke]);
  useEffect(() => {
    const [kljucevi, b] = JSON.parse(kljuc);
    let vidjene = [];
    let zadnje = {};
    try {
      vidjene = JSON.parse(localStorage.getItem("adm-vidjene") || "[]");
      zadnje = JSON.parse(localStorage.getItem("adm-brojke") || "{}");
      localStorage.setItem("adm-vidjene", JSON.stringify(kljucevi));
      localStorage.setItem("adm-brojke", JSON.stringify(b));
    } catch {}
    const nova = uzbune.find((u) => u.razina !== "info" && !vidjene.includes(u.kljuc));
    const rast = Object.entries(b)
      .filter(([k, v]) => v != null && zadnje[k] != null && Number(v) > Number(zadnje[k]))
      .map(([k, v]) => ({ k, d: Number(v) - Number(zadnje[k]) }));
    // Hrvatske množine: 1 / 2–4 / 5+ (11–14 kao 5+).
    const oblik = (n, [jedan, dva, pet]) => (n % 10 === 1 && n % 100 !== 11 ? jedan : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? dva : pet);
    const RIJEC = {
      profili: ["novi profil", "nova profila", "novih profila"],
      prednarudzbe: ["nova prednarudžba", "nove prednarudžbe", "novih prednarudžbi"],
      pratitelji: ["novi pratitelj na Instagramu", "nova pratitelja na Instagramu", "novih pratitelja na Instagramu"],
      runde: ["nova runda danas", "nove runde danas", "novih rundi danas"],
    };
    const IME = (k, d) => (RIJEC[k] ? oblik(d, RIJEC[k]) : k);
    const p = nova
      ? { vrsta: nova.razina === "kriticno" ? "HITNO" : "VAŽNO", naslov: nova.naslov, detalj: nova.detalj }
      : rast.length
        ? { vrsta: "NOVOST", naslov: rast.map((r) => `+${r.d} ${IME(r.k, r.d)}`).join(" · "), detalj: "od tvog zadnjeg pogleda" }
        : null;
    // Kratka odgoda bez poništavanja: drugi (razvojni) prolaz ne smije otkazati poruku prvoga.
    if (p) setTimeout(() => setPoruka(p), 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kljuc]);
  useEffect(() => {
    if (!poruka) return;
    const t = setTimeout(() => setPoruka(null), 9000);
    return () => clearTimeout(t);
  }, [poruka]);
  if (!poruka) return null;
  const boja = poruka.vrsta === "HITNO" ? "var(--a-alarm)" : poruka.vrsta === "VAŽNO" ? "var(--a-warn)" : "var(--a-live)";
  return (
    <div role="alert" className="najava fixed inset-x-0 top-0 z-[75] flex justify-center px-4" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
      <div className="flex w-full max-w-xl items-start gap-3 border-2 bg-[color:var(--a-panel)] px-4 py-3" style={{ borderColor: boja }}>
        <span className="num glitch shrink-0 text-[2rem] leading-none" style={{ color: boja }} data-t={poruka.vrsta}>
          {poruka.vrsta}
        </span>
        <div className="min-w-0 flex-1">
          <p className="mono text-[12.5px] normal-case tracking-[0.02em] text-[color:var(--a-fg)]">{poruka.naslov}</p>
          <p className="mono text-[10.5px] normal-case text-[color:var(--a-mute)]">{poruka.detalj}</p>
        </div>
        <button type="button" onClick={() => setPoruka(null)} className="chip mono h-9 shrink-0 border border-[color:var(--a-line)] px-2.5 text-[11px] text-[color:var(--a-mute)]">
          [ X ]
        </button>
      </div>
    </div>
  );
}

// Odbrojavanje do lansiranja (ili vrijeme od lansiranja), otkucava svake sekunde.
// Piše izravno u element (bez stanja), pa server i preglednik ne mogu imati različit tekst pri hidrataciji.
export function Odbrojavanje({ cilj, className }) {
  const ref = useRef(null);
  useEffect(() => {
    const dva = (n) => String(n).padStart(2, "0");
    const tik = () => {
      const el = ref.current;
      if (!el) return;
      const ms = cilj - Date.now();
      const s = Math.floor(Math.abs(ms) / 1000);
      const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sek = s % 60;
      el.textContent = ms > 0 ? `${d ? `${d}d ` : ""}${dva(h)}:${dva(m)}:${dva(sek)}` : `LIVE +${d ? `${d}d ` : ""}${dva(h)}:${dva(m)}`;
    };
    tik();
    const id = setInterval(tik, 1000);
    return () => clearInterval(id);
  }, [cilj]);
  return (
    <span ref={ref} className={className}>
      —
    </span>
  );
}
