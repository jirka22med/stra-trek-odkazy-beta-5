// ===================================================================
// PERFORMANCE MONITOR v3.2 - SMART EDITION
// Autor: Claude.ai | Architekt: Vice admirál Jiřík
// ✅ NOVINKA: Rozšířená detekce zařízení + Smart Lag Detection
// ✅ Ignoruje background throttling + user idle
// ===================================================================

let frameCount = 0;
let lastFpsUpdate = Date.now();
let currentFps = 0;
let fpsHistory = [];
let renderTimes = [];
let firebaseQueries = 0;
let cacheHits = 0;
let cacheMisses = 0;
let startTime = Date.now();
let latencyMeasurements = [];
let isDashboardOpen = false;

// --- 🆕 EXTENDED TRACKING ---
let pageSwitch = { count: 0, times: [] };
let searchStats = { count: 0, times: [] };
let linkOperations = { added: 0, deleted: 0, edited: 0, moved: 0 };
let timeline = [];
let batteryInfo = { level: null, charging: null };
let longTasks = [];
let networkRTT = 0;

// ========================================
// 🆕 SMART LAG DETECTION - Tab & User Tracking
// ========================================
let isTabActive = !document.hidden;
let lastUserInteraction = Date.now();
let realLags = [];      // Skutečné user-visible lagy
let backgroundLags = []; // Background throttling (ignorujeme)

// Track user activity
['click', 'scroll', 'keypress', 'touchstart', 'mousemove'].forEach(event => {
    document.addEventListener(event, () => {
        lastUserInteraction = Date.now();
    }, { passive: true });
});

// Track tab visibility
document.addEventListener('visibilitychange', () => {
    isTabActive = !document.hidden;
    const status = isTabActive ? '☀️ ACTIVE' : '🌙 BACKGROUND';
    console.log(`🔄 Tab status: ${status}`);
    addToTimeline('Tab Status', status);
});

// ========================================
// 🛡️ INICIALIZACE SYSTÉMOVÝCH SENZORŮ
// ========================================

// 1. Senzor baterie
if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
        const updateBattery = () => {
            batteryInfo.level = Math.round(battery.level * 100);
            batteryInfo.charging = battery.charging;
            if (isDashboardOpen) updateDashboard();
        };
        updateBattery();
        battery.addEventListener('chargingchange', updateBattery);
        battery.addEventListener('levelchange', updateBattery);
    }).catch(err => {
        console.log('⚠️ Battery API nedostupné:', err);
    });
}

// 2. 🆕 SMART Long Tasks Detection
try {
    const taskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
                const timeSinceInteraction = Date.now() - lastUserInteraction;
                const isUserActive = timeSinceInteraction < 5000; // 5s threshold
                
                const lagEntry = { 
                    timestamp: new Date().toLocaleTimeString('cs-CZ'), 
                    duration: Math.round(entry.duration)
                };
                
                // Kategorizuj lag
                if (!isTabActive) {
                    // Background tab throttling - IGNORUJ!
                    backgroundLags.push({ ...lagEntry, reason: 'background-tab' });
                    console.log('⚪ Background lag (OK):', lagEntry.duration + 'ms');
                    
                } else if (!isUserActive) {
                    // Idle GC - méně kritické
                    backgroundLags.push({ ...lagEntry, reason: 'idle-gc' });
                    console.log('🟡 Idle lag (OK):', lagEntry.duration + 'ms');
                    
                } else {
                    // SKUTEČNÝ user-visible lag!
                    realLags.push({ ...lagEntry, reason: 'user-visible' });
                    longTasks.push(lagEntry); // Pro backward compatibility
                    console.log('🔴 REAL LAG (BAD):', lagEntry.duration + 'ms');
                    addToTimeline('⚠️ Real User Lag', `${Math.round(entry.duration)}ms`);
                }
                
                if (longTasks.length > 20) longTasks.shift();
                if (realLags.length > 20) realLags.shift();
                if (backgroundLags.length > 50) backgroundLags.shift();
                
                if (isDashboardOpen) updateDashboard();
            }
        });
    });
    taskObserver.observe({ entryTypes: ['longtask'] });
    console.log('✅ Smart Lag Detection aktivní!');
} catch (e) {
    console.log('ℹ️ Long Tasks API není podporováno');
}

