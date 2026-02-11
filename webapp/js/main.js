document.addEventListener('DOMContentLoaded', function() {
    // Initialize State
    state.currentScenes = [...playData.scenes];

    // 1. Render UI Elements
    generateDynamicTags();
    renderCharacters();

    // 2. Attach Global Listeners
    attachEventListeners();

    // 3. Initialize Visuals
    updateAllDimensions();
    displayAllScenes();

    // 4. Initialize Controls
    initializeVideoControls();
    initializeKeyboardShortcuts();
});