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
