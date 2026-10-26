// Crumbi (Okruszek) jako aplikacja: gra działa też bez internetu; przy sieci zawsze bierze najnowszą wersję (najpierw sieć, potem pamięć).
// Wzorzec z Kociłapek. Przy każdej zmianie plików gry podbij numer w PAMIEC (crumbi-N): stara pamięć jest usuwana przy aktywacji.
const PAMIEC = 'crumbi-2';   // Z18: nowa wersja (logika toru, HUD, jasne panele)
const PLIKI = ['./', './index.html', './teksty.js', './dzwiek.js', './manifest.webmanifest', './ikona-192.png', './ikona-512.png', './ikona-180.png'];
self.addEventListener('install', e => {
  // każdy plik osobno i zawsze świeży z sieci (cache: 'reload'); brak jednego pliku nie blokuje instalacji
  e.waitUntil(caches.open(PAMIEC).then(c => Promise.all(PLIKI.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => { })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== PAMIEC).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.includes('/api/')) return;
  e.respondWith(
    fetch(e.request).then(r => { if (r.ok) { const kopia = r.clone(); caches.open(PAMIEC).then(c => c.put(e.request, kopia)); } return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: e.request.mode === 'navigate' }).then(r => r || caches.match('./index.html')))
  );
});
