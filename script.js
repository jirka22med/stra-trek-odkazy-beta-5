// ===================================================================
// PERFORMANCE MONITOR v3.0 - GALACTIC EDITION
// Autor: Claude.ai | Architekt: Vice admirál Jiřík | Partner: Gemini
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

// --- 🆕 EXTENDED TRACKING & HARDWARE SENSORS ---
let pageSwitch = { count: 0, times: [] };
let searchStats = { count: 0, times: [] };
let linkOperations = { added: 0, deleted: 0, edited: 0, moved: 0 };
let timeline = [];
let batteryInfo = { level: null, charging: null };
let longTasks = [];
let networkRTT = 0;

// ========================================
// 🛡️ INICIALIZACE SYSTÉMOVÝCH SENZORŮ
// ========================================

// 1. Senzor baterie pro Lenovo IdeaPad Gaming 3
if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
        const updateBattery = () => {
            batteryInfo.level = Math.round(battery.level * 100);
            batteryInfo.charging = battery.charging;
            addToTimeline('Power Status', `${batteryInfo.level}% (${batteryInfo.charging ? 'Nabíjení' : 'Baterie'})`);
        };
        updateBattery();
        battery.addEventListener('chargingchange', updateBattery);
        battery.addEventListener('levelchange', updateBattery);
    });
}

// 2. Detekce "záseků" systému (Long Tasks API)
try {
    const taskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
                const lagInfo = `Lag: ${Math.round(entry.duration)}ms`;
                longTasks.push({ 
                    timestamp: new Date().toLocaleTimeString('cs-CZ'), 
                    duration: entry.duration 
                });
                addToTimeline('⚠️ System Lag', lagInfo);
                console.warn(`🚀 [PerfMonitor] Detekován zásek: ${lagInfo}`);
            }
        });
    });
    taskObserver.observe({ entryTypes: ['longtask'] });
} catch (e) {
    console.log("Long Tasks API není v tomto prohlížeči podporováno.");
}

// 3. Rozšířená síťová diagnostika (RTT)
function updateNetworkInfo() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
        networkRTT = conn.rtt || 0;
    }
}
setInterval(updateNetworkInfo, 5000);

// ========================================
// 📊 MONITOROVÁNÍ FPS & JÁDRO
// ========================================

function monitorPerformance() {
    frameCount++;
    const now = Date.now();
    
    if (now - lastFpsUpdate > 1000) {
        currentFps = Math.round(frameCount);
        frameCount = 0;
        lastFpsUpdate = now;
        
        // Přidej do historie (max 20 hodnot)
        fpsHistory.push(currentFps);
        if (fpsHistory.length > 20) fpsHistory.shift();
        
        updateCompactIndicator();
        
        // Update dashboard pouze pokud je otevřený
        if (isDashboardOpen) {
            updateDashboard();
        }
    }
    
    requestAnimationFrame(monitorPerformance);
}

// Kompaktní indikátor v rohu obrazovky
function updateCompactIndicator() {
    const perfEl = document.getElementById('perfMode');
    if (!perfEl) return;

    const memory = getMemoryUsage();
    
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
    
    perfEl.textContent = `⚡ ${currentFps} FPS | ${memory}MB | ${status} System`;
}

// ========================================
// 🖥️ DASHBOARD UPDATE (v3.0 GALACTIC)
// ========================================

