import os
import firebase_admin

from firebase_admin import credentials
from firebase_admin import firestore

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

SERVICE_ACCOUNT = os.path.join(
    BASE_DIR,
    "serviceAccountKey.json"
)

# singleton Firebase

try:

    firebase_admin.get_app()

except ValueError:

    cred = credentials.Certificate(
        SERVICE_ACCOUNT
    )

    firebase_admin.initialize_app(
        cred
    )

db = firestore.client()

config = (
    db.collection("config")
      .document("ui")
      .get()
      .to_dict()
)

SEASON = config["currentSeason"]

season_start = int(
    SEASON.split("-")[0]
)

season_end = int(
    SEASON.split("-")[1]
)

NHL_SEASON_ID = int(
    f"{season_start}{season_end}"
)

PLAYOFF_YEAR = season_end