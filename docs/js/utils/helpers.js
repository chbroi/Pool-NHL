/* ==================================================
   HELPERS

   Fonctions utilitaires utilisées dans
   plusieurs modules de l'application.

   Responsabilités :
   - Gestion des dates limites
   - Gestion des rondes
   - Affichage des délais
   - Vérification des résultats
   - Messages contextuels

   ================================================== */
import { appState } from "../app/state.js";

/*
   Vérifie si un résultat officiel
   est disponible pour une clé donnée.
*/
export function isResultAvailable(key) {
  return appState.results[key] && appState.results[key] !== "";
}

/*
   Retourne les matchs parents utilisés
   pour construire une ronde donnée.

   Exemple :

   R3_EST_1
   ← R2_EST_1
   ← R2_EST_2
*/
export function getParentMatch(matchKey, teamNb) {

  const map = {
    R2_EST_1: ["R1_EST_1_team", "R1_EST_2_team"],
    R2_EST_2: ["R1_EST_3_team", "R1_EST_4_team"],
    R2_WEST_1: ["R1_WEST_1_team", "R1_WEST_2_team"],
    R2_WEST_2: ["R1_WEST_3_team", "R1_WEST_4_team"],

    R3_EST_1: ["R2_EST_1_team", "R2_EST_2_team"],
    R3_WEST_1: ["R2_WEST_1_team", "R2_WEST_2_team"],

    R4_final: ["R3_EST_1_team", "R3_WEST_1_team"]
  };

  return map[matchKey] ? map[matchKey][teamNb-1] : null;
}

/*
   Met à jour le message d'information
   affiché au-dessus du formulaire.

   Affiche :
   - la ronde active
   - la date limite
   - le temps restant
*/
export function refreshHelperMessage() {
  
  if ( !appState.submission || !appState.currentSeason) {
  return;
}

    const helper =
        document.getElementById(
            "helperMessage"
        );

    if (!helper) return;

    const deadline =
        appState[
            `round${appState.submission}Deadline`
        ];

    const deadlinePassed =
        deadline &&
        Date.now() > deadline;

    if (!isSubmissionOpen()) {

        helper.innerHTML =
            "🔒 Les soumissions sont actuellement fermées. Revenez plus tard.";

        return;
    }

    const roundNames = {
        1: "Première ronde",
        2: "Deuxième ronde",
        3: "Finales de conférence",
        4: "Finale de la Coupe Stanley"
    };

    helper.innerHTML = `
        🏒 Soumission active :
        <strong>
            ${roundNames[appState.submission]}
        </strong>

        • Date limite :
        <strong>
            ${formatDeadline(deadline)}
        </strong>
        • Temps restant :
          <strong>
            ${formatCountdown(deadline)}
          </strong>
              `;

}

/*
   Convertit une date limite
   en chaîne lisible.
*/
export function formatDeadline(value) {

  if (!value) {
    return "TBD";
  }

  return new Date(value)
    .toLocaleString();

}

/*
   Détermine si les soumissions
   sont actuellement autorisées.

   Tient compte :
   - du statut global
   - de la date limite
*/
export function isSubmissionOpen() {

    const deadline =
        appState[
            `round${appState.submission}Deadline`
        ];

    const deadlinePassed =
        deadline &&
        Date.now() > deadline;

    return (
        appState.submissionOpen &&
        !deadlinePassed
    );

}

/*
   Génère un compte à rebours
   lisible à partir d'une date limite.
*/
export function formatCountdown(deadline) {

  const diff =
    deadline - Date.now();

  if (diff <= 0) {
    return "🔒 Expiré";
  }

  const days =
    Math.floor(
      diff / (1000 * 60 * 60 * 24)
    );

  const hours =
    Math.floor(
      (diff / (1000 * 60 * 60)) % 24
    );

  const minutes =
    Math.floor(
      (diff / (1000 * 60)) % 60
    );
  const secondes =
    Math.floor(
      (diff / (1000)) % 60
    );

  return `${days}j ${hours}h ${minutes}m ${secondes}s`;

}
