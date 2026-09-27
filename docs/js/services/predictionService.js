/* ==================================================
   PREDICTION SERVICE

   Gestion complète des prédictions.

   Responsabilités :
   - Soumission des choix
   - Chargement des prédictions existantes
   - Validation du formulaire
   - Détection des champs manquants
   - Mise en évidence des modifications

   ================================================== */
import { appState } from "../app/state.js";
import { showTab } from "../app/tabs.js";
import { getPrediction,submitPrediction,updatePrediction} from "./firestoreService.js";
import { round1Ids } from "../constants.js";
import { showSuccess,showWarning,showError,confirmDialog} from "../ui/dialogs.js";

/*
   Sauvegarde ou met à jour la soumission
   de l'utilisateur connecté.

   Une confirmation est demandée avant
   l'enregistrement dans Firestore.
*/
export async function submitPredictions() {

  if (!appState.user) {
    await showWarning(
  "Onglet non-autorisé",
  "Veuillez vous connecter avant de procéder.");
    return;
  }

  const existingPrediction = await getPrediction(appState.user.uid, appState.submission,appState.currentSeason);

  const result = await confirmDialog(
  "Soumettre les prédictions",
  "Voulez-vous enregistrer vos choix ?"
);

if (!result.isConfirmed) {
  return;
}

  const form = document.getElementById("predictionForm");
  const formData = new FormData(form);

  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });
  
  try {

    // 1. FIRESTORE (SEULEMENT DATA)
    const payload = {
  userId: appState.user.uid,
  userName: appState.user.displayName,
  round: appState.submission,
  picks: data,
  timestamp: Date.now(),
  updatedAt: Date.now(),
  season: appState.currentSeason
};

if (existingPrediction) {

  await updatePrediction(
    existingPrediction.id,
    payload
  );

} else {

  await submitPrediction(
    payload
  );

}

    appState.hasSubmitted = true;
    await showSuccess(
    "Prédictions enregistrées",
    "Vous pouvez les modifier jusqu'à la date limite."
  );
    const tabs = document.getElementById("tabs");
    if (tabs) tabs.style.display = "block";

    showTab("home");

  } catch (err) {
    await showError("Erreur",err.message);

  }
};

/*
   Recharge la dernière version enregistrée
   de la soumission active.

   Les champs modifiés sont également
   mémorisés afin de détecter les changements.
*/
export async function loadExistingSubmission() {

  if (!appState.user) return;

  const prediction =
    await getPrediction(
      appState.user.uid,
      appState.submission,
      appState.currentSeason
    );

  if (!prediction) return;

  appState.originalSubmission =
  structuredClone(
    prediction.picks
  );
  
  const picks =
    prediction.picks;

  // RONDE 1
  for (const id of round1Ids) {

    if (picks[id]) {

      await setFieldValue(
        id,
        picks[id]
      );

    }

  }
  const round1Games = [
  "R1_EST_1_games",
  "R1_EST_2_games",
  "R1_EST_3_games",
  "R1_EST_4_games",
  "R1_WEST_1_games",
  "R1_WEST_2_games",
  "R1_WEST_3_games",
  "R1_WEST_4_games"
];

for (const id of round1Games) {

  if (picks[id]) {

    await setFieldValue(
      id,
      picks[id]
    );

  }

}


  // RONDE 2
  const round2 = [
    "R2_EST_1_team",
    "R2_EST_1_games",
    "R2_EST_2_team",
    "R2_EST_2_games",
    "R2_WEST_1_team",
    "R2_WEST_1_games",
    "R2_WEST_2_team",
    "R2_WEST_2_games"
  ];

  for (const id of round2) {

    if (picks[id]) {

      await setFieldValue(
        id,
        picks[id]
      );

    }

  }

    // RONDE 3
  const round3 = [
    "R3_EST_1_team",
    "R3_EST_1_games",
    "R3_WEST_1_team",
    "R3_WEST_1_games"
  ];

  for (const id of round3) {

    if (picks[id]) {

      await setFieldValue(
        id,
        picks[id]
      );

    }

  }

   // RONDE 4
  const round4 = [
    "R4_final_team",
    "R4_final_games"
  ];

  for (const id of round4) {

    if (picks[id]) {

      await setFieldValue(
        id,
        picks[id]
      );

    }

  }
// Conn Smythe
  if (picks.Conn_Smythe) {

  await setFieldValue(
    "Conn_Smythe",
    picks.Conn_Smythe
  );

}

}

