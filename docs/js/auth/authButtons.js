import { auth, GoogleAuthProvider } from "../firebase.js";
import { appState } from "../app/state.js";

import { signInWithPopup, signOut} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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
