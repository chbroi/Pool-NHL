/* ==================================================
   UI LISTENERS

   Gestion des événements associés
   au formulaire de prédictions.

   Responsabilités :
   - Propagation des gagnants
   - Génération dynamique des rondes
   - Mise à jour du Conn Smythe
   - Validation du formulaire

   ================================================== */
import { round1Ids} from "../constants.js";
import { appState } from "../app/state.js";
import { checkIfReadyToSubmit } from "../services/predictionService.js"; // ou renderRounds.js
import { updateConnSmytheField } from "../services/nhlService.js"; // ou renderRounds.js
import { generateRound } from "./render.js"; // ou renderRounds.js

/*
   Attache les événements de la première ronde.

   Chaque modification d'un gagnant
   déclenche la reconstruction de la ronde 2.
*/
export function attachRound1Listeners() {

  round1Ids.forEach(id => {

    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('change', async () => {
      await generateRound(2);

      attachRound2Listeners();

      checkIfReadyToSubmit(
        appState.submission
      );
    });

  });

}

/*
   Attache les événements de la deuxième ronde.

   Chaque modification d'un gagnant
   déclenche la reconstruction de la ronde 3.
*/
export function attachRound2Listeners() {

  [
    'R2_EST_1_team',
    'R2_EST_2_team',
    'R2_WEST_1_team',
    'R2_WEST_2_team'
  ].forEach(id => {

    const el = document.getElementById(id);

    if (!el) return;

    el.addEventListener('change', async () => {

      await generateRound(3);

      attachRound3Listeners();

      checkIfReadyToSubmit(
        appState.submission
      );

    });

  });

}
/*
   Attache les événements de la troisième ronde.

   Chaque modification met à jour :
   - la finale
   - les choix Conn Smythe
*/
export function attachRound3Listeners() {

  [
    'R3_EST_1_team',
    'R3_WEST_1_team'
  ].forEach(id => {

    const el = document.getElementById(id);

    if (!el) return;

    el.addEventListener('change', async () => {

      await generateRound(4);
      attachConnSmytheListeners();
      updateConnSmytheField(appState.players, appState.submission);
      checkIfReadyToSubmit(appState.submission);
    });

  });

}

/*
   Synchronise automatiquement la liste
   des candidats Conn Smythe avec les
   finalistes sélectionnés.
*/
export function attachConnSmytheListeners() {

  const est = document.getElementById('R3_EST_1_team');
  const west = document.getElementById('R3_WEST_1_team');

  if (est) {
    est.addEventListener('change', () => {

      updateConnSmytheField(
        appState.players,
        appState.submission
      );

      checkIfReadyToSubmit(
        appState.submission
      );

    });
  }

  if (west) {
    west.addEventListener('change', () => {

      updateConnSmytheField(
        appState.players,
        appState.submission
      );

      checkIfReadyToSubmit(
        appState.submission
      );

    });
  }

  const conn = document.getElementById('Conn_Smythe');

  if (conn) {

    conn.addEventListener('change', () => {

      checkIfReadyToSubmit(
        appState.submission
      );

    });

  }
}
