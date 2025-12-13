// firebaseLinksFunctions.js - v2.0 OPTIMIZED FOR MOBILE
// 🚀 PERFORMANCE MODE: Minimální Firebase dotazy, maximální cache

const firebaseConfig = {
    apiKey: "AIzaSyBdsU71bo-BBUNinMctWM73jX8fX7mXz60",
    authDomain: "star-trek-odkazy.firebaseapp.com",
    projectId: "star-trek-odkazy",
    storageBucket: "star-trek-odkazy.firebasestorage.app",
    messagingSenderId: "1009898907428",
    appId: "1:1009898907428:web:07297e8b8d76ff2654b5b1"
};

let app = null;
let db = null;

// ========================================
// 🚀 NOVÝ CACHE SYSTÉM - 3 ÚROVNĚ
// ========================================

// GLOBAL CACHE - všechny odkazy najednou (načte se 1x při startu)
let GLOBAL_LINKS_CACHE = null;
let GLOBAL_LINKS_TIMESTAMP = 0;

// PAGES CACHE
let GLOBAL_PAGES_CACHE = null;
let GLOBAL_PAGES_TIMESTAMP = 0;

// KONFIGURACE
const CACHE_CONFIG = {
    LINKS_DURATION: 60000,      // 60 sekund
    PAGES_DURATION: 120000,     // 2 minuty (stránky se mění ještě méně)
    INVALIDATE_DEBOUNCE: 500    // Čeká 500ms před invalidací
};

// Debounce timer pro invalidaci
let invalidateTimer = null;

// ========================================
// INICIALIZACE FIREBASE
// ========================================

window.initializeFirebaseLinksApp = async function() {
    console.log("🚀 Firebase inicializace (OPTIMIZED v2.0)...");
    try {
        if (typeof firebase === 'undefined' || !firebase.initializeApp) {
            console.error("❌ Firebase SDK není načteno!");
            return false;
        }

        if (!app) {
            app = firebase.initializeApp(firebaseConfig, "linksApp");
            console.log("✅ Firebase aplikace inicializována");
        }

        if (!db) {
            if (typeof firebase.firestore === 'undefined') {
                console.error("❌ Firestore SDK není načteno!");
                return false;
            }
            db = firebase.firestore(app);
            console.log("✅ Firestore databáze připravena");

            // Offline persistence pouze na desktopu
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (!isMobile) {
                try {
                    await db.enablePersistence();
                    console.log("✅ Offline persistence povolena");
                } catch (err) {
                    console.warn("⚠️ Offline persistence nelze aktivovat:", err.code);
                }
            } else {
                console.log("📱 Mobile detekován - offline persistence přeskočena");
            }
        }

        return true;
    } catch (error) {
        console.error("❌ Chyba při inicializaci Firebase:", error);
        return false;
    }
};

// ========================================
// 🚀 NOVÁ FUNKCE: PRELOAD ALL DATA
// ========================================

window.preloadAllFirestoreData = async function() {
    console.log("⚡ PRELOAD: Načítám VŠE najednou...");
    
    if (!db) {
        console.error("❌ DB není inicializována");
        return { links: [], pages: [] };
    }

    try {
        // Paralelní načtení links + pages (rychlejší než sekvenčně)
        const [linksSnapshot, pagesSnapshot] = await Promise.all([
            db.collection('links').orderBy('orderIndex', 'asc').get(),
            db.collection('pages').orderBy('orderIndex', 'asc').get()
        ]);

        // Zpracování links
        GLOBAL_LINKS_CACHE = linksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        GLOBAL_LINKS_TIMESTAMP = Date.now();

        // Zpracování pages
        GLOBAL_PAGES_CACHE = pagesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        GLOBAL_PAGES_TIMESTAMP = Date.now();

        console.log(`✅ PRELOAD HOTOVO: ${GLOBAL_LINKS_CACHE.length} odkazů, ${GLOBAL_PAGES_CACHE.length} stránek`);
        
        return {
            links: GLOBAL_LINKS_CACHE,
            pages: GLOBAL_PAGES_CACHE
        };
    } catch (error) {
        console.error("❌ Chyba při preload:", error);
        return { links: [], pages: [] };
    }
};

// ========================================
// 🚀 INTELIGENTNÍ INVALIDACE CACHE
// ========================================

function scheduleInvalidateCache() {
    clearTimeout(invalidateTimer);
    
    invalidateTimer = setTimeout(() => {
        console.log("🔄 Cache invalidována (debounced)");
        GLOBAL_LINKS_CACHE = null;
        GLOBAL_PAGES_CACHE = null;
    }, CACHE_CONFIG.INVALIDATE_DEBOUNCE);
}

