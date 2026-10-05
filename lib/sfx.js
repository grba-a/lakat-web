// Zvuk je isključen dok ga posjetitelj ne upali (Petar d2). Zvukovi su iz aplikacije.
const KEY = "lakat-zvuk";
const cache = {};

export function soundOn() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setSound(on) {
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {}
  window.dispatchEvent(new Event(KEY));
}

export function play(name) {
  if (typeof window === "undefined" || !soundOn()) return;
  const a = (cache[name] ||= new Audio(`/${name}.wav`));
  a.currentTime = 0;
  a.play().catch(() => {});
}

export const SOUND_EVENT = KEY;

// Tihi klak pločice: kratki šum iz WebAudio, samo kad je zvuk upaljen (w03).
let ctx;
let last = 0;
export function tick() {
  if (typeof window === "undefined" || !soundOn()) return;
  const now = performance.now();
  if (now - last < 120) return; // više pločica u istoj sekundi = jedan klak
  last = now;
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    const len = Math.floor(ctx.sampleRate * 0.025);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1800;
    gain.gain.value = 0.18;
    src.buffer = buf;
    src.connect(hp).connect(gain).connect(ctx.destination);
    src.start();
  } catch {}
}
