// Chiến lược Cache: Giúp app mở được ngay cả khi không có mạng
const CACHE_NAME = 'api-expert-v1';
const assets = ['index.html', 'manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(assets)));
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
