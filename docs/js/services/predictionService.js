import { appState } from "../app/state.js";
import { showTab } from "../app/tabs.js";
import { getPrediction,submitPrediction,updatePrediction} from "./firestoreService.js";
import { attachRound1Listeners, attachRound2Listeners, attachRound3Listeners, attachConnSmytheListeners} from "../ui/listeners.js";
import { round1Ids } from "../constants.js";

export async function submitPredictions() {

  if (!appState.user) {
    alert("Tu dois être connecté.");
    return;
  }

  const existingPrediction = await getPrediction(appState.user.uid, appState.submission);
  console.log(existingPrediction);

  if (!confirm("Confirmer la soumission?")) return;

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
  updatedAt: Date.now()
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

    const tabs = document.getElementById("tabs");
    if (tabs) tabs.style.display = "block";

    showTab("home");

  } catch (err) {
    console.error(err);
    alert("Erreur: " + err.message);
  }
};


export async function loadExistingSubmission() {

  if (!appState.user) return;

  const prediction =
    await getPrediction(
      appState.user.uid,
      appState.submission
    );

  if (!prediction) return;

  appState.originalSubmission =
  structuredClone(
    prediction.picks
  );
  const picks =
    prediction.picks;

  console.log(
  "Conn Smythe sauvegardé:",
  picks.Conn_Smythe
);

console.log(
  "Valeurs disponibles:",
  [...document.getElementById("Conn_Smythe").options]
    .map(o => o.value)
);

  // RONDE 1
  for (const id of round1Ids) {

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

}

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
