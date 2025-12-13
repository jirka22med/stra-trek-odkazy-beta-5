 # 🤝 Průvodce Přispíváním - Contributing Guide

> **Star Trek Database - Hvězdná Databáze Odkazů**

Děkujeme za zájem přispět do projektu! 🖖 Tento dokument ti pomůže zorientovat se v procesu přispívání.

---

## 📋 Obsah

- [Code of Conduct](#-code-of-conduct)
- [Jak můžu přispět?](#-jak-můžu-přispět)
- [Nastavení Vývojového Prostředí](#-nastavení-vývojového-prostředí)
- [Workflow pro Přispívání](#-workflow-pro-přispívání)
- [Coding Standards](#-coding-standards)
- [Commit Guidelines](#-commit-guidelines)
- [Pull Request Process](#-pull-request-process)
- [Testování](#-testování)
- [Dokumentace](#-dokumentace)

---

## 📜 Code of Conduct

### Naše Zásady

- ✅ **Respektuj ostatní** - Buď vstřícný a profesionální
- ✅ **Konstruktivní feedback** - Kritizuj kód, ne lidi
- ✅ **Otevřenost** - Buď otevřený novým nápadům
- ✅ **Spolupráce** - Pomáhej ostatním růst

### Nepřijatelné Chování

- ❌ Harašení, urážky, diskriminace
- ❌ Spamming nebo trolling
- ❌ Zveřejňování privátních informací
- ❌ Neprofesionální chování

**Hlášení problémů:** Kontaktuj správce projektu přes GitHub Issues.

---

## 🎯 Jak můžu přispět?

### 1. 🐛 Nahlášení Bugů

**Před nahlášením:**
- Zkontroluj, že bug už není nahlášený v [Issues](https://github.com/jirka22med/stra-trek-odkazy-beta-5/issues)
- Ověř, že problém existuje v nejnovější verzi

**Šablona pro Bug Report:**

```markdown
## 🐛 Popis Bugu
Stručný a jasný popis co se pokazilo.

## 🔄 Kroky k Reprodukci
1. Přejdi na '...'
2. Klikni na '...'
3. Scrolluj na '...'
4. Uvidíš chybu

## ✅ Očekávané Chování
Co mělo nastat?

## 📸 Screenshots
Pokud je to možné, přidej screenshoty.

## 🖥️ Prostředí
- OS: [např. Windows 10, macOS 13, Android 12]
- Prohlížeč: [např. Chrome 120, Firefox 121]
- Zařízení: [např. iPhone 14, Infinix Note 30, Desktop]
- Verze projektu: [např. v2.0]

## 📋 Dodatečný Kontext
Jakékoliv další informace o problému.

## 🔍 Console Logs
```javascript
// Vlož relevantní console logy zde
```
```

### 2. 💡 Návrhy Nových Funkcí

**Šablona pro Feature Request:**

```markdown
## 💡 Popis Funkce
Jasný popis nové funkce.

## 🎯 Problém, který řeší
Jaký problém tato funkce řeší?

## 💭 Navrhované Řešení
Jak by funkce měla fungovat?

## 🔄 Alternativy
Jaké alternativní řešení jsi zvažoval?

## 📊 Přínosy
- Zlepší výkon?
- Usnadní použití?
- Přidá novou funkcionalitu?
```

### 3. 📝 Zlepšení Dokumentace

- Opravy překlepů a gramatiky
- Vylepšení vysvětlení
- Přidání příkladů
- Překlad do jiných jazyků

### 4. 🎨 Design Contributions

- UI/UX vylepšení
- Ikonky a grafika
- Animace
- Barevné schéma

---

## 🛠 Nastavení Vývojového Prostředí

### Požadavky

```bash
# Základní nástroje
- Git 2.x+
- Moderní prohlížeč (Chrome 120+, Firefox 121+)
- Textový editor (VS Code doporučeno)
- Python 3.x nebo Node.js (pro lokální server)
```

### Instalace

```bash
# 1. Fork repozitář na GitHubu
# 2. Klonuj SVŮJ fork
git clone https://github.com/TVUJ-USERNAME/stra-trek-odkazy-beta-5.git
cd stra-trek-odkazy-beta-5

# 3. Přidaj upstream remote
git remote add upstream https://github.com/jirka22med/stra-trek-odkazy-beta-5.git

# 4. Ověř remotes
git remote -v
# Origin = tvůj fork
# Upstream = originální repo

# 5. Spusť lokální server
python -m http.server 8000
# Nebo
npx http-server -p 8000

# 6. Otevři v prohlížeči
# http://localhost:8000
```

### VS Code Extensions (Doporučené)

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "ritwickdey.liveserver",
    "eamodio.gitlens",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

---

## 🔄 Workflow pro Přispívání

### 1. Synchronizace s Upstream

```bash
# Před začátkem práce vždy aktualizuj
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

### 2. Vytvoření Feature Branch

```bash
# Pojmenování: feature/název nebo fix/název
git checkout -b feature/amazing-feature

# Příklady dobrých názvů:
# feature/fullscreen-mode
# fix/mobile-scrolling-bug
# docs/update-readme
# style/improve-button-animations
```

### 3. Práce na Kódu

```bash
# Pravidelně commituj
git add .
git commit -m "feat: Add fullscreen mode"

# Push do SVÉHO forku
git push origin feature/amazing-feature
```

### 4. Vytvoření Pull Requestu

1. Jdi na GitHub do svého forku
2. Klikni **"Compare & pull request"**
3. Vyplň PR template
4. Klikni **"Create pull request"**

---

## 📏 Coding Standards

### JavaScript Style Guide

```javascript
// ✅ DOBŘE

// 1. Používej const/let, NIKDY var
const API_URL = "https://api.example.com";
let currentUser = null;

// 2. Arrow funkce pro callbacks
links.forEach(link => {
    console.log(link.name);
});

// 3. Async/await místo callback hell
async function loadData() {
    try {
        const data = await fetchFromFirebase();
        return data;
    } catch (error) {
        console.error('Chyba:', error);
    }
}

// 4. Destrukturování objektů
const { name, url, pageId } = link;

// 5. Template literals
const message = `Odkaz "${name}" byl přidán`;

// 6. Komentáře nad funkcemi
/**
 * Načte odkazy pro konkrétní stránku
 * @param {string} pageId - ID stránky
 * @returns {Promise<Array>} - Pole odkazů
 */
async function loadLinksForPage(pageId) {
    // Implementace...
}

// 7. Error handling
try {
    await riskyOperation();
} catch (error) {
    console.error('Chyba v operaci:', error);
    showUserError('Něco se pokazilo');
}

// 8. DRY (Don't Repeat Yourself)
// ❌ ŠPATNĚ
function deleteLink1() { /* duplicated code */ }
function deleteLink2() { /* duplicated code */ }

// ✅ SPRÁVNĚ
function deleteLink(linkId) {
    // Universal function
}
```

### CSS Best Practices

```css
/* ✅ DOBŘE */

/* 1. BEM metodologie nebo jasné názvy */
.page-tab {}
.page-tab--active {}
.page-tab__delete-button {}

/* 2. Mobile-first přístup */
.container {
    padding: 10px; /* Mobile default */
}

@media (min-width: 768px) {
    .container {
        padding: 20px; /* Desktop override */
    }
}

/* 3. CSS Variables pro opakující se hodnoty */
:root {
    --color-primary: #00ffff;
    --color-secondary: #FF7800;
    --border-radius: 10px;
}

.button {
    background: var(--color-primary);
    border-radius: var(--border-radius);
}

/* 4. Komentáře pro sekce */
/* ====================================
   NAVIGATION STYLES
   ==================================== */

/* 5. Optimalizace pro performance */
.animated-element {
    will-change: transform; /* Hint pro GPU */
    transform: translateZ(0);
}
```

### HTML Best Practices

```html
<!-- ✅ DOBŘE -->

<!-- 1. Semantic HTML -->
<header>
    <nav>
        <ul>
            <li><a href="#home">Domů</a></li>
        </ul>
    </nav>
</header>

<main>
    <article>
        <h2>Nadpis článku</h2>
        <p>Obsah...</p>
    </article>
</main>

<footer>
    <p>&copy; 2024 Star Trek Database</p>
</footer>

<!-- 2. Accessibility -->
<button 
    id="myButton"
    aria-label="Přidat nový odkaz"
    title="Přidat nový odkaz">
    ➕
</button>

<!-- 3. Data attributes pro JS -->
<tr data-link-id="abc123" data-page-id="page1">
    <td>Obsah</td>
</tr>

<!-- 4. Optimalizace načítání -->
<script src="script.js" defer></script>
<script src="async-script.js" async></script>
```

### Performance Guidelines

```javascript
// ✅ OPTIMALIZOVANÉ

// 1. Batch DOM updates
const fragment = document.createDocumentFragment();
items.forEach(item => {
    fragment.appendChild(createItem(item));
});
container.appendChild(fragment); // Jeden reflow!

// 2. Debounce event handlers
let debounceTimer;
searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        performSearch(e.target.value);
    }, 300);
});

// 3. Event delegation
table.addEventListener('click', (e) => {
    const button = e.target.closest('.delete-button');
    if (button) handleDelete(button);
});

// 4. Cache DOM queries
const modal = document.getElementById('modal'); // Cache
// ❌ document.getElementById('modal') v každém volání

// 5. RequestAnimationFrame pro animace
function animate() {
    // Update pozice
    requestAnimationFrame(animate);
}
```

---

## 💬 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - Nová funkce
- `fix` - Oprava bugu
- `docs` - Změny v dokumentaci
- `style` - Formátování (ne CSS změny!)
- `refactor` - Refactoring kódu
- `perf` - Performance zlepšení
- `test` - Přidání testů
- `chore` - Maintenance (build, dependencies)

### Příklady

```bash
# ✅ DOBRÉ COMMITY

git commit -m "feat(search): Add global search with highlighting"

git commit -m "fix(mobile): Fix scrolling performance on Infinix Note 30"

git commit -m "docs: Update installation instructions in README"

git commit -m "perf(cache): Reduce Firebase queries by 90%"

git commit -m "style(buttons): Improve button hover animations"

git commit -m "refactor(modal): Simplify modal opening logic"

# ❌ ŠPATNÉ COMMITY
git commit -m "fixed stuff"
git commit -m "update"
git commit -m "asdfasdf"
git commit -m "WIP"
```

### Detailed Commit Body (Optional)

```bash
git commit -m "feat(fullscreen): Add fullscreen mode for mobile

Implemented fullscreen API wrapper with:
- Auto-detection of browser support
- Persistent state in localStorage
- Event listeners for orientation changes
- Fallback for unsupported browsers

Fixes #123
Closes #124"
```

---

## 🔍 Pull Request Process

### PR Checklist

Před odesláním PR zkontroluj:

- [ ] Kód je otestovaný a funguje
- [ ] Přidány/aktualizovány komentáře
- [ ] Dokumentace je aktuální
- [ ] Žádné console.log() v produkčním kódu
- [ ] Žádné merge konflikty
- [ ] Code review sám sobě (přečti si diff)
- [ ] Branch je aktuální s main

### PR Template

```markdown
## 📝 Popis
Stručný popis změn.

## 🎯 Typ Změny
- [ ] 🐛 Bug fix
- [ ] ✨ Nová funkce
- [ ] 📝 Dokumentace
- [ ] 🎨 UI/UX
- [ ] ⚡ Performance
- [ ] ♻️ Refactoring

## 🔗 Související Issue
Fixes #(issue_number)
Closes #(issue_number)

## 🧪 Jak jsem testoval?
1. Krok 1
2. Krok 2
3. Výsledek

## 📸 Screenshots (pokud relevantní)
![Before](url)
![After](url)

## ✅ Checklist
- [ ] Kód je otestovaný
- [ ] Dokumentace aktualizována
- [ ] Self-review proveden
- [ ] Žádné console.log()
- [ ] Žádné merge konflikty

## 💬 Dodatečné Poznámky
Další kontext o PR.
```

### Review Process

1. **Automatické Kontroly** (pokud nastavené)
   - Linting
   - Build test
   - Code quality checks

2. **Code Review**
   - Maintainer zkontroluje kód
   - Může požádat o změny
   - Diskuze v komentářích

3. **Schválení & Merge**
   - Po schválení bude PR mergnuto
   - Branch bude smazaný

---

## 🧪 Testování

### Manuální Testování

**Před odesláním PR otestuj:**

```bash
# 1. Desktop prohlížeče
- Chrome (nejnovější)
- Firefox (nejnovější)
- Safari (pokud máš Mac)
- Edge (nejnovější)

# 2. Mobile zařízení
- Android Chrome
- iOS Safari
- Opera Mobile

# 3. Různé rozlišení
- Desktop: 1920x1080, 1366x768
- Tablet: 1024x768
- Mobile: 375x667, 414x896

# 4. Funkcionality
- ✅ Přidávání odkazů
- ✅ Editace odkazů
- ✅ Mazání odkazů
- ✅ Vyhledávání
- ✅ Stránkování
- ✅ Fullscreen režim
- ✅ Performance monitor
```

### Performance Testování

```javascript
// Otevři Performance Dashboard
// Zkontroluj:

// 1. FPS
// ✅ Desktop: 60 FPS
// ✅ Mobile: 55+ FPS

// 2. Memory
// ✅ < 100MB normal usage
// ✅ < 150MB po dlouhém používání

// 3. Cache Hit Rate
// ✅ > 85% po warm-up

// 4. Render Time
// ✅ < 100ms průměr
```

### Debug Checklist

```javascript
// Před PR zkontroluj Console:

// ❌ ZAKÁZÁNO v produkci:
console.log("debug info");
console.warn("temp warning");
debugger;

// ✅ POVOLENO:
console.error("Critical error:", error);
// V error handlerech

// ✅ POVOLENO s podmínkou:
if (CONFIG.debug) {
    console.log("Debug mode active");
}
```

---

## 📚 Dokumentace

### Kdy Aktualizovat Docs

- ✅ Nová funkce → Přidej do README
- ✅ API změna → Aktualizuj API Reference
- ✅ Bug fix → Přidej do CHANGELOG
- ✅ Breaking change → Zdůrazni v README + CHANGELOG

### Dokumentační Standardy

```javascript
/**
 * JSDoc komentáře pro funkce
 * 
 * @param {string} linkId - Jedinečné ID odkazu
 * @param {Object} updates - Objekt s aktualizacemi
 * @param {string} updates.name - Nový název
 * @param {string} updates.url - Nová URL
 * @returns {Promise<boolean>} - True pokud úspěšné
 * @throws {Error} - Pokud linkId neexistuje
 * 
 * @example
 * await updateLink('abc123', {
 *     name: 'Nový název',
 *     url: 'https://new-url.com'
 * });
 */
async function updateLink(linkId, updates) {
    // Implementace...
}
```

---

## 🎓 Užitečné Zdroje

### Dokumentace
- [MDN Web Docs](https://developer.mozilla.org/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Git Documentation](https://git-scm.com/doc)

### Tutoriály
- [JavaScript.info](https://javascript.info/)
- [CSS-Tricks](https://css-tricks.com/)
- [Web.dev](https://web.dev/)

### Tools
- [Can I Use](https://caniuse.com/) - Browser compatibility
- [BundlePhobia](https://bundlephobia.com/) - Package size
- [PageSpeed Insights](https://pagespeed.web.dev/) - Performance

---

## 💖 Poděkování

Děkujeme všem přispěvatelům za jejich čas a úsilí! 🖖

Každý příspěvek, ať už malý nebo velký, pomáhá projektu růst.

**Live Long and Prosper!** 🚀

---

## 📞 Kontakt

- **GitHub Issues:** [Nahlásit problém](https://github.com/jirka22med/stra-trek-odkazy-beta-5/issues)
- **Discussions:** [Diskuze](https://github.com/jirka22med/stra-trek-odkazy-beta-5/discussions)

---

<div align="center">

**Made with ❤️ by Star Trek Database Community**

[⬅️ Zpět na README](README.md)

</div>