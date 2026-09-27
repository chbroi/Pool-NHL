import firebase_admin

from firebase_admin import credentials
from firebase_admin import firestore
from settings import (
    db,
    SEASON
)



mapping = {

    "A": "R1_EST_1",
    "B": "R1_EST_2",
    "C": "R1_EST_3",
    "D": "R1_EST_4",

    "E": "R1_WEST_1",
    "F": "R1_WEST_2",
    "G": "R1_WEST_3",
    "H": "R1_WEST_4",

    "I": "R2_EST_1",
    "J": "R2_EST_2",

    "K": "R2_WEST_1",
    "L": "R2_WEST_2",

    "M": "R3_EST_1",
    "N": "R3_WEST_1",

    "O": "R4_final"
}

db.collection(
    "playoffStructure"
).document(
    SEASON
).set({

    "season": SEASON,
    "mapping": mapping

})

print(
    f"{SEASON} playoff structure updated"
)