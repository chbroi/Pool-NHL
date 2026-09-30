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
   Génère la vue complète des résultats.

   Affiche pour chaque soumission :
   - les résultats officiels
   - les prédictions de chaque participant
   - le détail des points obtenus
   - les totaux intermédiaires
   - le total général
*/
export async function loadPredictionsDetails() {

  const container = document.getElementById("resultsTab");
  container.innerHTML = `
    <div class="card">

      <div class="subTabs">

        <button
          id="tableViewBtn"
          class="actionBtn"
          onclick="showResultsView('table')">
          📊 Tableau
        </button>

        <button
        id="bracketViewBtn"
          class="actionBtn secondary"
          onclick="showResultsView('bracket')">
          🏒 Bracket
        </button>

      </div>

      <div id="resultsTableView"></div>

      <div
  id="resultsBracketView"
  style="display:none">

  <div class="card">

    <h3>🏒 Bracket</h3>

    <div class="bracketControls">
      <label>
        Utilisateur
      </label>

      <select id="bracketUserSelect">

        <option value="official">
          Résultats officiels
        </option>

      </select>

      <label id="submissionLabel">
        Soumission
      </label>

      <select id="bracketSubmissionSelect">
      </select>

    </div>

    <div id="playoffBracket"></div>

  </div>

</div>

    </div>
    `;

  const tableContainer = document.getElementById( "resultsTableView");
  const round1Matchups = await getRound1Matchups();
  appState.round1Matchups = round1Matchups;

  const round1Map = {};
  round1Matchups.forEach(m => {
    round1Map[m.id] = `${getTeamLogo(m.team1)}${m.team1} vs ${getTeamLogo(m.team2)}${m.team2}`;
  });
  const predictions = await getAllPredictions();
  if (predictions.length > 0) {
    initializeBracket(predictions);
  }
  console.log(
  document.getElementById(
    "bracketUserSelect"
  )
);
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
    tableContainer.innerHTML += html;
    


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


export function showResultsView(view) {

  const table =
    document.getElementById(
      "resultsTableView"
    );

  const bracket =
    document.getElementById(
      "resultsBracketView"
    );

  const tableBtn =
    document.getElementById(
      "tableViewBtn"
    );

  const bracketBtn =
    document.getElementById(
      "bracketViewBtn"
    );

  if (view === "table") {

    table.style.display = "block";
    bracket.style.display = "none";

    tableBtn.classList.remove(
      "secondary"
    );

    bracketBtn.classList.add(
      "secondary"
    );

  }
  else {

    table.style.display = "none";
    bracket.style.display = "block";

    tableBtn.classList.add(
      "secondary"
    );

    bracketBtn.classList.remove(
      "secondary"
    );

  }
}



export function renderBracket(source,showPrediction=false,submission=1) {

  const container =
    document.getElementById(
      "playoffBracket"
    );

  if (!container) return;

  const r = source;

  container.innerHTML = `

<div class="playoffBracket">

  
  <div class="roundColumn">
    <div class="roundTitle">
      Ronde 1
    </div>
    <div class="
  conference
  ${submission > 1 ? 'lockedRound' : ''}
">
    ${renderSeriesCard(
      buildSeries(
        "R1_EST_1",
        r,
        appState.round1Matchups
      ),showPrediction
    )}

    ${renderSeriesCard(
      buildSeries(
        "R1_EST_2",
        r,
        appState.round1Matchups
      ),showPrediction
    )}


    ${renderSeriesCard(
      buildSeries(
        "R1_EST_3",
        r,
        appState.round1Matchups
      ),showPrediction
    )}

    ${renderSeriesCard(
      buildSeries(
        "R1_EST_4",
        r,
        appState.round1Matchups
      ),showPrediction
    )}

  </div>
  </div>

  
  <div class="roundColumn">
  <div class="roundTitle">
      Ronde 2
    </div>
  <div class="
  conference
  ${submission > 2 ? 'lockedRound' : ''}
">
    ${renderSeriesCard(
      buildSeries(
        "R2_EST_1",
        r,
        appState.round1Matchups
      ),showPrediction
    )}

    ${renderSeriesCard(
      buildSeries(
        "R2_EST_2",
        r,
        appState.round1Matchups
      ),showPrediction
    )}

  </div>
  </div>

  
  <div class="roundColumn">
  <div class="roundTitle">
      Finale de l'est
    </div>
  <div class="
  conference
  ${submission > 3 ? 'lockedRound' : ''}
">
    ${renderSeriesCard(
      buildSeries(
        "R3_EST_1",
        r,
        appState.round1Matchups
      ),showPrediction
    )}

  </div>
  </div>

  
  
  <div class="roundColumn">
  <div class="roundTitle">
      Finale de la coupe Stanley
    </div>
  <div class="stanley">
    ${renderSeriesCard(
      buildSeries(
        "R4_final",
        r,
        appState.round1Matchups
      ),showPrediction
    )}

  </div>
  </div>

  
  <div class="roundColumn">
  <div class="roundTitle">
      Finale de l'ouest
    </div>
  <div class="
  conference
  ${submission > 3 ? 'lockedRound' : ''}
">
    ${renderSeriesCard(
      buildSeries(
        "R3_WEST_1",
        r,
        appState.round1Matchups
      ),showPrediction
    )}

  </div>
  </div>

  
<div class="roundColumn">
  <div class="roundTitle">
      Ronde 2
    </div>
  <div class="
  conference
  ${submission > 2 ? 'lockedRound' : ''}
">
    ${renderSeriesCard(
      buildSeries(
        "R2_WEST_1",
        r,
        appState.round1Matchups
      ),showPrediction
    )}

    ${renderSeriesCard(
      buildSeries(
        "R2_WEST_2",
        r,
        appState.round1Matchups
      ),showPrediction
    )}

  </div>
  </div>

  
<div class="roundColumn">
  <div class="roundTitle">
      Ronde 1
    </div>
  <div class="
  conference
  ${submission > 1 ? 'lockedRound' : ''}
">
    ${renderSeriesCard(
      buildSeries(
        "R1_WEST_1",
        r,
        appState.round1Matchups
      ),showPrediction
    )}

    ${renderSeriesCard(
      buildSeries(
        "R1_WEST_2",
        r,
        appState.round1Matchups
      ),showPrediction
    )}

    ${renderSeriesCard(
      buildSeries(
        "R1_WEST_3",
        r,
        appState.round1Matchups
      ),showPrediction
    )}

    ${renderSeriesCard(
      buildSeries(
        "R1_WEST_4",
        r,
        appState.round1Matchups
      ),showPrediction
    )}

  </div>
  </div>

</div>

  `;
}


export async function initializeBracket (predictions) {

  populateUserSelector (predictions);
  attachBracketListeners(predictions);
  renderSelectedBracket (predictions);
}

function populateUserSelector(
  predictions
) {

  const select =
    document.getElementById(
      "bracketUserSelect"
    );

  const users =
    new Map();

  predictions.forEach(p => {

    users.set(
      p.userId,
      p.userName
    );

  });

  let html = `
    <option value="official">
      Résultats officiels
    </option>
  `;

  users.forEach((name,id) => {

    html += `
      <option value="${id}">
        ${name}
      </option>
    `;

  });

  select.innerHTML = html;

  updateSubmissionSelector();
}

function updateSubmissionSelector(
  predictions
) {

  const userId =
    document.getElementById(
      "bracketUserSelect"
    ).value;

  const select =
    document.getElementById(
      "bracketSubmissionSelect"
    );

  select.innerHTML = "";

  if (userId === "official")
    return;

  const rounds =
    [...new Set(

      predictions
        .filter(
          p => p.userId === userId
        )
        .map(
          p => p.round
        )

    )]
    .sort((a,b)=>a-b);

  rounds.forEach(round => {

    select.innerHTML += `
      <option value="${round}">
        Soumission ${round}
      </option>
    `;

  });

}

function attachBracketListeners(predictions) {

  document
    .getElementById(
      "bracketUserSelect"
    )
    .addEventListener(
      "change",
      () => {

        updateSubmissionSelector(
          predictions
        );

        renderSelectedBracket(
          predictions
        );

      }
    );

  document
    .getElementById(
      "bracketSubmissionSelect"
    )
    .addEventListener(
      "change",
      () =>
        renderSelectedBracket(
          predictions
        )
    );

}

function renderSelectedBracket(
  predictions
) {

  const userId =
    document.getElementById(
      "bracketUserSelect"
    ).value;
    
  const submissionLabel =
  document.getElementById(
    "submissionLabel"
  );

const submissionSelect =
  document.getElementById(
    "bracketSubmissionSelect"
  );

if (userId === "official") {

  submissionLabel.style.display =
    "none";

  submissionSelect.style.display =
    "none";

}
else {

  submissionLabel.style.display =
    "";

  submissionSelect.style.display =
    "";

}
  
  const showPrediction =  userId !== "official";
  const submission =
    Number(
      document.getElementById(
        "bracketSubmissionSelect"
      ).value
    );

  if (
    userId === "official"
  ) {

    renderBracket(
      appState.results,false,1
    );

    return;
  }

  const prediction =
    predictions.find(
      p =>
        p.userId === userId &&
        p.round === submission
    );

  if (!prediction) {

    renderBracket(
      appState.results,false,1
    );

    return;
  }

  const source =
    buildHybridBracket(
      prediction.picks
    );

  renderBracket(
    source,showPrediction,submission
);
}

function buildHybridBracket(
  picks
) {

  const source = {

    ...appState.results,

    _prediction: picks

  };

  const submission =
    Number(
      document.getElementById(
        "bracketSubmissionSelect"
      ).value
    );

  const roundsToOverride = {

    1:["R1","R2","R3","R4"],

    2:["R2","R3","R4"],

    3:["R3","R4"],

    4:["R4"]

  };

  const allowed =
    roundsToOverride[
      submission
    ];

  Object.entries(
    picks
  ).forEach(
    ([key,value]) => {

      if (
        allowed.some(
          round =>
            key.startsWith(
              round
            )
        )
      ) {

        source[key] =
          value;

      }

    }
  );

  return source;
}

function getSeriesScore( winner,team1,team2,games) {

  if (!games) {

    return {

      team1Wins:"-",

      team2Wins:"-"

    };

  }

  const loserWins =
    games - 4;

  if (
    winner === team1
  ) {

    return {

      team1Wins:4,

      team2Wins:loserWins

    };

  }

  return {

    team1Wins:loserWins,

    team2Wins:4

  };

}

function buildSeries(matchId, source, round1Map) {

  let team1;
  let team2;

  const winner =
  source[
    `${matchId}_team`
  ];

  const games =
    source[
      `${matchId}_games`
    ];

  const predictedWinner =
    source._prediction?.[
      `${matchId}_team`
    ];

  const predictedGames =
    source._prediction?.[
      `${matchId}_games`
    ];
  const officialWinner = appState.results[
    `${matchId}_team`
  ];

  const officialGames = appState.results[
    `${matchId}_games`
  ];
  const teamCorrect = predictedWinner === officialWinner;
  const gamesCorrect =  predictedWinner === officialWinner &&  Number(predictedGames) === Number(officialGames);
  const officialResultAvailable =
  !!officialWinner &&
  !!officialGames;
  if (matchId.startsWith("R1")) {

    const matchup =
      round1Map.find(
        m => m.id === matchId
      );

    if (!matchup) return null;

    team1 =
      matchup.team1;

    team2 =
      matchup.team2;
  }
  else {

    const parent1 =
      getParentMatch(
        matchId,
        1
      );

    const parent2 =
      getParentMatch(
        matchId,
        2
      );

    team1 =
      source[
        `${parent1}`
      ];

    team2 =
      source[
        `${parent2}`
      ];
      }

      console.log({

  matchId,

  predictedWinner,

  officialWinner,

  predictedGames,

  officialGames,

  teamCorrect,

  gamesCorrect

});
  return {

  matchId,

  team1,

  team2,

  winner,

  games,

  predictedWinner,

  predictedGames,

  officialGames,
  
  officialWinner,

  teamCorrect,

  gamesCorrect,

  officialResultAvailable

};

}

function renderSeriesCard( series, showPrediction,isLocked=false ) {
  if (!series)
    return "";

  const {

  team1,
  team2,

  winner,
  games,
  teamCorrect,
  gamesCorrect,
  officialResultAvailable

  } = series;


    let predictionIcon = "";

    if (isLocked) {

      predictionIcon = "🔒";

    }
    else if (!officialResultAvailable ) {

      predictionIcon = "";

    }
    else if (teamCorrect && gamesCorrect) {

      predictionIcon = "✅✅";

    }
    else if (teamCorrect) {

      predictionIcon = "✅";

    }
    else {

      predictionIcon = "❌";

    }
  const predictionHtml = 
  showPrediction
  ? `<div class="predictionResult">
       ${predictionIcon}
     </div>`

  : "";

  const score =
    getSeriesScore(
      winner,
      team1,
      team2,
      games
    );

    const team1Winner =
  winner === team1;

const team2Winner =
  winner === team2;

  return `

  <div class="seriesCard">

    <div class="
  teamRow
  ${team1Winner ? 'winnerRow' : 'loserRow'}
">

      ${getTeamLogo(team1)}

      <span>

        ${team1}

      </span>

      <strong>

        ${score.team1Wins}

      </strong>

    </div>

    <div class="
  teamRow
  ${team2Winner ? 'winnerRow' : 'loserRow'}
">

      ${getTeamLogo(team2)}

      <span>

        ${team2}

      </span>

      <strong>

        ${score.team2Wins}

      </strong>

    </div>
      ${predictionHtml}
    </div>

  `;
}