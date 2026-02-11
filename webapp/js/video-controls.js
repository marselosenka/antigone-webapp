/**
 * SETTING UP THE PLAYER
 * This function finds all the video UI elements (buttons, sliders, etc.)
 * and tells them how to react when the user interacts with them.
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

    // Helper: Swaps between Play and Pause states
    function togglePlay() {
        if (videoElement.paused) videoElement.play();
        else videoElement.pause();
    }

    // Helper: Updates the icons (Play/Pause) to match what the video is doing
    function updatePlayState() {
        if (videoElement.paused) {
            playIcon.textContent = '▶';
            overlayIcon.textContent = '▶';
            videoWrapper.classList.remove('playing');
            videoWrapper.classList.add('paused');
        } else {
            playIcon.textContent = '⏸';
            overlayIcon.textContent = '⏸';
            videoWrapper.classList.add('playing');
            videoWrapper.classList.remove('paused');
        }
    }

    // Play/Pause button click
    playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
    });

    videoWrapper.addEventListener('click', togglePlay);
    videoElement.addEventListener('play', updatePlayState);
    videoElement.addEventListener('pause', updatePlayState);

    // SYNC TIMELINE: Moves the red playhead as the video plays
    videoElement.addEventListener('timeupdate', () => {
        const percent = (videoElement.currentTime / 4939) * 100;
        document.getElementById('playhead').style.left = percent + '%';
        document.getElementById('current-time').textContent = formatTime(videoElement.currentTime);
        progressBar.value = videoElement.currentTime;
    });

    progressBar.addEventListener('input', (e) => {
        videoElement.currentTime = parseFloat(e.target.value);
    });

    // Audio controls
    muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        videoElement.muted = !videoElement.muted;
        muteBtn.textContent = videoElement.muted ? '🔇' : '🔊';
    });

    volumeControl.addEventListener('input', (e) => {
        e.stopPropagation();
        videoElement.volume = e.target.value / 100;
    });
    volumeControl.addEventListener('click', (e) => e.stopPropagation());

    // Fullscreen toggle
    fullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (videoElement.requestFullscreen) videoElement.requestFullscreen();
        else if (videoElement.webkitRequestFullscreen) videoElement.webkitRequestFullscreen();
    });

    updatePlayState();
}

/**
 * JUMP TO SCENE
 * When a user clicks a scene tag, this moves the video to the specific
 * start time and updates the script text.
 */
function handleSceneTagClick(sceneId) {
    const scene = playData.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const videoElement = document.getElementById('video-element');
    videoElement.currentTime = scene.start;
    videoElement.play();
    updateTextPanels(scene.text);
    highlightRelatedItems(scene);
}

/**
 * CLEANUP
 * Removes all current colored markers from the timeline track.
 */
function clearTimeline() {
    const markers = document.querySelectorAll('.scene-marker');
    markers.forEach(marker => marker.remove());
}

/**
 * CHARACTER-SPECIFIC TIMELINE
 * Draws the markers on the timeline for scenes where a
 * specific character is present.
 */
function displayCharacterTimeline(character) {
    clearTimeline();
    const totalDuration = 4939;
    const charData = playData.characters.find(c => c.id === character);
    const characterColor = charData ? charData.color : '#66bb6a';

    state.currentScenes.forEach(scene => {
        const marker = document.createElement('div');
        marker.className = 'scene-marker';

        // Calculate position and width as a percentage of total time
        const startPercent = (scene.start / totalDuration) * 100;
        const widthPercent = ((scene.end - scene.start) / totalDuration) * 100;

        // Colors the marker to match the character's theme
        marker.style.left = startPercent + '%';
        marker.style.width = widthPercent + '%';
        marker.style.background = `${characterColor}66`;
        marker.style.borderLeft = `1px solid ${characterColor}`;
        marker.style.borderRight = `1px solid ${characterColor}`;

        const label = document.createElement('div');
        label.className = 'scene-marker-label';
        label.textContent = scene.name;
        label.style.color = '#fff';
        marker.appendChild(label);

        // Clicking a marker jumps the video to that moment
        marker.addEventListener('click', function() {
            const videoElement = document.getElementById('video-element');
            videoElement.currentTime = scene.start;
            videoElement.play();
            updateTextPanels(scene.text);
        });

        document.getElementById('timeline-track').appendChild(marker);
    });
}

/**
 * GLOBAL TIMELINE
 * Displays all scenes on the timeline, usually shown when no character
 * filter is active.
 */
function displayAllScenes() {
    clearTimeline();
    const totalDuration = 4939;

    playData.scenes.forEach(scene => {
        const marker = document.createElement('div');
        marker.className = 'scene-marker';

        const startPercent = (scene.start / totalDuration) * 100;
        const widthPercent = ((scene.end - scene.start) / totalDuration) * 100;

        marker.style.left = startPercent + '%';
        marker.style.width = widthPercent + '%';

        const label = document.createElement('div');
        label.className = 'scene-marker-label';
        label.textContent = scene.name;
        marker.appendChild(label);

        marker.addEventListener('click', function() {
            const videoElement = document.getElementById('video-element');
            videoElement.currentTime = scene.start;
            videoElement.play();
            updateTextPanels(scene.text);
            highlightRelatedItems(scene);
        });

        document.getElementById('timeline-track').appendChild(marker);
    });
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
 * This handles the Space bar, Arrow keys, and number shortcuts.
 */
function initializeKeyboardShortcuts() {
    const helpButton = document.getElementById('help-button');
    const helpDialog = document.getElementById('keyboard-help');

    helpButton.addEventListener('click', () => helpDialog.classList.toggle('show'));

    // Close help window if user clicks elsewhere
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