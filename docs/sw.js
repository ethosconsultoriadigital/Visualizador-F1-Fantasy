/* Service Worker — F1 Fantasy MZT 2026 (PWA wrapper)
 * - Habilita la instalación ("Agregar a inicio" como app).
 * - Cachea el shell (splash/íconos) para arranque rápido.
 * - Deja preparado el soporte de notificaciones push (opcional, requiere
 *   configurar Web Push/VAPID más adelante).
 */
const CACHE = 'f1f-shell-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon-32.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Solo cacheamos el shell propio (mismo origen). El contenido de la app
  // (script.google.com dentro del iframe) siempre va a la red.
  if (url.origin === self.location.origin) {
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
  }
});

/* ---- Notificaciones push (preparado; inactivo hasta configurar VAPID) ---- */
self.addEventListener('push', (event) => {
  let data = { title: 'F1 Fantasy MZT', body: '¡No olvides hacer tu pick!' };
  try { if (event.data) data = Object.assign(data, event.data.json()); } catch (e) {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      data: { url: data.url || './' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
