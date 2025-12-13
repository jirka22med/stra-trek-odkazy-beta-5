 // ========================================
        // PERFORMANCE MONITOR v2.0 - CLEAN VERSION
        // ========================================

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
        
        // ========================================
        // 🆕 NOVÉ: Extended tracking
        // ========================================
        let pageSwitch = { count: 0, times: [] };
        let searchStats = { count: 0, times: [] };
        let linkOperations = { added: 0, deleted: 0, edited: 0, moved: 0 };
        let timeline = [];

        // Monitor FPS
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
            
            perfEl.textContent = `⚡ ${currentFps} FPS | ${memory}MB | ${status} Cache`;
        }

        // Dashboard update
        function updateDashboard() {
            // FPS
            document.getElementById('dash-fps').textContent = `${currentFps} FPS`;
            const fpsDash = document.getElementById('dash-fps');
            fpsDash.className = 'perf-metric-value';
            if (currentFps < 30) fpsDash.classList.add('warning');
            if (currentFps < 20) fpsDash.classList.add('error');
            
            // FPS Sparkline
            updateSparkline();
            
            // Render times
            if (renderTimes.length > 0) {
                const lastRender = renderTimes[renderTimes.length - 1];
                const avgRender = Math.round(renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length);
                document.getElementById('dash-render-time').textContent = `${lastRender} ms`;
                document.getElementById('dash-avg-render').textContent = `${avgRender} ms`;
            }
            
            // Memory
            const memory = getMemoryUsage();
            const memoryLimit = getMemoryLimit();
            const memoryPercent = Math.round((memory / memoryLimit) * 100);
            document.getElementById('dash-memory').textContent = `${memory} MB`;
            document.getElementById('dash-memory-limit').textContent = `${memoryLimit} MB`;
            
            const memProgress = document.getElementById('memory-progress');
            memProgress.style.width = `${memoryPercent}%`;
            memProgress.className = 'progress-fill';
            if (memoryPercent > 70) memProgress.classList.add('warning');
            if (memoryPercent > 85) memProgress.classList.add('error');
            
            // Firebase & Cache
            document.getElementById('dash-queries').textContent = firebaseQueries;
            const cacheRate = getCacheHitRate();
            document.getElementById('dash-cache-rate').textContent = `${cacheRate}%`;
            
            const cacheProgress = document.getElementById('cache-progress');
            cacheProgress.style.width = `${cacheRate}%`;
            cacheProgress.className = 'progress-fill';
            if (cacheRate < 70) cacheProgress.classList.add('warning');
            if (cacheRate < 50) cacheProgress.classList.add('error');
            
            // Cache info (pokud existuje window.getFirestoreCacheInfo)
            if (typeof window.getFirestoreCacheInfo === 'function') {
                const cacheInfo = window.getFirestoreCacheInfo();
                document.getElementById('dash-links-cached').textContent = cacheInfo.links.count || 0;
                document.getElementById('dash-pages-cached').textContent = cacheInfo.pages.count || 0;
            }
            
            // Network
            if (latencyMeasurements.length > 0) {
                const avgLatency = Math.round(latencyMeasurements.reduce((a, b) => a + b, 0) / latencyMeasurements.length);
                document.getElementById('dash-latency').textContent = `${avgLatency} ms`;
            }
            
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            document.getElementById('dash-connection').textContent = connection ? connection.effectiveType : 'Unknown';
            
            // System info
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            document.getElementById('dash-device').textContent = isMobile ? 'Mobile' : 'Desktop';
            document.getElementById('dash-screen').textContent = `${window.screen.width}x${window.screen.height}`;
            
            const uptime = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(uptime / 60);
            const seconds = uptime % 60;
            document.getElementById('dash-uptime').textContent = `${minutes}m ${seconds}s`;
        }

        // Sparkline graph
        function updateSparkline() {
            const sparkline = document.getElementById('fps-sparkline');
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

        // Memory usage
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

        // Cache hit rate
        function getCacheHitRate() {
            const total = cacheHits + cacheMisses;
            if (total === 0) return 100;
            return Math.round((cacheHits / total) * 100);
        }

        // Toggle dashboard (otevřít/zavřít)
        function togglePerfDashboard() {
            const modal = document.getElementById('perfDashboardModal');
            isDashboardOpen = !isDashboardOpen;
            
            if (isDashboardOpen) {
                modal.classList.add('active');
                updateDashboard();
            } else {
                modal.classList.remove('active');
            }
        }

        // Force refresh cache
        function forceRefreshCache() {
            if (typeof window.forceRefreshFirestoreCache === 'function') {
                window.forceRefreshFirestoreCache();
                alert('✅ Cache byla obnovena!');
            } else {
                alert('⚠️ Funkce není dostupná (firebaseLinksFunctions.js)');
            }
        }

        // Clear stats
        function clearPerfStats() {
            if (confirm('Opravdu chcete vymazat statistiky?')) {
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
                
                startTime = Date.now();
                
                addToTimeline('Statistiky vymazány', 'Reset proběhl');
                
                alert('✅ Statistiky vymazány!');
                updateDashboard();
            }
        }

        // Zavření modalu kliknutím mimo panel
        document.getElementById('perfDashboardModal').addEventListener('click', function(e) {
            if (e.target === this) {
                togglePerfDashboard();
            }
        });

        // ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isDashboardOpen) {
                togglePerfDashboard();
            }
        });

        // ========================================
        // HOOKY PRO MĚŘENÍ (volitelné)
        // ========================================

        // Hook pro měření render time
        window.measureRenderTime = function(timeMs) {
            renderTimes.push(timeMs);
            if (renderTimes.length > 10) renderTimes.shift();
        };

        // Hook pro Firebase dotazy
        window.trackFirebaseQuery = function() {
            firebaseQueries++;
        };

        // Hook pro cache hits/misses
        window.trackCacheHit = function() {
            cacheHits++;
        };

        window.trackCacheMiss = function() {
            cacheMisses++;
        };

        // Hook pro latency
        window.trackLatency = function(timeMs) {
            latencyMeasurements.push(timeMs);
            if (latencyMeasurements.length > 10) latencyMeasurements.shift();
        };
        
        // ========================================
        // 🆕 NOVÉ HOOKY PRO EXTENDED TRACKING
        // ========================================
        
        // Přepínání stránek
        window.trackPageSwitch = function(timeMs) {
            pageSwitch.count++;
            pageSwitch.times.push(timeMs);
            if (pageSwitch.times.length > 20) pageSwitch.times.shift();
            addToTimeline('Přepnuta stránka', `${timeMs}ms`);
        };
        
        // Vyhledávání
        window.trackSearch = function(query, timeMs) {
            searchStats.count++;
            searchStats.times.push(timeMs);
            if (searchStats.times.length > 20) searchStats.times.shift();
            addToTimeline('Vyhledávání', `"${query}" (${timeMs}ms)`);
        };
        
        // Operace s odkazy
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
        
        // Timeline helper
        function addToTimeline(action, details = '') {
            const timestamp = new Date().toLocaleTimeString('cs-CZ');
            timeline.push({ time: timestamp, action, details });
            
            // Max 50 záznamů
            if (timeline.length > 50) timeline.shift();
        }
        
        // Inicializační události
        addToTimeline('Performance Monitor', 'Spuštěn');

        // ========================================
        // 📥 EXPORT DO TXT
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
            
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            const connectionType = connection ? connection.effectiveType : 'Unknown';
            
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const deviceType = isMobile ? 'Mobile' : 'Desktop';
            
            let cacheInfo = { links: { count: 0 }, pages: { count: 0 } };
            if (typeof window.getFirestoreCacheInfo === 'function') {
                cacheInfo = window.getFirestoreCacheInfo();
            }
            
            // Extended stats
            const avgPageSwitch = pageSwitch.times.length > 0 
                ? Math.round(pageSwitch.times.reduce((a, b) => a + b, 0) / pageSwitch.times.length) 
                : 0;
            
            const avgSearchTime = searchStats.times.length > 0 
                ? Math.round(searchStats.times.reduce((a, b) => a + b, 0) / searchStats.times.length) 
                : 0;
            
            const totalOperations = linkOperations.added + linkOperations.deleted + linkOperations.edited + linkOperations.moved;
            
            // Formátování reportu
            const report = `
═══════════════════════════════════════════════════════════════
    ⚡ PERFORMANCE REPORT - Star Trek Database
═══════════════════════════════════════════════════════════════

📅 Datum a čas: ${timestamp}
⏱️  Uptime: ${minutes}m ${seconds}s

───────────────────────────────────────────────────────────────
🎨 RENDERING METRIKY
───────────────────────────────────────────────────────────────
FPS (aktuální):          ${currentFps} fps
FPS Historie:            ${fpsHistory.join(', ')} fps
Poslední render:         ${renderTimes.length > 0 ? renderTimes[renderTimes.length - 1] : 0} ms
Průměrný render:         ${avgRender} ms
Všechny render časy:     ${renderTimes.join(', ')} ms

───────────────────────────────────────────────────────────────
💾 PAMĚŤ
───────────────────────────────────────────────────────────────
Použitá paměť:           ${memory} MB
Limit paměti:            ${memoryLimit} MB
Využití paměti:          ${memoryPercent}%
Status:                  ${memoryPercent > 85 ? '❌ KRITICKÉ' : memoryPercent > 70 ? '⚠️ VAROVÁNÍ' : '✅ OK'}

───────────────────────────────────────────────────────────────
🔥 FIREBASE & CACHE
───────────────────────────────────────────────────────────────
Firebase dotazy celkem:  ${firebaseQueries}
Cache hit rate:          ${cacheRate}%
Cache hits:              ${cacheHits}
Cache misses:            ${cacheMisses}
Odkazy v cache:          ${cacheInfo.links.count}
Stránky v cache:         ${cacheInfo.pages.count}
Status:                  ${cacheRate > 70 ? '✅ VÝBORNÉ' : cacheRate > 50 ? '⚠️ PRŮMĚRNÉ' : '❌ ŠPATNÉ'}

───────────────────────────────────────────────────────────────
🌐 SÍŤ
───────────────────────────────────────────────────────────────
Průměrná latence:        ${avgLatency} ms
Všechny měření:          ${latencyMeasurements.join(', ')} ms
Typ připojení:           ${connectionType}
Status:                  ${avgLatency < 100 ? '✅ RYCHLÉ' : avgLatency < 300 ? '⚠️ POMALÉ' : '❌ VELMI POMALÉ'}

───────────────────────────────────────────────────────────────
📱 SYSTÉMOVÉ INFORMACE
───────────────────────────────────────────────────────────────
Zařízení:                ${deviceType}
User Agent:              ${navigator.userAgent}
Rozlišení obrazovky:     ${window.screen.width}x${window.screen.height}
Viewport:                ${window.innerWidth}x${window.innerHeight}
Pixel Ratio:             ${window.devicePixelRatio || 1}
Platforma:               ${navigator.platform}
Jazyk:                   ${navigator.language}
Online:                  ${navigator.onLine ? 'Ano' : 'Ne'}

───────────────────────────────────────────────────────────────
📈 STATISTIKY PŘEPÍNÁNÍ STRÁNEK
───────────────────────────────────────────────────────────────
Počet přepnutí:          ${pageSwitch.count}x
Průměrná doba:           ${avgPageSwitch} ms
Nejrychlejší:            ${pageSwitch.times.length > 0 ? Math.min(...pageSwitch.times) : 0} ms
Nejpomalejší:            ${pageSwitch.times.length > 0 ? Math.max(...pageSwitch.times) : 0} ms
Všechny časy:            ${pageSwitch.times.join(', ')} ms

───────────────────────────────────────────────────────────────
🔍 STATISTIKY VYHLEDÁVÁNÍ
───────────────────────────────────────────────────────────────
Počet vyhledávání:       ${searchStats.count}x
Průměrná doba:           ${avgSearchTime} ms
Nejrychlejší:            ${searchStats.times.length > 0 ? Math.min(...searchStats.times) : 0} ms
Nejpomalejší:            ${searchStats.times.length > 0 ? Math.max(...searchStats.times) : 0} ms
Všechny časy:            ${searchStats.times.join(', ')} ms

───────────────────────────────────────────────────────────────
📝 OPERACE S ODKAZY
───────────────────────────────────────────────────────────────
Celkem operací:          ${totalOperations}x
Přidáno odkazů:          ${linkOperations.added}x
Smazáno odkazů:          ${linkOperations.deleted}x
Upraveno odkazů:         ${linkOperations.edited}x
Přesunuto odkazů:        ${linkOperations.moved}x

───────────────────────────────────────────────────────────────
⏱️ TIMELINE (posledních ${Math.min(timeline.length, 20)} událostí)
───────────────────────────────────────────────────────────────
${timeline.slice(-20).map(event => `${event.time} - ${event.action}${event.details ? ': ' + event.details : ''}`).join('\n')}

───────────────────────────────────────────────────────────────
📊 SHRNUTÍ
───────────────────────────────────────────────────────────────
Celkové hodnocení:       ${getCelkoveHodnoceni()}
Doporučení:              ${getDoporuceni()}

═══════════════════════════════════════════════════════════════
Vygenerováno: Performance Monitor v2.0
Více admirál Jiřík - Hvězdná databáze odkazů
═══════════════════════════════════════════════════════════════
            `.trim();
            
            // Stažení souboru
            const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            const filename = `performance_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
            link.href = url;
            link.download = filename;
            link.click();
            
            URL.revokeObjectURL(url);
            
            console.log('✅ Performance report exportován:', filename);
            alert(`✅ Report exportován!\n\nSoubor: ${filename}`);
        }
        
        // Pomocné funkce pro report
        function getCelkoveHodnoceni() {
            let score = 100;
            
            if (currentFps < 30) score -= 20;
            if (currentFps < 20) score -= 20;
            
            const memPercent = Math.round((getMemoryUsage() / getMemoryLimit()) * 100);
            if (memPercent > 85) score -= 20;
            else if (memPercent > 70) score -= 10;
            
            const cacheRate = getCacheHitRate();
            if (cacheRate < 50) score -= 20;
            else if (cacheRate < 70) score -= 10;
            
            if (score >= 90) return '🌟 VÝBORNÉ (A+)';
            if (score >= 75) return '✅ DOBRÉ (A)';
            if (score >= 60) return '⚠️ PRŮMĚRNÉ (B)';
            if (score >= 40) return '⚠️ SLABÉ (C)';
            return '❌ KRITICKÉ (D)';
        }
        
        function getDoporuceni() {
            const recommendations = [];
            
            if (currentFps < 30) {
                recommendations.push('Snižte FPS zátěž (méně animací)');
            }
            
            const memPercent = Math.round((getMemoryUsage() / getMemoryLimit()) * 100);
            if (memPercent > 70) {
                recommendations.push('Vysoké využití paměti - zvažte refresh stránky');
            }
            
            const cacheRate = getCacheHitRate();
            if (cacheRate < 70) {
                recommendations.push('Nízký cache hit rate - zkontrolujte optimalizaci');
            }
            
            if (firebaseQueries > 10) {
                recommendations.push('Mnoho Firebase dotazů - zkontrolujte cache systém');
            }
            
            if (recommendations.length === 0) {
                return '✅ Vše funguje optimálně!';
            }
            
            return recommendations.join(', ');
        }

        // Start monitoring
        monitorPerformance();
        console.log('⚡ Performance Monitor v2.0 aktivován (Clean Version + Export)');
console.log('🆕 Nové funkce: Blur Counter, GPU Layers, Tapeta Info');
console.log('📊 Použij: PerformanceMonitor.quickDiag() pro rychlou diagnostiku');