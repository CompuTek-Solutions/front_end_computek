# 🏢 Computek Solutions - Système de Gestion de Stock

Une application **professionnelle et moderne** de gestion de stock, d'inventaire, de ventes et de statistiques conçue spécifiquement pour **Computek Solutions**.

## ✨ Fonctionnalités Principales

### 👨‍💼 **Interface Administrateur**
- **Tableau de bord** - Vue d'ensemble des performances
- **Gestion des produits** - Ajouter, modifier, supprimer des produits
- **Génération de code-barres** - Créer automatiquement des codes-barres pour les produits
- **Gestion de l'inventaire** - Suivre les stocks, alertes stock faible
- **Historique des ventes** - Consulter toutes les transactions
- **Statistiques avancées** - Graphiques, tendances, produits les plus vendus
- **Gestion des utilisateurs** - Créer et gérer les comptes vendeurs
- **Paramètres** - Configuration de l'entreprise

### 👥 **Interface Vendeur**
- **Tableau de bord personnel** - Performance et KPIs
- **Nouvelle vente** - Vendre via scan de code-barres ou sélection manuelle
- **Scanner code-barres** - Scan en temps réel avec caméra
- **Panier d'achat** - Gestion des articles avec modification des quantités
- **Facturation** - Génération automatique de factures
- **Historique des ventes** - Consultation des ventes personnelles
- **Analyse des performances** - Statistiques personnelles, classement

## 🎯 Objectifs Réalisés

✅ Système d'authentification avec rôles (Admin/Vendeur)  
✅ Gestion complète des produits avec code-barres  
✅ Scanner code-barres en temps réel  
✅ Module de vente avec panier d'achat  
✅ Système de facturation automatisé  
✅ Gestion de l'inventaire avec alertes  
✅ Statistiques et rapports détaillés  
✅ Interface responsive et mobile-friendly  
✅ Design moderne et professionnel  
✅ Stockage des données en localStorage

## 🚀 Démarrage Rapide

### Installation

```bash
# Installation des dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible à `http://localhost:5173`

### Comptes de Démonstration

**Administrateur:**
- Email: `admin@computek.com`
- Mot de passe: `123456`

**Vendeur:**
- Email: `seller@computek.com`
- Mot de passe: `123456`

## 📁 Structure du Projet

```
src/
├── pages/
│   ├── auth/              # Pages d'authentification
│   ├── admin/             # Pages administrateur
│   └── seller/            # Pages vendeur
├── components/
│   ├── common/            # Composants réutilisables
│   ├── admin/             # Composants admin
│   └── seller/            # Composants vendeur
├── store/                 # Gestion d'état (Zustand)
├── styles/                # Feuilles de style CSS
├── utils/                 # Fonctions utilitaires
└── App.jsx                # Composant principal avec routing
```

## 🛠 Technologies Utilisées

- **React 19** - Framework UI
- **React Router DOM** - Navigation
- **Zustand** - Gestion d'état globale
- **Recharts** - Graphiques et statistiques
- **JSBarcode** - Génération de code-barres
- **HTML5-QRCode** - Scanning code-barres
- **React Hot Toast** - Notifications
- **Vite** - Build tool

## 📝 Notes Importantes

1. **Données** - Utilise localStorage pour la persistance. Intégrez une API backend pour la production.
2. **Code-barres** - Nécessite l'autorisation caméra du navigateur pour le scanner.
3. **Logo** - Le logo doit être présent dans `public/logo.jpg`

---

**Version:** 1.0.0  
**Développé pour:** Computek Solutions
