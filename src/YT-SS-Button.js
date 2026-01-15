// ==UserScript==
// @name            YouTube Screenshot Button
// @namespace       https://criskkky.carrd.co/
// @version         1.0.2
// @description     Adds a button to take a screenshot of the current video frame on YouTube.
// @description:es  Añade un botón para tomar una captura de pantalla del fotograma actual del vídeo en YouTube.
// @description:pt  Adiciona um botão para tirar uma captura de tela do fotograma atual do vídeo no YouTube.
// @description:fr  Ajoute un bouton pour prendre une capture d'écran de l'image vidéo actuelle sur YouTube.
// @description:it  Aggiunge un pulsante per scattare uno screenshot del fotogramma video corrente su YouTube.
// @description:uk  Додає кнопку для знімка поточного кадру відео на YouTube.
// @description:ru  Добавляет кнопку для снятия скриншота текущего кадра видео на YouTube.
// @description:ro  Adaugă un buton pentru a face un screenshot al cadrului video curent de pe YouTube.

// @author          https://criskkky.carrd.co/
// @supportURL      https://github.com/criskkky/YT-SS-Button/issues
// @icon            https://raw.githubusercontent.com/criskkky/YT-SS-Button/main/static/icon.svg
// @copyright       https://github.com/criskkky/

// @grant           GM_getValue
// @grant           GM_setValue
// @match           *://*.youtube.com/*
// ==/UserScript==

