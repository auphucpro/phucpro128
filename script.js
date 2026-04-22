// Toàn bộ logic điều khiển app được bóc tách sang đây
function switchTab(tabId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

async function getRandomWallpaper() {
    const output = document.getElementById('tool-output');
    output.style.display = 'block';
    output.innerHTML = "Đang lấy ảnh nghệ thuật...";
    const imgUrl = `https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=500&q=80`;
    output.innerHTML = `<img src="${imgUrl}" style="width:100%; border-radius:8px;"> <br> Đã cập nhật ảnh từ Unsplash!`;
}

function getAIAdvice() {
    const output = document.getElementById('tool-output');
    output.style.display = 'block';
    output.innerHTML = "AI đang suy nghĩ...";
    const advices = [
        "Hãy tập trung vào Firebase Storage để lưu trữ phim cá nhân nhé sếp!",
        "Dùng PWA sẽ giúp app chạy mượt như app cài từ CH Play đấy.",
        "Sếp nên đẩy code lên GitHub thường xuyên để không bị mất dữ liệu."
    ];
    setTimeout(() => {
        const random = advices[Math.floor(Math.random() * advices.length)];
        output.innerHTML = `<strong>🤖 AI khuyên:</strong> <br> ${random}`;
    }, 1000);
}

// Kiểm tra trạng thái mạng
window.addEventListener('load', () => {
    const status = document.getElementById('weather-status');
    if (navigator.onLine) {
        status.innerHTML = "🟢 Hệ thống Đang Online";
        // Đăng ký Service Worker cho PWA (Nếu có file sw.js)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(() => {});
        }
    } else {
        status.innerHTML = "🔴 Chế độ Ngoại tuyến";
    }
});
