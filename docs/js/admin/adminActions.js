/* ==================================================
   ADMIN ACTIONS

   Fonctions réservées aux administrateurs du pool.

   Responsabilités :
   - Gestion des soumissions
   - Gestion des paiements
   - Gestion des commentaires
   - Gestion du Conn Smythe
   - Génation du participant fictif Random Noob
   - Journalisation des actions administratives

   Dépendances :
   - Firestore
   - Dialogues utilisateur
   - État global de l'application

   ================================================== */

import { db } from "../firebase.js";
import { appState } from "../app/state.js";
import { showTab } from "../app/tabs.js";
import { renderAdmin } from "../ui/render.js";
import { showSuccess,showWarning,confirmDialog} from "../ui/dialogs.js";
import { refreshHelperMessage } from "../utils/helpers.js";
import { buildRandomNoobPicks} from "../services/randomNoobService.js";
import {collection, doc, addDoc,query, where, updateDoc, deleteDoc,getDocs} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* =================================================
   SOUMISSIONS
   =================================================
*/ 
/*
   Ouvre ou ferme les soumissions du pool.

   Met à jour la configuration globale,
   journalise l'action et rafraîchit
   l'interface utilisateur concernée.
*/
export async function toggleSubmissionOpen(status) {
  
  await updateDoc(
    doc(db, "config", "ui"),
    {
      submissionOpen: status
    }
  );
  await addDoc(
  collection(db, "adminLogs"),
  {
    action: status
      ? "Ouverture des soumissions"
      : "Fermeture des soumissions",

    admin:
      appState.user.displayName,

    timestamp:
      Date.now()
  }
);

  appState.submissionOpen = status;
  renderAdmin();
if (document.getElementById("submitTab").style.display === "block") {
showTab("submit");
}
refreshHelperMessage();
};

/*
   Définit la soumission actuellement active.

   Cette valeur détermine quelle ronde de
   prédictions peut être modifiée par les
   participants.
*/
export async function updateSubmissionRound() {

  const round = Number(
    document.getElementById(
      "adminSubmission"
    ).value
  );
  

  await updateDoc(
    doc(db, "config", "ui"),
    {
      currentSubmission: round
    }
  );
  await addDoc(
  collection(db, "adminLogs"),
  {
    action:
      `Soumission active -> ${round}`,

    admin:
      appState.user.displayName,

    timestamp:
      Date.now()
  }
);

  appState.submission = round;
  renderAdmin();
  refreshHelperMessage();
  await showSuccess(
  "Soumission activée",
  `Tu as activé la soumission ${round}`
);
  
};

/* ==================================================
   HISTORIQUE ADMINISTRATIF
*  ================================================== */

/**   Supprime l'ensemble des entrées contenues
   dans le journal administratif.

   Cette opération est irréversible.
*/
export async function clearAdminHistory(){

 const result =
  await confirmDialog(
    "Suppression",
    "Supprimer tout l'historique ?"
  );

if (!result.isConfirmed) {
  return;
}

  const snapshot =
    await getDocs(
      collection(
        db,
        "adminLogs"
      )
    );

  await Promise.all(

    snapshot.docs.map(
      d =>
        deleteDoc(d.ref)
    )

  );

  renderAdmin();

};

/*
   Met à jour les dates limites associées
   aux différentes soumissions.

   Les dates sont enregistrées sous forme
   de timestamp dans Firestore.
*/

export async function updateDeadline() {

  await addDoc(
  collection(db, "adminLogs"),
  {
    action:
      "Modification des dates limites",

    admin:
      appState.user.displayName,

    timestamp:
      Date.now()
  }
);


  await updateDoc(
    doc(db, "config", "ui"),
    {

      round1Deadline:
        new Date(
          document.getElementById(
            "round1Deadline"
          ).value
        ).getTime(),

      round2Deadline:
        new Date(
          document.getElementById(
            "round2Deadline"
          ).value
        ).getTime(),

      round3Deadline:
        new Date(
          document.getElementById(
            "round3Deadline"
          ).value
        ).getTime(),

      round4Deadline:
        new Date(
          document.getElementById(
            "round4Deadline"
          ).value
        ).getTime()

    }
  );

  await showSuccess(
  "Date des soumissions",
  "La date des soumissions a été mis à jour."
);
refreshHelperMessage();
};

