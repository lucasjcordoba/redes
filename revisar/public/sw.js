/**
 * Service worker de la app: la hace instalable, guarda la cáscara para que
 * abra rápido y recibe las notificaciones push.
 *
 * Los datos (/api/*) nunca se cachean: una publicación aprobada tiene que
 * verse aprobada, no como estaba la última vez.
 */
const VERSION = "redes-v1";
const CASCARA = ["/", "/app.css", "/app.js", "/manifest.webmanifest", "/icono-192.png", "/avatar-raudal.jpg", "/avatar-tecnoaid.jpg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CASCARA)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Red primero para la cáscara (así siempre está la última versión), caché si no hay conexión.
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/") || url.pathname.startsWith("/p/")) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const copia = r.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copia));
        return r;
      })
      .catch(() => caches.match(e.request).then((r) => r ?? caches.match("/"))),
  );
});

self.addEventListener("push", (e) => {
  let aviso = {};
  try { aviso = e.data.json(); } catch { aviso = { titulo: "Redes", cuerpo: e.data?.text() ?? "" }; }
  e.waitUntil(self.registration.showNotification(aviso.titulo ?? "Redes", {
    body: aviso.cuerpo ?? "",
    icon: "/icono-192.png",
    badge: "/icono-192.png",
    tag: aviso.etiqueta,
    renotify: Boolean(aviso.etiqueta),
    data: { url: aviso.url ?? "/" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL(e.notification.data?.url ?? "/", location.origin).href;
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      const abierta = ventanas.find((v) => v.url.startsWith(location.origin));
      if (abierta) return abierta.navigate(url).then((v) => v?.focus());
      return self.clients.openWindow(url);
    }),
  );
});
