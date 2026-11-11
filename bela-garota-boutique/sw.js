// ============================================================
// SERVICE WORKER — hace que la tienda sea instalable y que abra
// aunque la conexión sea mala o no haya internet.
//
// Estrategia:
//  - Archivos del sitio (HTML/CSS/JS): primero la red (para que
//    siempre veas la última versión) y, si tarda o falla, la copia
//    guardada.
//  - Catálogo (Apps Script, solo lectura): primero la red; sin
//    conexión se muestra el último catálogo guardado.
//  - Imágenes y tipografías externas: primero la copia guardada.
//  - Las escrituras del panel de admin (POST) nunca se guardan.
//
// Si cambiás la lista de archivos de abajo, subí el número de versión.
// ============================================================
const VERSION = "v1";
const CACHE_SITIO = `bg-sitio-${VERSION}`;
const CACHE_DATOS = `bg-datos-${VERSION}`;
const CACHE_MEDIA = `bg-media-${VERSION}`;
const MAX_MEDIA = 80;
const ESPERA_RED_MS = 4000;

const ARCHIVOS_BASE = [
  "./",
  "index.html",
  "producto.html",
  "carrito.html",
  "css/style.css",
  "js/config.js",
  "js/data-demo.js",
  "js/api.js",
  "js/cart.js",
  "js/catalog.js",
  "js/product.js",
  "js/pwa.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_SITIO)
      .then((cache) => cache.addAll(ARCHIVOS_BASE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const vigentes = [CACHE_SITIO, CACHE_DATOS, CACHE_MEDIA];
  event.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(
          claves
            .filter((c) => c.startsWith("bg-") && !vigentes.includes(c))
            .map((c) => caches.delete(c))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; // admin (POST) va siempre directo a la red

  const url = new URL(req.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  if (url.origin === self.location.origin) {
    event.respondWith(redPrimero(req, CACHE_SITIO, { ignoreSearch: true }));
    return;
  }

  if (url.hostname === "script.google.com" || url.hostname === "script.googleusercontent.com") {
    event.respondWith(redPrimero(req, CACHE_DATOS));
    return;
  }

  const esMedia =
    req.destination === "image" ||
    req.destination === "font" ||
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com";
  if (esMedia) {
    event.respondWith(cachePrimero(req, CACHE_MEDIA));
  }
});

// Red primero con tiempo de espera; si no responde, copia guardada.
async function redPrimero(req, nombreCache, opciones) {
  const cache = await caches.open(nombreCache);
  const guardada = await cache.match(req, opciones);

  const deRed = fetch(req).then((res) => {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  });

  if (!guardada) return deRed;

  deRed.catch(() => {}); // sigue actualizando el caché en segundo plano
  const espera = new Promise((resolve) => setTimeout(() => resolve(null), ESPERA_RED_MS));
  try {
    const res = await Promise.race([deRed, espera]);
    return res && res.ok ? res : guardada;
  } catch (err) {
    return guardada;
  }
}

// Copia guardada primero; si no existe, se baja y se guarda.
async function cachePrimero(req, nombreCache) {
  const cache = await caches.open(nombreCache);
  const guardada = await cache.match(req);
  if (guardada) return guardada;

  const res = await fetch(req);
  // "opaque" = imagen de otro dominio sin CORS: se puede guardar igual.
  if (res && (res.ok || res.type === "opaque")) {
    await cache.put(req, res.clone());
    recortar(cache);
  }
  return res;
}

async function recortar(cache) {
  const claves = await cache.keys();
  for (let i = 0; i < claves.length - MAX_MEDIA; i++) {
    await cache.delete(claves[i]);
  }
}