function updateDashboard() {
    // 1. FPS METRIKY
    const fpsDash = document.getElementById('dash-fps');
    if (fpsDash) {
        fpsDash.textContent = `${currentFps} FPS`;
        fpsDash.className = 'perf-metric-value';
        if (currentFps < 30) fpsDash.classList.add('warning');
        if (currentFps < 20) fpsDash.classList.add('error');
    }
    
    // FPS Sparkline graf
    updateSparkline();
    
    // 2. RENDER TIMES (Z links.js)
    if (renderTimes.length > 0) {
        const lastRender = renderTimes[renderTimes.length - 1];
        const avgRender = Math.round(renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length);
        const renderTimeEl = document.getElementById('dash-render-time');
        const avgRenderEl = document.getElementById('dash-avg-render');
        if (renderTimeEl) renderTimeEl.textContent = `${lastRender} ms`;
        if (avgRenderEl) avgRenderEl.textContent = `${avgRender} ms`;
    }
    
    // 3. PAMĚŤ (RAM)
    const memory = getMemoryUsage();
    const memoryLimit = getMemoryLimit();
    const memoryPercent = Math.round((memory / memoryLimit) * 100);
    const memEl = document.getElementById('dash-memory');
    const memLimitEl = document.getElementById('dash-memory-limit');
    if (memEl) memEl.textContent = `${memory} MB`;
    if (memLimitEl) memLimitEl.textContent = `${memoryLimit} MB`;
    
    const memProgress = document.getElementById('memory-progress');
    if (memProgress) {
        memProgress.style.width = `${memoryPercent}%`;
        memProgress.className = 'progress-fill';
        if (memoryPercent > 70) memProgress.classList.add('warning');
        if (memoryPercent > 85) memProgress.classList.add('error');
    }
    
    // 4. FIREBASE & CACHE STATS
    const queriesEl = document.getElementById('dash-queries');
    if (queriesEl) queriesEl.textContent = firebaseQueries;
    
    const cacheRate = getCacheHitRate();
    const cacheRateEl = document.getElementById('dash-cache-rate');
    if (cacheRateEl) cacheRateEl.textContent = `${cacheRate}%`;
    
    const cacheProgress = document.getElementById('cache-progress');
    if (cacheProgress) {
        cacheProgress.style.width = `${cacheRate}%`;
        cacheProgress.className = 'progress-fill';
        if (cacheRate < 70) cacheProgress.classList.add('warning');
        if (cacheRate < 50) cacheProgress.classList.add('error');
    }
    
    // 🆕 CACHE TTL & DETAILED INFO (v3.0)
    if (typeof window.getFirestoreCacheInfo === 'function') {
        const cacheInfo = window.getFirestoreCacheInfo();
        const linksCachedEl = document.getElementById('dash-links-cached');
        const pagesCachedEl = document.getElementById('dash-pages-cached');
        const ttlEl = document.getElementById('dash-cache-ttl');
        
        if (linksCachedEl) linksCachedEl.textContent = cacheInfo.links.count || 0;
        if (pagesCachedEl) pagesCachedEl.textContent = cacheInfo.pages.count || 0;
        
        if (ttlEl && cacheInfo.links.age) {
            const ttlSeconds = Math.max(0, Math.round((cacheInfo.config.LINKS_DURATION - cacheInfo.links.age) / 1000));
            ttlEl.textContent = `${ttlSeconds}s`;
        }
    }
    
    // 5. NETWORK & LATENCY
    if (latencyMeasurements.length > 0) {
        const avgLatency = Math.round(latencyMeasurements.reduce((a, b) => a + b, 0) / latencyMeasurements.length);
        const latencyEl = document.getElementById('dash-latency');
        if (latencyEl) latencyEl.textContent = `${avgLatency} ms`;
    }
    
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const connEl = document.getElementById('dash-connection');
    if (connEl) connEl.textContent = connection ? connection.effectiveType : 'Unknown';

    const rttEl = document.getElementById('dash-rtt');
    if (rttEl) rttEl.textContent = `${networkRTT} ms`;
    
    // 6. 🆕 HARDWARE STATUS (v3.0)
    const batteryEl = document.getElementById('dash-battery');
    if (batteryEl && batteryInfo.level !== null) {
        batteryEl.textContent = `${batteryInfo.level}% ${batteryInfo.charging ? '⚡' : '🔋'}`;
        batteryEl.className = 'perf-metric-value ' + (batteryInfo.level < 20 ? 'error' : 'success');
    }
    
    // 7. SYSTÉMOVÉ INFORMACE
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const deviceEl = document.getElementById('dash-device');
    const screenEl = document.getElementById('dash-screen');
    const uptimeEl = document.getElementById('dash-uptime');
    
    if (deviceEl) deviceEl.textContent = isMobile ? 'Mobile Device' : 'Desktop (Lenovo IdeaPad)';
    if (screenEl) screenEl.textContent = `${window.screen.width}x${window.screen.height}`;
    
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(uptime / 60);
    const seconds = uptime % 60;
    if (uptimeEl) uptimeEl.textContent = `${minutes}m ${seconds}s`;
}

