
/* ====================*=============================
   S*ORING ENGINE

   Moteur de calcul du pointage du pool.

   Responsabilités :
   - Calcul des points d'une soumission
   - Calcul du total d'un participant
   - Construction du classement global
   - Application des règles de pointage
     définies dans SCORING

   ==============*==================================* */
import { SCORING } from "../constants.js";

/*
   Détermine à quelle ronde appartient
   une clé de résultat ou de prédiction.

   Exemple :
*  R2_EST_1_team → ronde 2
*/
export function getRoundFromKey(key) {
  if (key.startsWith("R1")) return 1;
  if (key.startsWith("R2")) return 2;
  if (key.startsWith("R3")) return 3;
  if (key.startsWith("R4")) return 4;
  return 0;
}


/*
   Calcule le score obtenu pour une
   soumission donnée.

   Les points sont attribués selon :
   - l'équipe correctement sélectionnée
   - le nombre exact de matchs
   - le trophée Conn Smythe

   Les règles appliquées dépendent de la
   soumission utilisée lors de la prédiction.
*/
export function calculateSubmissionScore(picks, results, submission) {

  let score = 0;

  const submissionConfig = SCORING.submissions[submission];
  if (!submissionConfig) return 0;

  Object.keys(picks).forEach(key => {

    const resultValue = results[key];

    if (!resultValue || resultValue === "") return;

    // ✅ MATCHS
    if (key.includes("_team")) {

      const round = getRoundFromKey(key);
      const roundConfig = submissionConfig.rounds[round];

      if (!roundConfig) return;

      if (picks[key] === resultValue) {

        // ✅ points équipe
        score += roundConfig.team;

        // ✅ points games
        const gamesKey = key.replace("_team", "_games");

        if (
          results[gamesKey] &&
          Number(picks[gamesKey]) === Number(results[gamesKey])
        ) {
          score += roundConfig.games;
        }
      }
    }

    // ✅ CONN SMYTHE
    if (key === "Conn_Smythe") {

      if (picks[key] === results[key]) {
        score += submissionConfig.connSmythe;
      }
    }

  });

  return score;
}


/*
   Calcule le total cumulé d'un participant.

   Les prédictions sont évaluées individuellement
   puis additionnées afin d'obtenir le pointage
   global du participant.
*/
export function calculateTotalScore(predictions, results) {

  let total = 0;

  predictions.forEach(pred => {

    const submissionNumber = pred.round;
    const picks = pred.picks;

    const filtered = {};

    Object.keys(picks).forEach(key => {

      const round = getRoundFromKey(key);

      if (round >= submissionNumber || key === "Conn_Smythe") {
        filtered[key] = picks[key];
      }
    });

    total += calculateSubmissionScore(filtered, results);
  });

  return total;
}

/*
   Génère le classement global du pool.

   Chaque soumission est évaluée puis les
   points sont regroupés par participant.

   Retour :
   [
     {
       id,
       name,
       score
     }
   ]

   Les participants sont retournés en ordre décroissant de pointage.
*/
export async function computeLeaderboard(predictions, results) {

  const scores = {};

  predictions.forEach(p => {

    const userId = p.userId;
    const submission = p.round;

    const score = calculateSubmissionScore(
      p.picks,
      results,
      submission
    );

    scores[userId] = (scores[userId] || 0) + score;

  });

  return Object.entries(scores).map(([id, score]) => {

    const user = predictions.find(p => p.userId === id);

    return {
      id,
      name: user.userName,
      score
    };

  }).sort((a, b) => b.score - a.score);
}
