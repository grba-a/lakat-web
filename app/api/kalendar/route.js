// „Dodaj u kalendar“ (Petar w15): događaj 1. 12. 2026. u 12:00 po Zagrebu, s podsjetnikom dan prije i u podne.
export function GET(request) {
  const url = new URL("/", request.url).toString();
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LAKAT//lakat-web//HR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:lakat-lansiranje-2026-12-01@lakat-web",
    "DTSTAMP:20261004T120000Z",
    "DTSTART:20261201T110000Z",
    "DTEND:20261201T113000Z",
    "SUMMARY:LAKAT. Šank se otvara",
    `DESCRIPTION:LAKAT izlazi na iPhoneu. ${url}`,
    `URL:${url}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Sutra u podne LAKAT.",
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:PT0M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Šank je otvoren.",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return new Response(ics, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'attachment; filename="lakat-1-12.ics"',
    },
  });
}
