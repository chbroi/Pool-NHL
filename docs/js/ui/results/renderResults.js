/* ==================================================
   RESULTS RENDERER

   Affichage détaillé des résultats du pool.

   Responsabilités :
   - Comparaison des prédictions
   - Calcul visuel des points
   - Historique des soumissions
   - Totaux par ronde
   - Totaux globaux

   Ce module constitue la vue la plus
   détaillée du système de pointage.

   ================================================== */
import { appState } from "../../app/state.js";
import { getAllPredictions} from "../../services/firestoreService.js";
import { computeLeaderboard, getRoundFromKey } from "../../logic/scoring.js";
import { getParentMatch, isResultAvailable } from "../../utils/helpers.js";
import { getRound1Matchups } from "../../services/matchService.js";
import { SCORING, MATCH_ORDER,getTeamLogo } from "../../constants.js";


/*
   Génère la vue comp*ète des résultats.

   Affiche pour chaque soumission :
   - les résultats officiels
   - les prédictions de chaque participant
   - le détail des points obtenus
   - les totaux intermédiaires
   - le total général
*/
export async function loadPredictionsDetails() {

  const round1Matchups = await getRound1Matchups();
  const round1Map = {};
  round1Matchups.forEach(m => {
    round1Map[m.id] = `${getTeamLogo(m.team1)}${m.team1} vs ${getTeamLogo(m.team2)}${m.team2}`;
  });
  const container = document.getElementById("resultsTab");
  const predictions = await getAllPredictions();
  if (predictions.length === 0) {

  container.innerHTML = `
    <div class="card">
      <h3>📊 Résultats</h3>

      <p>
        Aucune soumission pour le moment.
      </p>
    </div>
  `;

  return;
}
  const leaderboard = await computeLeaderboard(predictions, appState.results);
  
  
  container.innerHTML = `<h2>📊 Résultats</h2>`;

  /*
   Regroupement des prédictions
   par ronde de soumission.
*/
  const submissions = {};

  predictions.forEach(data => {
    
    if (!submissions[data.round]) {
      submissions[data.round] = {};
    }

    submissions[data.round][data.userId] = {
      name: data.userName,
      picks: data.picks
    };
  });
  const sortedRounds = Object.keys(submissions)
    .map(Number)
    .sort((a,b)=>a-b);
  
  const lastSubmission = sortedRounds[sortedRounds.length - 1];

  // Tous les users
  
  const currentUserId =
  appState.user?.uid;

const currentUser =
  leaderboard.find(
    u => u.id === currentUserId
  );

const randomNoob =
  leaderboard.find(
    u => u.id === "randomNoob"
  );

const others =
  leaderboard.filter(
    u =>
      u.id !== currentUserId &&
      u.id !== "randomNoob"
  );

const orderedUsers = [

  ...(currentUser ? [currentUser] : []),

  ...(randomNoob ? [randomNoob] : []),

  ...others

];


  Object.values(submissions).forEach(roundUsers => {
    Object.entries(roundUsers).forEach(([id, user]) => {
      orderedUsers[id] = user.name;
    });
  });

  const rounds = {
    1: MATCH_ORDER.filter(k => k.startsWith("R1")),
    2: MATCH_ORDER.filter(k => k.startsWith("R2")),
    3: MATCH_ORDER.filter(k => k.startsWith("R3")),
    4: MATCH_ORDER.filter(k => k.startsWith("R4"))
  };

  /**   Accumulation du score total
   sur l'ensemble des soumissions.
*/
  const globalScores = {};

  Object.keys(submissions).map(Number).sort((a,b)=>a-b).forEach(round => {

    let html = `<h3>Soumission ${round}</h3>`;
    html += `<div class="tableWrapper">`;
    html += `<table class="resultsTable">`;

    // HEADER
    html += `<tr>
      <th>Match</th>
      <th>Résultat</th>
    `;

    
    orderedUsers.forEach(u => {
    
      const isMe = appState.user && u.id === appState.user.uid;
      html += `<th class="${isMe ? 'myColumnHeader' : ''}">
        ${isMe ? "👤 " : ""}${u.name}
      </th>`;
    });


    html += `</tr>`;

    const submissionScores = {};

    // Rounds
    Object.keys(rounds).forEach(r => {

      if (Number(r) < Number(round)) return;
      html += `<tr class="roundHeader">
        <td colspan="${orderedUsers.length + 2}">Ronde ${r}</td>
      </tr>`;

      rounds[r].forEach(matchKey => {

        const teamKey = matchKey + "_team";
        const gamesKey = matchKey + "_games";

        // ✅ RÉSULTAT (gagnant seulement, jamais de "vs")
        let resultTeam = appState.results[teamKey];
        let resultDisplay = resultTeam
          ? `${getTeamLogo(resultTeam)} ${resultTeam}`
          : "-";
        
        const resultGames = appState.results[gamesKey];
        
        if (resultTeam && isResultAvailable(gamesKey)) {
          resultDisplay += ` (${resultGames})`;
        }
        
        // ✅ MATCH NAME (affrontement seulement ici)
        let displayName = "";
        
        // ✅ RONDE 1 → matchup réel
        if (matchKey.startsWith("R1")) {
          const m = round1Map[matchKey];
        
          if (m && m !== "") {
            displayName = m;
          } else {
            displayName = matchKey;
          }
        }
        
        // ✅ RONDE 2+
        else {
        
          const p1 = getParentMatch(matchKey, 1);
          const p2 = getParentMatch(matchKey, 2);
        
          const t1 = p1 ? appState.results[p1] : null;
          const t2 = p2 ? appState.results[p2] : null;
        
          if (t1 && t2) {
            displayName = `${getTeamLogo(t1)}${t1} vs ${getTeamLogo(t2)}${t2}`;
          } else {
            // ✅ fallback selon ta logique
            if (matchKey.startsWith("R2")) {
              displayName = matchKey.includes("EST")
                ? "Gagnant Est X vs Gagnant Est Y"
                : "Gagnant Ouest X vs Gagnant Ouest Y";
            }
            else if (matchKey.startsWith("R3")) {
              displayName = matchKey.includes("EST")
                ? "Finale Est"
                : "Finale Ouest";
            }
            else if (matchKey.startsWith("R4")) {
              displayName = "Finale Coupe Stanley";
            }
            else {
              displayName = "Match à déterminer";
            }
          }
        }

      

        html += `<tr><td>${displayName}</td>`;

        html += `<td>${resultDisplay}</td>`;

        orderedUsers.forEach(user => {
          const userData = submissions[round]?.[user.id];
          const pickTeam = userData?.picks?.[teamKey];
          const pickGames = userData?.picks?.[gamesKey];

          let cell = pickTeam
            ? `${getTeamLogo(pickTeam)} ${pickTeam} (${pickGames})`
            : "-";

          let points = 0;
          
          const submission = round;
          const roundNum = getRoundFromKey(teamKey);
          const submissionConfig = SCORING.submissions[submission];
          const roundConfig = submissionConfig?.rounds[roundNum];
          const isMe = appState.user && user.id === appState.user.uid;
          

          if (pickTeam && isResultAvailable(teamKey)) {

            if (pickTeam === resultTeam) {

              
                if (roundConfig) {
                
                  points += roundConfig.team;
                
                  if (
                    isResultAvailable(gamesKey) &&
                    Number(pickGames) === Number(resultGames)
                  ) {
                    points += roundConfig.games;
                  }
                
                }
                if (
                  isResultAvailable(gamesKey) &&
                  Number(pickGames) === Number(resultGames)
                ) {
                  cell += " ✅✅";
                } else {
                  cell += " ✅";
                }


            } else {
              cell += " ❌";
            }

            if (points > 0) {
              cell += ` (+${points})`;
            }
          }

          submissionScores[user.id] = (submissionScores[user.id] || 0) + points;
          globalScores[user.id] = (globalScores[user.id] || 0) + points;
          

          html += `
          <td class="${isMe ? 'myColumnCell' : ''}">
            ${cell}
          </td>
        `;
        });

        html += `</tr>`;
      });
      
    });
    /*
      Évaluation du choix Conn Smythe
      pour chaque participant.
    */
    html += `<tr>
      <td>🏆 Conn Smythe</td>
      <td>${appState.results["Conn_Smythe"] || "-"}</td>
    `;

    orderedUsers.forEach(user => {

      const userData = submissions[round]?.[user.id];
      const pick = userData?.picks?.["Conn_Smythe"];

      let cell = pick || "-";
      let points = 0;

      const submission = Number(round);
      const submissionConfig = SCORING.submissions[submission];

      if (pick && appState.results["Conn_Smythe"]) {

        if (pick === appState.results["Conn_Smythe"]) {
          cell += ` ✅✅ (+${submissionConfig.connSmythe})`;
          points += submissionConfig.connSmythe;
        } else {
          cell += " ❌";
        }
      }

      submissionScores[user.id] = (submissionScores[user.id] || 0) + points;
      globalScores[user.id] = (globalScores[user.id] || 0) + points;

      
      const isMe = appState.user && user.id === appState.user.uid;
      
      html += `
        <td class="${isMe ? 'myColumnCell' : ''}">
          ${cell}
        </td>
      `;

    });

    html += `</tr>`;

    // ✅ Total soumission
    html += `<tr class="scoreRow">
      <td colspan="2"><strong>Total Soumission</strong></td>`;

    orderedUsers.forEach(user => {
      html += `<td><strong>${submissionScores[user.id] || 0}</strong></td>`;
    });

    html += `</tr>`;

    // ✅ Total global
    
    if (round === lastSubmission) {
    
      html += `<tr class="totalGlobalRow">
        <td colspan="2"><strong>Total Global</strong></td>`;
    
      orderedUsers.forEach(user => {
        html += `<td><strong>${globalScores[user.id] || 0}</strong></td>`;
      });
    
      html += `</tr>`;
    }

    html += `</table></div><br>`;
    container.innerHTML += html;
    


  });
}