/*
   Affecte une valeur à un champ du formulaire
   puis déclenche les événements associés.

   Utilisé lors du rechargement automatique
   d'une soumission existante.
*/
async function setFieldValue(name, value) {

  const field =
    document.querySelector(
      `[name="${name}"]`
    );

  if (!field) return;

  field.value = value;

  field.dispatchEvent(
    new Event("change")
  );

  await new Promise(resolve =>
    setTimeout(resolve, 0)
  );

}

/*
   Retourne la liste des choix obligatoires
   qui n'ont pas encore été complétés.
*/
export function getMissingSelections(currentSubmission) {

  const missing = [];

  const requiredFields =
    getRequiredFields(currentSubmission);

  requiredFields.forEach(id => {

    const el =
      document.getElementById(id);

    if (!el) return;

    if (!el.value) {

      const label =
        document
          .querySelector(
            `label[for="${id}"]`
          )
          ?.textContent
          ??
        id;

      missing.push({
        id,
        label
      });

    }

  });

  return missing;

}

/*
   Détermine les champs obligatoires pour
   une soumission donnée.

   Les exigences diminuent progressivement
   au fur et à mesure de l'avancement
   des séries éliminatoires.
*/
export function getRequiredFields(currentSubmission) {

  const requiredFields = [];

  if (currentSubmission === 1) {
    requiredFields.push(...round1Ids);

    // AJOUTER les games R1
    requiredFields.push(
      'R1_EST_1_games',
      'R1_EST_2_games',
      'R1_EST_3_games',
      'R1_EST_4_games',
      'R1_WEST_1_games',
      'R1_WEST_2_games',
      'R1_WEST_3_games',
      'R1_WEST_4_games'
    );
  }

  if (currentSubmission <= 2) {
    requiredFields.push(
      "R2_EST_1_team", "R2_EST_1_games",
      "R2_EST_2_team", "R2_EST_2_games",
      "R2_WEST_1_team", "R2_WEST_1_games",
      "R2_WEST_2_team", "R2_WEST_2_games"
    );
  }

  if (currentSubmission <= 3) {
    requiredFields.push(
      "R3_EST_1_team", "R3_EST_1_games",
      "R3_WEST_1_team", "R3_WEST_1_games"
    );
  }

  requiredFields.push(
    "R4_final_team",
    "R4_final_games",
    "Conn_Smythe"
  );

  return requiredFields;

}

/*
   Valide visuellement le formulaire.

   États possibles :

   - Orange : choix obligatoire manquant
   - Vert : valeur modifiée depuis la
             dernière sauvegarde

   Active ou désactive le bouton
   de soumission.
*/
export function checkIfReadyToSubmit(currentSubmission) {

const missing = getMissingSelections(currentSubmission);

document
  .querySelectorAll(
    "#predictionForm select"
  )
  .forEach(select => {
    const originalValue =
  appState.originalSubmission?.[
    select.name
  ];

const isMissing =
  !select.value;

select.classList.remove(
  "missingSelection",
  "changedSelection"
);

if (isMissing) {

  select.classList.add(
    "missingSelection"
  );

}
else if (
  originalValue !== undefined &&
  select.value !== originalValue
) {

  select.classList.add(
    "changedSelection"
  );

}

  });

  document.getElementById("submitBtn").disabled =  missing.length > 0;
}