// ========================================
// ODKAZY - CRUD OPERACE
// ========================================

window.addLinkToFirestore = async function(linkName, linkUrl, orderIndex, pageId) {
    if (!db) {
        console.error("❌ Firestore databáze není inicializována");
        return false;
    }
    try {
        await db.collection('links').add({
            name: linkName,
            url: linkUrl,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            orderIndex: orderIndex,
            pageId: pageId || null
        });
        console.log(`✅ Odkaz "${linkName}" přidán na stránku ${pageId}`);
        scheduleInvalidateCache(); // Debounced invalidace
        return true;
    } catch (error) {
        console.error("❌ Chyba při přidávání odkazu:", error);
        return false;
    }
};

// 🚀 OPTIMALIZOVÁNO: Používá GLOBAL_CACHE
window.getLinksFromFirestore = async function() {
    if (!db) {
        console.error("❌ Firestore databáze není inicializována");
        return [];
    }

    const now = Date.now();
    
    // Pokud máme čerstvý cache, vraťme ho
    if (GLOBAL_LINKS_CACHE && (now - GLOBAL_LINKS_TIMESTAMP) < CACHE_CONFIG.LINKS_DURATION) {
        console.log("⚡ Vracím GLOBAL_LINKS_CACHE (bez API volání)");
        return GLOBAL_LINKS_CACHE;
    }

    // Jinak znovu načteme
    console.log("🔄 Cache expirovala, načítám z Firebase...");
    try {
        const snapshot = await db.collection('links')
            .orderBy('orderIndex', 'asc')
            .get();
        
        GLOBAL_LINKS_CACHE = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        GLOBAL_LINKS_TIMESTAMP = now;
        console.log(`✅ Načteno ${GLOBAL_LINKS_CACHE.length} odkazů z Firestore`);
        return GLOBAL_LINKS_CACHE;
    } catch (error) {
        console.error("❌ Chyba při načítání odkazů:", error);
        return GLOBAL_LINKS_CACHE || [];
    }
};

window.deleteLinkFromFirestore = async function(linkId) {
    if (!db) {
        console.error("❌ Firestore databáze není inicializována");
        return false;
    }
    try {
        await db.collection('links').doc(linkId).delete();
        console.log(`✅ Odkaz smazán: ${linkId}`);
        scheduleInvalidateCache();
        return true;
    } catch (error) {
        console.error("❌ Chyba při mazání odkazu:", error);
        return false;
    }
};