/*
   Génère dynamiquement le formulaire
   de prédiction d'une ronde.

   Les affrontements sont construits
   à partir des résultats connus ou
   des choix déjà effectués.
*/
export async function generateRound(roundNumber) {

  const container = document.getElementById(`round${roundNumber}`);
  if (!container) return;

  const form = document.getElementById("predictionForm");
  const picks = form ? Object.fromEntries(new FormData(form)) : {};

  let matchups = [];

  // ✅ source (résultats ou picks)
  const source =
    roundNumber <= appState.submission
      ? appState.results
      : picks;

  // ✅ R1 depuis Firestore
  if (roundNumber === 1) {
    matchups = await getRound1Matchups();
  }

  // ✅ R2
  if (roundNumber === 2) {
    matchups = [
      { id: "R2_EST_1", team1: source["R1_EST_1_team"], team2: source["R1_EST_2_team"] },
      { id: "R2_EST_2", team1: source["R1_EST_3_team"], team2: source["R1_EST_4_team"] },
      { id: "R2_WEST_1", team1: source["R1_WEST_1_team"], team2: source["R1_WEST_2_team"] },
      { id: "R2_WEST_2", team1: source["R1_WEST_3_team"], team2: source["R1_WEST_4_team"] }
    ];
  }

  // ✅ R3
  if (roundNumber === 3) {
    matchups = [
      { id: "R3_EST_1", team1: source["R2_EST_1_team"], team2: source["R2_EST_2_team"] },
      { id: "R3_WEST_1", team1: source["R2_WEST_1_team"], team2: source["R2_WEST_2_team"] }
    ];
  }

  // ✅ R4
  if (roundNumber === 4) {
    container.style.display = "block";

    matchups = [
      { id: "R4_final", team1: source["R3_EST_1_team"], team2: source["R3_WEST_1_team"] }
    ];
  }

  // ✅ RENDER HTML
  let html = `<h2>Ronde ${roundNumber}</h2>`;

  matchups.forEach(match => {

    const team1 = match.team1 || "";
    const team2 = match.team2 || "";

    if (!team1 || !team2) {
      html += `<div class="matchup"><label>Match à venir</label></div>`;
      return;
    }

    html += `
      <div class="matchup">
        <label>  ${getTeamLogo(team1)}${team1}  vs  ${getTeamLogo(team2)}${team2} </label>
        <select name="${match.id}_team" id="${match.id}_team">
          <option value="">Choisir</option>
          <option value="${team1}">${team1}</option>
          <option value="${team2}">${team2}</option>
        </select>

        <label>en</label>

        <select name="${match.id}_games" id="${match.id}_games">
          <option value="">Choisir</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
        </select> matchs
      </div>
    `;
  });

  container.innerHTML = html;
  container.style.display = "block";
}

