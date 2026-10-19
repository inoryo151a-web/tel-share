// 受け取りページの最新版を取りに行きつつ、共有された番号がGitHubに送られないようにする仕組み
// ・ページを開く時は、番号などが付いていない素のアドレスで最新版を取りに行く（番号はGitHubに送られない）
// ・電波が無い時だけ、スマホに保存しておいた分を使う
const CACHE = 'tel-share-v4';
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
    const bare = new URL('./', self.registration.scope).href; // 「?」以降（共有された内容）を外したアドレス
    e.respondWith(
      fetch(bare, { cache: 'no-store' })
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
