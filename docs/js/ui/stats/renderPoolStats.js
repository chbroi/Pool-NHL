
/* ================================*=================
   POOL STATISTICS RENDERER

   Analyse statistique des prédictions
   des participants.

   Responsabilités :
   - Tendances du pool
   - Choix populaires
   - Choix uniques
   - Consensus général
   - Pronostic collectif

   ================================================== */
import { getAllPredictions } from "../../services/firestoreService.js";
import { computeLeaderboard }from "../../logic/scoring.js";
import { appState } from "../../app/state.js";
/*
   Génère les statistiques globales
   du pool à partir de toutes les
   prédictions enregistrées.

   Cette page permet notamment
   d'identifier les favoris du pool
   et les prédictions uniques.
*/
export async function renderStats() {

  const container =
    document.getElementById(
      "statsTab"
    );

  const predictions =
    await getAllPredictions();
    const leaderboard =

  await computeLeaderboard(
    predictions,
    appState.results
  );

  // =====================
  // COMPTEURS
  // =====================

  const stanleyPicks = {};
  const connSmythePicks = {};
  const randomNoob =
  leaderboard.find(
    p => p.id === "randomNoob"
  );

  predictions.forEach(p => {

    const cup =
      p.picks?.R4_final_team;

    if (cup) {

      stanleyPicks[cup] =
        (stanleyPicks[cup] || 0) + 1;
    }

    const conn =
      p.picks?.Conn_Smythe;

    if (conn) {

      connSmythePicks[conn] =
        (connSmythePicks[conn] || 0) + 1;
    }
  });

  const totalPredictions =
  predictions.filter(
    p => p.userId !== "randomNoob"
  ).length;

  const favoriteCup =
    Object.entries(stanleyPicks)
      .sort((a,b) => b[1]-a[1])[0];

  const favoriteConn =
    Object.entries(connSmythePicks)
      .sort((a,b) => b[1]-a[1])[0];

  const uniqueConn =
    Object.entries(connSmythePicks)
      .filter(([_,count]) => count === 1)
      .slice(0,5);

  const uniqueTeams =
    Object.entries(stanleyPicks)
      .filter(([_,count]) => count === 1);
  const humans =
    leaderboard.filter(
      p => p.id !== "randomNoob"
    );

  const aheadOfNoob =
    humans.filter(
      p => p.score > randomNoob.score
    ).length;

  const behindNoob =
    humans.filter(
      p => p.score < randomNoob.score
    ).length;

  const tiedWithNoob =
    humans.filter(
      p => p.score === randomNoob.score
    ).length;
  const rank =
  leaderboard
    .sort((a,b)=>b.score-a.score)
    .findIndex(
      p => p.id === "randomNoob"
    ) + 1;

    const latestPredictions = {};

predictions.forEach(p => {

  const current =
    latestPredictions[p.userId];

  if (
    !current ||
    p.round > current.round
  ) {
    latestPredictions[p.userId] = p;
  }

});

const activePredictions =
  Object.values(
    latestPredictions
  );


  
    const averageHumanScore =

  humans.reduce(
    (sum,p) => sum + p.score,
    0)/humans.length;

  const deltas =

  humans.map(p => ({

    name:p.name,

    diff:
      p.score -
      randomNoob.score

  }));

  const bestVsNoob =
  [...deltas]
    .sort(
      (a,b)=>
        b.diff-a.diff
    )[0];
    
  const worstVsNoob =
    [...deltas]
      .sort(
        (a,b)=>
          a.diff-b.diff
      )[0];


const pickCounts = {};

activePredictions.forEach(p => {

  Object.entries(
    p.picks || {}
  ).forEach(([key,value]) => {

    if (!key.endsWith("_team"))
      return;

    pickCounts[key] ??= {};
    pickCounts[key][value] ??= 0;

    pickCounts[key][value]++;

  });

});

const consensusPicks = {};

Object.entries(
  pickCounts
).forEach(([match,votes]) => {

  consensusPicks[match] =

    Object.entries(votes)
      .sort(
        (a,b) => b[1] - a[1]
      )[0][0];

});

const herdScores = [];

activePredictions.forEach(p => {

  let matches = 0;
  let total = 0;

  Object.entries(
    p.picks || {}
  ).forEach(([key,value]) => {

    if (!key.endsWith("_team"))
      return;

    total++;

    if (
      consensusPicks[key] === value
    ) {
      matches++;
    }

  });

  herdScores.push({

    userName: p.userName,

    score:
      total > 0
        ? matches / total * 100
        : 0

  });

});

const audacityScores = [];

activePredictions.forEach(p => {

  let score = 0;
  let total = 0;

  Object.entries(
    p.picks || {}
  ).forEach(([key,value]) => {

    if (!key.endsWith("_team"))
      return;

    const popularity =
      pickCounts[key]?.[value];

    if (!popularity)
      return;

    score += 1 / popularity;

    total++;

  });

  audacityScores.push({

    userName: p.userName,

    score:
      total > 0
        ? score / total
        : 0

  });

});

const biggestSheep =
  [...herdScores]
    .sort((a,b) =>
      b.score - a.score
    )[0];

const biggestRebel =
  [...herdScores]
    .sort((a,b) =>
      a.score - b.score
    )[0];

const mostAudacious =
  [...audacityScores]
    .sort((a,b) =>
      b.score - a.score
    )[0];

const leastAudacious =
  [...audacityScores]
    .sort((a,b) =>
      a.score - b.score
    )[0];

    console.log(
  "activePredictions",
  activePredictions
);

console.log(
  "pickCounts",
  pickCounts
);

console.log(
  "consensusPicks",
  consensusPicks
);

console.log(
  "herdScores",
  herdScores
);

console.log(
  "audacityScores",
  audacityScores
);

  // =====================
  // CONSENSUS
  // =====================

  let consensus = 0;

  if (favoriteCup) {

    consensus =
      (
        favoriteCup[1]
        /
        totalPredictions
      ) * 100;
  }

  let consensusText =
    "Pool très divisé";

  if (consensus >= 75)
    consensusText =
      "Consensus très fort";

  else if (consensus >= 60)
    consensusText =
      "Consensus modéré";

  // =====================
  // HTML
  // =====================

  container.innerHTML = `

    <div class="card">

      <h2>
        📈 Aperçu du pool
      </h2>

      <p>
        👥 Participants :
        <strong>
          ${totalPredictions}
        </strong>
      </p>

      <p>
        🏆 Équipes différentes choisies :
        <strong>
          ${Object.keys(stanleyPicks).length}
        </strong>
      </p>

      <p>
        🏅 Choix Conn Smythe différents :
        <strong>
          ${Object.keys(connSmythePicks).length}
        </strong>
      </p>

    </div>

<div class="card">

  <h2>
    🤖 Random Noob Challenge
  </h2>

  <p>
    Score :
    <strong>
      ${randomNoob.score}
    </strong>
  </p>

  <p>
    Classement :
    <strong>
      ${rank}e sur ${leaderboard.length}
    </strong>
  </p>

  <p>
    ✅ Devant lui :
    <strong>
      ${aheadOfNoob}
    </strong>
  </p>

  <p>
    ❌ Derrière lui :
    <strong>
      ${behindNoob}
    </strong>
  </p>

  <p>
    🤝 Égaux :
    <strong>
      ${tiedWithNoob}
    </strong>
  </p>

  <p>
    📈 Score moyen humain :
    <strong>
      ${averageHumanScore.toFixed(1)}
    </strong>
  </p>

  <p>
    🏆 Meilleur écart :
    <strong>
      ${bestVsNoob.name}
      (${bestVsNoob.diff})
    </strong>
  </p>

  <p>
    🥶 Pire écart :
    <strong>
      ${worstVsNoob.name}
      (${worstVsNoob.diff})
    </strong>
  </p>

</div>

<div class="card">

  <h2>
    🐑 Suiveur du troupeau
  </h2>
  <p class="smallText">
(% de choix identiques au consensus du pool)
</p>

  <p>

    Plus conformiste :

    <strong>
      ${biggestSheep.userName}
    </strong>

    (${biggestSheep.score.toFixed(1)}%)

  </p>

  <p>

    Plus rebelle :

    <strong>
      ${biggestRebel.userName}
    </strong>

    (${biggestRebel.score.toFixed(1)}%)

  </p>

</div>

<div class="card">

  <h2>
    🚀 Indice d'audace
  </h2>
  <p class="smallText">
(favorise les choix rares et uniques)
</p>

  <p>

    Joueur le plus audacieux :

    <strong>
      ${mostAudacious.userName}
    </strong>

  </p>

  <p>

    Joueur qui suit le plus le consensus :

    <strong>
      ${leastAudacious.userName}
    </strong>

  </p>

</div>

    <div class="card">

      <h2>
        🏆 Favoris des poolers pour la Coupe Stanley
      </h2>

      ${Object.entries(stanleyPicks)

        .sort((a,b) => b[1]-a[1])

        .map(([team,count]) => `

          <p>

            <strong>
              ${team}
            </strong>

            •

            ${(
              count /
              totalPredictions *
              100
            ).toFixed(1)}%

          </p>

        `).join("")}

    </div>

    <div class="card">

      <h2>
        🏅 Favoris des poolers pour le Conn Smythe
      </h2>

      ${Object.entries(connSmythePicks)

        .sort((a,b) => b[1]-a[1])

        .slice(0,10)

        .map(([player,count]) => `

          <p>

            <strong>
              ${player}
            </strong>

            •

            ${(
              count /
              totalPredictions *
              100
            ).toFixed(1)}%

          </p>

        `).join("")}

    </div>

    <div class="card">

      <h2>
        🔮 Pronostic populaire des poolers
      </h2>

      <p>

        🏆 Coupe Stanley :

        <strong>

          ${
            favoriteCup
              ? favoriteCup[0]
              : "-"
          }

        </strong>

      </p>

      <p>

        🏅 Conn Smythe :

        <strong>

          ${
            favoriteConn
              ? favoriteConn[0]
              : "-"
          }

        </strong>

      </p>

    </div>

    <div class="card">

      <h2>
        ⚡ Choix uniques
      </h2>

      <h4>
        Conn Smythe
      </h4>

      ${
        uniqueConn.length

        ? uniqueConn
            .map(([player]) => `

              <p>
                ${player}
              </p>

            `)
            .join("")

        : "<p>Aucun choix unique.</p>"
      }

      <h4>
        Coupe Stanley
      </h4>

      ${
        uniqueTeams.length

        ? uniqueTeams
            .map(([team]) => `

              <p>
                ${team}
              </p>

            `)
            .join("")

        : "<p>Aucun choix unique.</p>"
      }

    </div>

    <div class="card">

      <h2>
        🤝 Consensus du pool
      </h2>

      <p>

        Consensus :

        <strong>

          ${consensus.toFixed(1)}%

        </strong>

      </p>

      <p>

        ${consensusText}

      </p>

    </div>

  `;
}
