# ♿ Guide des Bonnes Pratiques d'Accessibilité - Woorkly

## 🎯 Principes WCAG 2.1 (AA)

Pour chaque composant, respecter ces 4 principes:

1. **Perceptible** — L'info est accessible à tous (pas seulement visuellement)
2. **Utilisable** — Navigation au clavier, lecteur d'écran, etc.
3. **Compréhensible** — Texte clair, labels explicites
4. **Robuste** — Compatible avec technologies d'assistance

---

## 📋 Checklist par type d'élément

### ✅ Boutons & Actions

```jsx
// ✅ BON
<button 
  onClick={handleClick}
  aria-label="Fermer le menu"
>
  Fermer
</button>

// ❌ MAUVAIS
<div onClick={handleClick} style={{cursor:'pointer'}}>
  Fermer
</div>

// ❌ MAUVAIS (icône seule sans label)
<button>
  <svg>...</svg>
</button>

// ✅ BON (icône avec label)
<button aria-label="Fermer">
  <svg aria-hidden="true">
    <path d="..." />
  </svg>
</button>
```

**Checklist:**
- [ ] Utiliser `<button>` plutôt que `<div onClick>`
- [ ] Ajouter `aria-label` si le texte n'est pas assez explicite
- [ ] Icône seule? Ajouter `aria-label` au bouton
- [ ] État du bouton? Utiliser `aria-pressed`, `aria-expanded`, etc.

---

### ✅ Formulaires & Inputs

```jsx
// ✅ BON
<label htmlFor="email">Votre email</label>
<input 
  id="email"
  type="email"
  placeholder="exemple@email.com"
  aria-label="Adresse email"
/>

// ❌ MAUVAIS (pas de label)
<input type="email" placeholder="Votre email" />

// ❌ MAUVAIS (label pas associée)
<label>Email:</label>
<input type="email" />

// ✅ BON (label implicite)
<label>
  Email:
  <input type="email" />
</label>

// ✅ BON (textarea avec label)
<label htmlFor="message">Message</label>
<textarea 
  id="message"
  aria-label="Votre message"
  required
  aria-required="true"
/>
```

**Checklist:**
- [ ] `<label>` associée à chaque input (via `htmlFor`)
- [ ] `aria-label` si le label n'est pas visible
- [ ] Placeholder ≠ label (ne disparaît pas au clic)
- [ ] Input required? Ajouter `aria-required="true"`
- [ ] Erreur de validation? Ajouter `aria-invalid="true"` + message d'erreur

---

### ✅ Images & SVG

```jsx
// ✅ BON (image avec alt descriptif)
<img 
  src="/avatar.jpg" 
  alt="Avatar de John Doe" 
/>

// ❌ MAUVAIS (alt vide ou générique)
<img src="/avatar.jpg" alt="image" />

// ✅ BON (SVG icon avec description)
<svg aria-label="Accueil">
  <title>Aller à l'accueil</title>
  <path d="..." />
</svg>

// ✅ BON (SVG icon cachée du lecteur d'écran)
<button>
  <svg aria-hidden="true">
    <path d="..." />
  </svg>
  Accueil
</button>

// ❌ MAUVAIS (SVG sans description)
<svg>
  <path d="M10 20 L 30 40" />
</svg>
```

**Checklist:**
- [ ] Alt text décriptif (qui? quoi? où? contexte)
- [ ] SVG seule? Ajouter `aria-label` ou `<title>`
- [ ] SVG + texte? Utiliser `aria-hidden="true"` sur l'SVG
- [ ] Icone purement décorative? Utiliser `aria-hidden="true"`

---

### ✅ Listes & Navigation

```jsx
// ✅ BON (listes sémantiques)
<nav>
  <ul>
    <li><Link to="/home">Accueil</Link></li>
    <li><Link to="/about">À propos</Link></li>
  </ul>
</nav>

// ✅ BON (menu avec aria-label)
<nav aria-label="Navigation principale">
  <ul>
    <li><Link to="/home">Accueil</Link></li>
  </ul>
</nav>

// ✅ BON (item active)
<li>
  <Link 
    to="/about" 
    aria-current={pathname === '/about' ? 'page' : undefined}
  >
    À propos
  </Link>
</li>

// ❌ MAUVAIS (div au lieu de nav/ul)
<div className="menu">
  <div><Link to="/home">Accueil</Link></div>
  <div><Link to="/about">À propos</Link></div>
</div>
```

**Checklist:**
- [ ] `<nav>` pour les sections de navigation
- [ ] `<ul>`, `<ol>`, `<li>` pour les listes
- [ ] `aria-label` si plusieurs `<nav>` sur la page
- [ ] Page active? Utiliser `aria-current="page"`

---

### ✅ Headers & Landmarks

```jsx
// ✅ BON (structure sémantique)
<div>
  <header>
    <nav>Navigation</nav>
  </header>
  <main>
    <section>
      <h1>Titre principal</h1>
      <article>Contenu</article>
    </section>
  </main>
  <footer>Pied de page</footer>
</div>

// ❌ MAUVAIS (div pour tout)
<div>
  <div class="header">Navigation</div>
  <div class="main">
    <div class="section">
      <h1>Titre</h1>
      Contenu
    </div>
  </div>
  <div class="footer">Pied de page</div>
</div>

// ✅ BON (heading hierarchy)
<h1>Titre principal</h1>     {/* 1 seul <h1> par page */}
<h2>Section importante</h2>
<h3>Sous-section</h3>
<h4>Détail</h4>

// ❌ MAUVAIS (hierarchy brisée)
<h1>Titre</h1>
<h3>Saut directement à h3</h3>  {/* h2 manquant! */}
<h2>Retour à h2</h2>
```

