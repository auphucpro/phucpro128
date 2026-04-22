// ==========================================
// HỆ THỐNG MẬT THẤT (SECRET KNOCK ADMIN)
// ==========================================
let tapCount = 0;
let tapTimer;
const ADMIN_PASSWORD = "2411"; 

function secretKnock() {
    tapCount++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => { tapCount = 0; }, 2000);
    if (tapCount >= 5) {
        document.getElementById('admin-login-modal').classList.add('active');
        tapCount = 0; 
    }
}

function closeAdminLogin() {
    document.getElementById('admin-login-modal').classList.remove('active');
    document.getElementById('admin-pin').value = '';
}

function verifyAdmin() {
    const pin = document.getElementById('admin-pin').value;
    if (pin === ADMIN_PASSWORD) {
        closeAdminLogin();
        document.getElementById('admin-panel-modal').classList.add('active');
    } else {
        alert("Sai mã PIN! Kẻ xâm nhập bị từ chối.");
    }
}

function closeAdminPanel() {
    document.getElementById('admin-panel-modal').classList.remove('active');
}

// ==========================================
// HỆ THỐNG LƯU DỮ LIỆU & RENDER UI
// ==========================================
let globalData = { videos: [], music: [] };

async function loadMediaData() {
    try {
        const response = await fetch('links.json');
        const defaultData = await response.json();
        
        const savedCustomData = localStorage.getItem('my_custom_media');
        const customData = savedCustomData ? JSON.parse(savedCustomData) : { videos: [], music: [] };

        globalData.videos = [...defaultData.videos, ...customData.videos];
        globalData.music = [...defaultData.music, ...customData.music];

        renderUI();
        document.getElementById('weather-status').innerHTML = "🟢 Đồng bộ Dữ liệu Thành Công!";
    } catch (error) {
        document.getElementById('weather-status').innerHTML = "🟡 Đang dùng dữ liệu Local (Offline)";
        const savedCustomData = localStorage.getItem('my_custom_media');
        if(savedCustomData) {
            globalData = JSON.parse(savedCustomData);
            renderUI();
        }
    }
}

function renderUI() {
    const videoContainer = document.getElementById('video-container');
    let videoHTML = '';
    globalData.videos.forEach(vid => {
        videoHTML += `
            <div class="media-card" id="card-${vid.id}">
                <video id="${vid.id}" controls poster="${vid.poster || 'https://via.placeholder.com/800x450/1e293b/38bdf8?text=My+Video'}">
                    <source src="${vid.url}" type="video/mp4">
                </video>
                <div class="media-info">
                    <h3>${vid.title}</h3>
                    <p>Nguồn: ${vid.source}</p>
                    <button class="audio-btn" onclick="toggleAudioOnly('${vid.id}')">🎧 Tắt hình, chỉ nghe tiếng</button>
                </div>
            </div>
        `;
    });
    videoContainer.innerHTML = videoHTML || "<p style='text-align:center; color:#94a3b8; padding: 20px;'>Chưa có Video nào</p>";

    const musicContainer = document.getElementById('music-container');
    let musicHTML = '';
    globalData.music.forEach(mus => {
        musicHTML += `
            <div class="media-card">
                <div class="music-art">🎵</div>
                <audio controls>
                    <source src="${mus.url}" type="audio/mpeg">
                </audio>
                <div class="media-info">
                    <h3>${mus.title}</h3>
                    <p>Ca sĩ: ${mus.artist || mus.source}</p>
                </div>
            </div>
        `;
    });
    musicContainer.innerHTML = musicHTML || "<p style='text-align:center; color:#94a3b8; padding: 20px;'>Chưa có bài Nhạc nào</p>";

    // SAU KHI RENDER XONG, ĐÍNH KÈM SỰ KIỆN CHO MINI PLAYER
    bindMediaEvents();
}

function saveCustomMedia() {
    const type = document.getElementById('media-type').value; 
    const title = document.getElementById('media-title').value.trim();
    const author = document.getElementById('media-author').value.trim();
    const url = document.getElementById('media-url').value.trim();

    if (!title || !url) return alert("Vui lòng nhập Tiêu đề và Link URL!");

    let customData = JSON.parse(localStorage.getItem('my_custom_media')) || { videos: [], music: [] };

    const newItem = {
        id: "custom_" + Date.now(), 
        title: title,
        source: author || "Admin Upload",
        artist: author || "Admin Upload",
        url: url,
        poster: "https://via.placeholder.com/800x450/1e293b/10b981?text=Admin+Added"
    };

    if (type === 'video') customData.videos.unshift(newItem); 
    if (type === 'music') customData.music.unshift(newItem);

    localStorage.setItem('my_custom_media', JSON.stringify(customData));
    closeAdminPanel();
    loadMediaData();
    alert("✅ Đã thêm thành công!");
}

// ==========================================
// TÍNH NĂNG MỚI: QUẢN LÝ TRÌNH PHÁT NỀN (MINI-PLAYER)
// ==========================================
let activeMedia = null;

