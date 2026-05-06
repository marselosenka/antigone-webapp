/**
 * SETTING UP THE PLAYER
 * Initializes video controls. Timeline-related behavior has been removed.
 */
function initializeVideoControls() {
    const videoElement = document.getElementById('video-element');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const progressBar = document.getElementById('video-progress');
    const muteBtn = document.getElementById('mute-btn');
    const volumeControl = document.getElementById('volume-control');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const videoWrapper = document.getElementById('video-player');
    const overlayIcon = document.querySelector('.video-overlay-icon');

    videoElement.style.display = 'block';

    videoElement.addEventListener('loadedmetadata', () => {
        document.getElementById('duration').textContent = formatTime(videoElement.duration);
        progressBar.max = videoElement.duration;
    });

    function togglePlay() {
        if (videoElement.paused) videoElement.play();
        else videoElement.pause();
    }

    function updatePlayState() {
        if (videoElement.paused) {
            playIcon.textContent = '?';
            if (overlayIcon) overlayIcon.textContent = '?';
            videoWrapper.classList.remove('playing');
            videoWrapper.classList.add('paused');
        } else {
            playIcon.textContent = '?';
            if (overlayIcon) overlayIcon.textContent = '?';
            videoWrapper.classList.add('playing');
            videoWrapper.classList.remove('paused');
        }
    }

    playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
    });

    videoWrapper.addEventListener('click', togglePlay);
    videoElement.addEventListener('play', updatePlayState);
    videoElement.addEventListener('pause', updatePlayState);

    videoElement.addEventListener('timeupdate', () => {
        document.getElementById('current-time').textContent = formatTime(videoElement.currentTime);
        progressBar.value = videoElement.currentTime;
    });

    progressBar.addEventListener('input', (e) => {
        videoElement.currentTime = parseFloat(e.target.value);
    });

    muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        videoElement.muted = !videoElement.muted;
        muteBtn.textContent = videoElement.muted ? '??' : '??';
    });

    volumeControl.addEventListener('input', (e) => {
        e.stopPropagation();
        videoElement.volume = e.target.value / 100;
    });
    volumeControl.addEventListener('click', (e) => e.stopPropagation());

    fullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (videoElement.requestFullscreen) videoElement.requestFullscreen();
        else if (videoElement.webkitRequestFullscreen) videoElement.webkitRequestFullscreen();
    });

    updatePlayState();
}

/**
 * When a user clicks a scene tag, update text and semantic highlights only.
 */
function handleSceneTagClick(sceneId) {
    const scene = playData.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    updateTextPanels(scene.text);
    highlightRelatedItems(scene);
}

/**
 * Timeline visualization removed.
 */
function clearTimeline() {
    return;
}

/**
 * Timeline visualization removed.
 */
function displayCharacterTimeline(character) {
    return;
}

/**
 * Timeline visualization removed.
 */
function displayAllScenes() {
    return;
}

/**
 * VISUAL SYNC
 * Takes all the metadata for a scene and makes the corresponding
 * tags in the sidebars "pulse" or highlight.
 */
function highlightRelatedItems(scene) {
    scene.emotions.forEach(emotion => highlightTag(emotion));
    scene.themes.forEach(theme => highlightTag(theme));
    scene.events.forEach(event => highlightTag(event));
}

/**
 * TAG HIGHLIGHTING
 * Temporarily adds a CSS class to a tag to grab the user's attention.
 */
function highlightTag(value) {
    const tag = document.querySelector(`.tag[data-value="${value}"]`);
    if (tag) {
        tag.classList.add('highlight');
        setTimeout(() => tag.classList.remove('highlight'), 1500);
    }
}

/**
 * TIME FORMATTER
 * Converts raw seconds (e.g., 125) into readable strings (e.g., "02:05").
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}


/**
 * USER TOOLS
 * Listens for key presses so the user can control the play without a mouse.
 */
function initializeKeyboardShortcuts() {
    const helpButton = document.getElementById('help-button');
    const helpDialog = document.getElementById('keyboard-help');

    helpButton.addEventListener('click', () => helpDialog.classList.toggle('show'));

    document.addEventListener('click', (e) => {
        if (!helpDialog.contains(e.target) && !helpButton.contains(e.target)) {
            helpDialog.classList.remove('show');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        const videoElement = document.getElementById('video-element');

        switch(e.key) {
            case ' ':
                e.preventDefault();
                if (videoElement.paused) videoElement.play();
                else videoElement.pause();
                break;
            case 'ArrowRight':
                e.preventDefault();
                videoElement.currentTime = Math.min(videoElement.currentTime + 5, videoElement.duration);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                videoElement.currentTime = Math.max(videoElement.currentTime - 5, 0);
                break;
            case '1': case '2': case '3': case '4': case '5': case '6':
                e.preventDefault();
                const bubbles = document.querySelectorAll('.character-bubble');
                if (bubbles[parseInt(e.key) - 1]) bubbles[parseInt(e.key) - 1].click();
                break;
            case 'f': case 'F':
                e.preventDefault();
                document.getElementById('fullscreen-btn').click();
                break;
            case 'm': case 'M':
                e.preventDefault();
                document.getElementById('mute-btn').click();
                break;
            case '?':
                e.preventDefault();
                helpDialog.classList.toggle('show');
                break;
        }
    });
}

