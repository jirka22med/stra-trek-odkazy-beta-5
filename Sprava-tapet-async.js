// Sprava-tapet.js - ASYNC-SAFE MODE v2.3
// 🖖 Více admirál Jiřík - Optimalizováno pro async loading
// ⚡ Funguje s defer i async!

(function() {
    'use strict';

    // ========================================
    // KONFIGURACE
    // ========================================
    const CONFIG = {
        debug: true,
        prefix: 'melnicka_tapeta_',
        containerSelector: '.background-image-container img',
        
        tapety: {
            desktop: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/animal-nature-feather-multi-colored-close-up-blue-beak-generative-ai.jpg?ver=0',
            mobile: 'https://img42.rajce.idnes.cz/d4202/19/19651/19651587_25f4050a3274b2ce2c6af3b5fb5b76b1/images/staensoubor1.jpg?ver=0'
        },
        
        preloadImages: true,
        enableGPUAcceleration: true,
        disableBlurOnMobile: true,
        
        // NOVÉ: Max počet pokusů najít DOM element
        maxRetries: 10,
        retryDelay: 50 // ms
    };

    // ========================================
    // UTILITY FUNKCE
    // ========================================

    function log(message, type = 'info') {
        if (!CONFIG.debug) return;
        const emoji = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : type === 'success' ? '✅' : '🖖';
        console.log(`${emoji} [Mělnická Tapeta v2.3] ${message}`);
    }

    function saveToStorage(key, value) {
        try {
            localStorage.setItem(CONFIG.prefix + key, JSON.stringify(value));
        } catch (e) {
            log(`Chyba ukládání: ${e.message}`, 'error');
        }
    }

    function loadFromStorage(key) {
        try {
            const value = localStorage.getItem(CONFIG.prefix + key);
            return value ? JSON.parse(value) : null;
        } catch (e) {
            return null;
        }
    }

    // ========================================
    // ASYNC-SAFE: ČEKÁNÍ NA DOM ELEMENT
    // ========================================
    function waitForElement(selector, maxAttempts = CONFIG.maxRetries) {
        return new Promise((resolve, reject) => {
            let attempts = 0;

            function check() {
                attempts++;
                const element = document.querySelector(selector);

                if (element) {
                    log(`Element nalezen po ${attempts} pokusech`, 'success');
                    resolve(element);
                } else if (attempts >= maxAttempts) {
                    log(`Element nenalezen po ${maxAttempts} pokusech!`, 'error');
                    reject(new Error(`Element ${selector} not found`));
                } else {
                    setTimeout(check, CONFIG.retryDelay);
                }
            }

            check();
        });
    }

    // ========================================
    // DETEKCE ZAŘÍZENÍ
    // ========================================
    function detectDevice() {
        const width = window.screen.width;
        const height = window.screen.height;
        const ua = navigator.userAgent.toLowerCase();
        const pixelRatio = window.devicePixelRatio || 1;
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        const device = {
            isInfinix: (
                width <= 420 && 
                height >= 800 && 
                hasTouch &&
                (ua.includes('infinix') || ua.includes('android'))
            ),
            isMobile: width <= 768 || hasTouch,
            isTablet: width > 768 && width <= 1024 && hasTouch,
            isDesktop: width > 1024 && !hasTouch,
            isLargeMonitor: width > 1600,
            orientation: window.matchMedia("(orientation: landscape)").matches ? 'landscape' : 'portrait',
            screenWidth: width,
            screenHeight: height,
            pixelRatio: pixelRatio,
            hasTouch: hasTouch,
            userAgent: ua,
            isAndroid: ua.includes('android'),
            androidVersion: ua.match(/android (\d+)/i) ? parseInt(ua.match(/android (\d+)/i)[1]) : null,
            isHighRefreshRate: window.screen.availHeight > 2000 || pixelRatio >= 2.5
        };

        log(`Zařízení: ${device.isInfinix ? 'Infinix Note 30' : device.isMobile ? 'Mobile' : 'Desktop'}`, 'success');
        return device;
    }

    // ========================================
    // GPU OPTIMALIZACE
    // ========================================
    function optimizeGPULayers(device) {
        if (!CONFIG.enableGPUAcceleration) return;

        try {
            const bgContainer = document.querySelector('.background-image-container');
            const bgImage = document.querySelector(CONFIG.containerSelector);
            
            if (device.isMobile || device.isInfinix) {
                log('Mobil - GPU pro OBSAH', 'info');
                
                if (bgContainer) {
                    bgContainer.style.transform = 'none';
                    bgContainer.style.willChange = 'auto';
                }
                
                if (bgImage) {
                    bgImage.style.transform = 'none';
                    bgImage.style.willChange = 'auto';
                }
                
                const scrollContainers = document.querySelectorAll('main, .content-wrapper, body');
                scrollContainers.forEach(container => {
                    if (container) {
                        container.style.transform = 'translateZ(0)';
                        container.style.backfaceVisibility = 'hidden';
                    }
                });
                
                log('GPU → scroll obsah', 'success');
            } else {
                if (bgContainer) {
                    bgContainer.style.transform = 'translate3d(0, 0, 0)';
                    bgContainer.style.backfaceVisibility = 'hidden';
                }
                log('GPU → desktop mode', 'success');
            }
        } catch (e) {
            log(`GPU chyba: ${e.message}`, 'warn');
        }
    }

    // ========================================
    // VYPNUTÍ BLUR
    // ========================================
    function disableBlurOnMobile(device) {
        if (!CONFIG.disableBlurOnMobile || (!device.isMobile && !device.isInfinix)) return;
        
        log('Vypínám blur...', 'info');
        
        const selectors = ['.card', '.music-player', '.playlist-item', '[class*="glass"]', '[class*="panel"]', '.container', 'header', 'nav'];
        let count = 0;
        
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                const style = window.getComputedStyle(el);
                if (style.backdropFilter && style.backdropFilter !== 'none') {
                    el.style.backdropFilter = 'none';
                    el.style.webkitBackdropFilter = 'none';
                    
                    const bg = style.backgroundColor;
                    if (bg.includes('rgba')) {
                        const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
                        if (match) {
                            const [, r, g, b, a] = match;
                            el.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${Math.max(parseFloat(a || 1), 0.85)})`;
                        }
                    }
                    count++;
                }
            });
        });
        
        if (count > 0) log(`Blur vypnut (${count} elementů)`, 'success');
    }

    // ========================================
    // PRELOAD
    // ========================================
    function preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                log(`Načteno: ${url.substring(0, 40)}...`, 'success');
                resolve(url);
            };
            img.onerror = () => reject(new Error(`Failed: ${url}`));
            img.src = url;
        });
    }

    // ========================================
    // NASTAVENÍ TAPETY
    // ========================================
    async function setTapeta(forceRefresh = false) {
        log('Nastavuji tapetu...', 'info');

        const device = detectDevice();
        saveToStorage('device_info', device);

        let tapetyUrl = (device.isInfinix || (device.isMobile && device.screenWidth <= 420)) 
            ? CONFIG.tapety.mobile 
            : CONFIG.tapety.desktop;

        log(`Vybrána: ${device.isMobile ? 'MOBILE' : 'DESKTOP'}`, 'info');

        const cachedUrl = loadFromStorage('current_url');
        const cachedTime = loadFromStorage('last_set_timestamp');
        const cacheAge = cachedTime ? (Date.now() - cachedTime) / 60000 : Infinity;

        if (!forceRefresh && cachedUrl === tapetyUrl && cacheAge < 60) {
            log(`Cache OK (${Math.round(cacheAge)} min)`, 'info');
            await applyTapeta(cachedUrl, device);
            return;
        }

        if (CONFIG.preloadImages) {
            try {
                await preloadImage(tapetyUrl);
            } catch (error) {
                log(`Preload failed, zkouším alt...`, 'warn');
                const alt = tapetyUrl === CONFIG.tapety.desktop ? CONFIG.tapety.mobile : CONFIG.tapety.desktop;
                try {
                    await preloadImage(alt);
                    tapetyUrl = alt;
                } catch {
                    const lastCached = loadFromStorage('current_url');
                    if (lastCached) {
                        tapetyUrl = lastCached;
                        log('Použita cache', 'warn');
                    } else {
                        log('ŽÁDNÁ TAPETA!', 'error');
                        return;
                    }
                }
            }
        }

        await applyTapeta(tapetyUrl, device);
        saveToStorage('current_url', tapetyUrl);
        saveToStorage('last_set_timestamp', Date.now());
    }

    // ========================================
    // APLIKACE TAPETY (ASYNC-SAFE)
    // ========================================
    async function applyTapeta(url, device) {
        try {
            // KLÍČOVÁ ZMĚNA: Počkej na element!
            const bgImage = await waitForElement(CONFIG.containerSelector);
            
            bgImage.src = url;
            bgImage.alt = 'Mělnická tapeta';

            optimizeGPULayers(device);
            disableBlurOnMobile(device);

            log('Tapeta nastavena ✓', 'success');
        } catch (error) {
            log(`Aplikace tapety selhala: ${error.message}`, 'error');
        }
    }

    // ========================================
    // OBNOVENÍ
    // ========================================
    async function restoreTapeta() {
        const cached = loadFromStorage('current_url');
        const device = detectDevice();

        if (cached) {
            log('Obnovuji cache...', 'info');
            await applyTapeta(cached, device);
        } else {
            await setTapeta();
        }
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================
    function setupEventListeners() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => setTapeta(true), 100);
        });

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => setTapeta(true), 500);
        });

        log('Listeners OK', 'success');
    }

    // ========================================
    // INICIALIZACE (ASYNC-SAFE!)
    // ========================================
    async function init() {
        const startTime = performance.now();
        
        log('╔═══════════════════════════════════════╗', 'info');
        log('  TAPETA v2.3 - ASYNC-SAFE MODE         ', 'info');
        log('╚═══════════════════════════════════════╝', 'info');
        
        log(`DOM state: ${document.readyState}`, 'info');
        log(`Script typ: ${document.currentScript?.async ? 'ASYNC' : 'DEFER/SYNC'}`, 'info');

        try {
            // Počkej na background container
            await waitForElement(CONFIG.containerSelector);
            
            setupEventListeners();
            await restoreTapeta();
            
            const loadTime = Math.round(performance.now() - startTime);
            log(`Init OK (${loadTime}ms)`, 'success');
            
        } catch (error) {
            log(`Init FAILED: ${error.message}`, 'error');
        }
    }

    // ========================================
    // VEŘEJNÉ API
    // ========================================
    window.MelnickaTapeta = {
        refresh: () => setTapeta(true),
        getDeviceInfo: () => loadFromStorage('device_info'),
        getCurrentUrl: () => loadFromStorage('current_url'),
        clearCache: () => {
            localStorage.removeItem(CONFIG.prefix + 'current_url');
            localStorage.removeItem(CONFIG.prefix + 'last_set_timestamp');
            localStorage.removeItem(CONFIG.prefix + 'device_info');
            log('Cache cleared', 'success');
        },
        toggleGPU: (enable) => {
            CONFIG.enableGPUAcceleration = enable;
            setTapeta(true);
        },
        toggleBlur: (enable) => {
            CONFIG.disableBlurOnMobile = !enable;
            enable ? location.reload() : disableBlurOnMobile(detectDevice());
        },
        setCustomTapeta: async (url) => {
            await applyTapeta(url, detectDevice());
            saveToStorage('current_url', url);
        },
        version: '2.3 ASYNC-SAFE',
        debug: {
            testLoadTiming: () => {
                console.log('Script load type:', document.currentScript?.async ? 'async' : 'defer/sync');
                console.log('DOM state:', document.readyState);
                console.log('Element exists:', !!document.querySelector(CONFIG.containerSelector));
            },
            measureFPS: () => {
                let frames = 0, last = performance.now(), running = true;
                function count() {
                    if (!running) return;
                    frames++;
                    const now = performance.now();
                    if (now >= last + 1000) {
                        log(`FPS: ${frames}${frames < 60 ? ' ⚠️' : ' ✓'}`, frames < 60 ? 'warn' : 'success');
                        frames = 0;
                        last = now;
                    }
                    requestAnimationFrame(count);
                }
                requestAnimationFrame(count);
                setTimeout(() => { running = false; }, 10000);
            },
            getReport: () => {
                const device = detectDevice();
                const memory = performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB'
                } : 'N/A';
                
                console.group('📊 Performance Report');
                console.log('Device:', device.isInfinix ? 'Infinix Note 30' : device.isMobile ? 'Mobile' : 'Desktop');
                console.log('Screen:', `${device.screenWidth}x${device.screenHeight}`);
                console.log('Memory:', memory);
                console.log('Script type:', document.currentScript?.async ? 'async' : 'defer');
                console.groupEnd();
            }
        }
    };

    // ========================================
    // SMART AUTO-START
    // ========================================
    if (document.readyState === 'loading') {
        // Async script spuštěný před DOMContentLoaded
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // Defer nebo pozdní async
        init();
    }

})();