// 3. Network RTT monitoring
function updateNetworkInfo() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && conn.rtt) {
        networkRTT = conn.rtt;
    }
}
setInterval(updateNetworkInfo, 5000);
updateNetworkInfo();

// ========================================
// 📊 MONITORING FPS
// ========================================

function monitorPerformance() {
    frameCount++;
    const now = Date.now();
    
    if (now - lastFpsUpdate > 1000) {
        currentFps = Math.round(frameCount);
        frameCount = 0;
        lastFpsUpdate = now;
        
        fpsHistory.push(currentFps);
        if (fpsHistory.length > 20) fpsHistory.shift();
        
        updateCompactIndicator();
        
        if (isDashboardOpen) {
            updateDashboard();
        }
    }
    
    requestAnimationFrame(monitorPerformance);
}

// Kompaktní indikátor
function updateCompactIndicator() {
    const perfEl = document.getElementById('perfMode');
    if (!perfEl) return;

    const memory = getMemoryUsage();
    const cacheRate = getCacheHitRate();
    
    let status = '✅';
    perfEl.className = '';
    
    if (currentFps < 30) {
        status = '⚠️';
        perfEl.classList.add('warning');
    }
    if (currentFps < 20) {
        status = '❌';
        perfEl.classList.add('error');
    }
    
    perfEl.textContent = `⚡ ${currentFps} FPS | ${memory}MB | Cache ${cacheRate}%`;
}

// ========================================
// 🖥️ DASHBOARD UPDATE (ZKALIBROVANÝ)
// ========================================

