// Thay đổi version này (ví dụ thành 'my-super-app-v2') mỗi khi sếp có cập nhật code mới
const CACHE_NAME = 'my-super-app-v2'; 
const assets = ['index.html', 'style.css', 'script.js', 'manifest.json'];

// BƯỚC 1: Cài đặt và lưu code vào bộ nhớ điện thoại
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(assets)));
  // Lệnh tối thượng: Ép Service Worker mới hoạt động ngay lập tức không cần chờ
  self.skipWaiting(); 
});

// BƯỚC 2: Kích hoạt và dọn dẹp rác cũ
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  // Yêu cầu app tải lại bằng tài nguyên mới nhất
  self.clients.claim();
});

// BƯỚC 3: Xử lý khi mất mạng (Offline)
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
