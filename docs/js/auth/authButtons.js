/* ==================================================
   AUTH BUTTONS

   Gestion des boutons de connexion
   et de déconnexion.

   Responsabilités :
   - Authentification Google
   - Déconnexion de l'utilisateur
   - Mise à jour de l'état utilisateur

   L'initialisation complète de l'application
   est gérée séparément par authHandlers.js.

   ================================================== */
import { auth, GoogleAuthProvider } from "../firebase.js";
import { appState } from "../app/state.js";
import { signInWithPopup, signOut} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/*
   Configure les boutons de connexion
   et de déconnexion de l'application.

   La gestion détaillée de l'état utilisateur
   est ensuite prise en charge par les
   listeners d'authentification Firebase.
*/
export function initializeAuthButtons() {

  document
    .getElementById("loginBtn")
    ?.addEventListener(
      "click",
      async () => {

        const provider =
          new GoogleAuthProvider();

        const result =
          await signInWithPopup(
            auth,
            provider
          );

        appState.user =
          result.user;

      }
    );

  document
    .getElementById("logoutBtn")
    ?.addEventListener(
      "click",
      async () => {

        await signOut(auth);

      }
    );

}