function updateDashboard() {
    // 1. FPS METRIKY
    updateElement('dash-fps', `${currentFps} FPS`, currentFps < 30 ? 'warning' : currentFps < 20 ? 'error' : '');
    updateSparkline();
    
    // 2. RENDER TIMES
    if (renderTimes.length > 0) {
        const lastRender = renderTimes[renderTimes.length - 1];
        const avgRender = Math.round(renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length);
        updateElement('dash-render-time', `${lastRender} ms`);
        updateElement('dash-avg-render', `${avgRender} ms`);
    }
    
    // 3. PAMĚŤ
    const memory = getMemoryUsage();
    const memoryLimit = getMemoryLimit();
    const memoryPercent = Math.round((memory / memoryLimit) * 100);
    
    updateElement('dash-memory', `${memory} MB`);
    updateElement('dash-memory-limit', `${memoryLimit} MB`);
    updateProgressBar('memory-progress', memoryPercent);
    
    // 4. FIREBASE & CACHE
    updateElement('dash-queries', firebaseQueries);
    
    const cacheRate = getCacheHitRate();
    updateElement('dash-cache-rate', `${cacheRate}%`);
    updateProgressBar('cache-progress', cacheRate);
    
    // Cache details
    if (typeof window.getFirestoreCacheInfo === 'function') {
        const cacheInfo = window.getFirestoreCacheInfo();
        updateElement('dash-links-cached', cacheInfo.links.count || 0);
        updateElement('dash-pages-cached', cacheInfo.pages.count || 0);
        
        // Cache TTL
        if (cacheInfo.links.age !== null) {
            const ttlSeconds = Math.max(0, Math.round((cacheInfo.config.LINKS_DURATION - cacheInfo.links.age) / 1000));
            updateElement('dash-cache-ttl', `${ttlSeconds}s`);
        }
    }
    
    // 5. NETWORK
    if (latencyMeasurements.length > 0) {
        const avgLatency = Math.round(latencyMeasurements.reduce((a, b) => a + b, 0) / latencyMeasurements.length);
        updateElement('dash-latency', `${avgLatency} ms`);
    }
    
    updateElement('dash-rtt', `${networkRTT} ms`);
    
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    updateElement('dash-connection', connection ? connection.effectiveType : 'Unknown');
    
    // 6. SYSTEM INFO
    updateElement('dash-device', detectDeviceType());
    
    // Battery
    if (batteryInfo.level !== null) {
        const batteryText = `${batteryInfo.level}% ${batteryInfo.charging ? '⚡' : '🔋'}`;
        const batteryClass = batteryInfo.level < 20 ? 'error' : batteryInfo.charging ? 'success' : '';
        updateElement('dash-battery', batteryText, batteryClass);
    } else {
        updateElement('dash-battery', 'N/A');
    }
    
    updateElement('dash-screen', `${window.screen.width}x${window.screen.height}`);
    
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(uptime / 60);
    const seconds = uptime % 60;
    updateElement('dash-uptime', `${minutes}m ${seconds}s`);
    
    // 7. PAGE SWITCHING STATS
    updateElement('dash-page-switches', `${pageSwitch.count}x`);
    if (pageSwitch.times.length > 0) {
        const avg = Math.round(pageSwitch.times.reduce((a,b)=>a+b,0) / pageSwitch.times.length);
        const fastest = Math.min(...pageSwitch.times);
        const slowest = Math.max(...pageSwitch.times);
        updateElement('dash-page-avg', `${avg} ms`);
        updateElement('dash-page-fastest', `${fastest} ms`);
        updateElement('dash-page-slowest', `${slowest} ms`);
    }
    
    // 8. LINK OPERATIONS
    updateElement('dash-links-added', linkOperations.added);
    updateElement('dash-links-deleted', linkOperations.deleted);
    updateElement('dash-links-edited', linkOperations.edited);
    updateElement('dash-links-moved', linkOperations.moved);
    
    // 9. 🆕 SMART LONG TASKS (Real vs Background)
    updateElement('dash-long-tasks', realLags.length); // Jen real lagy!
    updateElement('dash-background-lags', backgroundLags.length); // Background lagy
    
    const longTasksList = document.getElementById('dash-long-tasks-list');
    if (longTasksList) {
        if (realLags.length > 0) {
            longTasksList.innerHTML = realLags.slice(-5).reverse().map(lt => 
                `<div style="color: #ff3333;">[${lt.timestamp}] 🔴 User-visible: ${lt.duration}ms</div>`
            ).join('');
        } else {
            longTasksList.innerHTML = '<div style="color: #00ff00;">✅ Žádné real lagy!</div>';
        }
        
        // Přidej background lagy (pro info)
        if (backgroundLags.length > 0) {
            longTasksList.innerHTML += `<div style="color: #888; margin-top: 10px; font-size: 0.9em;">
                ⚪ Background/Idle: ${backgroundLags.length}× (normální)
            </div>`;
        }
    }
}

// ========================================
// 🔧 HELPER FUNKCE
// ========================================

function updateElement(id, text, className = '') {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = text;
        if (className) {
            el.className = 'perf-metric-value ' + className;
        }
    }
}

function updateProgressBar(id, percent) {
    const bar = document.getElementById(id);
    if (bar) {
        bar.style.width = `${Math.min(100, percent)}%`;
        bar.className = 'progress-fill';
        if (percent > 70) bar.classList.add('warning');
        if (percent > 85) bar.classList.add('error');
    }
}

// ========================================
// 🆕 ROZŠÍŘENÁ DETEKCE ZAŘÍZENÍ
// ========================================