// ========================================
// 📈 POMOCNÉ FUNKCE (PAMĚŤ, GRAFY)
// ========================================

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
        alert('✅ Cache byla obnovena přes Performance Monitor!');
    } else {
        alert('⚠️ Funkce forceRefreshFirestoreCache nebyla nalezena.');
    }
}

function clearPerfStats() {
    if (confirm('Opravdu chcete vymazat veškeré naměřené statistiky?')) {
        firebaseQueries = 0;
        cacheHits = 0;
        cacheMisses = 0;
        renderTimes = [];
        fpsHistory = [];
        latencyMeasurements = [];
        
        // Extended stats
        pageSwitch = { count: 0, times: [] };
        searchStats = { count: 0, times: [] };
        linkOperations = { added: 0, deleted: 0, edited: 0, moved: 0 };
        timeline = [];
        longTasks = [];
        
        startTime = Date.now();
        addToTimeline('Statistiky vymazány', 'Uživatel provedl reset');
        
        alert('✅ Statistiky vymazány!');
        updateDashboard();
    }
}

// Event Listeners pro modal
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
// 🪝 SYSTÉMOVÉ HOOKY PRO EXTERNÍ SKRIPTY
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
    
    // Udržujeme posledních 50 záznamů
    if (timeline.length > 50) timeline.shift();
}

// ========================================
// 📥 EXPORTY (TXT & JSON)
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
    
    const avgLatency = latencyMeasurements.length > 0 
        ? Math.round(latencyMeasurements.reduce((a, b) => a + b, 0) / latencyMeasurements.length) 
        : 0;
    
    let cacheInfo = { links: { count: 0 }, pages: { count: 0 } };
    if (typeof window.getFirestoreCacheInfo === 'function') {
        cacheInfo = window.getFirestoreCacheInfo();
    }
    
    const report = `
═══════════════════════════════════════════════════════════════
    ⚡ PERFORMANCE REPORT - Hvězdná Databáze Odkazů
═══════════════════════════════════════════════════════════════

📅 Datum a čas: ${timestamp}
⏱️  Uptime: ${minutes}m ${seconds}s
📱 Zařízení: ${/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop (Lenovo IdeaPad)'}
🔋 Baterie: ${batteryInfo.level}% (${batteryInfo.charging ? 'Nabíjení' : 'Provoz z baterie'})

───────────────────────────────────────────────────────────────
🎨 RENDERING METRIKY
───────────────────────────────────────────────────────────────
FPS (aktuální):          ${currentFps} fps
FPS Historie:            ${fpsHistory.join(', ')} fps
Průměrný render:         ${avgRender} ms

───────────────────────────────────────────────────────────────
💾 PAMĚĚŤ (RAM)
───────────────────────────────────────────────────────────────
Použitá paměť:           ${memory} MB
Limit prohlížeče:        ${memoryLimit} MB
Vytížení:                ${memoryPercent}%

───────────────────────────────────────────────────────────────
🔥 FIREBASE & CACHE
───────────────────────────────────────────────────────────────
Firebase dotazy:         ${firebaseQueries}
Cache hit rate:          ${cacheRate}%
Odkazy v cache:          ${cacheInfo.links.count}
Stránky v cache:         ${cacheInfo.pages.count}

───────────────────────────────────────────────────────────────
🌐 SÍŤOVÁ DATA
───────────────────────────────────────────────────────────────
Průměrná latence:        ${avgLatency} ms
Network RTT:             ${networkRTT} ms
Typ připojení:           ${navigator.connection ? navigator.connection.effectiveType : 'Unknown'}

───────────────────────────────────────────────────────────────
📈 OPERAČNÍ STATISTIKY
───────────────────────────────────────────────────────────────
Počet přepnutí stran:    ${pageSwitch.count}x
Počet vyhledávání:       ${searchStats.count}x
Přidáno odkazů:          ${linkOperations.added}
Smazáno odkazů:          ${linkOperations.deleted}
Upraveno odkazů:         ${linkOperations.edited}

───────────────────────────────────────────────────────────────
⚠️ INCIDENTY (Záseky > 50ms)
───────────────────────────────────────────────────────────────
Počet detekovaných:      ${longTasks.length}
${longTasks.slice(-5).map(lt => `[${lt.timestamp}] Doba: ${Math.round(lt.duration)}ms`).join('\n')}

───────────────────────────────────────────────────────────────
⏱️ TIMELINE (Posledních 20 událostí)
───────────────────────────────────────────────────────────────
${timeline.slice(-20).map(event => `${event.time} - ${event.action}: ${event.details}`).join('\n')}

═══════════════════════════════════════════════════════════════
Vygenerováno: Performance Monitor v3.0
Vice admirál Jiřík - Hvězdná flotila
═══════════════════════════════════════════════════════════════
    `.trim();
    
    downloadPerfFile(report, `perf_report_${Date.now()}.txt`, 'text/plain');
}

