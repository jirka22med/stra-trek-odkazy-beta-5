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
        
        this.isOpen = false;
        
        // Inicializace
        this.init();
    }
    
    init() {
        this.close();
        
        if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
        
        if (this.backdrop) {
            this.backdrop.addEventListener('click', (e) => {
                if (e.target === this.backdrop) this.close();
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
    
    open(linkId, linkName, linkUrl) {
        if (!this.modal) return;
        
        // 🚀 Nejdřív načteme seznam stránek
        this.populatePageSelect();
        
        // Vyplní data
        this.modalLinkId.value = linkId;
        this.modalLinkName.value = linkName;
        this.modalLinkUrl.value = linkUrl;
        
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
        
        console.log('❌ Modal zavřen');
    }
    
    getData() {
        return {
            id: this.modalLinkId.value,
            name: this.modalLinkName.value.trim(),
            url: this.modalLinkUrl.value.trim(),
            // 🚀 NOVÉ: Vrátíme i vybranou stránku
            pageId: this.modalPageSelect ? this.modalPageSelect.value : null
        };
    }
    
    isValid() {
        const data = this.getData();
        return data.id && data.name && data.url;
    }
}

window.modalManager = new ModalManager();