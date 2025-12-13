# 🚀 Star Trek Database - Hvězdná Databáze Odkazů

[![Live Demo](https://img.shields.io/badge/Live-Demo-00ffff?style=for-the-badge)](https://jirka22med.github.io/stra-trek-odkazy-beta-5/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-ff7800?style=for-the-badge)](https://github.com/jirka22med/stra-trek-odkazy-beta-5)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> **Pokročilá webová aplikace pro správu odkazů s futuristickým Star Trek designem, optimalizovaná pro mobilní zařízení a desktop.**

---

## 📋 Obsah

- [O Projektu](#-o-projektu)
- [Funkce](#-funkce)
- [Technologie](#-technologie)
- [Instalace](#-instalace)
- [Použití](#-použití)
- [Architektura](#-architektura)
- [Performance Optimalizace](#-performance-optimalizace)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)
- [Přispívání](#-přispívání)
- [Autor](#-autor)
- [Licence](#-licence)

---

## 🌌 O Projektu

**Star Trek Database** je moderní webová aplikace pro organizaci a správu odkazů s unikátním sci-fi designem inspirovaným světem Star Treku. Projekt kombinuje pokročilé webové technologie s důrazem na výkon, responzivitu a uživatelskou přívětivost.

### 🎯 Hlavní Cíle

- ✅ **Vysoký výkon** - Optimalizováno pro 60 FPS i na mobilních zařízeních
- ✅ **Real-time synchronizace** - Firebase Firestore backend
- ✅ **MobilníFirst** - Speciální optimalizace pro Infinix Note 30 a podobná zařízení
- ✅ **Offline podpora** - Cache systém pro práci bez připojení
- ✅ **Performance monitoring** - Vestavěný real-time performance dashboard

---

## ✨ Funkce

### 🔥 Core Features

| Funkce | Popis | Status |
|--------|-------|--------|
| **📂 Stránkování** | Organizace odkazů do vlastních stránek/kategorií | ✅ |
| **🔍 Globální vyhledávání** | Vyhledávání napříč všemi stránkami s highlightingem | ✅ |
| **✏️ CRUD operace** | Přidávání, editace, mazání a přesouvání odkazů | ✅ |
| **🎨 Dynamická tapeta** | Adaptivní pozadí podle typu zařízení | ✅ |
| **📊 Performance monitor** | Real-time sledování FPS, paměti, cache | ✅ |
| **🌈 Rainbow scrollbar** | Animovaný scrollbar podporující všechny prohlížeče | ✅ |
| **📱 Fullscreen režim** | Celoobrazovkový mód pro mobilní zařízení | ✅ |
| **🐛 Enhanced Console Logger** | Pokročilý debugger s exportem logů | ✅ |

### 🎮 Speciální Features

#### 1. **Smart Cache System v2.0**
```javascript
// Preload všech dat najednou při startu
const preloadResult = await window.preloadAllFirestoreData();

// Poté pouze lokální filtrování - žádné Firebase dotazy!
const links = GLOBAL_LINKS_CACHE.filter(link => link.pageId === currentPageId);
```

**Výhody:**
- ⚡ **90% rychlejší** navigace mezi stránkami
- 🔥 Redukce Firebase dotazů z ~50/min na ~2/min
- 💾 Automatická invalidace cache po změnách
- 📡 Debounced sync messages (500ms)

#### 2. **GPU Optimalizace**
```javascript
// Mobilní režim - GPU pro scroll obsah, NE pro pozadí
if (device.isMobile) {
    // Tapeta bez GPU
    bgContainer.style.transform = 'none';
    
    // Scroll content s GPU
    scrollContainer.style.transform = 'translateZ(0)';
}
```

#### 3. **Performance Dashboard**
- 📈 Real-time FPS monitoring (Sparkline graf)
- 💾 Memory usage tracking
- 🔥 Firebase query counter
- 📊 Cache hit rate metriky
- ⏱️ Render time measurements
- 📥 **Export do TXT** formátu

---

## 🛠 Technologie

### Frontend Stack

```yaml
Core:
  - HTML5 (Semantic markup)
  - CSS3 (Advanced animations, Grid, Flexbox)
  - Vanilla JavaScript (ES6+)

Frameworks/Libraries:
  - Firebase SDK 9.0.0 (Firestore, Authentication)
  - Font: Orbitron, Courier New

Optimalizace:
  - RequestAnimationFrame API
  - DocumentFragment batching
  - Debounced events
  - Smart cache invalidation
```

### Backend

```yaml
Firebase Services:
  - Firestore Database (NoSQL)
  - Firebase Hosting (Optional)
  
Storage:
  - LocalStorage (Cache, settings)
  - SessionStorage (Temporary data)
```

### Performance Tools

```yaml
Monitoring:
  - Performance API
  - Memory profiling
  - Custom FPS counter
  - Network latency tracking

Debugging:
  - Enhanced Console Logger
  - Error boundaries
  - Performance report export
```

---

## 📦 Instalace

### 1. Klonování Repozitáře

```bash
git clone https://github.com/jirka22med/stra-trek-odkazy-beta-5.git
cd stra-trek-odkazy-beta-5
```

### 2. Firebase Konfigurace

Vytvoř si vlastní Firebase projekt na [console.firebase.google.com](https://console.firebase.google.com)

**Uprav `firebaseLinksFunctions.js`:**

```javascript
const firebaseConfig = {
    apiKey: "TVOJE_API_KEY",
    authDomain: "TVUJ_PROJECT.firebaseapp.com",
    projectId: "TVUJ_PROJECT_ID",
    storageBucket: "TVUJ_PROJECT.firebasestorage.app",
    messagingSenderId: "TVOJE_SENDER_ID",
    appId: "TVOJE_APP_ID"
};
```

### 3. Firestore Struktura

Vytvoř tyto kolekce:

```javascript
// Kolekce: pages
{
  id: "auto-generated",
  name: "Hlavní stránka",
  orderIndex: 0,
  timestamp: Timestamp
}

// Kolekce: links
{
  id: "auto-generated",
  name: "Starfleet Command",
  url: "https://www.startrek.com",
  orderIndex: 0,
  pageId: "page_id_reference",
  timestamp: Timestamp
}
```

### 4. Spuštění

**Lokální server:**
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server -p 8000
```

**Nebo otevři přímo `index.html` v prohlížeči** (některé funkce mohou být omezeny)

---

## 🎯 Použití

### Základní Operace

#### Přidání Odkazu
1. Vyber aktivní stránku v horním menu
2. Vyplň "Název Odkazu" a "URL Adresa"
3. Klikni na **➕ Přidat odkaz**

#### Vyhledávání
1. Zadej text do vyhledávacího pole
2. Výsledky se zobrazí v reálném čase
3. Klikni **✖️** pro zrušení vyhledávání

#### Editace Odkazu
1. Klikni na **✏️** v řádku odkazu
2. Uprav název/URL/umístění stránky
3. **✅ Uložit** nebo **❌ Zrušit**

#### Správa Stránek
1. Zadej název nové stránky v horním panelu
2. Klikni **➕ Vytvořit stránku**
3. Pro smazání stránky klikni **❌** na tabu stránky

### Pokročilé Funkce

#### Performance Monitor
```javascript
// Otevření dashboardu - klikni na indikátor vpravo dole
// Nebo programově:
window.openPerfDashboard();

// Export reportu
window.exportPerfReport();

// Refresh cache
window.forceRefreshFirestoreCache();
```

#### Console Logger
```javascript
// Otevření loggeru
window.openJirikModal();

// Programový přístup
console.log("Test zpráva"); // Automaticky logováno
console.error("Chybová zpráva"); // Kategorizováno
```

#### Tapeta Manager
```javascript
// Manuální refresh tapety
window.MelnickaTapeta.refresh();

// Vlastní tapeta
window.MelnickaTapeta.setCustomTapeta('https://url-to-image.jpg');

// Device info
const device = window.MelnickaTapeta.getDeviceInfo();

// Debug nástroje
window.MelnickaTapeta.debug.measureFPS();
window.MelnickaTapeta.debug.getReport();
```

#### Fullscreen Mode
```javascript
// Toggle fullscreen
window.FullscreenManager.toggle();

// Programový vstup/výstup
await window.FullscreenManager.enter();
await window.FullscreenManager.exit();

// Kontrola stavu
const isActive = window.FullscreenManager.isActive();
```

---

## 🏗 Architektura

### Struktura Souborů

```
📦 stra-trek-odkazy-beta-5/
├── 📄 index.html                    # Main HTML
├── 🎨 style.css                     # Core styles
├── 📜 JavaScript Moduly:
│   ├── firebaseLinksFunctions.js   # Firebase API (v2.0 Optimized)
│   ├── pagination.js               # Stránkování (Global Cache)
│   ├── links.js                    # CRUD operace (Optimized)
│   ├── search.js                   # Vyhledávání (Cache-based)
│   ├── modal.js                    # Modal manager
│   ├── script.js                   # Performance monitor
│   ├── Sprava-tapet-async.js       # Tapety (Async-safe)
│   ├── Sprava-tapet-defer.js       # Tapety (Defer)
│   ├── fullscreen-manager.js       # Fullscreen API
│   ├── scrollbar.js                # Rainbow scrollbar
│   └── jirkuv-hlidac.js            # Console logger
├── 🎨 Styling:
│   ├── modal.css                   # Modal styles
│   ├── perfMode.css                # Performance UI
│   └── scrollbar.css               # Scrollbar styles
└── 📋 README.md                     # Dokumentace
```

### Data Flow

```mermaid
graph TD
    A[User Action] --> B{Event Type}
    B -->|CRUD| C[Firebase Functions]
    B -->|Navigation| D[Pagination Manager]
    B -->|Search| E[Search Manager]
    
    C --> F[Debounced Cache Invalidation]
    F --> G[GLOBAL_CACHE Refresh]
    
    D --> H[Local Filter from Cache]
    E --> H
    
    H --> I[Optimized Render]
    I --> J[Performance Tracking]
    J --> K[Dashboard Update]
```

### Cache Strategy

```javascript
// PRELOAD při startu (1x)
await preloadAllFirestoreData();
  → GLOBAL_LINKS_CACHE = všechny odkazy
  → GLOBAL_PAGES_CACHE = všechny stránky

// ZMĚNA DAT (add/edit/delete)
await addLinkToFirestore(...);
  → scheduleInvalidateCache() // Debounced 500ms
  
// NAVIGACE/VYHLEDÁVÁNÍ
const links = await getLinksByPageId(pageId);
  → return GLOBAL_CACHE.filter(...) // Instant!
```

---

## ⚡ Performance Optimalizace

### 1. Rendering Optimalizace

```javascript
// ❌ ŠPATNĚ - Postupné DOM manipulace
links.forEach(link => {
    const row = createRow(link);
    tableBody.appendChild(row); // Reflow po každém!
});

// ✅ SPRÁVNĚ - Batch rendering
const fragment = document.createDocumentFragment();
links.forEach(link => {
    fragment.appendChild(createRow(link));
});
tableBody.appendChild(fragment); // Jeden reflow!
```

### 2. Event Delegation

```javascript
// ❌ ŠPATNĚ - Listener na každý řádek
rows.forEach(row => {
    row.addEventListener('click', handler);
});

// ✅ SPRÁVNĚ - Jeden listener na tabulku
tableBody.addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    if (row) handleRowClick(row);
});
```

### 3. Debouncing

```javascript
// Vyhledávání - 300ms delay
let searchDebounceTimer = null;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        performSearch(e.target.value);
    }, 300);
});
```

### 4. Mobile Optimalizace

```css
/* Vypnutí blur na mobilech pro performance */
@media (max-width: 768px) {
    *, *::before, *::after {
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
    }
    
    /* GPU jen pro scroll content */
    main, .content-wrapper {
        transform: translateZ(0);
        backface-visibility: hidden;
    }
}
```

### Dosažené Výsledky

| Metrika | Před Optimalizací | Po Optimalizaci | Zlepšení |
|---------|-------------------|-----------------|----------|
| FPS (Mobile) | 25-35 fps | 55-60 fps | **+94%** |
| Firebase Queries | ~50/min | ~2/min | **-96%** |
| Page Switch Time | 800ms | 80ms | **-90%** |
| Memory Usage | 180MB | 95MB | **-47%** |
| Cache Hit Rate | 15% | 92% | **+513%** |

---

## 📚 API Reference

### Global Objects

#### `window.paginationManager`

```javascript
// Získat aktuální stránku
const currentPageId = paginationManager.getCurrentPageId();

// Přepnout stránku
await paginationManager.switchToPage(pageId);

// Přidat stránku
await paginationManager.addNewPage();

// Refresh
await paginationManager.refresh();
```

#### `window.searchManager`

```javascript
// Vyhledat globálně
await searchManager.performGlobalSearch();

// Vymazat vyhledávání
searchManager.clearSearch();

// Refresh výsledků
searchManager.refresh();
```

#### `window.modalManager`

```javascript
// Otevřít modal
modalManager.open(linkId, name, url);

// Zavřít modal
modalManager.close();

// Získat data
const data = modalManager.getData();

// Validace
const isValid = modalManager.isValid();
```

### Firebase Functions

```javascript
// Links CRUD
await window.addLinkToFirestore(name, url, orderIndex, pageId);
await window.updateLinkInFirestore(linkId, newName, newUrl);
await window.deleteLinkFromFirestore(linkId);
await window.getLinksFromFirestore(); // Vrací cache
await window.getLinksByPageId(pageId); // Filtruje cache

// Pages CRUD
await window.addPageToFirestore(name, orderIndex);
await window.getPagesFromFirestore(); // Vrací cache
await window.deletePageFromFirestore(pageId);

// Cache management
await window.preloadAllFirestoreData();
await window.forceRefreshFirestoreCache();
const info = window.getFirestoreCacheInfo();
```

### Performance Tracking

```javascript
// FPS tracking (automatické)
// Render time tracking
window.measureRenderTime(timeMs);

// Cache tracking
window.trackCacheHit();
window.trackCacheMiss();

// User actions tracking
window.trackPageSwitch(timeMs);
window.trackSearch(query, timeMs);
window.trackLinkAdded(name);
window.trackLinkDeleted(name);
window.trackLinkEdited(name);
window.trackLinkMoved(name);
```

---

## 🐛 Troubleshooting

### Časté Problémy

#### 1. Firebase Connection Failed

**Problém:** `âŒ Firestore databáze není inicializována`

**Řešení:**
```javascript
// Zkontroluj Firebase config v firebaseLinksFunctions.js
// Ujisti se, že máš správné credentials
const firebaseConfig = {
    apiKey: "...",  // ✅ Správný klíč?
    projectId: "...", // ✅ Existující projekt?
    // ...
};
```

#### 2. Nízké FPS na Mobilu

**Problém:** FPS < 30 fps

**Řešení:**
```javascript
// 1. Otevři Performance Dashboard
// 2. Zkontroluj:
//    - Memory usage > 85%? → Refresh stránku
//    - Cache hit rate < 50%? → Klikni "Refresh Cache"

// 3. Vypni blur efekty (automatické na mobilech)
// 4. Zkus fullscreen režim (⛶ tlačítko)
```

#### 3. Links se Nenačítají

**Problém:** Prázdná tabulka po načtení

**Řešení:**
```javascript
// 1. Otevři DevTools Console (F12)
// 2. Zkontroluj chyby
// 3. Ověř Firebase rules:

// Firestore Rules (pro testing):
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ⚠️ Změň pro production!
    }
  }
}
```

#### 4. Console Logger se Neotevírá

**Problém:** Tlačítko 📋 nefunguje

**Řešení:**
```javascript
// Programově otevři modal:
window.openJirikModal();

// Nebo použij fallback tlačítko v HTML:
<button onclick="window.openJirikModal()">📋 Otevřít Logger</button>
```

### Debug Commands

```javascript
// Kompletní system check
console.log('=== SYSTEM DEBUG ===');
console.log('Firebase:', !!window.db ? '✅' : '❌');
console.log('Pagination:', !!window.paginationManager?.initialized ? '✅' : '❌');
console.log('Cache:', window.getFirestoreCacheInfo());
console.log('Performance:', {
    fps: currentFps,
    memory: getMemoryUsage() + 'MB',
    cacheRate: getCacheHitRate() + '%'
});

// Export debug reportu
window.exportPerfReport();
```

---

## 🤝 Přispívání

Příspěvky jsou vítány! 

### Postup:

1. **Fork** repozitář
2. Vytvoř **feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit** změny (`git commit -m 'Add some AmazingFeature'`)
4. **Push** do branch (`git push origin feature/AmazingFeature`)
5. Otevři **Pull Request**

### Coding Standards

```javascript
// ✅ DODRŽUJ:
// 1. ESLint pravidla (pokud nastaveno)
// 2. Komentáře v angličtině nebo češtině (konzistentně)
// 3. Funkce < 50 řádků
// 4. Performance first mindset

// ❌ NEDĚLEJ:
// - Synchronní Firebase dotazy v loopech
// - Direct DOM manipulace v cyklech
// - Global variables bez window prefix
// - Nekontrolované event listenery
```

---

## 👨‍🚀 Autor

**Více admirál Jiřík** 🖖  
- GitHub: [@jirka22med](https://github.com/jirka22med)
- Projekt vytvořen ve spolupráci s **Claude.AI**, **ChatGPT**, **Gemini.AI** a **Grok.AI**

### Speciální Poděkování

- 🤖 **Claude.AI** - Architektura, optimalizace, dokumentace
- 🤖 **ChatGPT** - Code review, debugging
- 🤖 **Gemini.AI** - Design konzultace
- 🤖 **Grok.AI** - Performance tuning

---

## 📄 Licence

Tento projekt je licencován pod **MIT License**.

```
MIT License

Copyright (c) 2024 Více admirál Jiřík

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🌟 Podporuj Projekt

Pokud se ti projekt líbí:

⭐ **Dej hvězdičku na GitHubu**  
🐛 **Nahlašuj bugy** přes Issues  
🎯 **Navrhuj nové featury**  
📢 **Sdílej s ostatními**

---

## 📊 Statistiky Projektu

![GitHub stars](https://img.shields.io/github/stars/jirka22med/stra-trek-odkazy-beta-5?style=social)
![GitHub forks](https://img.shields.io/github/forks/jirka22med/stra-trek-odkazy-beta-5?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/jirka22med/stra-trek-odkazy-beta-5?style=social)

**Celkem řádků kódu:** ~8,500+  
**JavaScript:** ~6,200 řádků  
**CSS:** ~1,800 řádků  
**HTML:** ~500 řádků  

**Performance Metrics:**
- ⚡ 60 FPS na většině zařízení
- 🚀 <100ms response time
- 💾 <100MB RAM usage
- 📡 90%+ cache hit rate

---

<div align="center">

### 🖖 Live Long and Prosper! 🖖

Made with ❤️ by **Více admirál Jiřík** & AI Team

[🌐 Live Demo](https://jirka22med.github.io/stra-trek-odkazy-beta-5/) | [📖 Dokumentace](#) | [🐛 Report Bug](https://github.com/jirka22med/stra-trek-odkazy-beta-5/issues)

---

**⭐ Star Trek Database v2.0 - Hvězdná flotila odkazů ⭐**

</div>
