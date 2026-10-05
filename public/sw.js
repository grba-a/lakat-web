// Gasi staru LAKAT web aplikaciju na uređajima gdje je instalirana (Petar d4, 2026-10-05).
// Stari service worker (lakat-v67) provjeri /sw.js, dobije ovaj, a ovaj obriše sve cacheve,
// odjavi se i jednom osvježi otvorene prozore, pa se učita nova stranica s ekranom
// „Račun ti je spremljen“. Web pushevi time prestaju jer pretplata nestaje s workerom.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      try {
        const sub = await self.registration.pushManager?.getSubscription();
        await sub?.unsubscribe();
      } catch {}
      await self.registration.unregister();
      const wins = await self.clients.matchAll({ type: "window" });
      wins.forEach((w) => w.navigate(w.url));
    })()
  );
});