/*
   Affiche les règles officielles
   de pointage du pool.

   Les valeurs sont directement basées
   sur la configuration SCORING.
*/
export function renderScoring() {

  const container = document.getElementById("scoringTab");

  container.innerHTML = `<h2>📊 Système de pointage</h2>`;
  container.innerHTML += `

<div class="card">

  <h3>
    🎯 Principe du pool
  </h3>

  <p>

    Plus une prédiction est faite tôt dans les séries,
    plus elle vaut de points.

  </p>

  <p>

    Exemple pour le champion de la Coupe Stanley :

  </p>

  <ul>

    <li>
      Soumission 1 :
      Champion correct = 8 pts
    </li>

    <li>
      Soumission 2 :
      Champion correct = 4 pts
    </li>

    <li>
      Soumission 3 :
      Champion correct = 2 pts
    </li>

    <li>
      Soumission 4 :
      Champion correct = 1 pt
    </li>

  </ul>

  <p>

    ✅ Le risque est récompensé lorsque la prédiction
    est faite avant que les séries avancent.

  </p>

</div>

`;

  Object.entries(SCORING.submissions).forEach(([sub, config]) => {

    let html = `<div class="card"> <h3>Soumission ${sub}</h3>`;
    html += `<ul>`;

    Object.entries(config.rounds).forEach(([round, pts]) => {
      html += `<li>Ronde ${round} : ${pts.team} pts (équipe) + ${pts.games} pts (# matchs)</li>`;
    });

    html += `<li>Conn Smythe : ${config.connSmythe} pts</li>`;
    html += `</ul> </div>`;

    container.innerHTML += html;

  })
  ;
  container.innerHTML += `

<div class="card">

  <h3>
    💡 Exemple concret
  </h3>

    <p>
    Soumission 1
    </p>

   Ronde 1 
  <ul>

    <li>
      CAR en 6
      (résultat : CAR en 6)
      → ✅ 1 pt équipe + 2 pts matchs =3 points
    </li>

    <li>
      DAL en 7
      (résultat : DAL en 6)
      → ✅ 1 pt équipe = 1 point
    </li>

    <li>
      EDM en 5
      (résultat : VGK en 6)
      → ❌ 0 point
    </li>

    <li>
      Conn Smythe correct
      → ✅ 4 pts
    </li>

  </ul>

  <p>

    <strong>
      Total : 8 pts
    </strong>

  </p>

  <p>
    Soumission 2
  </p>  
  Ronde 3
  <ul>
  
    <li>
      CAR en 6
      (résultat : CAR en 6)
      → ✅ 2 pts équipe + 2 pts matchs = 4 points
    </li>

    <li>
      DAL en 7
      (résultat : DAL en 6)
      → ✅ 2 pts équipe = 2 points
    </li>

    <li>
      EDM en 5
      (résultat : VGK en 6)
      → ❌ 0 pt
    </li>

    <li>
      Conn Smythe correct
      → ✅ 3 pts
    </li>

  </ul>

  <p>

    <strong>
      Total : 9 pts
    </strong>

  </p>

</div>

`;
}