function detectDeviceType() {
    const ua = navigator.userAgent.toLowerCase();
    const cores = navigator.hardwareConcurrency || 0;
    const screen = window.screen;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // ========================================
    // 🖥️ DESKTOPY & NOTEBOOKY
    // ========================================
    
     /// Lenovo IdeaPad Gaming 3 (high-end)
if (ua.includes('windows') && cores >= 12) {
    return "💻 Lenovo IdeaPad Gaming 3 (Název zařízení: DESKTOP-GLDFRSU | Procesor: AMD Ryzen 5 4600H with Radeon Graphics (3.00 GHz) | Nainstalovaná paměť RAM: 16,0 GB (použitelné: 15,4 GB) | ID zařízení: E5D9E72A-66E8-426E-A722-152D8BE53D4C | ID produktu: 00325-96755-12951-AAOEM | Typ systému: 64bitový operační systém, procesor pro platformu x64 | Pero a dotykové ovládání: Není k dispozici | Grafika: AMD Radeon(TM) Graphics & NVIDIA GeForce GTX 1650 4GB VRAM)";
}
    
    // Windows notebooky (obecné)
    if (ua.includes('windows') && cores >= 4 && cores < 12) {
        return `💻 Windows Notebook (${cores}C)`;
    }
    
    // Windows desktop (nízký počet jader nebo vysoký výkon)
    if (ua.includes('windows') && (cores <= 2 || cores >= 16)) {
        return `🖥️ Windows Desktop (${cores}C)`;
    }
    
    // MacOS
    if (ua.includes('macintosh') || ua.includes('mac os x')) {
        if (cores >= 8) {
            return `🍎 MacBook Pro (${cores}C)`;
        } else {
            return `🍎 MacBook Air (${cores}C)`;
        }
    }
    
    // Linux desktopy
    if (ua.includes('linux') && !ua.includes('android')) {
        return `🐧 Linux Desktop (${cores}C)`;
    }
    
    // ========================================
    // 📱 MOBILNÍ TELEFONY - ANDROID
    // ========================================
    
    if (ua.includes('android')) {
        // Infinix modely
        if (ua.includes('infinix')) {
            if (ua.includes('note 30')) {
                return "📱 Infinix Note 30 4G";
            }
            if (ua.includes('note 40')) {
                return "📱 Infinix Note 40 5G";
            }
            if (ua.includes('hot')) {
                return "📱 Infinix Hot Series";
            }
            return "📱 Infinix Mobile";
        }
        
        // Realme modely
        if (ua.includes('realme') || ua.includes('rmx')) {
            if (ua.includes('realme 8') || ua.includes('rmx3241')) {
                return "📱 Realme 8 5G";
            }
            if (ua.includes('realme 9') || ua.includes('rmx3521')) {
                return "📱 Realme 9 Pro+";
            }
            if (ua.includes('realme gt')) {
                return "📱 Realme GT Series";
            }
            return "📱 Realme Mobile";
        }
        
        // Xiaomi/Redmi modely
        if (ua.includes('xiaomi') || ua.includes('redmi') || ua.includes('mi ')) {
            if (ua.includes('redmi 10c')) {
                return "📱 Xiaomi Redmi 10C";
            }
            if (ua.includes('redmi note')) {
                return "📱 Redmi Note Series";
            }
            if (ua.includes('poco')) {
                return "📱 Poco Phone";
            }
            if (ua.includes('mi 11') || ua.includes('mi 12') || ua.includes('mi 13')) {
                return "📱 Xiaomi Mi Flagship";
            }
            return "📱 Xiaomi/Redmi Mobile";
        }
        
        // Samsung modely
        if (ua.includes('samsung')) {
            if (ua.includes('galaxy s')) {
                return "📱 Samsung Galaxy S Series";
            }
            if (ua.includes('galaxy note')) {
                return "📱 Samsung Galaxy Note";
            }
            if (ua.includes('galaxy a')) {
                return "📱 Samsung Galaxy A Series";
            }
            if (ua.includes('galaxy m')) {
                return "📱 Samsung Galaxy M Series";
            }
            return "📱 Samsung Mobile";
        }
        
        // OnePlus
        if (ua.includes('oneplus')) {
            return "📱 OnePlus Mobile";
        }
        
        // Huawei
        if (ua.includes('huawei') || ua.includes('honor')) {
            return "📱 Huawei/Honor Mobile";
        }
        
        // Oppo
        if (ua.includes('oppo')) {
            return "📱 Oppo Mobile";
        }
        
        // Vivo
        if (ua.includes('vivo')) {
            return "📱 Vivo Mobile";
        }
        
        // Nokia
        if (ua.includes('nokia')) {
            return "📱 Nokia Mobile";
        }
        
        // Motorola
        if (ua.includes('motorola') || ua.includes('moto')) {
            return "📱 Motorola Mobile";
        }
        
        // Google Pixel
        if (ua.includes('pixel')) {
            return "📱 Google Pixel";
        }
        
        // Obecný Android (fallback)
        if (screen.width <= 480) {
            return `📱 Android Mobile (${screen.width}×${screen.height})`;
        } else if (screen.width <= 768) {
            return `📱 Android Phablet (${screen.width}×${screen.height})`;
        } else {
            return `📱 Android Device (${screen.width}×${screen.height})`;
        }
    }
    
    // ========================================
    // 🍎 iOS ZAŘÍZENÍ
    // ========================================
    
    if (/iphone/.test(ua)) {
        if (screen.height >= 2796) return "📱 iPhone 15 Pro Max";
        if (screen.height >= 2556) return "📱 iPhone 14 Pro";
        if (screen.height >= 2532) return "📱 iPhone 12/13/14";
        if (screen.height >= 2436) return "📱 iPhone X/XS/11 Pro";
        return "📱 iPhone";
    }
    
    if (/ipad/.test(ua)) {
        if (screen.width >= 1024) {
            return "📱 iPad Pro";
        } else {
            return "📱 iPad";
        }
    }
    
    if (/ipod/.test(ua)) {
        return "📱 iPod Touch";
    }
    
    // ========================================
    // 🖥️ TABLETY
    // ========================================
    
    // Android tablety
    if (ua.includes('android') && screen.width >= 768) {
        if (ua.includes('samsung')) {
            return "📱 Samsung Galaxy Tab";
        }
        if (ua.includes('lenovo')) {
            return "📱 Lenovo Tablet";
        }
        if (ua.includes('huawei')) {
            return "📱 Huawei MatePad";
        }
        return `📱 Android Tablet (${screen.width}×${screen.height})`;
    }
    
    // ========================================
    // 🎮 HERNÍ KONZOLE & SPECIÁLNÍ ZAŘÍZENÍ
    // ========================================
    
    if (ua.includes('playstation')) {
        return "🎮 PlayStation";
    }
    
    if (ua.includes('xbox')) {
        return "🎮 Xbox";
    }
    
    if (ua.includes('nintendo')) {
        return "🎮 Nintendo Switch";
    }
    
    if (ua.includes('smart-tv') || ua.includes('smarttv')) {
        return "📺 Smart TV";
    }
    
    // ========================================
    // ❓ FALLBACK (Neznámé zařízení)
    // ========================================
    
    if (ua.includes('windows')) {
        return `🖥️ Windows PC (${cores}C)`;
    }
    
    if (isTouchDevice) {
        return `📱 Touch Device (${screen.width}×${screen.height})`;
    }
    
    return `❓ Unknown Device (${cores}C, ${screen.width}×${screen.height})`;
}

