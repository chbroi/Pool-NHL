
/* ================*=================================
*  USER SERVICE

   Gestion des utilisateurs et de la configuration
   générale du pool.

   Responsabilités :
   - Chargement de la configu*ation globale
   - Validation des conditions de participation
   - Acceptation des règlements
   - Gestion des participants

   ===========*==================================*=== */
import { db } from "../firebase.js";
import { showSuccess} from "../ui/dialogs.js";
import { collection, query, where, doc,getDoc, getDocs, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


let participants = [];

/* ============================*=====================
   ADMISSIBILITÉ
   ================================================== */

/*
   Vérifie si un utilisateur est admissible
   à la soumission demandée.

   À partir de la deuxième soumission,
   une prédiction valide doit exister pour
   la ronde précédente.
*/
export async function checkEligibility(userId, submission) {

  if (submission === 1) return true;

  const previousRound = submission - 1;

  const q = query(
    collection(db, "predictions"),
    where("userId", "==", userId),
    where("round", "==", previousRound)
  );

  const snapshot = await getDocs(q);

  return !snapshot.empty;
}
/* ==================================================
   CONFIGURATION
   ================================================== */

/*
   Charge la configuration active du pool
   ainsi que les résultats associés à la
   saison courante.

   Retourne un objet contenant :
   - la configuration
   - les résultats officiels
*/
   
export async function loadAppConfig() {

  const configRef =
    doc(db, "config", "ui");

  const configSnap =
    await getDoc(configRef);

  const config =
    configSnap.exists()
      ? configSnap.data()
      : null;

  if (!config) {

    return {
      config: null,
      results: {}
    };

  }

  const currentSeason =
    config.currentSeason;

  const resultsRef =
    doc(
      db,
      "results",
      currentSeason
    );

  const resultsSnap =
    await getDoc(resultsRef);

  return {

    config,

    results:
      resultsSnap.exists()
        ? resultsSnap.data()
        : {}

  };

}

/* ==================================================
   PARTICIPATION
   ================================================== */

/*
   Vérifie si l'utilisateur a officiellement
   accepté les règlements du pool.
*/
   
export async function hasAcceptedRules(userId) {

  const snap = await getDoc(
    doc(db, "participants", userId)
  );

  if (!snap.exists()) return false;

  return snap.data().acceptedRules === true;
}

/*
   Enregistre l'acceptation des règlements.

   Cette étape confirme officiellement
   l'intention de participer au pool.
*/

export async function acceptRules(user) {

  await setDoc(
    doc(db, "participants", user.uid),
    {
      acceptedRules: true,
      acceptedDate: Date.now(),
      displayName: user.displayName,
      email: user.email
    },
    { merge: true }
  );
}

