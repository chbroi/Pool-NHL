import requests
import firebase_admin
import urllib3
import os
import json
from settings import (
    db,
    NHL_SEASON_ID,
    SEASON,
    PLAYOFF_YEAR
)

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

SERVICE_ACCOUNT = os.path.join(
    BASE_DIR,
    "serviceAccountKey.json"
)



from firebase_admin import credentials
from firebase_admin import firestore

urllib3.disable_warnings()

# =====================================================
# AUTOMATIC PLAYOFF TEAMS
# =====================================================

def get_playoff_teams():

    url = (
        f"https://api-web.nhle.com/"
        f"v1/playoff-bracket/{PLAYOFF_YEAR}"
    )

    data = requests.get(
        url,
        verify=False
    ).json()

    teams = set()

    for series in data["series"]:

        if series["playoffRound"] != 1:
            continue

        teams.add(
            series["topSeedTeam"]["abbrev"]
        )

        teams.add(
            series["bottomSeedTeam"]["abbrev"]
        )

    return sorted(list(teams))



# =====================================================
# ROSTER
# =====================================================

def get_roster(team):

    url = (
        f"https://api-web.nhle.com/"
        f"v1/roster/{team}/current"
    )

    roster = requests.get(
        url,
        verify=False
    ).json()

    players = []

    for value in roster.values():

        if isinstance(value, list):

            for player in value:

                players.append(player)

    return players


# =====================================================
# PLAYER LANDING
# =====================================================

def get_player_details(player_id):

    url = (
        f"https://api-web.nhle.com/"
        f"v1/player/{player_id}/landing"
    )

    return requests.get(
        url,
        verify=False
    ).json()


# =====================================================
# FIND SEASON STATS
# =====================================================

def find_stats(details):

    season_games = 0
    
    season_goals = 0
    season_assists = 0
    season_points = 0

    playoff_games = 0
    playoff_goals = 0
    playoff_assists = 0
    playoff_points = 0

    wins = 0
    losses = 0
    gaa = 0
    save_pct = 0

    playoff_wins=0
    playoff_losses=0
    playoff_gaa=0
    playoff_save_pct=0
    

    season_totals = details.get(
        "seasonTotals",
        []
    )

    for stat in season_totals:

        season_id = stat.get(
            "season",
            0
        )

        game_type = stat.get(
            "gameTypeId",
            0
        )

        league = stat.get(
            "leagueAbbrev",
            ""
        )
        

        if season_id != NHL_SEASON_ID:
            continue

        # REGULAR SEASON
        
        if (
            season_id == NHL_SEASON_ID
            and game_type == 2
            and league == "NHL"
        ):
            season_games = stat.get(
                "gamesPlayed",
                0
            )
            season_goals = stat.get(
                "goals", 0
            )

            season_assists = stat.get(
                "assists", 0
            )

            season_points = stat.get(
                "points", 0
            )
            wins = stat.get(
                "wins", 0
            )
            losses = stat.get(
                "losses", 0
            )
            gaa = stat.get(
                "goalsAgainstAvg", 0
            )
            save_pct = stat.get(
                "savePctg", 0
            )

        # PLAYOFFS
        if (
            season_id == NHL_SEASON_ID
            and game_type == 3
            and league == "NHL"
        ):

            playoff_games = stat.get(
                "gamesPlayed",
                0
            )
            playoff_goals = stat.get(
                "goals", 0
            )

            playoff_assists = stat.get(
                "assists", 0
            )

            playoff_points = stat.get(
                "points", 0
            )
            playoff_wins = stat.get(
                "wins", 0
            )
            playoff_losses = stat.get(
                "losses", 0
            )
            playoff_gaa = stat.get(
                "goalsAgainstAvg", 0
            )
            playoff_save_pct = stat.get(
                "savePctg", 0
            )

    return {
    "seasonGames": season_games,
    "seasonGoals": season_goals,
    "seasonAssists": season_assists,
    "seasonPoints": season_points,

    "playoffGames": playoff_games,
    "playoffGoals": playoff_goals,
    "playoffAssists": playoff_assists,
    "playoffPoints": playoff_points,

    "wins": wins,
    "losses": losses,
    "gaa": gaa,
    "savePct": save_pct,

    "playoffWins": playoff_wins,
    "playoffLosses": playoff_losses,
    "playoffGaa": playoff_gaa,
    "playoffSavePct": playoff_save_pct
}

# =====================================================
# SAVE PLAYER
# =====================================================

def save_player(player, team):

    player_id = player["id"]

    try:

        details = get_player_details(
            player_id
        )

        stats = find_stats(details)

        document = {

            "season": SEASON,
            "nhlSeasonId": NHL_SEASON_ID,
            

            "playerId":
                player_id,

            "name":
                f"{player['firstName']['default']} "
                f"{player['lastName']['default']}",

            "team":
                team,

            "position":
                player.get(
                    "positionCode",
                    ""
                ),

            "activePlayoffTeam":
                True,

            **stats
        }

        db.collection(
            "players"
        ).document(
            f"{SEASON}_{player_id}"
        ).set(
            document,
            merge=True
        )


    except Exception as e:

        print(
            f"✖ Erreur {player_id}"
        )

        print(e)

def clear_players_collection():

    docs = db.collection("players").stream()

    for doc in docs:
        doc.reference.delete()

    print("Collection players supprimée")

def get_current_season_in_db():

    docs = list(
        db.collection("players")
        .limit(1)
        .stream()
    )

    if not docs:
        return None

    return docs[0].to_dict().get(
        "season"
    )

# =====================================================
# MAIN
# =====================================================

def main():

    season_in_db = get_current_season_in_db()

    #if (
    #    season_in_db is not None
    #    and season_in_db != NHL_SEASON_ID
    #):

        #clear_players_collection()

    teams = get_playoff_teams()

    ...

    for team in teams:

        roster = get_roster(team)

        for player in roster:

            save_player(
                player,
                team
            )

    print("Terminé")


if __name__ == "__main__":
    main()