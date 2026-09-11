//MAIN Script pour le pool
import { auth, GoogleAuthProvider } from "./firebase.js";
import { loadPlayers} from "./services/firestoreService.js";
import { signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { POOL_CONFIG} from "./constants.js";
import { appState } from "./app/state.js"
import { toggleSubmissionOpen, updateSubmissionRound, clearAdminHistory, updateDeadline, deletePredictionAdmin, togglePayment, deleteFeedback} from "./admin/adminActions.js";
import { showRulesModal } from "./app/rulesModal.js";
import { submitPredictions } from "./services/predictionService.js";
import { initializeTheme} from "./app/theme.js";
import { initializeAuth} from "./auth/authHandlers.js";
import { initializeAuthButtons} from "./auth/authButtons.js";
import { submitFeedback } from "./profile/feedback.js";
import { updateConnSmythePlayers } from "./services/nhlService.js";

import { showTab } from "./app/tabs.js";


initializeAuthButtons();

document.addEventListener("DOMContentLoaded", () => {
  

  const currentDeadline = appState[`round${appState.submission}Deadline`];
  if (currentDeadline && Date.now() > currentDeadline) {
    appState.submissionOpen =false;
  }
  
    document.querySelectorAll(".rulesEntryFee")
    .forEach(el => {
      el.textContent = POOL_CONFIG.entryFee;
    });
    const entryFeeAmount =
    document.getElementById("entryFeeAmount");
  
  if (entryFeeAmount) {
    entryFeeAmount.textContent =
      POOL_CONFIG.entryFee;
  }
    const backBtn =
    document.getElementById(
      "backToModalBtn"
    );
  
  if (backBtn) {
  
    backBtn.addEventListener(
      "click",
      () => {
  
        document.getElementById(
          "rulesBackContainer"
        ).style.display = "none";
  
        showRulesModal();
  
      }
    );
  
  }

initializeTheme();

});

await loadPlayers();

initializeAuth();
                  

window.showRulesModal = showRulesModal;

window.showTab = showTab;

window.submitPredictions =  submitPredictions;

window.submitFeedback = submitFeedback;

window.toggleSubmissionOpen = toggleSubmissionOpen;

window.updateSubmissionRound = updateSubmissionRound;

window.clearAdminHistory = clearAdminHistory;

window.updateDeadline = updateDeadline;

window.deletePredictionAdmin = deletePredictionAdmin;

window.togglePayment = togglePayment;

window.deleteFeedback = deleteFeedback;

window.updateConnSmythePlayers = updateConnSmythePlayers;
