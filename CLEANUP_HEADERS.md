# 🧹 Nettoyage des Headers Dupliqués

## ❌ Problème

9 pages ont leur propre header en dur au lieu d'utiliser le `<Header />` du layout principal :

1. `/dashboard/page.tsx`
2. `/page.tsx`
3. `/s/[slug]/page.tsx`
4. `/submissions/[id]/page.tsx`
5. `/submissions/page.tsx`
6. `/templates/[id]/edit/page.tsx`
7. `/templates/[id]/send/page.tsx`
8. `/templates/new/page.tsx`
9. `/templates/page.tsx`

## ✅ Solution

Le `layout.tsx` principal a déjà le `<Header />` qui s'affiche sur toutes les pages.

### À FAIRE sur chaque page :

**AVANT** :
```tsx
return (
  <div className="min-h-screen bg-gray-50">
    {/* Header */}
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        ...
      </div>
    </header>

    {/* Main Content */}
    <main className="...">
      {children}
    </main>
  </div>
)
```

**APRÈS** :
```tsx
return (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {children}
  </div>
)
```

### Étapes :

1. **Supprimer** le `<header>...</header>` de chaque page
2. **Retirer** le `<div className="min-h-screen">` wrapper
3. **Simplifier** - ne garder que le contenu principal
4. Le header du `layout.tsx` s'occupera du reste !

---

## 🎯 Résultat

- ✅ **Un seul header** sur toute l'application
- ✅ **Navigation cohérente** partout
- ✅ **Sticky header** qui reste en haut
- ✅ **Theme toggle** accessible partout
- ✅ **Responsive** et moderne

---

**Note** : Le layout.tsx utilise déjà `min-h-screen`, donc inutile de le répéter dans chaque page.
