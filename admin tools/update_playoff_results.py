import requests
import urllib3
import firebase_admin
import json
from settings import (
    db,
    PLAYOFF_YEAR,
    SEASON
)

from firebase_admin import credentials
from firebase_admin import firestore

urllib3.disable_warnings(
    urllib3.exceptions.InsecureRequestWarning
)


url = f"https://api-web.nhle.com/v1/playoff-bracket/{PLAYOFF_YEAR}"



data = requests.get(url,verify=False).json()

structure = (
    db.collection(
        "playoffStructure"
    )
    .document(
        SEASON
    )
    .get()
    .to_dict()
)

mapping = structure["mapping"]

results = {

    "season": SEASON,

    "playoffYear": PLAYOFF_YEAR

}

for series in data["series"]:

    key = mapping.get(
        series["seriesLetter"]
    )

    if not key:
        continue

    top_wins = series["topSeedWins"]
    bottom_wins = series["bottomSeedWins"]

    if top_wins == 4:

        winner = (
            series["topSeedTeam"]["abbrev"]
        )

    elif bottom_wins == 4:

        winner = (
            series["bottomSeedTeam"]["abbrev"]
        )

    else:
        continue

    results[f"{key}_team"] = winner

    results[f"{key}_games"] = (
        top_wins + bottom_wins
    )




print(
    json.dumps(
        results,
        indent=2
    )
)

print()

print("RESULTS GENERATED")

print(
    json.dumps(
        results,
        indent=2
    )
)
print(
    "Number of results:",len(results)
)

db.collection(
    "results"
).document(
    SEASON
).set(
    results,
    merge=True
)

print(
    "Firestore updated"
)