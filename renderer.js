const { ipcRenderer } = require('electron');

// Video element and controls
const video = document.getElementById('video');
const placeholder = document.getElementById('placeholder');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');

// Buttons
const openBtn = document.getElementById('openBtn');
const playPauseBtn = document.getElementById('playPauseBtn');
const stopBtn = document.getElementById('stopBtn');
const back10Btn = document.getElementById('back10Btn');
const back30Btn = document.getElementById('back30Btn');
const forward10Btn = document.getElementById('forward10Btn');
const forward30Btn = document.getElementById('forward30Btn');

// Speed controls
const speedSlider = document.getElementById('speedSlider');
const speedDisplay = document.getElementById('speedDisplay');
const speedUp = document.getElementById('speedUp');
const speedDown = document.getElementById('speedDown');
const speedPresets = document.querySelectorAll('.speed-preset');

// Icons
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');

// State
let currentPlaybackRate = 1.0;

// Format time (seconds to MM:SS)
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Update progress bar
function updateProgress() {
    const percent = (video.currentTime / video.duration) * 100;
    progressFill.style.width = `${percent}%`;
    currentTimeEl.textContent = formatTime(video.currentTime);
}

// Set video speed
function setSpeed(speed) {
    currentPlaybackRate = parseFloat(speed);
    video.playbackRate = currentPlaybackRate;
    speedSlider.value = currentPlaybackRate;
    speedDisplay.textContent = `${currentPlaybackRate.toFixed(1)}x`;

    // Update preset buttons
    speedPresets.forEach(btn => {
        btn.classList.toggle('active', parseFloat(btn.dataset.speed) === currentPlaybackRate);
    });
}

// Load and play video
async function loadVideo(filePath) {
    video.src = filePath;
    placeholder.classList.add('hidden');
    playPauseBtn.disabled = false;
    stopBtn.disabled = false;
    back10Btn.disabled = false;
    back30Btn.disabled = false;
    forward10Btn.disabled = false;
    forward30Btn.disabled = false;

    video.play().then(() => {
        updatePlayPauseIcon(true);
    }).catch(err => {
        console.error('Error playing video:', err);
    });
}

// Update play/pause icon
function updatePlayPauseIcon(isPlaying) {
    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

// Event Listeners

// Open file
openBtn.addEventListener('click', async () => {
    const filePath = await ipcRenderer.invoke('select-file');
    if (filePath) {
        loadVideo(filePath);
    }
});

// Play/Pause
playPauseBtn.addEventListener('click', () => {
    if (video.paused) {
        video.play();
        updatePlayPauseIcon(true);
    } else {
        video.pause();
        updatePlayPauseIcon(false);
    }
});

// Stop
stopBtn.addEventListener('click', () => {
    video.pause();
    video.currentTime = 0;
    updatePlayPauseIcon(false);
});

// Seek controls
back10Btn.addEventListener('click', () => {
    video.currentTime = Math.max(0, video.currentTime - 10);
});

back30Btn.addEventListener('click', () => {
    video.currentTime = Math.max(0, video.currentTime - 30);
});

forward10Btn.addEventListener('click', () => {
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
});

forward30Btn.addEventListener('click', () => {
    video.currentTime = Math.min(video.duration, video.currentTime + 30);
});

// Progress bar click
progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
});

// Speed controls
speedSlider.addEventListener('input', (e) => {
    setSpeed(e.target.value);
});

speedUp.addEventListener('click', () => {
    const newSpeed = Math.min(3, currentPlaybackRate + 0.1);
    setSpeed(newSpeed);
});

speedDown.addEventListener('click', () => {
    const newSpeed = Math.max(0.5, currentPlaybackRate - 0.1);
    setSpeed(newSpeed);
});

// Speed presets
speedPresets.forEach(btn => {
    btn.addEventListener('click', () => {
        setSpeed(btn.dataset.speed);
    });
});

// Video events
video.addEventListener('timeupdate', updateProgress);

video.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(video.duration);
});

video.addEventListener('ended', () => {
    updatePlayPauseIcon(false);
});

video.addEventListener('play', () => {
    updatePlayPauseIcon(true);
});

video.addEventListener('pause', () => {
    updatePlayPauseIcon(false);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Don't trigger if typing in an input
    if (e.target.tagName === 'INPUT') return;

    switch(e.key.toLowerCase()) {
        case ' ':
            e.preventDefault();
            if (!playPauseBtn.disabled) {
                playPauseBtn.click();
            }
            break;
        case 'arrowleft':
            e.preventDefault();
            if (!back10Btn.disabled) {
                back10Btn.click();
            }
            break;
        case 'arrowright':
            e.preventDefault();
            if (!forward10Btn.disabled) {
                forward10Btn.click();
            }
            break;
        case 'arrowdown':
            e.preventDefault();
            if (!back30Btn.disabled) {
                back30Btn.click();
            }
            break;
        case 'arrowup':
            e.preventDefault();
            if (!forward30Btn.disabled) {
                forward30Btn.click();
            }
            break;
        case 's':
            e.preventDefault();
            speedDown.click();
            break;
        case 'd':
            e.preventDefault();
            speedUp.click();
            break;
        case 'r':
            e.preventDefault();
            setSpeed(1);
            break;
        case 'o':
            e.preventDefault();
            openBtn.click();
            break;
    }
});
