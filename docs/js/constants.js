/* =============*==================================*=
   CONSTANTS

   Configuration statique de l'application.

   Responsabilités :
   - Structure des sér*es
   - Configuration financière
   - Pointage
   - Navigation
   - L*gos NHL

   Toute modification métier importante
   devrait idéalement être centralisée ici.

   =======*==================================*======= */
/*
   Ordre officiel des affrontements
   utilisé dans les tableaux
   de résultats.
*/
   export const MATCH_ORDER = [
  "R1_EST_1","R1_EST_2","R1_EST_3","R1_EST_4",
  "R1_WEST_1","R1_WEST_2","R1_WEST_3","R1_WEST_4",
  "R2_EST_1","R2_EST_2","R2_WEST_1","R2_WEST_2",
  "R3_EST_1","R3_WEST_1",
  "R4_final",
  "Conn_Smythe"
];

/*
   Paramètres financiers du pool.

   - coût d'inscription
   - répartition des gains
*/
export const POOL_CONFIG = {
  entryFee: 10,
  payout: {
    first: 4 / 7,
    second: 2 / 7,
    third: 1 / 7
  }
};

/*
   Liste complète des sélections
   de gagnants de première ronde.
*/
export const round1Ids = [
      'R1_EST_1_team', 'R1_EST_2_team', 'R1_EST_3_team', 'R1_EST_4_team',
      'R1_WEST_1_team', 'R1_WEST_2_team', 'R1_WEST_3_team', 'R1_WEST_4_team'
    ];

/*
   Configuration officielle du système
   de pointage.

   Chaque soumission possède ses
   propres valeurs de récompe*se.
*/
export const SCORING = {

  submissions: {

    1: {
      rounds: {
        1: { team: 1, games: 2 },
        2: { team: 2, games: 2 },
        3: { team: 4, games: 2 },
        4: { team: 8, games: 2 }
      },
      connSmythe: 4
    },

    2: {
      rounds: {
        2: { team: 1, games: 2 },
        3: { team: 2, games: 2 },
        4: { team: 4, games: 2 }
      },
      connSmythe: 3
    },

    3: {
      rounds: {
        3: { team: 1, games: 2 },
        4: { team: 2, games: 2 }
      },
      connSmythe: 2
    },

    4: {
      rounds: {
        4: { team: 1, games: 2 }
      },
      connSmythe: 1
    }

  }
};

/*
   Liste des onglets disponibles
   dans l'application.
*/
 export const TABS = [
  "home",
  "submit",
  "scoring",
  "results",
  "leaderboard",
  "stats",
  "statsNHL",
  "rules",
  "admin",
  "profile"
];

/*
   Génère le logo adapté au thème
   actuellement sélectionné.

   Version claire ou sombre selon
   l'apparence active.
*/
export function getTeamLogo(teamAbbrev) {

  if (!teamAbbrev) return "";

  const theme =
    document.body.dataset.theme === "dark"
      ? "dark"
      : "light";

  return `
    <img
      class="teamLogo"
      src="https://assets.nhle.com/logos/nhl/svg/${teamAbbrev}_${theme}.svg"
      alt="${teamAbbrev}"
    >
  `;
}
