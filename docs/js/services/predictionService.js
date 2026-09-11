import { appState } from "../app/state.js";
import { showTab } from "../app/tabs.js";
import { getPrediction,submitPrediction,updatePrediction} from "./firestoreService.js";

export async function submitPredictions() {

  if (!appState.user) {
    alert("Tu dois être connecté.");
    return;
  }

  const existingPrediction = await getPrediction(appState.user.uid, appState.submission);


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

  if (!appState.user) {
    return;
  }

  const prediction =
    await getPrediction(
      appState.user.uid,
      appState.submission
    );

  if (!prediction) {
    return;
  }

  const picks =
    prediction.picks;

  Object.entries(picks)
    .forEach(([key, value]) => {

      const field =
        document.querySelector(
          `[name="${key}"]`
        );

      if (field) {
        field.value = value;
      }

    });

}
