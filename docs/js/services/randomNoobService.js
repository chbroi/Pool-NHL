/* ==================================================
   RANDOM NOOB SERVICE

   Génération du participant fictif
   « Random Noob ».

   Responsabilités :
   - Génération de prédictions aléatoires
   - Propagation des gagnants aux rondes futures
   - Sélection aléatoire du Conn Smythe

   Random Noob sert uniquement de référence
   ludique et n'est pas un participant officiel.

   ================================================== */

import { appState } from "../app/state.js";
import { getRound1Matchups } from "./matchService.js";
import { getMatchupsForRound } from "./matchService.js";
import { getParentMatch } from "../utils/helpers.js";

/*
   Génère un nombre aléatoire de matchs
   compris entre 4 et 7.
*/
function getRandomGames() {

  return String(
    4 + Math.floor(Math.random() * 4)
  );

}

/*
   Sélectionne aléatoirement un gagnant
   entre deux équipes.
*/
function pickWinner(team1, team2) {

  return Math.random() < 0.5
    ? team1
    : team2;

}


/*
   Construit une soumission complète
   pour Random Noob.

   Les rondes futures sont générées
   automatiquement à partir des choix
   précédemment produits.
*/
export async function buildRandomNoobPicks() {

  const picks = {};

  // ----------------------
  // RONDE ACTIVE
  // ----------------------

  if (appState.submission === 1) {

    const round1 =
      await getRound1Matchups();

    round1.forEach(match => {

      picks[
        `${match.id}_team`
      ] =
        pickWinner(
          match.team1,
          match.team2
        );

      picks[
        `${match.id}_games`
      ] =
        getRandomGames();

    });

  } else {

    const currentMatchups =
      getMatchupsForRound(
        appState.submission
      );

    currentMatchups.forEach(match => {

      const [
        matchKey,
        ,
        team1Key,
        team2Key
      ] = match;

      picks[matchKey] =
        pickWinner(
          appState.results[team1Key],
          appState.results[team2Key]
        );

      picks[
        matchKey.replace(
          "_team",
          "_games"
        )
      ] =
        getRandomGames();

    });

  }
  for (
  let round =
    appState.submission + 1;

  round <= 4;

  round++
) {

  const matchups =
    getMatchupsForRound(round);

  const source = {

    ...appState.results,
    ...picks

  };

  matchups.forEach(match => {

    const [
      matchKey
    ] = match;

    const matchId =
      matchKey.replace(
        "_team",
        ""
      );

    const {
      team1,
      team2
    } =
      getNoobTeamsForMatch(
        matchId,
        source
      );

    if (
      !team1 ||
      !team2
    ) {
      return;
    }

    picks[matchKey] =
      pickWinner(
        team1,
        team2
      );

    picks[
      matchKey.replace(
        "_team",
        "_games"
      )
    ] =
      getRandomGames();

  });

}
const players =
  appState.players || [];
const finalists =
  players.filter(
    p =>
      p.team ===
      picks["R3_EST_1_team"]

      ||

      p.team ===
      picks["R3_WEST_1_team"]
  );
  if (finalists.length) {

  picks.Conn_Smythe =
    finalists[
      Math.floor(
        Math.random() *
        finalists.length
      )
    ].name;

}
return picks;
}

/*
   Détermine les deux équipes participant
   à un affrontement futur à partir des
   résultats connus et des prédictions
   déjà générées.
*/
function getNoobTeamsForMatch(
  matchId,
  source
) {

  const team1Parent =
    getParentMatch(matchId, 1);

  const team2Parent =
    getParentMatch(matchId, 2);

  return {
    team1: source[team1Parent],
    team2: source[team2Parent]
  };

}