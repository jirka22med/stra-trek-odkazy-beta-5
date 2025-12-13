// pagination.js - v2.0 OPTIMIZED - USES GLOBAL CACHE
// 🚀 PRELOAD při startu, pak jen lokální filtrování

class PaginationManager {
    constructor() {
        this.currentPageId = null;
        this.allPages = [];
        this.itemsPerPage = 10;
        
        // UI elementy
        this.tabsContainer = document.getElementById('pageTabs');
        this.addPageButton = document.getElementById('addPageButton');
        this.newPageNameInput = document.getElementById('newPageName');
        
        this.initialized = false;
        this.isLoading = false;
    }
    
    async init() {
        if (this.initialized) return;
        
        console.log("🚀 Inicializace Pagination Manageru v2.0...");
        
        // Zobrazíme loading stav
        this.showLoadingState();
        
        // 🛠️ Firebase init
        const dbReady = await window.initializeFirebaseLinksApp();
        
        if (!dbReady) {
            console.error("🛑 KRITICKÁ CHYBA: Nepodařilo se připojit k Firebase!");
            this.showErrorState("❌ Chyba připojení k databázi");
            return;
        }

        // 🚀 NOVÉ: PRELOAD všech dat najednou
        console.log("⚡ PRELOAD: Načítám všechna data najednou...");
        const preloadResult = await window.preloadAllFirestoreData();
        
        if (!preloadResult || preloadResult.pages.length === 0) {
            console.log("📄 Žádné stránky nenalezeny, vytvářím výchozí...");
            await window.addPageToFirestore('Hlavní stránka', 0);
            
            // Znovu načteme po vytvoření
            await window.preloadAllFirestoreData();
        }
        
        // Načteme stránky z GLOBAL_CACHE (už je tam)
        await this.loadPages();
        
        // Event listenery
        if (this.addPageButton) {
            this.addPageButton.addEventListener('click', () => this.addNewPage());
        }
        
        if (this.newPageNameInput) {
            this.newPageNameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.addNewPage();
                }
            });
        }
        
        this.initialized = true;
        console.log("✅ Pagination Manager v2.0 inicializován (PRELOAD dokončen)");
    }
    
    // 🚀 OPTIMALIZOVÁNO: Používá GLOBAL_PAGES_CACHE
    async loadPages() {
        // Získáme stránky z cache (rychlé)
        const pages = await window.getPagesFromFirestore();
        
        if (pages.length === 0) {
            this.allPages = [];
            this.renderTabs();
            return;
        }
        
        this.allPages = pages;
        
        // Nastavíme první stránku jako aktivní (pokud ještě není)
        if (this.allPages.length > 0 && !this.currentPageId) {
            this.currentPageId = this.allPages[0].id;
        }
        
        this.renderTabs();
        console.log(`✅ Načteno ${this.allPages.length} stránek (z cache)`);
    }
    
    // Vykreslení záložek stránek
    renderTabs() {
        if (!this.tabsContainer) return;
        
        this.tabsContainer.innerHTML = '';
        
        if (this.allPages.length === 0) {
            this.tabsContainer.innerHTML = '<div class="no-pages">🌌 Žádné stránky</div>';
            return;
        }
        
        const fragment = document.createDocumentFragment();
        
        this.allPages.forEach(page => {
            const tab = document.createElement('div');
            tab.className = 'page-tab';
            if (page.id === this.currentPageId) {
                tab.classList.add('active');
            }
            
            tab.innerHTML = `
                <span class="tab-name">${page.name}</span>
                <button class="tab-delete" title="Smazat stránku">❌</button>
            `;
            
            // Kliknutí na TAB
            tab.addEventListener('click', (e) => {
                if (e.target.classList.contains('tab-delete') || e.target.closest('.tab-delete')) {
                    return;
                }
                this.switchToPage(page.id);
            });
            
            // Mazání stránky
            const deleteBtn = tab.querySelector('.tab-delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deletePage(page.id, page.name);
                });
            }
            
            fragment.appendChild(tab);
        });
        
        this.tabsContainer.appendChild(fragment);
    }
    
    // 🚀 OPTIMALIZOVÁNO: Přepnutí bez DB dotazu
    async switchToPage(pageId) {
        if (this.currentPageId === pageId) return;
        const startTime = performance.now(); // ← PŘIDEJ
        console.log(`📄 Přepínám na stránku: ${pageId} (bez DB dotazu)`);
        this.currentPageId = pageId;
        
        // Překreslíme záložky
        this.renderTabs();
        
        // Načteme odkazy - už BEZ Firebase dotazu (používá getLinksByPageId s cache)
        await this.loadLinksForCurrentPage();
    // ← PŘIDEJ
    if (window.trackPageSwitch) {
        window.trackPageSwitch(Math.round(performance.now() - startTime));
    }
}
    
    // 🚀 OPTIMALIZOVÁNO: Filtruje z GLOBAL_CACHE
    async loadLinksForCurrentPage() {
        if (!this.currentPageId) return;
        
        console.log(`🔥 Načítám odkazy pro stránku: ${this.currentPageId} (z cache)`);
        
        // getLinksByPageId nyní filtruje z GLOBAL_CACHE - super rychlé!
        const links = await window.getLinksByPageId(this.currentPageId);
        
        // Zavoláme funkci z links.js pro vykreslení
        if (window.populateLinksTable) {
            window.populateLinksTable(links);
        }
        
        // Aktualizujeme vyhledávač
        if (window.searchManager) {
            window.searchManager.refresh();
        }
    }
    
    // Přidání nové stránky
    async addNewPage() {
        if (!this.newPageNameInput) return;
        
        const pageName = this.newPageNameInput.value.trim();
        
        if (!pageName) {
            alert('❌ Zadejte název stránky!');
            return;
        }
        
        console.log(`➕ Přidávám novou stránku: ${pageName}`);
        
        const newOrderIndex = this.allPages.length > 0 
            ? Math.max(...this.allPages.map(p => p.orderIndex)) + 1 
            : 0;
        
        const success = await window.addPageToFirestore(pageName, newOrderIndex);
        
        if (success) {
            this.newPageNameInput.value = '';
            
            // Počkáme na invalidaci cache a reload
            setTimeout(async () => {
                await this.loadPages();
                
                // Přepneme na novou stránku
                const newPage = this.allPages[this.allPages.length - 1];
                if (newPage) {
                    await this.switchToPage(newPage.id);
                }
            }, 600); // Čekáme na debounced invalidaci
        } else {
            alert('❌ Chyba při vytváření stránky!');
        }
    }
    
    // Smazání stránky
    async deletePage(pageId, pageName) {
        // Nelze smazat poslední stránku
        if (this.allPages.length <= 1) {
            alert('❌ Nelze smazat poslední stránku!');
            return;
        }
        
        const confirmed = confirm(`⚠️ Opravdu chcete smazat stránku "${pageName}"?\n\nVšechny odkazy na této stránce budou také smazány!`);
        
        if (!confirmed) return;
        
        console.log(`🗑️ Mažu stránku: ${pageId}`);
        
        // Smažeme všechny odkazy na této stránce
        const links = await window.getLinksByPageId(pageId);
        
        for (const link of links) {
            await window.deleteLinkFromFirestore(link.id);
        }
        
        // Smažeme stránku
        const success = await window.deletePageFromFirestore(pageId);
        
        if (success) {
            // Počkáme na invalidaci a reload
            setTimeout(async () => {
                await this.loadPages();
                
                // Pokud jsme smazali aktivní stránku, přepneme na první dostupnou
                if (this.currentPageId === pageId) {
                    if (this.allPages.length > 0) {
                        await this.switchToPage(this.allPages[0].id);
                    }
                }
            }, 600);
        } else {
            alert('❌ Chyba při mazání stránky!');
        }
    }
    
    // Getter pro aktuální stránku
    getCurrentPageId() {
        return this.currentPageId;
    }
    
    // Refresh po změnách
    async refresh() {
        await this.loadPages();
        if (this.currentPageId) {
            await this.loadLinksForCurrentPage();
        }
    }
    
    // 🚀 NOVÉ: Loading states
    showLoadingState() {
        if (this.tabsContainer) {
            this.tabsContainer.innerHTML = '<div class="page-tab-loading">⏳ Načítám stránky...</div>';
        }
    }
    
    showErrorState(message) {
        if (this.tabsContainer) {
            this.tabsContainer.innerHTML = `<div class="no-pages" style="color: red;">${message}</div>`;
        }
    }
}

// Globální instance
window.paginationManager = null;

// Inicializace po načtení DOM
document.addEventListener('DOMContentLoaded', async () => {
    window.paginationManager = new PaginationManager();
    await window.paginationManager.init();
    console.log("📄 Pagination systém v2.0 aktivován");
});