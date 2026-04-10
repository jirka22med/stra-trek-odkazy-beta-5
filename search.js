// search.js - v2.0 OPTIMIZED - POUŽÍVÁ GLOBAL_CACHE
// 🚀 Žádné nové Firebase dotazy, jen lokální filtrování

class SearchManager {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.clearSearchButton = document.getElementById('clearSearchButton');
        this.searchCountElement = document.getElementById('searchCount');
        this.linksTableBody = document.getElementById('linksTableBody');
        
        this.currentSearchTerm = '';
        this.isSearching = false;
        
        // Debounce timer pro lepší výkon
        this.searchDebounceTimer = null;
        this.DEBOUNCE_DELAY = 300; // 300ms delay před vyhledáváním
        
        this.init();
    }
    
    init() {
        if (!this.searchInput || !this.clearSearchButton) {
            console.error("⚠️ Vyhledávací elementy nenalezeny!");
            return;
        }
        
        // 🚀 OPTIMALIZOVÁNO: Debounced vyhledávání
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchDebounceTimer);
            
            this.currentSearchTerm = e.target.value.trim();
            
            if (this.currentSearchTerm.length > 0) {
                // Čekáme 300ms po skončení psaní
                this.searchDebounceTimer = setTimeout(() => {
                    this.performGlobalSearch();
                }, this.DEBOUNCE_DELAY);
            } else {
                this.clearSearch();
            }
        });
        
        // Vymazání vyhledávání
        this.clearSearchButton.addEventListener('click', () => {
            this.clearSearch();
        });
        
        // ESC klávesa pro vymazání
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSearch();
            }
        });
        
        console.log("✅ Vyhledávací modul v2.0 (Optimized) inicializován");
    }
    
    // 🚀 OPTIMALIZOVÁNO: Používá GLOBAL_CACHE místo nového dotazu
    async performGlobalSearch() {
        this.isSearching = true;
        const searchTerm = this.currentSearchTerm.toLowerCase();
        const startTime = performance.now(); // ← PŘIDEJ
        console.log(`🔍 Vyhledávám: "${searchTerm}" (z GLOBAL_CACHE)`);
        
        // 🚀 KLÍČOVÁ ZMĚNA: Místo await window.getLinksFromFirestore()
        // používáme existující cache - ŽÁDNÝ nový Firebase dotaz!
        const allLinks = await window.getLinksFromFirestore(); // Vrátí cache okamžitě
        const allPages = await window.getPagesFromFirestore();  // Také z cache
        
        // Filtrování výsledků (lokálně v JS - super rychlé)
        const results = allLinks.filter(link => {
            const nameMatch = link.name.toLowerCase().includes(searchTerm);
            const urlMatch = link.url.toLowerCase().includes(searchTerm);
            return nameMatch || urlMatch;
        });

        // Vykreslení výsledků
        this.renderSearchResults(results, searchTerm, allPages);
    
        // ← PŘIDEJ
    if (window.trackSearch) {
        window.trackSearch(searchTerm, Math.round(performance.now() - startTime));
    }
}
    
    // Vykreslení tabulky s výsledky
    renderSearchResults(results, searchTerm, allPages) {
        if (!this.linksTableBody) return;
        
        this.linksTableBody.innerHTML = '';
        this.updateSearchCount(results.length);

        if (results.length === 0) {
            this.linksTableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #ffaa00; padding: 20px;">
                        ⚠️ Žádný záznam nenalezen pro: "<strong>${this.escapeHtml(searchTerm)}</strong>"
                    </td>
                </tr>`;
            return;
        }

        const fragment = document.createDocumentFragment();

        results.forEach((link, index) => {
            // Zjistíme název stránky, kam odkaz patří
            const sourcePage = allPages.find(p => p.id === link.pageId);
            const pageName = sourcePage ? sourcePage.name : "Nezařazeno";

            const row = document.createElement('tr');
            row.dataset.linkId = link.id;
            
            row.innerHTML = `
                <td style="color: #888;">${index + 1}</td>
                <td style="text-align: center;">
                    <div style="font-weight: bold; font-size: 1.1em;">${this.highlightText(link.name, searchTerm)}</div>
                    <div style="font-size: 0.8em; color: #FF7800; margin-top: 4px; opacity: 0.8;">
                        📂 Sekce: ${this.escapeHtml(pageName)}
                    </div>
                </td>
                <td><button class="url-button" data-url="${link.url}" title="${link.url}">Odkaz</button></td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-link-button" data-name="${link.name}" data-url="${link.url}">✏️</button>
                        <button class="delete-link-button">🗑️</button>
                    </div>
                </td>
            `;
            fragment.appendChild(row);
        });

        this.linksTableBody.appendChild(fragment);
    }
    
    // Zvýraznění hledaného textu (žlutě)
    highlightText(text, searchTerm) {
        if (!searchTerm) return this.escapeHtml(text);
        const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, 'gi');
        return this.escapeHtml(text).replace(regex, '<span style="background: rgba(255,255,0,0.3); color: #ffff00;">$1</span>');
    }

    // Vymazání hledání a návrat na aktuální stránku
    clearSearch() {
        clearTimeout(this.searchDebounceTimer);
        
        this.searchInput.value = '';
        this.currentSearchTerm = '';
        this.isSearching = false;
        
        // Vyčistíme počítadlo
        if (this.searchCountElement) this.searchCountElement.textContent = '0';
        
        console.log("🔄 Vyhledávání ukončeno, návrat na stránku.");
        
        // Zavoláme PaginationManager, aby obnovil původní zobrazení stránky
        if (window.paginationManager) {
            window.paginationManager.loadLinksForCurrentPage();
        }
    }
    
    updateSearchCount(count) {
        if (this.searchCountElement) {
            this.searchCountElement.textContent = count;
        }
    }
    
    escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    escapeRegex(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // Pomocná metoda pro refresh (pokud je potřeba zvenčí)
    refresh() {
        if (this.isSearching && this.currentSearchTerm) {
            this.performGlobalSearch();
        }
    }
}

// Globální instance
window.searchManager = null;

document.addEventListener('DOMContentLoaded', () => {
    window.searchManager = new SearchManager();
    console.log("🔍 Search Manager v2.0 aktivován");
});