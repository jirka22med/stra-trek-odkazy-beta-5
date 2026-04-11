// fleet-registry.js - VELITELSKÝ MOST (Jediný soubor, který upravuješ)
const __FLEET_REGISTER_START = performance.now();
//====stímto se bude pracovat 1===========
// 🤖 AUTO-VERZOVAČ – verze roste při každém načtení stránky, žádné sekání!
const _buildDate = new Date();

const _buildCounter = (() => {
    try {
        const key = 'uss_prometheus_build';
        // Načteme poslední uloženou hodnotu, fallback na 54 (navazujeme na tvoji historii)
        const last = parseInt(localStorage.getItem(key) || '54', 10);
        const next = isNaN(last) ? 55 : last + 1;
        localStorage.setItem(key, next);
        return next;
    } catch (e) {
        // Pokud localStorage selže (např. soukromý režim), vrátíme timestamp – žádné sekání!
        return Date.now();
    }
})();

const FLEET_CONFIG = {
    version: `${_buildDate.getFullYear()}.${_buildDate.getMonth() + 1}.${_buildDate.getDate()}.${_buildCounter}`,
    // Výsledek např: "2025.2.24.55" – čitelné, automatické, nesekne se! ✅
    buildDate: _buildDate.toISOString().split('T')[0],
    buildNumber: _buildCounter,

    //=============toto se měnit nebude============
    codename: "Prometheus-Class",

    //=============toto se měnit nebude============

    // SEZNAM VŠECH MODULŮ (Tady spravuješ odkazy)
    modules: [
        //HLAVNÍ KOSTRA STAR TREK HUDEBNÍHO PŘEHRAVAČE
'./index.html',
        // --- CSS MODULY (POUZE AKTIVNÍ) ---
'./style.css',
'./perfMode.css',    
'./modal.css',        
'./scrollbar.css',        
'./browser-status.css',        
        
        // --- NULTÉ POŘADÍ V POŘADÍ ---
'./fleet-register.js',
        // --- Musí se načíst PŘED všemi Firebase moduly ---
'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js',
'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore-compat.js',
// --- Jiříkův Hlídač a zachytávač konzolových logu s exportem do html
'./jirkuv-hlidac.js',
// --- FIREBASE FUNKCE - Komunikace s databází     
'./firebaseLinksFunctions.js',
// --- DATA - Odkazy a obsah (MUSÍ být PŘED logikou!)        
'./links.js',
// --- LOGIKA - Moduly závislé na datech        
 
// --- LOGIKA - Moduly závislé na datech        
'./pagination.js',       
'./search.js',       
'./modal.js',
// ---  UI MODULY - Vizuální prvky a správa tapety      
'./Sprava-tapet-async.js',
'./fullscreen-manager.js',   
'./script.js',    
'./scrollbar.js',        
    ]
};

//stímto se bude pracovat 2===========
// ═══════════════════════════════════════════════════════════════════════════
// 🖖 EXPORT PRO SERVICE WORKER A MANIFEST
// ═══════════════════════════════════════════════════════════════════════════
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FLEET_CONFIG;
}

if (typeof window !== 'undefined') {
    window.FLEET_CONFIG = FLEET_CONFIG;
}

// ═══════════════════════════════════════════════════════════════════════════
// 📡 FLEET STATUS LOGGER
// ═══════════════════════════════════════════════════════════════════════════
console.log(
    `%c🖖 USS PROMETHEUS - Fleet Registry v${FLEET_CONFIG.version}`,
    'color: #00FF00; font-size: 16px; font-weight: bold; background: #000; padding: 10px; border: 2px solid #00FF00;'
);
console.log(
    `%c   Kódové jméno: ${FLEET_CONFIG.codename}`,
    'color: #00CCFF; font-size: 12px;'
);
console.log(
    `%c   Datum buildu: ${FLEET_CONFIG.buildDate}`,
    'color: #00CCFF; font-size: 12px;'
);
console.log(
    `%c   Registrované moduly: ${FLEET_CONFIG.modules.length}`,
    'color: #FFCC00; font-size: 12px;'
);
console.log(
    `%c   Status: Všechny systémy zelené! ✅`,
    'color: #00FF00; font-size: 12px; font-weight: bold;'
);
console.log(
    `%c   🛠️ NOUZOVÝ RESET ČÍTAČE – zadej do konzole prohlížeče kdykoli potřebuješ: localStorage.setItem('uss_prometheus_build', '0');  `,
    'color: #00FF00; font-size: 12px; font-weight: bold;'
);

console.log(
    `%c   Projekt běží na: https://jirka22med.github.io/star-trek-hudebni-prehravac-vylepsen-4-mobilni/ ✅`,
    'color: #00FF00; font-size: 12px; font-weight: bold;'
);


console.log(
    `%c🚀 [fleet-register] Načteno za ${(performance.now() - __FLEET_REGISTER_START).toFixed(2)} ms`,
    'background: #000; color: #00ff00; font-weight: bold; padding: 2px;'
);

// ═══════════════════════════════════════════════════════════════════════════
// 🛠️ NOUZOVÝ RESET ČÍTAČE – zadej do konzole prohlížeče kdykoli potřebuješ:
// localStorage.setItem('uss_prometheus_build', '0');
// ═══════════════════════════════════════════════════════════════════════════