function bindMediaEvents() {
    const allMediaElements = document.querySelectorAll('video, audio');
    
    allMediaElements.forEach(media => {
        // Khi một media bắt đầu phát
        media.addEventListener('play', function() {
            // Tự động tạm dừng tất cả các media khác đang phát
            allMediaElements.forEach(otherMedia => {
                if (otherMedia !== media && !otherMedia.paused) {
                    otherMedia.pause();
                }
            });

            activeMedia = media;
            showMiniPlayer(media);
        });

        // Khi media bị tạm dừng
        media.addEventListener('pause', function() {
            if (activeMedia === media) {
                updateMiniPlayerIcon();
            }
        });
    });
}

function showMiniPlayer(mediaElement) {
    document.getElementById('mini-player').style.display = 'flex';
    
    // Tìm thẻ Cha chứa bài nhạc/video để lấy tên bài
    const card = mediaElement.closest('.media-card');
    if (card) {
        document.getElementById('mini-title').innerText = card.querySelector('h3').innerText;
        document.getElementById('mini-artist').innerText = card.querySelector('p').innerText;
        document.getElementById('mini-icon').innerText = mediaElement.tagName === 'VIDEO' ? '🎬' : '🎵';
    }
    updateMiniPlayerIcon();
}

function updateMiniPlayerIcon() {
    const playPauseBtn = document.getElementById('mini-playpause');
    if (activeMedia && !activeMedia.paused) {
        playPauseBtn.innerText = '⏸️'; // Icon Tạm Dừng
    } else {
        playPauseBtn.innerText = '▶️'; // Icon Phát
    }
}

function toggleMiniPlayer() {
    if (activeMedia) {
        if (activeMedia.paused) activeMedia.play();
        else activeMedia.pause();
        updateMiniPlayerIcon();
    }
}

function closeMiniPlayer() {
    if (activeMedia) {
        activeMedia.pause();
    }
    document.getElementById('mini-player').style.display = 'none';
    activeMedia = null;
}


// ==========================================
// ĐỘNG CƠ CẬP NHẬT API ONLINE
// ==========================================
async function fetchTrendingMusic() {
    const output = document.getElementById('tool-output');
    output.style.display = 'block';
    output.innerHTML = "🔄 Đang quét mạng để tìm nhạc hot...";

    try {
        const response = await fetch('https://itunes.apple.com/search?term=remix&limit=5&media=music');
        const data = await response.json();
        let newMusic = [];
        data.results.forEach(song => {
            if(song.previewUrl) {
                newMusic.push({
                    id: "itunes_" + song.trackId,
                    title: song.trackName,
                    artist: song.artistName,
                    url: song.previewUrl,
                    source: "Apple Music API"
                });
            }
        });
        globalData.music = [...newMusic, ...globalData.music];
        renderUI(); // Render xong sẽ tự động bindMediaEvents lại!
        output.style.display = 'none';
        switchTab('music');
        alert("🎉 Đã kéo " + newMusic.length + " bản nhạc Trending mới vào App!");
    } catch (error) {
        output.innerHTML = "❌ Lỗi mạng: Không thể lấy nhạc lúc này.";
    }
}

async function fetchOnlineVideos() {
    const output = document.getElementById('tool-output');
    output.style.display = 'block';
    output.innerHTML = `<strong>🎬 Kế hoạch Video API:</strong><br>Cần API Key từ Pexels.com để kích hoạt tính năng này.`;
}

// ==========================================
// CÁC TÍNH NĂNG CƠ BẢN (Tab, Audio Switch, Tiện ích)
// ==========================================
function switchTab(tabId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

function toggleAudioOnly(videoId) {
    const videoElement = document.getElementById(videoId);
    const btn = event.currentTarget;
    if (videoElement.style.opacity === "0" || videoElement.style.opacity === "") {
        videoElement.style.opacity = "1";
        videoElement.style.height = "auto";
        btn.innerHTML = "🎧 Tắt hình, chỉ nghe tiếng";
        btn.style.background = "rgba(255, 255, 255, 0.1)";
        btn.style.color = "white";
    } else {
        videoElement.style.opacity = "0"; 
        videoElement.style.height = "40px"; 
        btn.innerHTML = "🎬 Bật lại hình ảnh";
        btn.style.background = "#38bdf8"; 
        btn.style.color = "#000";
    }
}

async function getRandomWallpaper() {
    const output = document.getElementById('tool-output');
    output.style.display = 'block';
    output.innerHTML = "Đang tải ảnh...";
    const imgUrl = `https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=500&q=80`;
    output.innerHTML = `<img src="${imgUrl}" style="width:100%; border-radius:16px;">`;
}

function getAIAdvice() {
    const output = document.getElementById('tool-output');
    output.style.display = 'block';
    output.innerHTML = "<strong>🤖 AI khuyên:</strong> Hãy mở 1 bản nhạc, sau đó chuyển sang tab Tiện ích để xem Mini-Player hoạt động nhé sếp!";
}

window.addEventListener('load', () => {
    loadMediaData(); 
});
