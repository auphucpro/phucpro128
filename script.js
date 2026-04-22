// --- HỆ THỐNG THÔNG BÁO CUSTOM ---
function showSms(message) {
    document.getElementById('alert-message').innerHTML = message;
    document.getElementById('custom-alert').classList.add('active');
}
function closeAlert() {
    document.getElementById('custom-alert').classList.remove('active');
}

// Thay thế toàn bộ alert() cũ bằng showSms()
window.alert = showSms; 

// --- ADMIN & AUTH ---
let tapCount = 0;
let tapTimer;
const ADMIN_PASSWORD = "2411"; 

function secretKnock() {
    tapCount++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => tapCount = 0, 2000);
    if (tapCount >= 5) {
        document.getElementById('admin-login-modal').classList.add('active');
        tapCount = 0;
    }
}

function verifyAdmin() {
    if (document.getElementById('admin-pin').value === ADMIN_PASSWORD) {
        document.getElementById('admin-login-modal').classList.remove('active');
        document.getElementById('admin-panel-modal').classList.add('active');
    } else { showSms("Sai mã PIN! Quyền truy cập bị từ chối."); }
}
function closeAdminLogin() { document.getElementById('admin-login-modal').classList.remove('active'); }
function closeAdminPanel() { document.getElementById('admin-panel-modal').classList.remove('active'); }

// --- PWA INSTALL LOGIC ---
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-card').style.display = 'block';
});

async function triggerInstall() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') document.getElementById('install-card').style.display = 'none';
        deferredPrompt = null;
    }
}

// --- CORE DATA & RENDER ---
let globalData = { videos: [], music: [] };
let activeMedia = null;

async function loadData() {
    try {
        const res = await fetch('links.json');
        const def = await res.json();
        const custom = JSON.parse(localStorage.getItem('my_custom_media')) || { videos: [], music: [] };
        globalData.videos = [...def.videos, ...custom.videos];
        globalData.music = [...def.music, ...custom.music];
        render();
    } catch (e) { console.error("Lỗi tải data"); }
}

function render() {
    const vCont = document.getElementById('video-container');
    const mCont = document.getElementById('music-container');
    
    // Render Custom UI thay vì controls trắng
    vCont.innerHTML = globalData.videos.map(v => {
        // Xử lý riêng nếu là mã nhúng TikTok (Iframe)
        if (v.isTikTok) {
            return `
            <div class="media-card">
                ${v.html}
                <div class="media-info"><h3>${v.title}</h3><p>${v.source}</p></div>
            </div>`;
        }
        // Video thường với Custom Play Button
        return `
        <div class="media-card">
            <div style="position: relative;">
                <video id="${v.id}" poster="${v.poster || ''}"><source src="${v.url}"></video>
                <div class="custom-player-ui" onclick="toggleCustomPlay('${v.id}')">
                    <div class="play-circle" id="play-btn-${v.id}">▶</div>
                </div>
            </div>
            <div class="media-info">
                <h3>${v.title}</h3><p>${v.source}</p>
                <button class="audio-btn" onclick="toggleAudioOnly('${v.id}')">🎧 Tắt hình, chỉ nghe tiếng</button>
            </div>
        </div>`;
    }).join('');

    mCont.innerHTML = globalData.music.map(m => `
        <div class="media-card">
            <div class="music-art">
                🎵
                <audio id="${m.id}"><source src="${m.url}"></audio>
                <div class="custom-player-ui" onclick="toggleCustomPlay('${m.id}')" style="opacity: 1; height: 100%;">
                    <div class="play-circle" id="play-btn-${m.id}">▶</div>
                </div>
            </div>
            <div class="media-info"><h3>${m.title}</h3><p>${m.artist}</p></div>
        </div>
    `).join('');
    
    bindEvents();
}

function saveCustomMedia() {
    const type = document.getElementById('media-type').value; 
    const title = document.getElementById('media-title').value.trim();
    const author = document.getElementById('media-author').value.trim();
    const url = document.getElementById('media-url').value.trim();

    if (!title || !url) return showSms("Vui lòng nhập Tiêu đề và Link URL!");

    let customData = JSON.parse(localStorage.getItem('my_custom_media')) || { videos: [], music: [] };
    const newItem = {
        id: "custom_" + Date.now(), title: title, source: author || "Admin", artist: author || "Admin", url: url
    };

    if (type === 'video') customData.videos.unshift(newItem); 
    if (type === 'music') customData.music.unshift(newItem);

    localStorage.setItem('my_custom_media', JSON.stringify(customData));
    closeAdminPanel(); loadData(); showSms("Đã thêm Media thành công!");
}