function exportPerfJson() {
    const cacheInfo = typeof window.getFirestoreCacheInfo === 'function' ? window.getFirestoreCacheInfo() : {};
    
    // 🚀 VÝPOČET ČASŮ
    const now = new Date();
    const uptimeInSeconds = Math.floor((Date.now() - startTime) / 1000);
    const readableTime = now.toLocaleTimeString('cs-CZ');

    // 🛰️ AUTO-DETEKCE ZAŘÍZENÍ (Jiříkova specifikace)
    const getDeviceType = () => {
        const ua = navigator.userAgent.toLowerCase();
        const vendor = navigator.vendor.toLowerCase();
        
        // 1. Detekce tvého Lenova (podle tvých hardware parametrů)
        if (ua.includes('windows') && (navigator.hardwareConcurrency >= 12 || ua.includes('nvidia'))) {
            return "Lenovo IdeaPad Gaming 3 (Ryzen/GTX1650)"; //[cite: 1]
        }
        
        // 2. Nakousnuté jablko (iOS / iPhone / iPad)
        if (/iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
            return "Nakousnuté Jablko (iOS/iPadOS)";
        }
        
        // 3. Android
        if (ua.includes('android')) {
            return "Android Mobile";
        }
        
        // 4. MacOS
        if (ua.includes('macintosh') || ua.includes('mac os x')) {
            return "MacOS (Apple Computer)";
        }
        
        return "Neznámý typ zařízení";
    };

    const dataPackage = {
        meta: {
            app: "Star Trek Database",
            author: "Vice admirál Jiřík",
            version: "3.1 Galactic-Auto",
            timestamp: now.toISOString(),
            timestamp_cz: readableTime,
            uptime_seconds: isNaN(uptimeInSeconds) ? 0 : uptimeInSeconds
        },
        hardware: {
            // Tady používáme naši novou detekci
            device: getDeviceType(),
            battery: batteryInfo,
            screen: `${window.screen.width}x${window.screen.height}`,
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
            latency_avg: latencyMeasurements.length > 0 ? Math.round(latencyMeasurements.reduce((a,b)=>a+b,0)/latencyMeasurements.length) : 0
        },
        firebase: {
            queries: firebaseQueries,
            cache_rate: getCacheHitRate(),
            cache_details: cacheInfo
        },
        incidents: {
            long_tasks_count: longTasks.length,
            long_tasks_log: longTasks
        },
        operations: linkOperations,
        timeline: timeline
    };

    downloadPerfFile(JSON.stringify(dataPackage, null, 4), `perf_data_${Date.now()}.json`, 'application/json');
}

function downloadPerfFile(content, fileName, contentType) {
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
addToTimeline('Performance Monitor v3.0', 'Systém inicializován a připraven');
console.log('⚡ Performance Monitor v3.0 (Galactic Edition) běží na plný výkon.');
