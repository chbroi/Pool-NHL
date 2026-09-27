import requests
import firebase_admin


from firebase_admin import credentials
from firebase_admin import firestore
from settings import (
    db,
    PLAYOFF_YEAR,
    SEASON
)


url = (
    f"https://api-web.nhle.com/v1/playoff-bracket/{PLAYOFF_YEAR}"
)

data = requests.get(
    url,
    verify=False
).json()

structure = db.collection(
    "playoffStructure"
).document(
    SEASON
).get().to_dict()

mapping = structure["mapping"]

matchups = []

for series in data["series"]:

    if series["playoffRound"] != 1:
        continue

    matchup_id = mapping.get(
        series["seriesLetter"]
    )

    if not matchup_id:
        continue

    matchups.append({

        "id": matchup_id,

        "team1":
        series["topSeedTeam"]["abbrev"],

        "team2":
        series["bottomSeedTeam"]["abbrev"]

    })

db.collection(
    "round1Matchups"
).document(
    SEASON
).set({

    "season": SEASON,

    "matchups": matchups

})

print(
    "Round1 updated"
)