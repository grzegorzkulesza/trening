// Offline cache. The page itself is always fetched fresh (bypassing the browser cache) when online,
// so a new index.html shows up on the next app start without reinstalling the icon.
const CACHE = "trening-v3";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, {cache:"reload"})))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin){
    if (!/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) return; // data requests (Google Sheets sync) always go to the network
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; }).catch(() => hit)));
    return;
  }
  const isPage = req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("index.html");
  const fresh = isPage ? fetch(req.url, {cache:"no-store"}) : fetch(req);
  e.respondWith(fresh.then(res => { if (res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(isPage ? "index.html" : req, copy)); } return res; })
    .catch(() => caches.match(isPage ? "index.html" : req).then(hit => hit || caches.match("index.html"))));
});
