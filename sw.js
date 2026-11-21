// Guarda la app para que abra sin internet. Cambia VERSION al publicar cambios.
const VERSION = "hangul-v3";
const FILES = ["./", "index.html", "manifest.webmanifest", "icons/icon-32.png", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "icons/logo-256.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname.includes("mymemory")) return; // el traductor siempre en vivo
  // Red primero (para recibir actualizaciones); si no hay internet, usa la copia guardada.
  e.respondWith(fetch(req).then(res => {
    if (res.ok && (url.origin === location.origin || url.hostname.includes("fonts.g"))) {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy));
    }
    return res;
  }).catch(() => caches.match(req).then(r => r || caches.match("index.html"))));
});
