// Sprava-tapet.js - MOBILE PERFORMANCE MODE v2.3 OPTIMIZED
// 🖖 Více admirál Jiřík - INFINIX NOTE 30 OPTIMIZED + GPU Smart Mode
// ⚡ Optimalizace: Odstraněn zbytečný fallback

(function() {
    'use strict';

    // ========================================
    // KONFIGURACE
    // ========================================
    const CONFIG = {
        debug: true,
        prefix: 'melnicka_tapeta_',
        containerSelector: '.background-image-container img',
        
        // ZJEDNODUŠENO: Pouze 2 tapety
        tapety: {
            desktop: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/animal-nature-feather-multi-colored-close-up-blue-beak-generative-ai.jpg?ver=0',
            mobile: 'https://img42.rajce.idnes.cz/d4202/19/19651/19651587_25f4050a3274b2ce2c6af3b5fb5b76b1/images/staensoubor1.jpg?ver=0'
        },
        
        preloadImages: true,
        enableGPUAcceleration: true,
        disableBlurOnMobile: true
    };

    // ========================================
    // UTILITY FUNKCE
    // ========================================

    // Debug log
    function log(message, type = 'info') {
        if (!CONFIG.debug) return;
        const emoji = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : type === 'success' ? '✅' : '🖖';
        console.log(`${emoji} [Mělnická Tapeta v2.3] ${message}`);
    }

    // LocalStorage s unikátním prefixem
    function saveToStorage(key, value) {
        try {
            localStorage.setItem(CONFIG.prefix + key, JSON.stringify(value));
            log(`Uloženo do storage: ${key}`, 'success');
        } catch (e) {
            log(`Chyba ukládání do storage: ${e.message}`, 'error');
        }
    }

    function loadFromStorage(key) {
        try {
            const value = localStorage.getItem(CONFIG.prefix + key);
            return value ? JSON.parse(value) : null;
        } catch (e) {
            log(`Chyba načítání ze storage: ${e.message}`, 'error');
            return null;
        }
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
            // Infinix Note 30 detekce
            isInfinix: (
                width <= 420 && 
                height >= 800 && 
                hasTouch &&
                (ua.includes('infinix') || 
                 ua.includes('note30') || 
                 ua.includes('android'))
            ),
            
            // Obecné kategorie
            isMobile: width <= 768 || hasTouch,
            isTablet: width > 768 && width <= 1024 && hasTouch,
            isDesktop: width > 1024 && !hasTouch,
            isLargeMonitor: width > 1600,
            
            // Orientace
            orientation: window.matchMedia("(orientation: landscape)").matches ? 'landscape' : 'portrait',
            
            // Technické info
            screenWidth: width,
            screenHeight: height,
            pixelRatio: pixelRatio,
            hasTouch: hasTouch,
            userAgent: ua,
            
            // Android specifika
            isAndroid: ua.includes('android'),
            androidVersion: ua.match(/android (\d+)/i) ? parseInt(ua.match(/android (\d+)/i)[1]) : null,
            
            // High refresh rate
            isHighRefreshRate: window.screen.availHeight > 2000 || pixelRatio >= 2.5
        };

        log(`Detekováno zařízení: ${device.isInfinix ? 'Infinix Note 30' : device.isMobile ? 'Mobile' : 'Desktop'}`, 'success');
        log(`Rozlišení: ${width}x${height}, Pixel Ratio: ${pixelRatio}`, 'info');
        if (device.isAndroid) {
            log(`Android verze: ${device.androidVersion || 'neznámá'}`, 'info');
        }

        return device;
    }

    // ========================================
    // GPU AKCELERACE - SMART MODE
    // ========================================
    function optimizeGPULayers(device) {
        if (!CONFIG.enableGPUAcceleration) return;

        try {
            const bgContainer = document.querySelector('.background-image-container');
            const bgImage = document.querySelector(CONFIG.containerSelector);
            
            // Na mobilu NEVYNUCUJ GPU pro pozadí
            if (device.isMobile || device.isInfinix) {
                log('Mobil detekován - GPU optimalizace pro OBSAH', 'info');
                
                // Odstraň GPU triky z pozadí
                if (bgContainer) {
                    bgContainer.style.transform = 'none';
                    bgContainer.style.webkitTransform = 'none';
                    bgContainer.style.willChange = 'auto';
                    bgContainer.style.backfaceVisibility = '';
                    bgContainer.style.webkitBackfaceVisibility = '';
                }
                
                if (bgImage) {
                    bgImage.style.transform = 'none';
                    bgImage.style.webkitTransform = 'none';
                    bgImage.style.willChange = 'auto';
                }
                
                // Aktivuj GPU jen pro scrollovací container
                const scrollContainers = document.querySelectorAll('main, .content-wrapper, .playlist-container, body');
                scrollContainers.forEach(container => {
                    if (container) {
                        container.style.transform = 'translateZ(0)';
                        container.style.webkitTransform = 'translateZ(0)';
                        container.style.backfaceVisibility = 'hidden';
                        container.style.webkitBackfaceVisibility = 'hidden';
                    }
                });
                
                log('GPU aktivována pro SCROLL OBSAH místo pozadí', 'success');
            } else {
                // Desktop - standardní GPU akcelerace
                if (bgContainer) {
                    bgContainer.style.transform = 'translate3d(0, 0, 0)';
                    bgContainer.style.webkitTransform = 'translate3d(0, 0, 0)';
                    bgContainer.style.backfaceVisibility = 'hidden';
                }
                
                if (bgImage) {
                    bgImage.style.transform = 'translate3d(0, 0, 0)';
                    bgImage.style.webkitTransform = 'translate3d(0, 0, 0)';
                }
                
                log('GPU akcelerace aktivována (Desktop)', 'success');
            }
        } catch (e) {
            log(`Chyba při GPU optimalizaci: ${e.message}`, 'warn');
        }
    }

    // ========================================
    // VYPNUTÍ BLUR NA MOBILU
    // ========================================
    function disableBlurOnMobile(device) {
        if (!CONFIG.disableBlurOnMobile) return;
        if (!device.isMobile && !device.isInfinix) return;
        
        log('Vypínám backdrop-filter na mobilním zařízení...', 'info');
        
        // Najdi všechny elementy s blur efektem
        const selectors = [
            '.card', 
            '.music-player', 
            '.playlist-item',
            '[class*="glass"]',
            '[class*="panel"]',
            '.container',
            'header',
            'nav'
        ];
        
        let disabledCount = 0;
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                const computedStyle = window.getComputedStyle(el);
                
                // Kontrola, jestli má backdrop-filter
                if (computedStyle.backdropFilter && computedStyle.backdropFilter !== 'none') {
                    el.style.backdropFilter = 'none';
                    el.style.webkitBackdropFilter = 'none';
                    
                    // Náhrada průhledností
                    const currentBg = computedStyle.backgroundColor;
                    if (currentBg.includes('rgba')) {
                        const rgbaMatch = currentBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
                        if (rgbaMatch) {
                            const [, r, g, b, a] = rgbaMatch;
                            const newAlpha = Math.max(parseFloat(a || 1), 0.85);
                            el.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${newAlpha})`;
                        }
                    }
                    
                    disabledCount++;
                }
            });
        });
        
        if (disabledCount > 0) {
            log(`Blur vypnut na ${disabledCount} elementech`, 'success');
        }
    }

    // ========================================
    // PRELOAD OBRÁZKU
    // ========================================
    function preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                log(`Obrázek úspěšně načten: ${url.substring(0, 50)}...`, 'success');
                resolve(url);
            };
            
            img.onerror = () => {
                log(`Chyba načtení obrázku: ${url}`, 'error');
                reject(new Error(`Failed to load image: ${url}`));
            };
            
            img.src = url;
        });
    }

    // ========================================
    // NASTAVENÍ TAPETY (ZJEDNODUŠENO)
    // ========================================
    async function setTapeta(forceRefresh = false) {
        log('Zahajuji nastavení tapety...', 'info');

        // Získej device info
        const device = detectDevice();
        saveToStorage('device_info', device);

        // Vyber správnou tapetu
        let tapetyUrl;
        if (device.isInfinix || (device.isMobile && device.screenWidth <= 420)) {
            tapetyUrl = CONFIG.tapety.mobile;
            log('Vybrána MOBILNÍ tapeta', 'info');
        } else {
            tapetyUrl = CONFIG.tapety.desktop;
            log('Vybrána DESKTOP tapeta', 'info');
        }

        // Kontrola cache
        const cachedUrl = loadFromStorage('current_url');
        const cachedTimestamp = loadFromStorage('last_set_timestamp');
        const now = Date.now();
        const cacheAge = cachedTimestamp ? (now - cachedTimestamp) / 1000 / 60 : Infinity;

        if (!forceRefresh && cachedUrl === tapetyUrl && cacheAge < 60) {
            log(`Použita CACHED tapeta (cache age: ${Math.round(cacheAge)} min)`, 'info');
            applyTapeta(cachedUrl, device);
            return;
        }

        // Preload obrázku
        if (CONFIG.preloadImages) {
            try {
                log('Preloaduji obrázek...', 'info');
                await preloadImage(tapetyUrl);
            } catch (error) {
                log(`Preload selhal: ${error.message}`, 'error');
                
                // ZJEDNODUŠENO: Zkus druhou tapetu jako fallback
                const fallbackUrl = tapetyUrl === CONFIG.tapety.desktop 
                    ? CONFIG.tapety.mobile 
                    : CONFIG.tapety.desktop;
                
                log(`Zkouším alternativní tapetu...`, 'warn');
                
                try {
                    await preloadImage(fallbackUrl);
                    tapetyUrl = fallbackUrl;
                    log('Alternativní tapeta úspěšně načtena', 'success');
                } catch (fallbackError) {
                    log('Ani alternativní tapeta se nenačetla! Používám cached verzi.', 'error');
                    
                    // Poslední záchrana - cached tapeta
                    const lastCached = loadFromStorage('current_url');
                    if (lastCached) {
                        tapetyUrl = lastCached;
                        log('Použita poslední cached tapeta', 'warn');
                    } else {
                        log('KRITICKÁ CHYBA: Žádná tapeta k dispozici!', 'error');
                        return;
                    }
                }
            }
        }

        // Aplikuj tapetu
        applyTapeta(tapetyUrl, device);

        // Ulož do cache
        saveToStorage('current_url', tapetyUrl);
        saveToStorage('last_set_timestamp', now);
        saveToStorage('device_type', device.isInfinix ? 'infinix' : device.isMobile ? 'mobile' : 'desktop');
    }

    // ========================================
    // APLIKACE TAPETY NA DOM
    // ========================================
    function applyTapeta(url, device) {
        const bgContainer = document.querySelector(CONFIG.containerSelector);

        if (!bgContainer) {
            log('KRITICKÁ CHYBA: Background container nenalezen!', 'error');
            log(`Hledaný selektor: ${CONFIG.containerSelector}`, 'error');
            return;
        }

        // Nastavení obrázku
        bgContainer.src = url;
        bgContainer.alt = 'Mělnická tapeta';

        // GPU optimalizace
        optimizeGPULayers(device);
        
        // Vypni blur na mobilu
        disableBlurOnMobile(device);

        log(`Tapeta úspěšně nastavena!`, 'success');
    }

    // ========================================
    // OBNOVENÍ TAPETY
    // ========================================
    function restoreTapeta() {
        log('Obnovuji uloženou tapetu...', 'info');

        const cachedUrl = loadFromStorage('current_url');
        const cachedDeviceType = loadFromStorage('device_type');
        const device = detectDevice();

        if (cachedUrl) {
            log(`Nalezena cached tapeta: ${cachedDeviceType}`, 'success');
            applyTapeta(cachedUrl, device);
        } else {
            log('Žádná cached tapeta, nastavuji novou...', 'warn');
            setTapeta();
        }
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================
    function setupEventListeners() {
        // Orientace (mobil)
        window.addEventListener('orientationchange', () => {
            log('Změna orientace detekována', 'info');
            setTimeout(() => {
                setTapeta(true);
            }, 100);
        });

        // Resize (desktop) - s debounce
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                log('Změna velikosti okna detekována', 'info');
                setTapeta(true);
            }, 500);
        });

        // Scroll debug (pouze v dev módu)
        if (CONFIG.debug) {
            let scrollDebounce;
            let lastScrollY = 0;
            
            window.addEventListener('scroll', () => {
                clearTimeout(scrollDebounce);
                scrollDebounce = setTimeout(() => {
                    const scrollY = window.scrollY || window.pageYOffset;
                    const scrollDelta = Math.abs(scrollY - lastScrollY);
                    
                    if (scrollDelta > 500) {
                        log(`Scroll: ${scrollY}px (delta: ${scrollDelta}px)`, 'info');
                        lastScrollY = scrollY;
                    }
                }, 250);
            }, { passive: true });
        }

        log('Event listeners nastaveny', 'success');
    }

    // ========================================
    // INICIALIZACE
    // ========================================
    function init() {
        log('╔═══════════════════════════════════════╗', 'info');
        log('  MĚLNICKÁ TAPETA MODULE v2.3 OPT       ', 'info');
        log('  MOBILE PERFORMANCE + SIMPLIFIED       ', 'info');
        log('╚═══════════════════════════════════════╝', 'info');

        // Kontrola DOM elementu
        const bgContainer = document.querySelector(CONFIG.containerSelector);
        if (!bgContainer) {
            log('CHYBA: Background container neexistuje!', 'error');
            log(`Očekávaný selektor: ${CONFIG.containerSelector}`, 'error');
            log('Ujisti se, že máš v HTML: <div class="background-image-container"><img src=""></div>', 'error');
            return;
        }

        log('Background container nalezen ✓', 'success');

        // Nastav event listeners
        setupEventListeners();

        // Obnov nebo nastav tapetu
        restoreTapeta();

        log('Inicializace dokončena!', 'success');
        log('╚═══════════════════════════════════════╝', 'info');
    }

    // ========================================
    // VEŘEJNÉ API
    // ========================================
    window.MelnickaTapeta = {
        // Základní funkce
        refresh: () => setTapeta(true),
        getDeviceInfo: () => loadFromStorage('device_info'),
        getCurrentUrl: () => loadFromStorage('current_url'),
        
        // Cache management
        clearCache: () => {
            localStorage.removeItem(CONFIG.prefix + 'current_url');
            localStorage.removeItem(CONFIG.prefix + 'last_set_timestamp');
            localStorage.removeItem(CONFIG.prefix + 'device_info');
            log('Cache vymazána!', 'success');
        },
        
        // GPU kontrola
        toggleGPU: (enable) => {
            CONFIG.enableGPUAcceleration = enable;
            log(`GPU akcelerace: ${enable ? 'ZAPNUTO' : 'VYPNUTO'}`, 'info');
            setTapeta(true);
        },
        
        // Blur kontrola
        toggleBlur: (enable) => {
            CONFIG.disableBlurOnMobile = !enable;
            if (enable) {
                log('Blur POVOLEN - obnovuji stránku...', 'info');
                location.reload();
            } else {
                log('Blur ZAKÁZÁN - vypínám...', 'info');
                const device = detectDevice();
                disableBlurOnMobile(device);
            }
        },
        
        // Manuální nastavení tapety
        setCustomTapeta: (url) => {
            const device = detectDevice();
            applyTapeta(url, device);
            saveToStorage('current_url', url);
            log(`Vlastní tapeta nastavena: ${url}`, 'success');
        },
        
        // Info
        version: '2.3 OPT - Simplified Fallback Logic',
        
        // Debug nástroje
        debug: {
            testStyles: () => {
                const bgContainer = document.querySelector(CONFIG.containerSelector);
                if (bgContainer) {
                    const parent = bgContainer.parentElement;
                    const parentStyle = window.getComputedStyle(parent);
                    const imgStyle = window.getComputedStyle(bgContainer);
                    
                    console.table({
                        'Container Position': parentStyle.position,
                        'Container Transform': parentStyle.transform,
                        'Container Will-Change': parentStyle.willChange,
                        'Image Transform': imgStyle.transform,
                        'Image Will-Change': imgStyle.willChange,
                        'Z-Index': parentStyle.zIndex
                    });
                }
            },
            
            measureFPS: () => {
                let frames = 0;
                let lastTime = performance.now();
                let isRunning = true;
                
                function count() {
                    if (!isRunning) return;
                    
                    frames++;
                    const now = performance.now();
                    if (now >= lastTime + 1000) {
                        const fps = frames;
                        log(`FPS: ${fps}${fps < 60 ? ' ⚠️ LAG!' : ' ✓'}`, fps < 60 ? 'warn' : 'success');
                        frames = 0;
                        lastTime = now;
                    }
                    requestAnimationFrame(count);
                }
                
                requestAnimationFrame(count);
                log('FPS měření spuštěno (10 sekund)', 'success');
                
                setTimeout(() => {
                    isRunning = false;
                    log('FPS měření ukončeno', 'info');
                }, 10000);
            },
            
            listBlurElements: () => {
                const allElements = document.querySelectorAll('*');
                const blurElements = [];
                
                allElements.forEach(el => {
                    const style = window.getComputedStyle(el);
                    if (style.backdropFilter && style.backdropFilter !== 'none') {
                        blurElements.push({
                            tag: el.tagName,
                            class: el.className,
                            filter: style.backdropFilter
                        });
                    }
                });
                
                console.table(blurElements);
                log(`Nalezeno ${blurElements.length} elementů s blur efektem`, 'info');
            },
            
            getPerformanceReport: () => {
                const device = detectDevice();
                const memory = performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB',
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + ' MB'
                } : 'N/A';
                
                console.group('📊 Performance Report');
                console.log('Device:', device.isInfinix ? 'Infinix Note 30' : device.isMobile ? 'Mobile' : 'Desktop');
                console.log('Screen:', `${device.screenWidth}x${device.screenHeight} (${device.pixelRatio}x)`);
                console.log('Memory:', memory);
                console.log('GPU Mode:', CONFIG.enableGPUAcceleration ? 'Enabled' : 'Disabled');
                console.log('Blur:', CONFIG.disableBlurOnMobile && device.isMobile ? 'Disabled' : 'Enabled');
                console.log('Tapety:', Object.keys(CONFIG.tapety).length + ' URLs');
                console.groupEnd();
            }
        }
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