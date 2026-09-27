/* ===================*==============================
   FIRESTORE SERVICE

   Couche d'accès aux données Firestore.

   Responsabilités :
   - Gestion des prédictions
   - Gestion des participants
   - Gestion des commentaires
   - Gestion des joueurs NHL
   - Gestion du journal administratif

   Toutes les fonctions de ce module
   effectuent des lectures ou écritures
   directes dans Firestore.

   ================================================== */
import { db } from "../firebase.js";
import { appState } from "../app/state.js";
import { collection, query, where, getDocs, addDoc, updateDoc,doc} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


/*
   Récupère toutes les prédictions
   de la saison active.

   Utilisé notamment pour :
   - le classement
   - les statistiques
   - les résultats détaillés
*/
export async function getAllPredictions() {

  const q = query(collection(db,"predictions"),
  where("season","==",appState.currentSeason));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    doc => ({
      id: doc.id,
      ...doc.data()
    })
  );
}

/*
   Vérifie si un utilisateur possède déjà
   une soumission pour la ronde demandée.
*/
export async function hasSubmitted(userId, round) {

  const q = query(
    collection(db, "predictions"),
    where("season", "==", appState.currentSeason),
    where("userId", "==", userId),
    where("round", "==", round)
 );

  const snapshot = await getDocs(q);

  return !snapshot.empty;
}


/*
   Enregistre une nouvelle soumission
   dans Firestore.
*/
export async function submitPrediction(data) {

  return await addDoc(collection(db, "predictions"), data);
}

/*
   Récupère tous les commentaires transmis
   par les participants.
*/
export async function getAllFeedback() {

  const snapshot =
    await getDocs(
      collection(
        db,
        "feedback"
      )
    );

  return snapshot.docs.map(
    doc => ({
      id: doc.id,
      ...doc.data()
    })
  );

}

/*
   Retourne la liste complète des participants
   enregistrés dans le système.
*/
export async function getAllParticipants() {

  const snapshot =
    await getDocs(
      collection(
        db,
        "participants"
      )
    );

  return snapshot.docs.map(
    doc => ({
      id: doc.id,
      ...doc.data()
    })
  );
}
/*
   Charge les statistiques des joueurs
   de la saison active dans appState.

   Ces données servent principalement
   au choix du Conn Smythe et aux statistiques NHL.
*/
export async function loadPlayers() {

    const q = query(
        collection(db, "players"),
        where(
            "season",
            "==",
            appState.currentSeason
        )
    );

    const snapshot =
        await getDocs(q);

    appState.players =
        snapshot.docs.map(
            doc => doc.data()
        );
}

/*
   Récupère l'historique des actions
   administratives.
*/
export async function getAdminLogs() {

  const snapshot =
    await getDocs(
      collection(
        db,
        "adminLogs"
      )
    );

  return snapshot.docs.map(
    doc => ({
      id: doc.id,
      ...doc.data()
    })
  );

}

/*
   Ajoute une entrée dans le journal
   administratif.
*/
export async function addAdminLog( action, admin) {

  return await addDoc(
    collection(
      db,
      "adminLogs"
    ),
    {
      action,
      admin,
      timestamp: Date.now()
    }
  );

}

/*
   Recherche une prédiction spécifique
   à un utilisateur, une ronde
   et une saison.
*/
export async function getPrediction(userId,
  round,season) {

  const q = query(
    collection(db, "predictions"),
    where("userId", "==", userId),
    where("round", "==", round),
    where("season","==",season)
  );

  const snapshot =
    await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data()
  };

}

/*
   Met à jour une prédiction existante.
*/
export async function updatePrediction(docId, data) {

  await updateDoc(doc(db,"predictions",docId),data);
}


