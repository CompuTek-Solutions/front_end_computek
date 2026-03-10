# 🔌 API Endpoints Reference (Backend)

Ce document décrit la structure API recommandée pour intégrer un backend à Computek Solutions.

## Base de Configuration

```javascript
// services/api.js
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

const api = {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
};
```

## Authentication Endpoints

### POST /auth/login
Connexion utilisateur

**Requête:**
```json
{
  "email": "user@computek.com",
  "password": "123456"
}
```

**Réponse (200):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@computek.com",
    "role": "admin|seller"
  }
}
```

### POST /auth/logout
Déconnexion

**Réponse (200):**
```json
{
  "message": "Logged out successfully"
}
```

### GET /auth/me
Profil utilisateur actuel

**Réponse (200):**
```json
{
  "id": "user_id",
  "name": "User Name",
  "email": "user@computek.com",
  "role": "admin|seller"
}
```

---

## Products Endpoints

### GET /products
Récupérer tous les produits

**Query Params:**
- `page` (int, default: 1)
- `limit` (int, default: 20)
- `category` (string, optional)
- `search` (string, optional)

**Réponse (200):**
```json
{
  "data": [
    {
      "id": "product_id",
      "name": "Product Name",
      "description": "Description",
      "price": 25000,
      "costPrice": 15000,
      "category": "Electronics",
      "barcode": "COMP123456",
      "sku": "PROD-001",
      "stock": 50,
      "createdAt": "2026-03-05T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### GET /products/:id
Récupérer un produit spécifique

**Réponse (200):**
```json
{
  "id": "product_id",
  "name": "Product Name",
  "price": 25000,
  "stock": 50
}
```

### POST /products
Créer un produit (Admin only)

**Requête:**
```json
{
  "name": "New Product",
  "description": "Description",
  "price": 25000,
  "costPrice": 15000,
  "category": "Electronics",
  "barcode": "COMP123456",
  "sku": "PROD-001"
}
```

**Réponse (201):**
```json
{
  "id": "new_product_id",
  "message": "Product created successfully"
}
```

### PUT /products/:id
Modifier un produit (Admin only)

**Requête:** Même structure que POST

**Réponse (200):**
```json
{
  "message": "Product updated successfully"
}
```

### DELETE /products/:id
Supprimer un produit (Admin only)

**Réponse (200):**
```json
{
  "message": "Product deleted successfully"
}
```

### GET /products/barcode/:barcode
Chercher par code-barres

**Réponse (200):**
```json
{
  "id": "product_id",
  "name": "Product Name",
  "price": 25000
}
```

---

## Sales Endpoints

### GET /sales
Récupérer tous les ventes (Admin)
Récupérer mes ventes (Seller)

**Query Params:**
- `startDate` (ISO8601, optional)
- `endDate` (ISO8601, optional)
- `status` (completed|pending|cancelled, optional)

**Réponse (200):**
```json
{
  "data": [
    {
      "id": "sale_id",
      "items": [
        {
          "productId": "product_id",
          "name": "Product Name",
          "price": 25000,
          "quantity": 2,
          "total": 50000
        }
      ],
      "subtotal": 50000,
      "discount": 5000,
      "total": 45000,
      "paymentMethod": "cash",
      "sellerId": "seller_id",
      "status": "completed",
      "createdAt": "2026-03-05T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### GET /sales/:id
Détail d'une vente

**Réponse (200):**
```json
{
  "id": "sale_id",
  "items": [ ... ],
  "total": 45000,
  "paymentMethod": "cash",
  "notes": "Notes sur la vente",
  "createdAt": "2026-03-05T10:00:00Z"
}
```

### POST /sales
Créer une vente (Seller)

**Requête:**
```json
{
  "items": [
    {
      "productId": "product_id",
      "quantity": 2
    }
  ],
  "discount": 5,
  "paymentMethod": "cash",
  "notes": "Client note"
}
```

**Réponse (201):**
```json
{
  "id": "sale_id",
  "invoiceNumber": "INV-202603-0001",
  "total": 45000,
  "message": "Sale created successfully"
}
```

### POST /sales/:id/invoice
Générer une facture PDF

**Réponse (200):**
- Retourne un PDF blob

---

## Inventory Endpoints

### GET /inventory
État de l'inventaire complet

**Réponse (200):**
```json
{
  "data": [
    {
      "productId": "product_id",
      "productName": "Product Name",
      "quantity": 50,
      "minStock": 10,
      "isLowStock": false,
      "value": 1250000,
      "lastUpdated": "2026-03-05T10:00:00Z"
    }
  ]
}
```

### GET /inventory/low-stock
Articles en stock faible

**Réponse (200):**
```json
{
  "data": [
    {
      "productId": "product_id",
      "productName": "Product Name",
      "quantity": 5,
      "minStock": 10
    }
  ]
}
```

### POST /inventory/adjust
Ajuster le stock (Admin)

**Requête:**
```json
{
  "productId": "product_id",
  "quantity": 10,
  "reason": "purchase|return|adjustment|sale"
}
```

**Réponse (200):**
```json
{
  "message": "Inventory adjusted",
  "newQuantity": 60
}
```

---

## Statistics Endpoints

### GET /statistics/overview
Aperçu statistiques

**Réponse (200):**
```json
{
  "period": "month",
  "totalRevenue": 1500000,
  "totalSales": 45,
  "averageOrder": 33333,
  "itemsSold": 150,
  "topProducts": [
    {
      "productId": "product_id",
      "name": "Product Name",
      "quantity": 25,
      "revenue": 625000
    }
  ]
}
```

### GET /statistics/sales-by-period
Ventes par période

**Query Params:**
- `period` (day|week|month|year)
- `startDate` (ISO8601)
- `endDate` (ISO8601)

**Réponse (200):**
```json
{
  "data": [
    {
      "period": "2026-03-05",
      "revenue": 250000,
      "saleCount": 10
    }
  ]
}
```

### GET /statistics/top-products
Top produits vendus

**Query Params:**
- `limit` (int, default: 10)

**Réponse (200):**
```json
{
  "data": [
    {
      "rank": 1,
      "productId": "product_id",
      "name": "Product Name",
      "quantity": 50,
      "revenue": 1250000,
      "growth": 15.5
    }
  ]
}
```

### GET /statistics/seller-performance
Performance vendeurs (Admin)

**Réponse (200):**
```json
{
  "data": [
    {
      "sellerId": "seller_id",
      "name": "Seller Name",
      "totalSales": 100000,
      "saleCount": 10,
      "commission": 5000,
      "ranking": 1
    }
  ]
}
```

---

## Users Endpoints (Admin Only)

### GET /users
Lister tous les utilisateurs

**Réponse (200):**
```json
{
  "data": [
    {
      "id": "user_id",
      "name": "User Name",
      "email": "user@computek.com",
      "role": "seller",
      "status": "active|inactive",
      "createdAt": "2026-03-01T00:00:00Z"
    }
  ]
}
```

### POST /users
Créer un utilisateur

**Requête:**
```json
{
  "name": "New Seller",
  "email": "seller@computek.com",
  "password": "secure_password",
  "role": "seller"
}
```

**Réponse (201):**
```json
{
  "id": "new_user_id",
  "message": "User created successfully"
}
```

### PUT /users/:id
Modifier un utilisateur

**Réponse (200):**
```json
{
  "message": "User updated successfully"
}
```

### DELETE /users/:id
Supprimer un utilisateur

**Réponse (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

## Error Handling

### Response d'Erreur Standard

**400 Bad Request:**
```json
{
  "error": "Invalid input",
  "details": {
    "email": "Invalid email format"
  }
}
```

**401 Unauthorized:**
```json
{
  "error": "Invalid credentials or token expired"
}
```

**403 Forbidden:**
```json
{
  "error": "You don't have permission for this action"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "requestId": "req_id_123"
}
```

---

## Rate Limiting

- 100 requêtes par minute par IP
- 1000 requêtes par heure par utilisateur

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

---

## CORS Headers

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

---

## Implementation Frontend

Exemple avec Fetch API:

```javascript
// services/api.js
const API_URL = import.meta.env.VITE_API_URL;

export const fetchProducts = async () => {
  const response = await fetch(`${API_URL}/products`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.json();
};

export const createSale = async (saleData) => {
  const response = await fetch(`${API_URL}/sales`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(saleData)
  });
  return response.json();
};
```

Intégration dans Zustand:

```javascript
export const useProductStore = create((set) => ({
  async loadProducts() {
    const data = await fetchProducts();
    set({ products: data });
  }
}));
```

---

**Version API:** 1.0.0  
**À mettre en place pour:** Production
