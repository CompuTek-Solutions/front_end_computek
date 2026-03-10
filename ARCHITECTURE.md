# 🏗️ Architecture Technique - Computek Solutions

## Vue d'Ensemble

```
┌─────────────────────────────────────────────────────┐
│                  NAVIGATEUR                         │
├─────────────────────────────────────────────────────┤
│                  REACT (Frontend)                   │
│  ┌──────────────────────────────────────────────┐  │
│  │         Pages & Composants                   │  │
│  │  - Admin (Dashboard, Products, Stats)        │  │
│  │  - Seller (Dashboard, Sales, Performance)    │  │
│  │  - Auth (Login)                              │  │
│  └──────────────────────────────────────────────┘  │
│                      ↓                              │
│  ┌──────────────────────────────────────────────┐  │
│  │    COUCHE D'ÉTAT (Zustand)                   │  │
│  │    - authStore (Authentification)            │  │
│  │    - productStore (Produits, Ventes)         │  │
│  └──────────────────────────────────────────────┘  │
│                      ↓                              │
│  ┌──────────────────────────────────────────────┐  │
│  │    PERSISTANCE (localStorage)                │  │
│  │    - user (Session)                          │  │
│  │    - products (Inventaire)                   │  │
│  │    - sales (Historique)                      │  │
│  │    - inventory (Stocks)                      │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Hiérarchie des Composants

### Structure Globale

```
App.jsx (Routeur principal)
├── Login (Page d'authentification)
├── Layout (Wrapper contenant Header + Sidebar)
│   ├── Header (Logo, Titre, Infos Utilisateur)
│   ├── Sidebar (Navigation Menu)
│   └── Main Content
│       ├── Admin Routes
│       │   ├── AdminDashboard
│       │   ├── AdminProducts (+ ProductForm, ProductList)
│       │   ├── AdminInventory
│       │   ├── AdminSales
│       │   ├── AdminStatistics
│       │   ├── AdminUsers
│       │   └── AdminSettings
│       └── Seller Routes
│           ├── SellerDashboard
│           ├── SellerNewSale (+ SaleCart, BarcodeScanner)
│           ├── SellerSalesHistory
│           └── SellerPerformance
```

## Structure de Dossiers Détaillée

```
src/
├── pages/                    # Pages principales
│   ├── auth/
│   │   ├── Login.jsx        # Page de connexion
│   │   └── Auth.css         # Styles authentification
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminDashboard.css
│   │   ├── AdminProducts.jsx
│   │   ├── Products.css
│   │   ├── AdminInventory.jsx
│   │   ├── Inventory.css
│   │   ├── AdminSales.jsx
│   │   ├── Sales.css
│   │   ├── AdminStatistics.jsx
│   │   ├── Statistics.css
│   │   ├── AdminUsers.jsx
│   │   ├── AdminUsers.css
│   │   ├── AdminSettings.jsx
│   │   └── AdminSettings.css
│   └── seller/
│       ├── SellerDashboard.jsx
│       ├── SellerDashboard.css
│       ├── NewSale.jsx
│       ├── NewSale.css
│       ├── SellerSalesHistory.jsx
│       ├── SellerSalesHistory.css
│       ├── SellerPerformance.jsx
│       └── SellerPerformance.css
│
├── components/               # Composants réutilisables
│   ├── Layout.jsx           # Wrapper principal
│   ├── Layout.css
│   ├── common/
│   │   ├── Header.jsx       # En-tête
│   │   ├── Header.css
│   │   ├── Sidebar.jsx      # Navigation latérale
│   │   └── Sidebar.css
│   ├── admin/
│   │   ├── ProductForm.jsx  # Formulaire produit
│   │   ├── ProductForm.css
│   │   ├── ProductList.jsx  # Liste produits
│   │   └── ProductList.css
│   └── seller/
│       ├── SaleCart.jsx     # Panier d'achat
│       ├── SaleCart.css
│       ├── BarcodeScanner.jsx
│       └── BarcodeScanner.css
│
├── store/                    # Zustand stores
│   ├── authStore.js         # Gestion authentification
│   └── productStore.js      # Gestion produits/ventes
│
├── styles/                   # Styles globaux
│   ├── global.css           # Résets, variables CSS
│   └── components.css       # Classes utilitaires
│
├── utils/                    # Fonctions utilitaires
│   ├── barcodeUtils.js      # Génération code-barres
│   ├── helpers.js           # Formatage, calculs
│   ├── validation.js        # Validation formulaires
│   └── dateUtils.js         # Manipulation dates
│
├── hooks/                    # Hooks React personnalisés
│   └── (vides pour v1.0)
│
├── App.jsx                   # Composant root avec routes
└── main.jsx                  # Point d'entrée
```

## Flux de Données

### Authentification

```
Login.jsx
  ↓
useAuthStore.login()
  ↓
localStorage.setItem('user')
  ↓
authStore.user = userData
  ↓
useAuthStore.isAuthenticated = true
  ↓
Navigate to /admin ou /seller
```

### Gestion des Produits

```
ProductForm.jsx (Ajout)
  ↓
useProductStore.addProduct()
  ↓
Zustand state update
  ↓
localStorage.setItem('products')
  ↓
ProductList.jsx refetch automatique
  ↓
Affichage mis à jour
```

### Vente (Vendeur)

```
NewSale.jsx (Sélection articles)
  ↓
addToCart() → cartItems state
  ↓
SaleCart.jsx (Affichage panier)
  ↓
Finaliser
  ↓
useProductStore.addSale()
  ↓
localStorage.setItem('sales')
  ↓
updateInventory() pour chaque article
  ↓
SellerSalesHistory mis à jour
```

## Gestion d'État (Zustand)

### authStore

```javascript
{
  user: {
    id: string,
    name: string,
    email: string,
    role: 'admin' | 'seller',
    loginTime: ISO8601
  },
  isAuthenticated: boolean,
  
  // Actions
  login(userData),
  logout()
}
```

### productStore

```javascript
{
  // Data
  products: Product[],
  sales: Sale[],
  inventory: InventoryItem[],
  
  // Actions - Produits
  addProduct(product),
  updateProduct(id, updates),
  deleteProduct(id),
  getProductById(id),
  getProductByBarcode(barcode),
  
  // Actions - Ventes
  addSale(sale),
  getSaleById(id),
  
  // Actions - Inventaire
  updateInventory(productId, quantity),
  getInventoryByProductId(productId)
}
```

## Interfaces Données

### Product

```javascript
{
  id: string,           // UUID
  name: string,         // Obligatoire
  description: string,  // Optionnel
  price: number,        // Obligatoire
  costPrice: number,    // Optionnel
  category: string,     // Optionnel
  barcode: string,      // Obligatoire, unique
  sku: string,          // Optionnel
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

### Sale

```javascript
{
  id: string,
  items: [
    {
      productId: string,
      name: string,
      price: number,
      quantity: number,
      total: number    // price × quantity
    }
  ],
  subtotal: number,
  discount: number,
  total: number,
  paymentMethod: string,  // 'cash', 'card', 'transfer', 'check'
  notes: string,
  status: 'completed',
  date: ISO8601
}
```

### InventoryItem

```javascript
{
  productId: string,
  quantity: number,
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

## Styles Architecture

### Variables CSS Globales

```css
:root {
  --primary: #2563eb;
  --secondary: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --dark: #1e293b;
  --light: #f8fafc;
  --border: #e2e8f0;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

### Classes Utilitaires

- `.btn`, `.btn-primary`, `.btn-secondary`
- `.card`, `.card-header`, `.card-title`
- `.table`, `.badge`
- `.alert`, `.form-*`
- `.grid`, `.flex`, `.gap-*`

## Librairies Principales

| Librairie | Version | Usage |
|-----------|---------|-------|
| React | 19.2 | Framework UI |
| React-Router-DOM | 7.13 | Routage |
| Zustand | Latest | État global |
| Recharts | Latest | Graphiques |
| JSBarcode | 3.12 | Code-barres |
| HTML5-QRCode | 2.3 | Scanner |
| React Hot Toast | 2.6 | Notifications |
| Vite | 7.3 | Build tool |

## Performance et Optimisations

### Optimisations Actuelles

1. **Lazy Components**
   - Routes chargées à la demande
   
2. **Memoization**
   - useMemo pour les calculs coûteux
   - React.memo sur les listes

3. **CSS Optimisé**
   - CSS-in-JS évité
   - Utility-first approach
   - Pas d'imports inutiles

### Opportunités Futures

1. **Code Splitting**
   - Lazy loading des pages
   - Dynamic imports

2. **Image Optimization**
   - Compression images
   - Webp format

3. **PWA**
   - Service workers
   - Offline support

## Sécurité

### Actuellement

- localStorage sécurisé pour démo
- Validation client-side
- Protection des routes

### Pour Production

- JWT tokens
- HTTPS obligatoire
- CORS configuration
- API authentication
- Input sanitization
- OWASP compliance

## Intégration API (Pour l'Avenir)

Structure suggérée:

```javascript
// services/api.js
export const productAPI = {
  getAll: () => fetch('/api/products'),
  create: (data) => fetch('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetch(`/api/products/${id}`, { method: 'PUT' }),
  delete: (id) => fetch(`/api/products/${id}`, { method: 'DELETE' })
}
```

## Testing (Futur)

Structure recommandée:

```
src/
├── __tests__/
│   ├── components/
│   ├── pages/
│   ├── store/
│   └── utils/
```

Outils:
- Vitest
- React Testing Library
- Cypress (E2E)

---

**Architecture Version:** 1.0.0  
**Dernière mise à jour:** Mars 2026
