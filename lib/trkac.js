// Kopija jezgre trkača iz lakat-pwa (`public/igre/trkac.js`, 2026-10-04), bez izmjena fizike.
// Na webu je „primjer onoga što dolazi za igre“: Petar ne želi da se ime igre spominje.
// ── Brend paleta (kopija tokena iz app/globals.css; ovdje doslovno jer
// modul nema pristup Tailwindu ni CSS varijablama na offline ekranu) ──
const BOJE = {
  accent: "#4ade80",
  linija: "rgba(255,255,255,0.42)",
  jaka: "rgba(255,255,255,0.62)",
  tlo: "rgba(255,255,255,0.3)",
  daleko: "rgba(255,255,255,0.055)",
  stup: "rgba(255,255,255,0.1)",
  lampa: "rgba(74,222,128,0.1)",
  pao: "#f87171",
};

// VISINA SVIJETA JE KADAR, NE UKRAS. Prazno nebo iznad glave ne nosi ništa,
// a svaka jedinica visine krade veličinu figurici: platno je fiksne visine u
// pikselima, pa što je svijet "viši", to je trkač sitniji. 150 je najniže
// što još ostavlja zraka iznad najvišeg skoka.
const H = 150;
const TLO = 116; // y linije tla (ispod nje je pločnik)

const IGRAC_X = 34;
const IGRAC_W = 17;
const IGRAC_H = 30;

const G = 2300; // gravitacija (j/s²)
const SKOK_V = 560; // vrh skoka ~68 j — čisto iznad najviše prepreke (47)
const REZ_SKOKA = 0.42; // ranije puštanje reže uzlet: kratki tap = niski skok
const BUFER_S = 0.12; // tap malo prije doskoka se pamti (pijana ruka kasni)

// ŠIRINA SVIJETA JE VRIJEME REAKCIJE. Prepreka se rađa desno od kadra, pa je
// broj jedinica preko ekrana ujedno i koliko sekundi imaš da je vidiš. Zato
// se svijet NE smije dodatno zumirati: figurica bi narasla, a igra postala
// nepoštena.
const V_POCETNA = 250;
const V_PRIRAST = 7; // po preskočenoj prepreci
const V_MAX = 560; // ~1,1 s upozorenja na startu, ~0,5 s na stropu

const KORAK = 1 / 120; // fiksni korak fizike — isti ishod na 60 i 120 Hz
const MAX_DT = 0.05; // duži zastoj se PRESKAČE, ne nadoknađuje

// Prepreke na putu doma u četiri ujutro. `h` je ono što odlučuje o skoku,
// `w` o tome koliko dugo si u zraku iznad nje.
const PREPREKE = [
  { key: "kanta", w: 24, h: 33, tezina: 3 },
  { key: "stozac", w: 22, h: 29, tezina: 3 },
  { key: "romobil", w: 38, h: 23, tezina: 2 },
  { key: "macka", w: 29, h: 19, tezina: 2 },
  { key: "gajbe", w: 19, h: 47, tezina: 1 }, // visoka — traži pun skok
];

// Siluete u pozadini se ponavljaju u periodu od 300 j: [x, širina, visina]
const ZGRADE = [
  [0, 48, 38],
  [54, 30, 24],
  [90, 22, 50],
  [118, 62, 32],
  [188, 26, 42],
  [222, 44, 26],
  [272, 20, 34],
];

export function presuda(n) {
  if (n === 0) return "Ni koraka. Sjedi doli.";
  if (n <= 3) return "Pao si prije prve krivine.";
  if (n <= 9) return "Noga ti je teža od glave.";
  if (n <= 19) return "Vidiš pekaru. Još malo.";
  if (n <= 34) return "Burek je tvoj. Zaslužio si.";
  return "Ti si trčao trijezan. Priznaj.";
}

function odaberiTip() {
  let ukupno = 0;
  for (const p of PREPREKE) ukupno += p.tezina;
  let r = Math.random() * ukupno;
  for (const p of PREPREKE) {
    r -= p.tezina;
    if (r <= 0) return p;
  }
  return PREPREKE[0];
}

/**
 * Pokreće trkača na zadanom <canvas>. Vraća upravljač.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{reduciran?: boolean, onBod?: (n:number)=>void, onKraj?: (n:number)=>void}} opcije
 * @returns {{kreni:()=>void, skoci:()=>void, pusti:()=>void, stop:()=>void, stanje:()=>string}}
 */
