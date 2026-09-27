/* ==================================================
   NHL SERVICE

   Outils liés aux statistiques NHL.

   Responsabilités :
   - Gestion du Conn Smythe
   - Classements de joueurs
   - Classements des gardiens

   ================================================== */

/*
   Prévu pour synchroniser les données
   de joueurs à partir de l'API NHL.

   Fonction actuellement utilisée
   comme point d'extension futur.
*/
   export async function updateConnSmythePlayers() {

  const response = await fetch(
    "https://api-web.nhle.com/v1/skater-stats-leaders/current"
  );

  const data = await response.json();

}

/*
   Met à jour la liste des candidats
   au Conn Smythe.

   Les candidats possibles sont limités
   aux équipes encore présentes dans
   les finales de conférence.
*/
export function updateConnSmytheList(team1,team2, players,submissionNumber) {

    const list = players.filter(
        player =>
            player.team === team1 ||
            player.team === team2
    );

    if (submissionNumber === 1) {

        list.sort(
            (a,b) =>
                b.seasonPoints -
                a.seasonPoints
        );

    } else {

        list.sort(
            (a,b) =>
                b.playoffPoints -
                a.playoffPoints
        );

    }

    const connSmytheSelect =
        document.getElementById(
            "Conn_Smythe"
        );

    connSmytheSelect.innerHTML = "";

    const defaultOption =
        document.createElement(
            "option"
        );

    defaultOption.value = "";

    defaultOption.textContent =
        "-- Choisissez un joueur --";

    connSmytheSelect.appendChild(
        defaultOption
    );

    list.forEach(player => {
      let label = "";
        const option =
            document.createElement(
                "option"
            );

        option.value =
            player.name;

        if (player.position === "G") {
        
            if (submissionNumber === 1) {
        
                label =
                  `${player.name} (${player.team})
                  • ${player.wins} V
                  • ${player.losses} D
                  • ${player.gaa.toFixed(2)} MBA
                  • ${player.savePct.toFixed(3)}`;
        
            }
            else {
        
                label =
                  `${player.name} (${player.team})
                  • ${player.playoffWins || 0} V
                  • ${player.playoffLosses || 0} D
                  • ${(player.playoffGaa || 0).toFixed(2)} MBA
                  • ${(player.playoffSavePct || 0).toFixed(3)}`;
        
            }
        }
        else {
        
            if (submissionNumber === 1) {
        
                label =
                  `${player.name} (${player.team})
                  • ${player.seasonGoals} B
                  • ${player.seasonAssists} A
                  • ${player.seasonPoints} PTS`;
        
            }
            else {
        
                label =
                  `${player.name} (${player.team})
                  • ${player.playoffGoals} B
                  • ${player.playoffAssists} A
                  • ${player.playoffPoints} PTS`;
        
            }
        }
         option.textContent = label;
        connSmytheSelect.appendChild(
            option
        );
    });

    connSmytheSelect.disabled =
        list.length === 0;
}

/*
   Rafraîchit automatiquement la liste
   Conn Smythe lorsque les finalistes
   changent.
*/
export function updateConnSmytheField(players,submissionNumber) {
    const team1 =
        document.getElementById(
            'R3_EST_1_team'
        ).value;

    const team2 =
        document.getElementById(
            'R3_WEST_1_team'
        ).value;

    if (team1 && team2) {

        updateConnSmytheList(
            team1,
            team2,
            players,
            submissionNumber
        );
    }
}

/*
   Retourne les joueurs triés selon
   le nombre de points en saison.
*/
export function getTopScorers(players) {

    return [...players]
        .sort(
            (a,b) =>
                b.seasonPoints -
                a.seasonPoints
        );
}

/*
   Retourne les joueurs triés selon
   le nombre de buts en saison.
*/
export function getTopGoalScorers(players) {

    return [...players]
        .sort(
            (a,b) =>
                b.seasonGoals -
                a.seasonGoals
        );
}

/*
   Retourne les joueurs triés selon
   le nombre de passes en saison.
*/
export function getTopAssists(players) {

    return [...players]
        .sort(
            (a,b) =>
                b.seasonAssists -
                a.seasonAssists
        );
}

/*
   Retourne les gardiens triés selon
   leur moyenne de buts alloués.
*/
export function getTopGoalies(players) {

    return [...players]

        .filter(
            p =>
                p.position === "G"
        )

        .sort(
            (a,b) =>
                a.gaa -
                b.gaa
        );
}