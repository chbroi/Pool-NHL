# Pool NHL - Roadmap

## ✅ Complété

### Architecture

- Migration vers une architecture modulaire ES6
- Séparation des responsabilités :
  - `app`
  - `auth`
  - `services`
  - `ui`
  - `logic`
  - `utils`
  - `constants`
- Centralisation de l'état dans `appState`
- Réexport centralisé des renderers

### Authentification

- Connexion Google Firebase
- Déconnexion
- Gestion du statut utilisateur
- Gestion des administrateurs
- Sauvegarde de l'acceptation des règlements
- Gestion du profil utilisateur

### Temps réel

- Synchronisation Firestore en temps réel
- Mise à jour automatique du classement
- Mise à jour automatique des résultats
- Mise à jour automatique des participants
- Mise à jour automatique de la configuration
- Mise à jour automatique des commentaires administrateurs
- Rafraîchissement intelligent des pages

### Interface

- Mode sombre / clair
- Navigation dynamique
- Affichage responsive
- Mise en évidence de la colonne du participant connecté
- Profil utilisateur
- Compte à rebours des dates limites
- Messages contextuels dynamiques

### Participation

- Validation de l'acceptation des règlements
- Suivi des paiements
- Carte de participation sur l'accueil
- Comptage automatique des participants
- Calcul automatique de la cagnotte
- Calcul automatique des gains projetés

### Soumissions

- Génération dynamique des rondes
- Validation des choix
- Modification des soumissions existantes
- Sauvegarde Firestore
- Validation du Conn Smythe
- Génération automatique des rondes futures

### Pointage

- Calcul automatique des scores
- Gestion multi-soumissions
- Classement global
- Calcul détaillé des points
- Pointage configurable via `SCORING`

### Résultats

- Affichage détaillé des prédictions
- Validation visuelle des choix
- Totaux par soumission
- Total global
- Affichage des logos NHL
- Affichage dynamique des affrontements

### Statistiques

#### Pool

- Favoris pour la Coupe Stanley
- Favoris Conn Smythe
- Pronostic collectif du pool
- Choix uniques
- Analyse du consensus

#### NHL

- Classement des pointeurs
- Classement des buteurs
- Classement des passeurs
- Statistiques des gardiens
- Saison régulière
- Séries éliminatoires

### Administration

- Gestion des paiements
- Gestion des commentaires
- Journal administratif
- Gestion des dates limites
- Ouverture/Fermeture des soumissions
- Gestion de la ronde active
- Suppression de soumissions
- Gestion du Conn Smythe officiel
- Génération du joueur fictif Random Noob

### Outils d'administration

- Scripts Python de synchronisation NHL
- Mise à jour automatique des joueurs actifs
- Mise à jour automatique des résultats
- Génération automatique des affrontements de ronde 1
- Gestion de la structure officielle des séries

---

# 🔥 Priorité Haute

## Fiabilité

### Optimisation

- Utiliser davantage `appState`
- Réduire les lectures Firestore inutiles
- Optimiser le calcul du classement
- Réduire le nombre de rafraîchissements complets

### Sécurité

- Vérifier toutes les permissions administrateur
- Renforcer les règles Firestore
- Empêcher l'exécution non autorisée des actions admin

### Soumissions

- Désactiver le bouton pendant l'envoi
- Ajouter un indicateur de chargement
- Validation visuelle améliorée
- Messages d'erreur plus explicites

---

# 🟡 Priorité Moyenne

## Mes prédictions

Créer un nouvel onglet :

```text
📋 Mes prédictions
```

Fonctionnalités :

- Historique complet
- Résultats détaillés
- Points obtenus
- Comparaison avec les résultats réels
- Évolution du score personnel

## Expérience utilisateur

- Conserver uniquement l'onglet Soumettre protégé
- Améliorer les animations
- Ajouter un bouton Retour en haut
- Ajouter des indicateurs de chargement

## Analyse du pool

Afficher :

- Équipe la plus populaire
- Équipe la moins populaire
- Choix les plus risqués
- Prédictions uniques
- Distribution des choix par ronde

## Administration

- Gestion complète des saisons
- Outils de correction de données
- Réimportation des résultats NHL

---

# 🟢 Priorité Basse

## Multi-saisons

Préparer :

```text
2025-2026
2026-2027
2027-2028
```

Fonctionnalités :

- Archives complètes
- Classements historiques
- Gagnants précédents
- Consultation d'anciennes saisons

## Export

Ajouter :

- Export CSV
- Export Excel
- Export PDF

Pour :

- Classement
- Participants
- Résultats
- Statistiques

## Automatisation

- Mise à jour quotidienne automatique des statistiques NHL
- Tâches planifiées Windows
- Synchronisation des résultats NHL
- Gestion automatique des joueurs actifs

---

# 🚀 Améliorations

## Évolution du classement

Afficher :

```text
Progression des participants
par ronde et par date
```

avec graphique interactif.

## Hall of Fame

Afficher :

```text
Champions des saisons précédentes
```

avec :

- gagnant
- score final
- nombre de participants

## Statistiques avancées

Afficher :

```text
Choix les plus populaires
Choix les plus audacieux
Choix les plus payants
```

## Activité récente

Afficher :

```text
Dernières soumissions
Derniers participants
Commentaires récents
```

## Random Noob avancé

Ajouter :

```text
🎲 Random Noob
📊 Random Expert
🔥 Favori du public
💀 Chaos Mode
```

---