/* ==================================================
   REALTIME SERVICE

   Synchronisation temps réel de l'application.

   Responsabilités :
   - Écoute des changements Firestore
   - Mise à jour des données en mémoire (appState)
   - Rafraîchissement intelligent de l'interface
   - Maintien du classement en temps réel
   - Gestion des notifications administrateur

   Les données reçues sont conservées dans
   appState afin d'éviter des lectures répétées
   dans Firestore lors des rendus.

   ================================================== */

import { db } from "../firebase.js";

import { doc,collection, onSnapshot }from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { appState } from "../app/state.js";
import { refreshHelperMessage } from "../utils/helpers.js";
import {renderHome, renderFullLeaderboard,loadPredictionsDetails,renderStats,renderProfile} from "../ui/render.js";
import { reloadFeedbackSection} from "../ui/render.js";
import { computeLeaderboard} from "../logic/scoring.js";
import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm";

/*
   Empêche l'installation multiple des mêmes
   listeners Firestore.
*/
let listenersStarted = false;

/*
   Permet de regrouper plusieurs événements
   Firestore rapprochés en un seul rafraîchissement.
*/
let refreshTimeout;

/*
  *Planifie un rafraîchissement différé.

   Plusieurs mises à jour Firestore reçues
   dans un court intervalle sont regroupées
   afin d'éviter des rendus inutiles.
*/
function scheduleRefresh() {

  clearTimeout(refreshTimeout);

  refreshTimeout = setTimeout(
    doRefresh,
    300
  );

}

/*
   Recharge uniquement l'onglet actif.

   Cette approche réduit considérablement le
   travail de rendu par rapport à un
   rafraîchissement complet de l'application.
*/
async function doRefresh() {

  const activeTab =
    localStorage.getItem(
      "activeTab"
    ) || "home";

  switch(activeTab) {

    case "home":
      await renderHome();
      break;

    case "leaderboard":
      await renderFullLeaderboard();
      break;

    case "results":
      await loadPredictionsDetails();
      break;

    case "stats":
      await renderStats();
      break;

    case "statsNHL":
      await renderNhlStats();
      break;

    case "profile":

      if (appState.user) {
        await renderProfile();
      }

      break;

  }

}

/*
   Configure les listeners Firestore globaux.

   Synchronise en temps réel :
   - les prédictions
   - le classement
   - les participants
   - les résultats officiels
   - la configuration du pool

   Cette fonction ne doit être appelée
   qu'une seule fois durant l'exécution.
*/
export function setupRealtimeListeners() {

  if (listenersStarted) {
    return;
  }

  listenersStarted = true;
  // Config

  /*
   Cache toutes les prédictions en mémoire
   puis recalcule immédiatement le classement.
  */
  onSnapshot(
  collection(db, "predictions"),
  async snapshot => {

    appState.predictions =
      snapshot.docs.map(
        doc => ({
          id: doc.id,
          ...doc.data()
        })
      );

    appState.leaderboard =
      await computeLeaderboard(
        appState.predictions,
        appState.results
      );

    scheduleRefresh();

  }
);

/*
   Met à jour les résultats officiels utilisés
   dans le calcul des points.
*/
onSnapshot(
  doc(
    db,
    "results",
    appState.currentSeason
  ),
  snapshot => {

    const data = snapshot.data();

    if (!data) return;

    appState.results = data;

    scheduleRefresh();

  }
);
/*
   Maintient une copie locale des participants
   afin d'éviter des lectures supplémentaires
   dans Firestore.
*/
onSnapshot(
  collection(db,"participants"),
  snapshot => {

    appState.participants =
      snapshot.docs.map(
        doc => ({
          id: doc.id,
          ...doc.data()
        })
      );

  }
);

/*
   Synchronise la configuration active :

   - ronde ouverte
   - état des soumissions
   - dates limites

   Utilisé principalement pour l'affichage
   des informations utilisateur.
*/
  onSnapshot(
  doc(db, "config", "ui"),

  (snap) => {

    const config = snap.data();

    if (!config) return;

    appState.submission =
      Number(
        config.currentSubmission
      );

    appState.submissionOpen =
      config.submissionOpen;

    appState.round1Deadline =
      config.round1Deadline;

    appState.round2Deadline =
      config.round2Deadline;

    appState.round3Deadline =
      config.round3Deadline;

    appState.round4Deadline =
      config.round4Deadline;

    refreshHelperMessage();

  },
);
}


/*
   Configure les listeners réservés
   aux administrateurs.

   Synchronise :
   - les commentaires reçus
   - les notifications de nouveaux messages

   Cette fonction n'est appelée que pour les
   utilisateurs possédant les privilèges admin.
*/
export function setupAdminRealtimeListeners() {

  console.log(
    "ADMIN FEEDBACK LISTENER STARTED"
  );

  onSnapshot(
    collection(db, "feedback"),

    snapshot => {

      console.log(
        "FEEDBACK RECEIVED",
        snapshot.size
      );

      reloadFeedbackSection(
        snapshot
      );

      const count =
        snapshot.size;

      if (
        window.lastFeedbackCount !== undefined &&
        count > window.lastFeedbackCount
      ) {

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title: "Nouveau commentaire reçu",
          showConfirmButton: false,
          timer: 4000
        });

      }

      window.lastFeedbackCount =
        count;

    },

    error => {

      console.error(
        "FEEDBACK ERROR",
        error
      );

    }

  );

}