/*
   Supprime une soumission sélectionnée par
   l'administrateur.

   Utilisé notamment pour corriger des erreurs
   ou retirer des entrées invalides.
*/
export async function deletePredictionAdmin() {

  const id =
    document.getElementById(
      "deletePredictionSelect"
    ).value;

  const result =
    await confirmDialog(
      "Suppression",
      "Supprimer cette soumission ?"
    );

  if (!result.isConfirmed) {
    return;
  }

  await deleteDoc(
    doc(
      db,
      "predictions",
      id
    )
  );

  renderAdmin();
  
await showSuccess(
  "Soumission supprimée",
  "La soumission sélectionnée a été supprimée"
);

};

/*
*Met à jour l'état de paiement d'un*participant.
 
Cette information est utilisée pour calculer
la cagnotte réelle du pool.
*/
export async function togglePayment(uid, paid){

  await updateDoc(
    doc(
      db,
      "participants",
      uid
    ),
    {
      paid
    }
  );

};

/* ==================================================
   COMMENTAIRES
   ================================================== */

/*
   Supprime un commentaire laissé par un participant.

   Utilisé après traitement ou lorsqu'un commentaire
   n'est plus pertinent.
*/
export async function deleteFeedback(id) {

  const result =
  await confirmDialog(
    "Suppression",
    "Supprimer ce commentaire ?"
  );

if (!result.isConfirmed) {
  return;
}

  await deleteDoc(
    doc(
      db,
      "feedback",
      id
    )
  );

  renderAdmin();

};

/* =======*==================================*=======
   RANDOM NOOB
   ========*==================================*====== */
/**
 * Vérifie si une prédiction Random Noob
 * existe déjà pour la saison et la soumission
 * actuellement actives.
 *
 * Retourne true si une prédiction existe déjà.
 */
async function randomNoobAlreadyExists() {

  const q = query(
    collection(db,"predictions"),
    where(
      "userId",
      "==",
      "randomNoob"
    ),
    where(
      "season",
      "==",
      appState.currentSeason
    ),
    where(
      "round",
      "==",
      appState.submission
    )
  );

  const snap =
    await getDocs(q);

  return !snap.empty;

}

/**
 * Génère une prédiction aléatoire servant
 * de participant de comparaison.
 *
 * Notes :
 * - n'est pas considéré comme un participant réel
 * - n'est pas inclus dans la cagnotte
 * - n'est pas inclus dans le calcul du nombre
 *   officiel de participants
 */
export async function generateRandomNoob() {

  const exists =
    await randomNoobAlreadyExists();

  if (exists) {

  const result =
    await confirmDialog(
      "Random Noob",
      `Une prédiction existe déjà pour la soumission ${appState.submission}.

Voulez-vous l'écraser ?`
    );

  if (!result.isConfirmed) {
    return;
  }

  // suppression de l'existante
  const q = query(
    collection(db, "predictions"),
    where("userId", "==", "randomNoob"),
    where(
      "season",
      "==",
      appState.currentSeason
    ),
    where(
      "round",
      "==",
      appState.submission
    )
  );

  const snap =
    await getDocs(q);

  await Promise.all(
    snap.docs.map(
      d => deleteDoc(d.ref)
    )
  );

}

  const picks =
    await buildRandomNoobPicks();

  await addDoc(
    collection(
      db,
      "predictions"
    ),
    {
      userId: "randomNoob",
      userName: "🎲 Random Noob",
      round: appState.submission,
      season: appState.currentSeason,
      picks,
      timestamp: Date.now()
    }
  );
await showSuccess(
  "Random Noob",
  `Prédiction aléatoire générée pour la soumission ${appState.submission}.`
);

}
/* ==================================================
   RÉSULTATS OFFICIELS
   ================================================== */
/*
   Définit le gagnant officiel du trophée
   Conn Smythe.

   Cette information est utilIsée dans le calcul
   des résultats et du classement global.
*/
export async function updateConnSmytheWinner() {

  const winner =
    document
      .getElementById(
        "connSmytheInput"
      )
      ?.value
      ?.trim();

  if (!winner) {

    await showWarning(
      "Conn Smythe",
      "Veuillez choisir un joueur."
    );

    return;

  }

  await updateDoc(

    doc(
      db,
      "results",
      appState.currentSeason
    ),

    {
      Conn_Smythe: winner
    }

  );

  await addDoc(
    collection(db,"adminLogs"),
    {
      action:
        `Conn Smythe → ${winner}`,

      admin:
        appState.user.displayName,

      timestamp:
        Date.now()
    }
  );
  await showSuccess(
    "Conn Smythe",
    "Résultat sauvegardé."
  );

}