**Checklist:**
- [ ] Un `<h1>` par page
- [ ] Hierarchy h1 → h2 → h3 (pas de sauts)
- [ ] `<header>`, `<main>`, `<footer>`, `<section>`, `<article>` pour structure
- [ ] Pas de `<div>` pour remplacer balises sémantiques

---

### ✅ Couleurs & Contraste

```jsx
// ✅ BON (contraste suffisant)
<button style={{ color: '#000', backgroundColor: '#fff' }}>
  Contraste 21:1 ✅
</button>

// ❌ MAUVAIS (contraste faible)
<button style={{ color: '#999', backgroundColor: '#f5f5f5' }}>
  Contraste ~3:1 ❌
</button>

// ✅ BON (pas seulement la couleur)
<span style={{ color: 'red' }}>Erreur:</span> Champ requis

// ❌ MAUVAIS (info seulement en couleur)
<span style={{ color: 'red' }}>Champ requis</span>  {/* Daltoniens? */}
```

**Checklist:**
- [ ] Contraste texte/fond ≥ 4.5:1 (normal text)
- [ ] Contraste ≥ 3:1 (large text)
- [ ] Info non seulement en couleur (ajouter symbole, texte, etc.)
- [ ] Vérifier avec: https://webaim.org/resources/contrastchecker/

---

### ✅ Focus & Keyboard Navigation

```jsx
// ✅ BON (visible focus)
<button style={{ outline: '2px solid #0066cc' }}>
  Cliquez-moi
</button>

// ❌ MAUVAIS (focus caché)
<button style={{ outline: 'none' }}>
  Invisible au clavier!
</button>

// ✅ BON (tabindex correct)
<div tabIndex={0} role="button">  {/* Rare */}
  Cliquable
</div>

// ❌ MAUVAIS (tabindex excessif)
<div tabIndex={5}>  {/* Casse l'ordre de tab */}
  Pas bon
</div>
```

**Checklist:**
- [ ] Focus outline visible (jamais `outline: none` sans remplacement)
- [ ] Focus order logique (tabindex < 1 rare, uniquement si nécessaire)
- [ ] Tous les éléments interactifs dans le flux de tab

---

## 🛠️ Patterns Réutilisables

### Modal Accessible

```jsx
function Modal({ isOpen, title, children, onClose }) {
  return isOpen ? (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-content"
    >
      <div className="modal-overlay" onClick={onClose} aria-hidden="true" />
      <div className="modal-content">
        <h2 id="modal-title">{title}</h2>
        <div id="modal-content">{children}</div>
        <button onClick={onClose}>Fermer</button>
      </div>
    </div>
  ) : null;
}
```

### Dropdown Menu Accessible

```jsx
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef(null);
  const menuRef = useRef(null);

  return (
    <div>
      <button
        ref={toggleRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        Menu
      </button>
      {isOpen && (
        <ul role="menu" ref={menuRef}>
          <li role="menuitem"><a href="/profile">Profil</a></li>
          <li role="menuitem"><a href="/settings">Paramètres</a></li>
          <li role="menuitem"><a href="/logout">Déconnexion</a></li>
        </ul>
      )}
    </div>
  );
}
```

---

## 🧪 Comment tester

### 1. Lighthouse
```bash
# Chrome DevTools → Lighthouse → Accessibility
# Vérifier score > 90
```

### 2. WAVE Extension
- https://wave.webaim.org/extension/
- Red = erreurs (corriger)
- Yellow = alertes (vérifier)

### 3. Keyboard Only
```
Tab → Nav dans tous les éléments interactifs?
Enter → Boutons répondent?
Espace → Checkboxes répondent?
Flèches → Menu/select répondent?
Escape → Modal ferme?
```

### 4. Narrator (Windows)
```bash
Win + Ctrl + N  # Ouvrir
Win + Ctrl + H  # Hotkyes
```

### 5. Axe DevTools
- https://www.deque.com/axe/devtools/
- Tous les éléments sont-ils tagés correctement?

---

## 📚 Ressources

- [WCAG 2.1 Spec](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM](https://webaim.org/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

---

## 💡 TL;DR - Les 10 règles d'or

1. ✅ Utiliser `<button>`, pas `<div onClick>`
2. ✅ Chaque input doit avoir un `<label>`
3. ✅ Images doivent avoir `alt` descriptif
4. ✅ Hiérarchie des headings h1 → h2 → h3
5. ✅ Contraste texte/fond ≥ 4.5:1
6. ✅ Focus visible et navigable au Tab
7. ✅ `<nav>`, `<main>`, `<footer>` pour structure
8. ✅ Ajouter `aria-label` si besoin de clarifier
9. ✅ Pas de `outline: none` sans remplacement
10. ✅ Tester avec clavier + lecteur d'écran