function updateSparkline() {
    const sparkline = document.getElementById('fps-sparkline');
    if (!sparkline) return;
    sparkline.innerHTML = '';
    
    const maxFps = 60;
    fpsHistory.forEach(fps => {
        const bar = document.createElement('div');
        bar.className = 'sparkline-bar';
        const height = (fps / maxFps) * 100;
        bar.style.height = `${height}%`;
        
        if (fps < 30) bar.classList.add('warning');
        if (fps < 20) bar.classList.add('error');
        
        sparkline.appendChild(bar);
    });
}

function getMemoryUsage() {
    if (performance.memory) {
        return Math.round(performance.memory.usedJSHeapSize / 1048576);
    }
    return 0;
}

function getMemoryLimit() {
    if (performance.memory) {
        return Math.round(performance.memory.jsHeapSizeLimit / 1048576);
    }
    return 512;
}

function getCacheHitRate() {
    const total = cacheHits + cacheMisses;
    if (total === 0) return 100;
    return Math.round((cacheHits / total) * 100);
}

// ========================================
// 🎮 OVLÁDÁNÍ DASHBOARDU
// ========================================

function togglePerfDashboard() {
    const modal = document.getElementById('perfDashboardModal');
    if (!modal) return;
    
    isDashboardOpen = !isDashboardOpen;
    
    if (isDashboardOpen) {
        modal.classList.add('active');
        updateDashboard();
    } else {
        modal.classList.remove('active');
    }
}