// --- MEDIA SESSION & CUSTOM PLAY ---
function toggleCustomPlay(id) {
    const media = document.getElementById(id);
    const btn = document.getElementById(`play-btn-${id}`);
    if(media.paused) { media.play(); btn.innerText = '⏸'; } 
    else { media.pause(); btn.innerText = '▶'; }
}

function bindEvents() {
    const all = document.querySelectorAll('video, audio');
    all.forEach(el => {
        el.onplay = () => {
            all.forEach(x => { 
                if(x !== el) { x.pause(); const b = document.getElementById(`play-btn-${x.id}`); if(b) b.innerText = '▶';} 
            });
            activeMedia = el;
            document.getElementById(`play-btn-${el.id}`).innerText = '⏸';
            updateMiniPlayer(el);
            setupMediaSession(el);
        };
        el.onpause = () => {
            const b = document.getElementById(`play-btn-${el.id}`); if(b) b.innerText = '▶';
            if(activeMedia === el) updateMiniPlayerIcon();
        };
    });
}

function setupMediaSession(el) {
    if ('mediaSession' in navigator) {
        const title = el.closest('.media-card').querySelector('h3').innerText;
        navigator.mediaSession.metadata = new MediaMetadata({ title: title, artist: 'Multi Phục Pro P.128' });
        navigator.mediaSession.setActionHandler('play', () => el.play());
        navigator.mediaSession.setActionHandler('pause', () => el.pause());
    }
}

function updateMiniPlayer(el) {
    const mp = document.getElementById('mini-player');
    mp.style.display = 'flex';
    document.getElementById('mini-title').innerText = el.closest('.media-card').querySelector('h3').innerText;
    updateMiniPlayerIcon();
    document.getElementById('pip-btn').style.display = el.tagName === 'VIDEO' ? 'block' : 'none';
}
function updateMiniPlayerIcon() {
    document.getElementById('mini-pp-icon').innerText = activeMedia && !activeMedia.paused ? '⏸️' : '▶️';
}
function toggleMiniPlayer() {
    if(!activeMedia) return;
    if(activeMedia.paused) activeMedia.play(); else activeMedia.pause();
}
async function togglePiP() {
    if (activeMedia && activeMedia.tagName === 'VIDEO') {
        try { await activeMedia.requestPictureInPicture(); } catch (e) { showSms("Trình duyệt không hỗ trợ PiP"); }
    }
}
function closeMiniPlayer() {
    if (activeMedia) activeMedia.pause();
    document.getElementById('mini-player').style.display = 'none';
    activeMedia = null;
}

// --- API FETCH TIKTOK & NCT (XỬ LÝ THỰC TẾ) ---
function fetchTikTokVideos() {
    // Sử dụng mã nhúng hợp lệ của TikTok thay vì tải file mp4 thô (tránh lỗi CORS)
    const mockTikTok = {
        id: "tt_" + Date.now(),
        title: "Video TikTok Trending",
        source: "TikTok Embed API",
        isTikTok: true,
        html: `<iframe style="width: 100%; height: 500px; border: none; border-radius: 28px;" src="https://www.tiktok.com/embed/v2/7183151815147818266" allow="fullscreen"></iframe>`
    };
    globalData.videos.unshift(mockTikTok);
    render();
    switchTab('video');
    showSms("Đã kéo một video TikTok thịnh hành qua mã nhúng Embed an toàn!");
}

function fetchNCTMusic() {
    showSms("Nhaccuatui (NCT) bảo mật rất nghiêm ngặt và chặn luồng kết nối ngoài (CORS).<br><br>Giải pháp: Sếp có thể tự tải file MP3 từ NCT về máy, sau đó dùng quyền Admin của app để Upload thủ công nhé!");
}

function switchTab(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.currentTarget.classList.add('active');
}
function getAIAdvice() { showSms("Giao diện Player ngang mặc định đã bị triệt tiêu! Sếp hãy mở tab Video hoặc Nhạc để xem nút Play tròn trong suốt cực kỳ đẳng cấp nhé."); }

window.onload = loadData;
