
# Pool de séries NHL (Web App)

Application web de gestion d'un pool des séries éliminatoires de la LNH.

Les participants effectuent des prédictions à différentes étapes des séries et accumulent des points selon l'exactitude de leurs choix.

---

## Fonctionnalités
### Participation
✅ Connexion Google (Firebase Authentication)
✅ Gestion des participants
✅ Acceptation des règlements
✅ Validation de l'éligibilité aux soumissions
✅ Suivi des paiements

### Prédictions
✅ Soumissions multi-rondes
- Première ronde
- Deuxième ronde
- Finales de conférence
- Finale de la Coupe Stanley
✅ Génération dynamique des affrontements futurs
✅ Modification des soumissions avant la date limite
✅ Prédiction du gagnant du Conn Smythe

### Classement et résultats
✅ Calcul automatique des points

✅ Classement en temps réel

✅ Détail complet des prédictions

✅ Validation visuelle :

✅ équipe correcte
✅✅ équipe et nombre de matchs corrects
❌ prédiction incorrecte

✅ Historique des soumissions

### Statistiques
✅ Statistiques du pool

- Favoris du pool
- Consensus
- Choix uniques
- Pronostic collectif

✅ Statistiques NHL

- Points
- Buts
- Passes
- Gardiens
- Saison régulière
- Séries éliminatoires


### Administration

✅ Gestion des paiements

✅ Gestion des commentaires

✅ Journal administratif

✅ Gestion des dates limites

✅ Activation / désactivation des soumissions

✅ Changement de la ronde active

✅ Suppression de soumissions

✅ Gestion du gagnant Conn Smythe

✅ Génération automatique du participant fictif « Random Noob »

### Temps réel
✅ Synchronisation Firestore temps réel

✅ Mise à jour automatique :

- Classement
- Résultats
- Participants
- Configuration
- Commentaires administrateurs

### Architecture
src/
├── admin/
├── app/
├── auth/
├── logic/
├── services/
├── ui/
│   ├── admin/
│   ├── home/
│   ├── leaderboard/
│   ├── profile/
│   ├── results/
│   └── stats/
├── utils/
├── firebase.js
├── constants.js
└── main.js
---
## Infrastructure

### Frontend
- HTML5
- CSS3
- JavaScript ES6 Modules

### Backend
- Firebase Authentication
- Cloud Firestore

### Données NHL

Les statistiques et résultats sont synchronisés à partir de l'API publique de la NHL.

Scripts d'administration disponibles :

admin-tools/

├── update_players.py
├── update_round1.py
├── update_playoff_results.py
├── update_playoff_structure.py
├── run_all_updates.py
└── settings.py

---

## Système de pointage
Le système récompense davantage les prédictions effectuées tôt dans les séries.

Exemple :

Soumission 1

Champion Coupe Stanley
✓ 8 points

Soumission 2

Champion Coupe Stanley
✓ 4 points

Soumission 3

Champion Coupe Stanley
✓ 2 points

Soumission 4

Champion Coupe Stanley
✓ 1 point
---

## Installation
1- Cloner le projet: git clone <repository>
2- Configurer Firebase: créer le fichier firebase.js
3- Installer un serveur local : npx serve ou python -m http.server 8000
---

## Deploiement
Solutions recommandées :

✅ GitHub Pages
✅ Firebase Hosting
✅ Netlify
✅ Vercel
---




---

## Améliorations prévues

Voir `IMPROVEMENTS.md`

---

## Auteur

Charles Brosseau
