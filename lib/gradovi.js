// Gradovi za kvartovski rat (w07). Isti popis koristi forma i server.
// Na ulaznici piše samo veliki grad i država (Petar, 2026-10-05), nikad kvart.
export function mjestoNaUlaznici(grad) {
  return grad && grad !== "Drugo" ? `${grad}, Hrvatska` : "";
}

export const GRADOVI = ["Dubrovnik", "Split", "Zagreb", "Rijeka", "Zadar", "Osijek", "Pula", "Šibenik", "Varaždin", "Drugo"];
