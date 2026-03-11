# 📘 Guide Complet - Computek Solutions Gestion de Stock

## Table des Matières
1. [Installation](#installation)
2. [Démarrage](#démarrage)
3. [Authentification](#authentification)
4. [Guide Admin](#guide-administrateur)
5. [Guide Vendeur](#guide-vendeur)
6. [Fonctionnalités Avancées](#fonctionnalités-avancées)

---

## Installation

### Prérequis
- **Node.js** v22 ou supérieur
- **npm** v10 ou supérieur
- Un navigateur moderne (Chrome, Firefox, Safari, Edge)
- **Accès à la caméra** (pour le scanner code-barres)

### Étapes d'Installation

```bash
# 1. Naviguer vers le dossier du projet
cd c:\Users\JNGUE\la-maison-jungle

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev

# 4. Ouvrir dans le navigateur
# http://localhost:5173
```

---

## Démarrage

### Premier Accès

1. Ouvrez `http://localhost:5173`
2. Vous verrez la page de connexion
3. Sélectionnez votre rôle (Administrateur ou Vendeur)
4. Entrez vos identifiants

### Comptes par Défaut

| Rôle | Email | Mot de passe |
|------|-------|------------|
| Admin | admin@computek.com | 123456 |
| Vendeur | seller@computek.com | 123456 |

---

## Authentification

### Se Connecter
1. Sélectionnez le rôle dans le formulaire
2. Entrez l'email
3. Entrez le mot de passe
4. Cliquez sur "Se connecter"

### Se Déconnecter
1. Cliquez sur le bouton "Déconnexion" dans le header
2. Vous retournerez à la page de connexion

---

## Guide Administrateur

### 🏠 Tableau de Bord

**Accès:** Menu principal > "Tableau de bord"

Affiche les statistiques clés:
- 💰 Chiffre d'affaires total
- 📦 Nombre d'articles vendus
- 🛒 Nombre de commandes
- 💳 Panier moyen
- 📊 Nombre de produits
- ⚠️ Articles en stock faible

### 📦 Gestion des Produits

**Accès:** Menu principal > "Produits"

#### Ajouter un Produit
1. Cliquez sur "➕ Ajouter un produit"
2. Remplissez le formulaire:
   - **Nom** (obligatoire)
   - **Catégorie** (optionnel)
   - **Description** (optionnel)
   - **Prix de vente** (obligatoire)
   - **Prix de revient** (optionnel)
   - **SKU** (optionnel)
   - **Code-barres** (obligatoire)
3. Cliquez sur "Générer" pour créer un code-barres automatique
4. Cliquez sur "Ajouter"

#### Modifier un Produit
1. Trouvez le produit dans la liste
2. Cliquez sur "✏️ Modifier"
3. Modifiez les champs désirés
4. Cliquez sur "Mettre à jour"

#### Supprimer un Produit
1. Trouvez le produit
2. Cliquez sur "🗑️ Supprimer"
3. Confirmez la suppression

#### Rechercher un Produit
1. Utilisez la barre de recherche
2. Tapez le nom ou le code-barres
3. Les résultats s'affichent automatiquement

### 📋 Gestion de l'Inventaire

**Accès:** Menu principal > "Inventaire"

#### Consulter l'Inventaire
- Vue d'ensemble de tous les stocks
- Filtrez par: Tous, Stock faible, Rupture
- Triez par: Nom, Quantité, Valeur

#### Interprétation des Statuts
- 🟢 **Vert:** Stock normal (≥10 unités)
- 🟡 **Orange:** Stock faible (1-9 unités)
- 🔴 **Rouge:** Rupture de stock (0 unités)

#### Valeur du Stock
- Calculée automatiquement (Quantité × Prix unitaire)
- Visible dans la colonne "Valeur stock"

### 📊 Statistiques et Rapports

**Accès:** Menu principal > "Statistiques"

#### Graphiques Disponibles

1. **Ventes Mensuelles** - Évolution du chiffre d'affaires
2. **Top 10 Produits** - Produits les plus vendus
3. **Répartition par Catégorie** - Camembert des ventes

#### Données Affichées
- Chiffre d'affaires total
- Nombre de ventes
- Panier moyen
- Quantités vendues

### 🛒 Historique des Ventes

**Accès:** Menu principal > "Ventes"

- Consultez toutes les transactions
- Filtrez par statut (Complétées, En attente, Annulées)
- Recherchez par ID de vente
- Consultez le total et les remises

### 👥 Gestion des Utilisateurs

**Accès:** Menu principal > "Utilisateurs"

#### Actions Possibles
- ✏️ Modifier un profil utilisateur
- 🗑️ Supprimer un utilisateur
- Voir l'état (Actif/Inactif)

### ⚙️ Paramètres

**Accès:** Menu principal > "Paramètres"

Configurez:
- Informations de l'entreprise
- Paramètres de facturation (TVA, devise)
- Paramètres de sécurité

---

## Guide Vendeur

### 🏠 Mon Tableau de Bord

**Accès:** Menu principal > "Tableau de bord"

Affiche vos performances personnelles:
- 💰 Vos ventes totales
- 🎯 Nombre de ventes
- 📦 Articles vendus
- 💳 Panier moyen
- 🏆 Commission (5% des ventes)

### 💳 Nouvelle Vente

**Accès:** Menu principal > "Nouvelle vente"

#### Méthode 1: Scanner Code-Barres

1. Cliquez sur "📱 Scanner Code-barres"
2. Autorisez l'accès à la caméra
3. Pointez la caméra sur le code-barres
4. L'article s'ajoute automatiquement au panier
5. Répétez pour d'autres articles

#### Méthode 2: Sélection Manuelle

1. Parcourez la liste des produits
2. Cliquez sur "➕ Ajouter" pour chaque produit
3. Modifiez les quantités dans le panier

#### Ajuster les Quantités
1. Dans le panier, changez le nombre dans la colonne "Quantité"
2. Le prix total se met à jour automatiquement
3. Cliquez sur "🗑️" pour supprimer un article

#### Appliquer une Remise
1. Entrez le pourcentage dans le champ "Remise (%)"
2. Exemple: 10 = 10% de remise
3. Le total se recalcule automatiquement

#### Choisir le Mode de Paiement
- Espèces
- Carte bancaire
- Virement
- Chèque

#### Ajouter des Notes
- Cliquez sur le champ "Notes"
- Tapez vos commentaires
- Optionnel

#### Finaliser la Vente
1. Vérifiez le panier
2. Vérifiez le total
3. Cliquez sur "✓ Finaliser la vente"
4. Confirmation de succès

### 📜 Historique de Mes Ventes

**Accès:** Menu principal > "Historique"

- Consultez toutes vos ventes
- Voyez les dates, montants, modes de paiement
- Filtrez par date si nécessaire
- Consultez vos statistiques personnelles

### 📊 Mes Performances

**Accès:** Menu principal > "Performances"

#### Indicateurs Affichés

1. **Taux de Performance** - % d'accomplissement vs objectif
2. **Classement** - Votre position parmi les vendeurs
3. **Objectif Mensuel** - Progression vs cible (500,000 XAF)
4. **Top 5 Produits** - Vos produits les plus vendus
5. **Statistiques Mensuelles** - Résumé des KPIs

#### Conseils d'Amélioration
- Augmentez votre base clients
- Diversifiez vos ventes
- Suivez les statistiques
- Adaptez votre approche aux produits populaires

---

## Fonctionnalités Avancées

### Génération de Code-Barres

#### Automatique (Admin)
1. Lors de l'ajout d'un produit
2. Cliquez sur le bouton "Générer"
3. Un code-barres unique est créé

#### Manuelle
1. Entrez directement le code-barres
2. Format accepté: 10-50 caractères
3. Doit être unique par produit

#### Impression de Code-Barres
- Les code-barres peuvent être imprimés via le navigateur
- Format: CODE128 standard
- Peut être collé sur les produits physiques

### Scanner Code-Barres

#### Activation
- Cliquez sur "📱 Scanner"
- Autorisez l'accès à la caméra
- La caméra s'affiche en fullscreen

#### Utilisation
1. Placez le code-barres dans le cadre
2. Attentez la détection automatique
3. L'article s'ajoute au panier
4. Continuez ou fermez le scanner

#### Résolution de Problèmes
- **Caméra non disponible:** Vérifiez les permissions
- **Code non détecté:** Meilleur éclairage, alignement correct
- **Mauvais produit scanné:** Vérifiez l'intégrité du code

### Gestion de l'Inventaire Avancée

#### Alertes Stock Faible
- Déclenchée automatiquement pour < 10 unités
- Visible dans le dashboard admin
- Code couleur: Jaune/Orange

#### Calcul de la Valeur
- Valeur = Quantité × Prix unitaire
- Calculée automatiquement
- Mise à jour en temps réel

#### Expirations (Futures)
- Pour une version ultérieure
- Alertes sur les produits périmés
- Gestion des retours

### Statistiques Avancées

#### Filtrage de Données
- Par période (mois, trimestre, année)
- Par catégorie de produit
- Par vendeur (Admin uniquement)

#### Export de Rapports (Futures)
- Excel (.xlsx)
- PDF (.pdf)
- CSV (.csv)

### Sécurité et Confidentialité

#### Permissions d'Accès
- **Admin:** Accès total à tous les modules
- **Vendeur:** Accès limité à ses propres ventes

#### Protection des Routes
- Redirection automatique si déconnecté
- Impossible d'accéder aux pages admin en tant que vendeur
- Sessions persistantes via localStorage

---

## Troubleshooting

### L'application ne démarre pas
```bash
# Vérifiez les dépendances
npm install

# Videz le cache npm
npm cache clean --force

# Réinstallez
npm install

# Relancez
npm run dev
```

### Caméra ne fonctionne pas
- Vérifiez que le navigateur a la permission
- Utilisez HTTPS (ou localhost)
- Testez sur un autre navigateur
- Vérifiez que la caméra n'est pas utilisée ailleurs

### Données perdues
- Les données sont dans localStorage
- Videz le cache: F12 > Application > Clear storage
- Videz le cache complet du navigateur

### Performance lente
- Limitez le nombre de produits
- Fermez les onglets inutiles
- Videz le cache du navigateur
- Utilisez un navigateur plus léger

---

## Support et Assistance

Pour toute question:
1. Consultez ce guide
2. Vérifiez le README.md
3. Contactez l'équipe Computek Solutions

---

**Dernière mise à jour:** Mars 2026  
**Version:** 1.0.0