function forceRefreshCache() {
    if (typeof window.forceRefreshFirestoreCache === 'function') {
        window.forceRefreshFirestoreCache();
        addToTimeline('Cache Refresh', 'Manuální obnovení cache');
        alert('✅ Cache byla obnovena!');
    } else {
        alert('⚠️ Funkce forceRefreshFirestoreCache není dostupná.');
    }
}

function clearPerfStats() {
    if (confirm('Opravdu chcete vymazat všechny statistiky?')) {
        firebaseQueries = 0;
        cacheHits = 0;
        cacheMisses = 0;
        renderTimes = [];
        fpsHistory = [];
        latencyMeasurements = [];
        pageSwitch = { count: 0, times: [] };
        searchStats = { count: 0, times: [] };
        linkOperations = { added: 0, deleted: 0, edited: 0, moved: 0 };
        timeline = [];
        longTasks = [];
        realLags = [];
        backgroundLags = [];
        
        startTime = Date.now();
        addToTimeline('Stats Cleared', 'Veškeré statistiky vymazány');
        
        alert('✅ Statistiky vymazány!');
        updateDashboard();
    }
}

// Event Listeners
const perfDashboardModal = document.getElementById('perfDashboardModal');
if (perfDashboardModal) {
    perfDashboardModal.addEventListener('click', function(e) {
        if (e.target === this) {
            togglePerfDashboard();
        }
    });
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isDashboardOpen) {
        togglePerfDashboard();
    }
});

// ========================================
// 🪝 SYSTÉMOVÉ HOOKY
// ========================================

window.measureRenderTime = function(timeMs) {
    renderTimes.push(timeMs);
    if (renderTimes.length > 10) renderTimes.shift();
};

window.trackFirebaseQuery = function() {
    firebaseQueries++;
};

window.trackCacheHit = function() {
    cacheHits++;
};

window.trackCacheMiss = function() {
    cacheMisses++;
};

window.trackLatency = function(timeMs) {
    latencyMeasurements.push(timeMs);
    if (latencyMeasurements.length > 10) latencyMeasurements.shift();
};

window.trackPageSwitch = function(timeMs) {
    pageSwitch.count++;
    pageSwitch.times.push(timeMs);
    if (pageSwitch.times.length > 20) pageSwitch.times.shift();
    addToTimeline('Přepnuta stránka', `${timeMs}ms`);
};

window.trackSearch = function(query, timeMs) {
    searchStats.count++;
    searchStats.times.push(timeMs);
    if (searchStats.times.length > 20) searchStats.times.shift();
    addToTimeline('Vyhledávání', `"${query}" (${timeMs}ms)`);
};

window.trackLinkAdded = function(linkName) {
    linkOperations.added++;
    addToTimeline('Přidán odkaz', linkName);
};

window.trackLinkDeleted = function(linkName) {
    linkOperations.deleted++;
    addToTimeline('Smazán odkaz', linkName);
};

window.trackLinkEdited = function(linkName) {
    linkOperations.edited++;
    addToTimeline('Upraven odkaz', linkName);
};

