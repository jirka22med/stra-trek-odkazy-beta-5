// fullscreen-manager.js - FULLSCREEN MODE PRO INFINIX NOTE 30
// 🖖 Více admirál Jiřík - Fix pro pohybující se tapetu

(function() {
    'use strict';

    // ========================================
    // KONFIGURACE
    // ========================================
    const CONFIG = {
        debug: true,
        buttonId: 'fullscreen-button', // ID tlačítka v HTML
        storageKey: 'fullscreen_mode_active',
        autoEnterOnMobile: false // Automatický fullscreen na mobilu při načtení
    };

    // ========================================
    // UTILITY FUNKCE
    // ========================================

    function log(message, type = 'info') {
        if (!CONFIG.debug) return;
        const emoji = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : type === 'success' ? '✅' : '🎬';
        console.log(`${emoji} [Fullscreen Manager] ${message}`);
    }

    // ========================================
    // DETEKCE FULLSCREEN PODPORY
    // ========================================
    function isFullscreenSupported() {
        return !!(
            document.fullscreenEnabled ||
            document.webkitFullscreenEnabled ||
            document.mozFullScreenEnabled ||
            document.msFullscreenEnabled
        );
    }

    function isCurrentlyFullscreen() {
        return !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullScreenElement
        );
    }

    // ========================================
    // ENTER FULLSCREEN
    // ========================================
    async function enterFullscreen() {
        const elem = document.documentElement;

        try {
            if (elem.requestFullscreen) {
                await elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                await elem.webkitRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                await elem.mozRequestFullScreen();
            } else if (elem.msRequestFullscreen) {
                await elem.msRequestFullscreen();
            }

            log('Fullscreen aktivován!', 'success');
            localStorage.setItem(CONFIG.storageKey, 'true');
            updateButtonState(true);
            return true;
        } catch (error) {
            log(`Chyba při aktivaci fullscreen: ${error.message}`, 'error');
            return false;
        }
    }

    // ========================================
    // EXIT FULLSCREEN
    // ========================================
    async function exitFullscreen() {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                await document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                await document.msExitFullscreen();
            }

            log('Fullscreen deaktivován', 'info');
            localStorage.setItem(CONFIG.storageKey, 'false');
            updateButtonState(false);
            return true;
        } catch (error) {
            log(`Chyba při deaktivaci fullscreen: ${error.message}`, 'error');
            return false;
        }
    }

    // ========================================
    // TOGGLE FULLSCREEN
    // ========================================
    async function toggleFullscreen() {
        if (isCurrentlyFullscreen()) {
            return await exitFullscreen();
        } else {
            return await enterFullscreen();
        }
    }

    // ========================================
    // UPDATE BUTTON STATE
    // ========================================
    function updateButtonState(isFullscreen) {
        const button = document.getElementById(CONFIG.buttonId);
        if (!button) return;

        // Změň ikonu
        if (isFullscreen) {
            button.innerHTML = '⛶'; // Exit fullscreen ikona
            button.title = 'Opustit celoobrazovkový režim';
            button.setAttribute('aria-label', 'Opustit celoobrazovkový režim');
        } else {
            button.innerHTML = '⛶'; // Enter fullscreen ikona
            button.title = 'Celoobrazovkový režim';
            button.setAttribute('aria-label', 'Zapnout celoobrazovkový režim');
        }

        log(`Button stav aktualizován: ${isFullscreen ? 'Fullscreen ON' : 'Fullscreen OFF'}`, 'success');
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================
    function setupEventListeners() {
        const button = document.getElementById(CONFIG.buttonId);

        if (!button) {
            log('CHYBA: Tlačítko s ID "' + CONFIG.buttonId + '" nenalezeno!', 'error');
            log('Přidej do HTML: <button id="fullscreen-button">⛶</button>', 'warn');
            return false;
        }

        // Kliknutí na tlačítko
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            await toggleFullscreen();
        });

        // Listener pro změnu fullscreen stavu (ESC klávesa, F11, atd.)
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        log('Event listeners nastaveny ✓', 'success');
        return true;
    }

    function handleFullscreenChange() {
        const isFullscreen = isCurrentlyFullscreen();
        updateButtonState(isFullscreen);
        
        if (isFullscreen) {
            log('📺 Fullscreen AKTIVNÍ - adresní řádek skrytý!', 'success');
            // Refresh tapetu pro jistotu
            if (window.MelnickaTapeta) {
                setTimeout(() => {
                    window.MelnickaTapeta.refresh();
                }, 100);
            }
        } else {
            log('📱 Fullscreen VYPNUTÝ - normální zobrazení', 'info');
        }
    }

    // ========================================
    // AUTO-ENTER NA MOBILU (VOLITELNÉ)
    // ========================================
    function autoEnterFullscreenOnMobile() {
        if (!CONFIG.autoEnterOnMobile) return;

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const wasFullscreen = localStorage.getItem(CONFIG.storageKey) === 'true';

        if (isMobile && wasFullscreen) {
            log('📱 Mobil detekován - automatický fullscreen...', 'info');
            
            // Musí být vyvoláno uživatelskou akcí, takže zobrazíme tlačítko
            const button = document.getElementById(CONFIG.buttonId);
            if (button) {
                button.style.animation = 'pulse 2s infinite';
                log('💡 Klikni na tlačítko pro fullscreen!', 'warn');
            }
        }
    }

    // ========================================
    // INICIALIZACE
    // ========================================
    function init() {
        log('╔═══════════════════════════════════════╗', 'info');
        log('  FULLSCREEN MANAGER v1.0              ', 'info');
        log('  FIX PRO POHYBUJÍCÍ SE TAPETU         ', 'info');
        log('╚═══════════════════════════════════════╝', 'info');

        // Kontrola podpory
        if (!isFullscreenSupported()) {
            log('⚠️ VAROVÁNÍ: Fullscreen API není podporováno!', 'warn');
            log('Tento prohlížeč nepodporuje fullscreen režim.', 'warn');
            return;
        }

        log('✓ Fullscreen API podporováno', 'success');

        // Setup event listeners
        const success = setupEventListeners();
        if (!success) return;

        // Nastav počáteční stav tlačítka
        updateButtonState(isCurrentlyFullscreen());

        // Auto-enter na mobilu (volitelné)
        autoEnterFullscreenOnMobile();

        log('Inicializace dokončena!', 'success');
        log('╚═══════════════════════════════════════╝', 'info');
    }

    // ========================================
    // VEŘEJNÉ API
    // ========================================
    window.FullscreenManager = {
        enter: enterFullscreen,
        exit: exitFullscreen,
        toggle: toggleFullscreen,
        isActive: isCurrentlyFullscreen,
        isSupported: isFullscreenSupported,
        version: '1.0 - Tapeta Fix'
    };

    // ========================================
    // AUTO-START
    // ========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();