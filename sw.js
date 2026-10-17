// 受け取りページをスマホの中に保存しておき、共有された番号がGitHubに送られないようにする仕組み
// ※ index.html などを更新した時は、下の名前の v1 を v2 に変えてください（古い保存分が入れ替わります）
const CACHE = 'tel-share-v2';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.mode === 'navigate') {
    // ページを開く通信（共有された番号がURLに付いている）は、スマホ内の保存分で返す。
    // 保存分が無い時も、番号を外したURLで取りに行く。
    e.respondWith(
      caches.match('./index.html').then(r => r || fetch(new URL('./', self.registration.scope).href))
    );
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
