// MODAL SYSTEM - S PODPOROU PŘESUNU MEZI STRÁNKAMI

class ModalManager {
    constructor() {
        this.modal = document.getElementById('editLinkModal');
        this.backdrop = this.modal;
        this.content = this.modal.querySelector('.modal-content');
        this.closeBtn = document.getElementById('cancelEditButton');
        this.saveBtn = document.getElementById('saveEditButton');
        
        this.modalLinkId = document.getElementById('modalLinkId');
        this.modalLinkName = document.getElementById('modalLinkName');
        this.modalLinkUrl = document.getElementById('modalLinkUrl');
        
        // 🚀 NOVÉ: Reference na select menu
        this.modalPageSelect = document.getElementById('modalPageSelect');
        
        // 📍 NOVÉ: Reference na pole pro pozici
        this.modalLinkPosition = document.getElementById('modalLinkPosition');
        
        this.isOpen = false;
        
        // Inicializace
        this.init();
    }
    
    init() {
        this.close();
        
        if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
        
        if (this.backdrop) {
            // 🛡️ FIX: Sledujeme kde mousedown začal
            // Modal se zavře POUZE pokud mousedown I click proběhly na backdrop
            // (ne pokud uživatel táhl výběr textu z inputu ven)
            let mousedownOnBackdrop = false;

            this.backdrop.addEventListener('mousedown', (e) => {
                mousedownOnBackdrop = (e.target === this.backdrop);
            });

            this.backdrop.addEventListener('click', (e) => {
                if (e.target === this.backdrop && mousedownOnBackdrop) {
                    this.close();
                }
                mousedownOnBackdrop = false;
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.close();
        });
    }
    
    // 🚀 NOVÁ FUNKCE: Načtení stránek do selectu
    populatePageSelect() {
        if (!this.modalPageSelect || !window.paginationManager) return;
        
        // Vyčistit staré možnosti
        this.modalPageSelect.innerHTML = '';
        
        const pages = window.paginationManager.allPages;
        const currentPageId = window.paginationManager.getCurrentPageId();
        
        pages.forEach(page => {
            const option = document.createElement('option');
            option.value = page.id;
            option.textContent = page.name;
            
            // Označíme aktuální stránku
            if (page.id === currentPageId) {
                option.selected = true;
                option.textContent += " (Aktuální)";
            }
            
            this.modalPageSelect.appendChild(option);
        });
    }
    
    open(linkId, linkName, linkUrl, currentPosition, maxPosition) {
        if (!this.modal) return;
        
        // 🚀 Nejdřív načteme seznam stránek
        this.populatePageSelect();
        
        // Vyplní data
        this.modalLinkId.value = linkId;
        this.modalLinkName.value = linkName;
        this.modalLinkUrl.value = linkUrl;
        
        // 📍 NOVÉ: Nastavení pole pro pozici
        if (this.modalLinkPosition) {
            this.modalLinkPosition.value = currentPosition || '';
            this.modalLinkPosition.max = maxPosition || 9999;
            this.modalLinkPosition.placeholder = `Aktuální pozice: ${currentPosition || '--'} (max: ${maxPosition || '--'})`;
        }
        
        this.modal.classList.add('active');
        this.isOpen = true;
        this.modalLinkName.focus();
        
        console.log('✅ Modal otevřen');
    }
    
    close() {
        if (!this.modal) return;
        this.modal.classList.remove('active');
        this.isOpen = false;
        
        // Vymazání dat
        this.modalLinkId.value = '';
        this.modalLinkName.value = '';
        this.modalLinkUrl.value = '';
        if (this.modalPageSelect) this.modalPageSelect.innerHTML = '';
        if (this.modalLinkPosition) {
            this.modalLinkPosition.value = '';
            this.modalLinkPosition.placeholder = 'Aktuální pozice: --';
        }
        
        console.log('❌ Modal zavřen');
    }
    
    getData() {
        return {
            id: this.modalLinkId.value,
            name: this.modalLinkName.value.trim(),
            url: this.modalLinkUrl.value.trim(),
            // 🚀 NOVÉ: Vrátíme i vybranou stránku
            pageId: this.modalPageSelect ? this.modalPageSelect.value : null,
            // 📍 NOVÉ: Cílová pozice (řádek)
            targetPosition: this.modalLinkPosition ? parseInt(this.modalLinkPosition.value) || null : null
        };
    }
    
    isValid() {
        const data = this.getData();
        return data.id && data.name && data.url;
    }
}

window.modalManager = new ModalManager();