(function () {
    'use strict';

    const WINDOW_FULLSCREEN_STORE_KEY = 'yt_window_fullscreen_enabled';
    let windowFullscreenEnabled = typeof GM_getValue === 'function' ? !!GM_getValue(WINDOW_FULLSCREEN_STORE_KEY, false) : false;

    // Window fullscreen CSS styles
    function injectWindowFullscreenCSS() {
        if (document.getElementById('yt-window-fullscreen-styles')) return;

        const windowFullscreenCSS = document.createElement('style');
        windowFullscreenCSS.id = 'yt-window-fullscreen-styles';
        windowFullscreenCSS.textContent = `
            ytd-app[data-window-fullscreen="true"] {
                --ytd-app-fullscreen: true !important;
            }
            ytd-app[data-window-fullscreen="true"] ytd-watch-flexy {
                height: 100vh !important;
                max-height: 100vh !important;
                width: 100vw !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                z-index: 9999 !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            ytd-app[data-window-fullscreen="true"] #full-bleed-container {
                height: 100vh !important;
                max-height: 100vh !important;
                width: 100vw !important;
            }
            ytd-app[data-window-fullscreen="true"] #player,
            ytd-app[data-window-fullscreen="true"] ytd-player {
                height: 100vh !important;
                width: 100vw !important;
            }
            ytd-app[data-window-fullscreen="true"] #player video,
            ytd-app[data-window-fullscreen="true"] ytd-player video,
            ytd-app[data-window-fullscreen="true"] video {
                height: 100vh !important;
                max-height: 100vh !important;
                min-height: 100vh !important;
                width: 100vw !important;
                max-width: 100vw !important;
            }
            ytd-app[data-window-fullscreen="true"] #masthead-container,
            ytd-app[data-window-fullscreen="true"] ytd-masthead {
                display: none !important;
            }
            ytd-app[data-window-fullscreen="true"] ytd-secondary-results,
            ytd-app[data-window-fullscreen="true"] #secondary {
                display: none !important;
            }
            ytd-app[data-window-fullscreen="true"] #guide-content {
                display: none !important;
            }
            ytd-app[data-window-fullscreen="true"] ytd-app {
                overflow: hidden !important;
            }
            html[data-window-fullscreen="true"],
            body[data-window-fullscreen="true"] {
                overflow: hidden !important;
            }
        `;

        document.head.appendChild(windowFullscreenCSS);
    }

    function toggleWindowFullscreen() {
        const ytdApp = document.querySelector('ytd-app');
        if (!ytdApp) return;

        windowFullscreenEnabled = !windowFullscreenEnabled;

        if (windowFullscreenEnabled) {
            ytdApp.setAttribute('data-window-fullscreen', 'true');
            injectWindowFullscreenCSS();
        } else {
            ytdApp.removeAttribute('data-window-fullscreen');
        }

        // Persist state
        try {
            if (typeof GM_setValue === 'function') {
                GM_setValue(WINDOW_FULLSCREEN_STORE_KEY, windowFullscreenEnabled);
            }
        } catch (_) {}

        updateWindowFullscreenButton();

        // Trigger resize event
        window.dispatchEvent(new Event('resize'));
    }

    function updateWindowFullscreenButton() {
        const btn = document.querySelector('.ytp-window-fullscreen-button');
        if (btn) {
            btn.setAttribute('data-active', windowFullscreenEnabled ? 'true' : 'false');
            btn.setAttribute('title', windowFullscreenEnabled ? 'Exit fullscreen' : 'Enter fullscreen');
        }
    }

    function addPlayerButtons() {
        // Get the actual button container (right sub-container first, fallback to main)
        let buttonContainer = document.querySelector('.ytp-right-controls-right');
        if (!buttonContainer) {
            buttonContainer = document.querySelector('.ytp-right-controls');
        }

        if (!buttonContainer) {
            return;
        }

        // Add window fullscreen button first (leftmost)
        if (!document.querySelector('.ytp-window-fullscreen-button')) {
            const fullscreenButton = document.createElement('button');
            fullscreenButton.className = 'ytp-button ytp-window-fullscreen-button';
            fullscreenButton.setAttribute('title', windowFullscreenEnabled ? 'Exit fullscreen' : 'Enter fullscreen');
            fullscreenButton.setAttribute('data-active', windowFullscreenEnabled ? 'true' : 'false');
            fullscreenButton.style.position = 'relative';
            fullscreenButton.style.width = '44px';

            // Create SVG icon for window fullscreen (expand to corners icon)
            const fssvgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            fssvgElement.setAttribute('viewBox', '0 0 24 24');
            fssvgElement.setAttribute('width', '24');
            fssvgElement.setAttribute('height', '24');
            fssvgElement.setAttribute('fill', 'none');
            fssvgElement.setAttribute('stroke', '#ffffff');
            fssvgElement.setAttribute('stroke-width', '2');
            fssvgElement.setAttribute('stroke-linecap', 'round');
            fssvgElement.setAttribute('stroke-linejoin', 'round');
            fssvgElement.style.transition = 'filter 0.2s';

            // Window fullscreen expand corners icon
            const fspathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            fspathElement.setAttribute('d', 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3');
            fssvgElement.appendChild(fspathElement);
            fullscreenButton.appendChild(fssvgElement);

            fullscreenButton.addEventListener('mouseenter', function() {
                this.querySelector('svg').style.filter = 'brightness(1.2)';
            });
            fullscreenButton.addEventListener('mouseleave', function() {
                this.querySelector('svg').style.filter = 'brightness(1)';
            });

            buttonContainer.insertBefore(fullscreenButton, buttonContainer.firstChild);
        }

        // Add screenshot button right after fullscreen
        if (!document.querySelector('.ytp-screenshot-button')) {
            const screenshotButton = document.createElement('button');
            screenshotButton.className = 'ytp-button ytp-screenshot-button';
            screenshotButton.setAttribute('title', 'Take screenshot');
            screenshotButton.style.position = 'relative';
            screenshotButton.style.width = '44px';

            const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgElement.setAttribute('viewBox', '0 0 487 487');
            svgElement.setAttribute('width', '24');
            svgElement.setAttribute('height', '24');
            svgElement.setAttribute('fill', '#ffffff');

            const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathElement.setAttribute('d', 'M308.1,277.95c0,35.7-28.9,64.6-64.6,64.6s-64.6-28.9-64.6-64.6s28.9-64.6,64.6-64.6S308.1,242.25,308.1,277.95z M440.3,116.05c25.8,0,46.7,20.9,46.7,46.7v122.4v103.8c0,27.5-22.3,49.8-49.8,49.8H49.8c-27.5,0-49.8-22.3-49.8-49.8v-103.9 v-122.3l0,0c0-25.8,20.9-46.7,46.7-46.7h93.4l4.4-18.6c6.7-28.8,32.4-49.2,62-49.2h74.1c29.6,0,55.3,20.4,62,49.2l4.3,18.6H440.3z M97.4,183.45c0-12.9-10.5-23.4-23.4-23.4c-13,0-23.5,10.5-23.5,23.4s10.5,23.4,23.4,23.4C86.9,206.95,97.4,196.45,97.4,183.45z M358.7,277.95c0-63.6-51.6-115.2-115.2-115.2s-115.2,51.6-115.2,115.2s51.6,115.2,115.2,115.2S358.7,341.55,358.7,277.95z');
            svgElement.appendChild(pathElement);
            screenshotButton.appendChild(svgElement);

            const windowFullscreenBtn = document.querySelector('.ytp-window-fullscreen-button');
            if (windowFullscreenBtn && windowFullscreenBtn.nextSibling) {
                buttonContainer.insertBefore(screenshotButton, windowFullscreenBtn.nextSibling);
            } else {
                buttonContainer.insertBefore(screenshotButton, buttonContainer.firstChild);
            }
        }
    }

    function captureFrame(video) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const videoTitle = document.title.replace(/\s-\sYouTube$/, '').trim();
        const filename = `${videoTitle}.png`;

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = filename;
        link.click();
    }

    /* Not needed anymore, for now at least.
    function handleFullscreenChange() {
        const screenshotButton = document.querySelector('.ytp-screenshot-button');
        if (screenshotButton) {
            const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
            screenshotButton.style.bottom = isFullscreen ? '15px' : '12px';
        }
    }
    */

    function setupKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            // Backtick key (`) for window fullscreen toggle
            if (e.key === '`' && window.location.href.includes('watch?v=')) {
                e.preventDefault();
                toggleWindowFullscreen();
            }
        });
    }

    function restoreWindowFullscreenState() {
        if (windowFullscreenEnabled) {
            const ytdApp = document.querySelector('ytd-app');
            if (ytdApp) {
                ytdApp.setAttribute('data-window-fullscreen', 'true');
                injectWindowFullscreenCSS();
            }
        }
    }

    function initialize() {
        // Event delegation for button clicks
        document.addEventListener('click', function(e) {
            if (e.target.closest('.ytp-window-fullscreen-button')) {
                e.preventDefault();
                e.stopPropagation();
                toggleWindowFullscreen();
            } else if (e.target.closest('.ytp-screenshot-button')) {
                const video = document.querySelector('video');
                if (video) captureFrame(video);
            }
        }, true);

        // Watch for player controls being added to DOM
        const controlsObserver = new MutationObserver(() => {
            if (window.location.href.includes('watch?v=')) {
                addPlayerButtons();
            }
        });

        controlsObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false
        });

        document.addEventListener('yt-navigate-finish', () => {
            if (window.location.href.includes('watch?v=')) {
                setTimeout(() => {
                    addPlayerButtons();
                    restoreWindowFullscreenState();
                }, 100);
            }
        });

        // document.addEventListener('fullscreenchange', handleWindowFullscreenChange);

        // Initial setup
        if (window.location.href.includes('watch?v=')) {
            setTimeout(() => {
                addPlayerButtons();
                restoreFullscreenState();
            }, 500);
        }

        setupKeyboardShortcut();
    }

    initialize();
})();