/*
   Construit les affrontements d'une ronde
   à partir des gagnants de la ronde
   précédente.
*/
export async function getMatchupsForRound(
  roundNumber,
  source
) {

  if (roundNumber === 1) {
    return await getRound1Matchups();
  }

  if (roundNumber === 2) {
    return [
      {
        id: "R2_EST_1",
        team1: source["R1_EST_1_team"],
        team2: source["R1_EST_2_team"]
      },
      {
        id: "R2_EST_2",
        team1: source["R1_EST_3_team"],
        team2: source["R1_EST_4_team"]
      },
      {
        id: "R2_WEST_1",
        team1: source["R1_WEST_1_team"],
        team2: source["R1_WEST_2_team"]
      },
      {
        id: "R2_WEST_2",
        team1: source["R1_WEST_3_team"],
        team2: source["R1_WEST_4_team"]
      }
    ];
  }

  if (roundNumber === 3) {
    return [
      {
        id: "R3_EST_1",
        team1: source["R2_EST_1_team"],
        team2: source["R2_EST_2_team"]
      },
      {
        id: "R3_WEST_1",
        team1: source["R2_WEST_1_team"],
        team2: source["R2_WEST_2_team"]
      }
    ];
  }

  if (roundNumber === 4) {
    return [
      {
        id: "R4_final",
        team1: source["R3_EST_1_team"],
        team2: source["R3_WEST_1_team"]
      }
    ];
  }

  return [];

}
