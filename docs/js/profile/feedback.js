/* ========================*=========================
   FEEDBACK

   Gestion des commentaires transmis
   par les participants.

   Responsabilités :
   - Validation des commentaires
   - Enregistrement dans Firestore
   - Confirmation à l'utilisateur

   ================================================== */
import { appState } from "../app/state.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "../firebase.js";
import { showSuccess,showWarning,showError} from "../ui/dialogs.js";

/*
   Soumet un commentaire ou une suggestion
   associée à l'utilisateur connecté.

   Les commentaires sont enregistrés dans
   Firestore afin d'être consultés depuis
   l'interface administrateur.
*/

export async function submitFeedback() {

  const message =
    document
      .getElementById(
        "profileComment"
      )
      ?.value
      ?.trim();

  if (!message) {

    await showWarning(
      "Commentaire vide",
      "Veuillez entrer un commentaire."
    );

    return;
  }

  try {

    await addDoc(
      collection(db, "feedback"),
      {
        userId: appState.user.uid,
        userName: appState.user.displayName,
        email: appState.user.email,
        message,
        timestamp: Date.now()
      }
    );


    await showSuccess(
      "Merci !",
      "Votre commentaire a été envoyé."
    );


    document.getElementById(
      "profileComment"
    ).value = "";

  } catch (err) {

    await showError(
      "Erreur:",
      err.message
    );

  }

};