export function pokreniTrkac(canvas, opcije = {}) {
  const { reduciran = false, onBod = null, onKraj = null } = opcije;
  const ctx = canvas.getContext("2d");

  let W = 390; // širina svijeta u jedinicama (ovisi o omjeru platna)
  let S = 1; // jedinica → CSS piksel
  let dpr = 1;

  let stanje = "spreman"; // "spreman" | "trci" | "kraj"
  let v = V_POCETNA;
  let bodovi = 0;
  let prepreke = [];
  let doSljedece = 0;

  let y = 0; // visina stopala iznad tla
  let vy = 0;
  let drzi = false;
  let bufer = 0; // preostalo vrijeme zapamćenog tapa
  let faza = 0; // hod nogu
  let pomak = 0; // ukupno prijeđeno (tlo i parallax)
  let trese = 0;

  let zadnji = 0;
  let akum = 0;
  let raf = 0;
  let ziv = true;

  function mjeri() {
    const r = canvas.getBoundingClientRect();
    const cssW = Math.max(1, r.width || canvas.clientWidth || 320);
    const cssH = Math.max(1, r.height || canvas.clientHeight || 260);
    dpr = Math.min(3, window.devicePixelRatio || 1);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    S = cssH / H;
    W = cssW / S;
  }

  function reset() {
    stanje = "spreman";
    v = V_POCETNA;
    bodovi = 0;
    prepreke = [];
    doSljedece = 220;
    y = 0;
    vy = 0;
    drzi = false;
    bufer = 0;
    trese = 0;
  }

  function kreni() {
    reset();
    stanje = "trci";
  }

  function skoci() {
    if (stanje !== "trci") return;
    drzi = true;
    if (y <= 0.01) {
      vy = SKOK_V;
      bufer = 0;
    } else {
      // Tap u zraku se PAMTI kratko: pijan čovjek tapne prerano, a ne
      // prekasno. Bez ovoga se skok "pojede" i izgleda ko da igra ne sluša.
      bufer = BUFER_S;
    }
  }

  function pusti() {
    drzi = false;
    if (vy > 0) vy *= REZ_SKOKA;
  }

  function spawn() {
    const t = odaberiTip();
    const pocetak = W + 12;
    prepreke.push({ ...t, x: pocetak, bodovan: false });
    let desni = pocetak + t.w;

    // Klaster: druga prepreka odmah iza prve. Jedan dug skok mora pokriti
    // obje — to je jedina stvar koju kratki tap NE riješi.
    if (bodovi > 6 && Math.random() < 0.22) {
      const t2 = PREPREKE[Math.random() < 0.5 ? 0 : 1];
      const razmak = 15 + Math.random() * 13;
      prepreke.push({ ...t2, x: desni + razmak, bodovan: false });
      desni += razmak + t2.w;
    }

    // Razmak raste s brzinom, pa je vrijeme reakcije uvijek isto — igra se
    // otežava skokom po sekundi, ne nemogućim tajmingom.
    const prazno = Math.max(150, v * (0.62 + Math.random() * 0.55) + 24);
    doSljedece = desni - pocetak + prazno;
  }

  function korak(dt) {
    if (stanje !== "trci") return;

    pomak += v * dt;
    faza += (v * dt) / 13;

    if (bufer > 0) {
      bufer -= dt;
      if (y <= 0.01 && bufer > 0) {
        vy = SKOK_V;
        bufer = 0;
      }
    }

    y += vy * dt;
    vy -= G * dt;
    if (y <= 0) {
      y = 0;
      vy = 0;
    }
    // Puštanje prsta usred uzleta reže skok i kad se dogodi između koraka
    if (!drzi && vy > 0) vy = Math.min(vy, SKOK_V * REZ_SKOKA);

    for (const o of prepreke) o.x -= v * dt;

    doSljedece -= v * dt;
    if (doSljedece <= 0) spawn();

    const px = IGRAC_X + 3;
    const pw = IGRAC_W - 6;

    for (const o of prepreke) {
      if (!o.bodovan && o.x + o.w < px) {
        o.bodovan = true;
        bodovi += 1;
        v = Math.min(V_MAX, v + V_PRIRAST);
        onBod?.(bodovi);
      }
      // Prepreka stoji NA TLU, pa je sudar čisto pitanje visine STOPALA:
      // ako su niža od vrha prepreke, zapeo si. (Tjeme ovdje nema što tražiti
      // — s njim je uvjet obrnut i gineš baš kad preskočiš.)
      // 3 j popusta: rub piksela ne smije ubiti skok koji je oku prošao.
      if (o.x < px + pw && o.x + o.w > px && y < o.h - 3) {
        stanje = "kraj";
        trese = 1;
        onKraj?.(bodovi);
        return;
      }
    }

    prepreke = prepreke.filter((o) => o.x + o.w > -30);
    if (trese > 0) trese = Math.max(0, trese - dt * 6);
  }

  // ── crtanje ──────────────────────────────────────────────────────────

  function pozadina() {
    ctx.fillStyle = BOJE.daleko;
    const P = 300;
    const off = (pomak * 0.18) % P;
    for (let k = -1; k * P - off < W + P; k++) {
      const bx = k * P - off;
      for (const [dx, bw, bh] of ZGRADE) {
        ctx.fillRect(bx + dx, TLO - bh, bw, bh);
      }
    }
  }

  function lampe() {
    const P = 210;
    const off = (pomak * 0.55) % P;
    ctx.strokeStyle = BOJE.stup;
    ctx.lineWidth = 2;
    for (let k = -1; k * P - off < W + P; k++) {
      const lx = k * P - off + 30;
      ctx.beginPath();
      ctx.moveTo(lx, TLO);
      ctx.lineTo(lx, TLO - 74);
      ctx.lineTo(lx + 12, TLO - 79);
      ctx.stroke();
      ctx.fillStyle = BOJE.lampa;
      ctx.beginPath();
      ctx.arc(lx + 13, TLO - 79, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function pod() {
    ctx.strokeStyle = BOJE.tlo;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, TLO);
    ctx.lineTo(W, TLO);
    ctx.stroke();

    // Crtice pločnika daju osjećaj brzine — bez njih se ne vidi da trčiš
    const P = 27;
    const off = pomak % P;
    ctx.strokeStyle = BOJE.daleko;
    ctx.lineWidth = 2;
    for (let k = -1; k * P - off < W + P; k++) {
      const tx = k * P - off;
      ctx.beginPath();
      ctx.moveTo(tx, TLO + 11);
      ctx.lineTo(tx + 11, TLO + 11);
      ctx.stroke();
    }
  }

  function crtajPrepreku(o) {
    const d = TLO; // dno
    const g = TLO - o.h; // vrh
    ctx.strokeStyle = o.key === "gajbe" ? BOJE.jaka : BOJE.linija;
    ctx.lineWidth = 2.2;
    ctx.beginPath();

    if (o.key === "kanta") {
      ctx.moveTo(o.x + 2.5, g + 4);
      ctx.lineTo(o.x + 4.5, d);
      ctx.lineTo(o.x + o.w - 4.5, d);
      ctx.lineTo(o.x + o.w - 2.5, g + 4);
      ctx.moveTo(o.x, g + 4);
      ctx.lineTo(o.x + o.w, g + 4);
      ctx.moveTo(o.x + o.w / 2, g + 4);
      ctx.lineTo(o.x + o.w / 2, g);
    } else if (o.key === "stozac") {
      ctx.moveTo(o.x + o.w / 2, g);
      ctx.lineTo(o.x + o.w - 3, d - 3);
      ctx.moveTo(o.x + o.w / 2, g);
      ctx.lineTo(o.x + 3, d - 3);
      ctx.moveTo(o.x, d);
      ctx.lineTo(o.x + o.w, d);
      ctx.moveTo(o.x + 5.5, d - 9);
      ctx.lineTo(o.x + o.w - 5.5, d - 9);
    } else if (o.key === "romobil") {
      ctx.moveTo(o.x + 5, d - 8);
      ctx.lineTo(o.x + o.w - 6, d - 8);
      ctx.moveTo(o.x + o.w - 6, d - 8);
      ctx.lineTo(o.x + o.w - 9, g);
      ctx.lineTo(o.x + o.w - 1, g);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(o.x + 5, d - 4.5, 4.5, 0, Math.PI * 2);
      ctx.moveTo(o.x + o.w - 1.5, d - 4.5);
      ctx.arc(o.x + o.w - 6, d - 4.5, 4.5, 0, Math.PI * 2);
    } else if (o.key === "macka") {
      // Leđa u luku, uši i rep — mačka na pločniku se ne miče ni za koga
      ctx.moveTo(o.x + 2, d);
      ctx.quadraticCurveTo(o.x + o.w * 0.45, g - 2, o.x + o.w - 7, d);
      ctx.moveTo(o.x + o.w - 8, d - 7);
      ctx.lineTo(o.x + o.w - 9.5, d - 12);
      ctx.lineTo(o.x + o.w - 6, d - 9);
      ctx.moveTo(o.x + 3, d - 3);
      ctx.quadraticCurveTo(o.x - 4, d - 10, o.x + 1, d - 15);
    } else {
      // gajbe — dvije naslagane, visoka prepreka
      ctx.rect(o.x, d - o.h / 2, o.w, o.h / 2);
      ctx.rect(o.x + 1.5, d - o.h, o.w - 3, o.h / 2);
      ctx.moveTo(o.x + o.w / 2, d - o.h / 2);
      ctx.lineTo(o.x + o.w / 2, d);
    }
    ctx.stroke();
  }

  function crtajIgraca() {
    const stopala = TLO - y;
    const tjeme = stopala - IGRAC_H;
    const cx = IGRAC_X + IGRAC_W / 2;
    const uzraku = y > 0.5;

    ctx.save();
    if (stanje === "kraj") {
      // Pao je preko prepreke — silueta koja leži čita se bez ijednog natpisa
      ctx.translate(IGRAC_X + IGRAC_W, TLO);
      ctx.rotate(-1.3);
      ctx.translate(-(IGRAC_X + IGRAC_W), -TLO);
    }
    ctx.strokeStyle = stanje === "kraj" ? BOJE.pao : BOJE.accent;
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.arc(cx, tjeme + 5, 4.8, 0, Math.PI * 2);
    ctx.stroke();

    const rame = tjeme + 12;
    const kuk = tjeme + 21;
    // Trup je blago nagnut naprijed — uspravna crta izgleda ko da stoji
    ctx.beginPath();
    ctx.moveTo(cx + 1.5, tjeme + 10);
    ctx.lineTo(cx - 1.5, kuk);
    ctx.stroke();

    const a = uzraku ? 0.75 : Math.sin(faza);
    const b = uzraku ? -0.45 : Math.sin(faza + Math.PI);
    for (const ang of [a, b]) {
      const kx = cx - 1.5 + Math.sin(ang) * 5.5;
      const fx = cx - 1.5 + Math.sin(ang) * 11;
      const fy = uzraku ? stopala - 4 : stopala - Math.max(0, -Math.cos(ang)) * 3;
      ctx.beginPath();
      ctx.moveTo(cx - 1.5, kuk);
      ctx.lineTo(kx, kuk + 5);
      ctx.lineTo(fx, fy);
      ctx.stroke();
    }

    // Stražnja ruka maše, prednja drži kriglu — trči doma, ali pivo ne pušta
    ctx.beginPath();
    ctx.moveTo(cx + 1, rame);
    ctx.lineTo(cx - 6 + Math.sin(faza + Math.PI) * 2.5, rame + 8);
    ctx.stroke();

    // Krigla ide ISPRED tijela i niže od ramena: podignuta uz prsa se stapa
    // s trupom u jednu mrlju i figurica prestane biti čovjek.
    const rx = cx + 8.5;
    const ry = rame + 6;
    ctx.beginPath();
    ctx.moveTo(cx + 1, rame);
    ctx.lineTo(rx - 1, ry);
    ctx.stroke();
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(rx - 1.5, ry - 6.5);
    ctx.lineTo(rx - 1.5, ry + 1.5);
    ctx.lineTo(rx + 4.5, ry + 1.5);
    ctx.lineTo(rx + 4.5, ry - 6.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(rx + 5, ry - 2.5, 2.4, -1.25, 1.25);
    ctx.stroke();

    ctx.restore();
  }

  function crtaj() {
    ctx.setTransform(S * dpr, 0, 0, S * dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (trese > 0 && !reduciran) {
      ctx.translate((Math.random() - 0.5) * 5 * trese, (Math.random() - 0.5) * 5 * trese);
    }
    if (!reduciran) {
      pozadina();
      lampe();
    }
    pod();
    for (const o of prepreke) crtajPrepreku(o);
    crtajIgraca();
  }

  function petlja(t) {
    if (!ziv) return;
    raf = requestAnimationFrame(petlja);
    if (!zadnji) zadnji = t;
    let dt = (t - zadnji) / 1000;
    zadnji = t;
    if (dt > MAX_DT) dt = 0; // povratak iz pozadine ne smije teleportirati igrača
    akum += dt;
    let osig = 0;
    while (akum >= KORAK && osig++ < 8) {
      korak(KORAK);
      akum -= KORAK;
    }
    crtaj();
  }

  function naVidljivost() {
    if (document.hidden) {
      zadnji = 0;
      akum = 0;
    }
  }

  mjeri();
  reset();
  const ro =
    typeof ResizeObserver !== "undefined" ? new ResizeObserver(mjeri) : null;
  if (ro) ro.observe(canvas);
  else window.addEventListener("resize", mjeri);
  document.addEventListener("visibilitychange", naVidljivost);
  raf = requestAnimationFrame(petlja);

  function stop() {
    ziv = false;
    cancelAnimationFrame(raf);
    if (ro) ro.disconnect();
    else window.removeEventListener("resize", mjeri);
    document.removeEventListener("visibilitychange", naVidljivost);
  }

  return { kreni, skoci, pusti, stop, stanje: () => stanje };
}