window.trackLinkMoved = function(linkName) {
    linkOperations.moved++;
    addToTimeline('Přesunut odkaz', linkName);
};

function addToTimeline(action, details = '') {
    const timestamp = new Date().toLocaleTimeString('cs-CZ');
    timeline.push({ time: timestamp, action, details });
    if (timeline.length > 50) timeline.shift();
}

// ========================================
// 📥 EXPORTY
// ========================================

function exportPerfReport() {
    const timestamp = new Date().toLocaleString('cs-CZ');
    const memory = getMemoryUsage();
    const memoryLimit = getMemoryLimit();
    const memoryPercent = Math.round((memory / memoryLimit) * 100);
    const cacheRate = getCacheHitRate();
    
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(uptime / 60);
    const seconds = uptime % 60;
    
    const avgRender = renderTimes.length > 0 
        ? Math.round(renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length) 
        : 0;
    
    let cacheInfo = { links: { count: 0 }, pages: { count: 0 } };
    if (typeof window.getFirestoreCacheInfo === 'function') {
        cacheInfo = window.getFirestoreCacheInfo();
    }
    
    const avgPageSwitch = pageSwitch.times.length > 0 
        ? Math.round(pageSwitch.times.reduce((a,b)=>a+b,0) / pageSwitch.times.length) 
        : 0;
    
    const report = `
═══════════════════════════════════════════════════════════════
    ⚡ PERFORMANCE REPORT v3.2 - Hvězdná Databáze (SMART)
═══════════════════════════════════════════════════════════════

📅 Datum a čas: ${timestamp}
⏱️  Uptime: ${minutes}m ${seconds}s
📱 Zařízení: ${detectDeviceType()}
🔋 Baterie: ${batteryInfo.level !== null ? `${batteryInfo.level}% ${batteryInfo.charging ? '⚡' : '🔋'}` : 'N/A'}

───────────────────────────────────────────────────────────────
🎨 RENDERING METRIKY
───────────────────────────────────────────────────────────────
FPS (aktuální):          ${currentFps} fps
FPS Historie:            ${fpsHistory.join(', ')} fps
Průměrný render:         ${avgRender} ms

───────────────────────────────────────────────────────────────
💾 PAMĚŤ (RAM)
───────────────────────────────────────────────────────────────
Použitá paměť:           ${memory} MB
Limit prohlížeče:        ${memoryLimit} MB
Vytížení:                ${memoryPercent}%
Status:                  ${memoryPercent > 85 ? '❌ KRITICKÉ' : memoryPercent > 70 ? '⚠️ VAROVÁNÍ' : '✅ OK'}

───────────────────────────────────────────────────────────────
🔥 FIREBASE & CACHE
───────────────────────────────────────────────────────────────
Firebase dotazy:         ${firebaseQueries}
Cache hit rate:          ${cacheRate}%
Odkazy v cache:          ${cacheInfo.links.count}
Stránky v cache:         ${cacheInfo.pages.count}

───────────────────────────────────────────────────────────────
🌐 SÍŤOVÉ DATA
───────────────────────────────────────────────────────────────
Network RTT:             ${networkRTT} ms
Typ připojení:           ${navigator.connection ? navigator.connection.effectiveType : 'Unknown'}

───────────────────────────────────────────────────────────────
📊 PŘEPÍNÁNÍ STRÁNEK
───────────────────────────────────────────────────────────────
Počet přepnutí:          ${pageSwitch.count}x
Průměrná doba:           ${avgPageSwitch} ms
Nejrychlejší:            ${pageSwitch.times.length > 0 ? Math.min(...pageSwitch.times) : 0} ms
Nejpomalejší:            ${pageSwitch.times.length > 0 ? Math.max(...pageSwitch.times) : 0} ms

───────────────────────────────────────────────────────────────
📝 OPERACE S ODKAZY
───────────────────────────────────────────────────────────────
Přidáno odkazů:          ${linkOperations.added}
Smazáno odkazů:          ${linkOperations.deleted}
Upraveno odkazů:         ${linkOperations.edited}
Přesunuto odkazů:        ${linkOperations.moved}

───────────────────────────────────────────────────────────────
⚠️ SMART LAG ANALYSIS (NOVÉ v3.2)
───────────────────────────────────────────────────────────────
🔴 Real User-Visible Lags:  ${realLags.length}
⚪ Background/Idle Lags:     ${backgroundLags.length} (normální)
📊 Total Incidents:          ${longTasks.length}

🔴 REAL LAGS (posledních 5):
${realLags.slice(-5).map(lt => `[${lt.timestamp}] User-visible: ${lt.duration}ms`).join('\n') || '✅ Žádné skutečné lagy!'}

⚪ BACKGROUND LAGS (info):
${backgroundLags.slice(-3).map(lt => `[${lt.timestamp}] ${lt.reason}: ${lt.duration}ms`).join('\n') || 'Žádné background lagy'}

───────────────────────────────────────────────────────────────
⏱️ TIMELINE (Posledních 20 událostí)
───────────────────────────────────────────────────────────────
${timeline.slice(-20).map(event => `${event.time} - ${event.action}: ${event.details}`).join('\n')}

═══════════════════════════════════════════════════════════════
Vygenerováno: Performance Monitor v3.2 (Smart Edition)
Vice admirál Jiřík - Hvězdná flotila
🆕 Smart Lag Detection: Ignoruje background throttling!
═══════════════════════════════════════════════════════════════
    `.trim();
    
    downloadFile(report, `perf_report_${Date.now()}.txt`, 'text/plain');
}

