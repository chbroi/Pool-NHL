/* ==================================================
   MATCH SERVICE

   Gestion des affrontements des séries.

   Responsabilités :
   - Chargement des affrontements réels
   - Construction des rondes futures
   - Mise à jour des formulaires de prédiction

   ================================================== */

import { db } from "../firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { appState } from "../app/state.js";


/*
   Récupère les affrontememts officiels
   de première ronde.
  */

export async function getRound1Matchups() {

  const ref = doc(
    db,
    "round1Matchups",
    appState.currentSeason
  );

  const snap =
    await getDoc(ref);

  if (!snap.exists()) {
    return [];
  }

  return snap.data().matchups || [];

}


/*
   Décrit la structure logique des rondes.

   Permet de déterminer quels affrontements
   dépendent des résultats de la ronde
   précédente.
*/
export function getMatchupsForRound(roundNumber) {
  switch (roundNumber) {
    case 2:
      return [
        ['R2_EST_1_team', 'R2_EST_1_label', 'R1_EST_1_team', 'R1_EST_2_team'],
        ['R2_EST_2_team', 'R2_EST_2_label', 'R1_EST_3_team', 'R1_EST_4_team'],
        ['R2_WEST_1_team', 'R2_WEST_1_label', 'R1_WEST_1_team', 'R1_WEST_2_team'],
        ['R2_WEST_2_team', 'R2_WEST_2_label', 'R1_WEST_3_team', 'R1_WEST_4_team']
      ];
    case 3:
      return [
        ['R3_EST_1_team', 'R3_EST_1_label', 'R2_EST_1_team', 'R2_EST_2_team'],
        ['R3_WEST_1_team', 'R3_WEST_1_label', 'R2_WEST_1_team', 'R2_WEST_2_team']
      ];
    case 4:
      // Ici, on met à jour les équipes de la finale (ronde 4) avec les gagnants de la ronde 3
      return [
        ['R4_final_team', 'R4_final_label', 'R3_EST_1_team', 'R3_WEST_1_team']
      ];
    default:
      return [];
  }
}

/*
   Met à jour l'affichage d'une ronde à partir
   des gagnants connus ou prédits.

   Utilisé pour construire dynamiquement
   les rondes 2 à 4.
*/
export function showRoundFromData(roundNumber, data) {

  const matchups = getMatchupsForRound(roundNumber);

  matchups.forEach(([selectId, labelId, teamId1, teamId2]) => {

    const team1 = data[teamId1];
    const team2 = data[teamId2];

    const select = document.getElementById(selectId);
    const label = document.getElementById(labelId);

    // CRUCIAL
    if (!select || !label) return;

    if (team1 && team2) {

      label.textContent = ` ${getTeamLogo(team1)} ${team1} vs ${getTeamLogo(team2)} ${team2}`;

      select.innerHTML = `
        <option value="">Choisir</option>
        <option value="${team1}">${team1}</option>
        <option value="${team2}">${team2}</option>
      `;
    }

  });
}