window.updateLinkInFirestore = async function(linkId, newName, newUrl) {
    if (!db) {
        console.error("❌ Firestore databáze není inicializována");
        return false;
    }
    try {
        await db.collection('links').doc(linkId).update({
            name: newName,
            url: newUrl,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Odkaz aktualizován: ${linkId}`);
        scheduleInvalidateCache();
        return true;
    } catch (error) {
        console.error("❌ Chyba při aktualizaci odkazu:", error);
        return false;
    }
};

window.updateLinkOrderInFirestore = async function(link1Id, link1OrderIndex, link2Id, link2OrderIndex) {
    if (!db) {
        console.error("❌ Firestore databáze není inicializována");
        return false;
    }
    
    const batch = db.batch();
    const link1Ref = db.collection('links').doc(link1Id);
    const link2Ref = db.collection('links').doc(link2Id);

    batch.update(link1Ref, { orderIndex: link2OrderIndex });
    batch.update(link2Ref, { orderIndex: link1OrderIndex });

    try {
        await batch.commit();
        console.log(`✅ Pořadí odkazů prohozeno`);
        scheduleInvalidateCache();
        return true;
    } catch (error) {
        console.error("❌ Chyba při prohazování pořadí:", error);
        return false;
    }
};

// ========================================
// 🚀 KLÍČOVÁ FUNKCE: Načtení odkazů pro stránku
// OPTIMALIZACE: Filtruje z GLOBAL_CACHE místo dotazu do DB
// ========================================

window.getLinksByPageId = async function(pageId) {
    console.log(`⚡ getLinksByPageId(${pageId}) - používám GLOBAL_CACHE`);
    
    // Ujistíme se, že máme načtená data
    if (!GLOBAL_LINKS_CACHE) {
        console.log("🔄 Global cache není, načítám...");
        await window.getLinksFromFirestore();
    }

    // Filtrujeme lokálně - MNOHEM rychlejší než Firebase dotaz
    const links = GLOBAL_LINKS_CACHE.filter(link => link.pageId === pageId);
    
    console.log(`✅ Nalezeno ${links.length} odkazů pro stránku ${pageId} (lokální filter)`);
    return links;
};

window.moveLinkToPage = async function(linkId, newPageId) {
    if (!db) {
        console.error("❌ Firestore databáze není inicializována");
        return false;
    }
    try {
        await db.collection('links').doc(linkId).update({
            pageId: newPageId,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Odkaz přesunut na stránku: ${newPageId}`);
        scheduleInvalidateCache();
        return true;
    } catch (error) {
        console.error("❌ Chyba při přesunu odkazu:", error);
        return false;
    }
};

// ========================================
// STRÁNKY - CRUD OPERACE
// ========================================

window.addPageToFirestore = async function(pageName, orderIndex) {
    if (!db) {
        console.error("❌ Firestore databáze není inicializována");
        return false;
    }
    try {
        await db.collection('pages').add({
            name: pageName,
            orderIndex: orderIndex,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Stránka "${pageName}" přidána`);
        scheduleInvalidateCache();
        return true;
    } catch (error) {
        console.error("❌ Chyba při přidávání stránky:", error);
        return false;
    }
};

// 🚀 OPTIMALIZOVÁNO: Používá GLOBAL_PAGES_CACHE
window.getPagesFromFirestore = async function() {
    if (!db) {
        console.error("❌ Firestore databáze není inicializována");
        return [];
    }

    const now = Date.now();
    
    if (GLOBAL_PAGES_CACHE && (now - GLOBAL_PAGES_TIMESTAMP) < CACHE_CONFIG.PAGES_DURATION) {
        console.log("⚡ Vracím GLOBAL_PAGES_CACHE (bez API volání)");
        return GLOBAL_PAGES_CACHE;
    }

    console.log("🔄 Pages cache expirovala, načítám z Firebase...");
    try {
        const snapshot = await db.collection('pages')
            .orderBy('orderIndex', 'asc')
            .get();
        
        GLOBAL_PAGES_CACHE = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        GLOBAL_PAGES_TIMESTAMP = now;
        console.log(`✅ Načteno ${GLOBAL_PAGES_CACHE.length} stránek`);
        return GLOBAL_PAGES_CACHE;
    } catch (error) {
        console.error("❌ Chyba při načítání stránek:", error);
        return GLOBAL_PAGES_CACHE || [];
    }
};

window.deletePageFromFirestore = async function(pageId) {
    if (!db) {
        console.error("❌ Firestore databáze není inicializována");
        return false;
    }
    try {
        await db.collection('pages').doc(pageId).delete();
        console.log(`✅ Stránka smazána: ${pageId}`);
        scheduleInvalidateCache();
        return true;
    } catch (error) {
        console.error("❌ Chyba při mazání stránky:", error);
        return false;
    }
};

window.updatePageInFirestore = async function(pageId, newName) {
    if (!db) {
        console.error("❌ Firestore databáze není inicializována");
        return false;
    }
    try {
        await db.collection('pages').doc(pageId).update({
            name: newName,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Stránka aktualizována: ${pageId}`);
        scheduleInvalidateCache();
        return true;
    } catch (error) {
        console.error("❌ Chyba při aktualizaci stránky:", error);
        return false;
    }
};

// ========================================
// 🚀 NOVÁ UTILITY FUNKCE
// ========================================

// Force refresh cache (použitelné pro manuální refresh tlačítko)
window.forceRefreshFirestoreCache = async function() {
    console.log("🔄 FORCE REFRESH cache...");
    GLOBAL_LINKS_CACHE = null;
    GLOBAL_PAGES_CACHE = null;
    await window.preloadAllFirestoreData();
    console.log("✅ Cache kompletně obnovena");
};

// Debug info
window.getFirestoreCacheInfo = function() {
    return {
        links: {
            cached: !!GLOBAL_LINKS_CACHE,
            count: GLOBAL_LINKS_CACHE?.length || 0,
            age: GLOBAL_LINKS_TIMESTAMP ? Date.now() - GLOBAL_LINKS_TIMESTAMP : null
        },
        pages: {
            cached: !!GLOBAL_PAGES_CACHE,
            count: GLOBAL_PAGES_CACHE?.length || 0,
            age: GLOBAL_PAGES_TIMESTAMP ? Date.now() - GLOBAL_PAGES_TIMESTAMP : null
        },
        config: CACHE_CONFIG
    };
};