function exportPerfJson() {
    const cacheInfo = typeof window.getFirestoreCacheInfo === 'function' 
        ? window.getFirestoreCacheInfo() 
        : { links: { count: 0 }, pages: { count: 0 } };
    
    const dataPackage = {
        meta: {
            app: "Star Trek Database",
            author: "Vice admirál Jiřík",
            version: "3.2 Smart Edition",
            timestamp: new Date().toISOString(),
            timestamp_cz: new Date().toLocaleString('cs-CZ'),
            uptime_seconds: Math.floor((Date.now() - startTime) / 1000)
        },
        hardware: {
            device: detectDeviceType(),
            battery: batteryInfo,
            screen: `${window.screen.width}x${window.screen.height}`,
            cores: navigator.hardwareConcurrency || 'N/A',
            memory: {
                used_mb: getMemoryUsage(),
                limit_mb: getMemoryLimit()
            }
        },
        performance: {
            fps_current: currentFps,
            fps_history: fpsHistory,
            render_times: renderTimes,
            network_rtt: networkRTT,
            page_switches: pageSwitch,
            search_stats: searchStats
        },
        firebase: {
            queries: firebaseQueries,
            cache_rate: getCacheHitRate(),
            cache_details: cacheInfo
        },
        incidents: {
            real_lags_count: realLags.length,
            background_lags_count: backgroundLags.length,
            total_long_tasks: longTasks.length,
            real_lags_log: realLags,
            background_lags_log: backgroundLags.slice(-10) // Jen posledních 10
        },
        tab_status: {
            is_active: isTabActive,
            last_user_interaction_ago_ms: Date.now() - lastUserInteraction
        },
        operations: linkOperations,
        timeline: timeline
    };

    downloadFile(JSON.stringify(dataPackage, null, 4), `perf_data_${Date.now()}.json`, 'application/json');
}

function downloadFile(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
}

// ========================================
// 🚀 START MONITORINGU
// ========================================

monitorPerformance();
addToTimeline('Performance Monitor v3.2', 'Smart Edition aktivována!');
console.log('✅ Performance Monitor v3.2 (Smart Edition) je online!');
console.log('🆕 Rozšířená detekce zařízení aktivní!');
console.log('🆕 Smart Lag Detection aktivní!');
console.log('🖖 Vice admirál Jiřík - Všechny systémy funkční!');

