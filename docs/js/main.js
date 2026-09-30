/* ============================*=====================
   MAIN

   Point d'entrée principal de l'application.

   Responsabilités :
   - Initialisation globale
   - Authentification
   - Thème
   - Règles de participation
   - Exposition des fonctions globales

   ============*==================================*== */
import { refreshHelperMessage } from "./utils/helpers.js"
import { toggleSubmissionOpen, updateSubmissionRound, clearAdminHistory, updateDeadline, deletePredictionAdmin, togglePayment, deleteFeedback} from "./admin/adminActions.js";
import { showRulesModal,initializeRulesUi } from "./app/rulesModal.js";
import { submitPredictions } from "./services/predictionService.js";
import { initializeTheme} from "./app/theme.js";
import { initializeAuth} from "./auth/authHandlers.js";
import { initializeAuthButtons} from "./auth/authButtons.js";
import { submitFeedback } from "./profile/feedback.js";
import { updateConnSmythePlayers } from "./services/nhlService.js";
import { generateRandomNoob,updateConnSmytheWinner} from "./admin/adminActions.js";
import { showTab } from "./app/tabs.js";
import { showResultsView} from "./ui/results/renderResults.js";

/* 
 Configuration des boutons d'authentification.
*/
initializeAuthButtons();

/*
   Initialisation des composants
   dépendant du DOM.
*/
document.addEventListener("DOMContentLoaded", () => {
  
  initializeRulesUi();
  initializeTheme();

});



/*
   Démarrage du cycle de vie
   d'authentifi*ation Firebase.
*/
initializeAuth();
                 
/*
   Mise à jour continue du compte à rebours des dates limites.
*/
setInterval(() => {refreshHelperMessage();

}, 1000);

/* =================================*================
   API GLOBALE UI*
   Fonctions exposées à partir du HTML
   via les attributs onclick.
   ================================================== */
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
window.generateRandomNoob = generateRandomNoob;
window.updateConnSmytheWinner =  updateConnSmytheWinner;
window.showResultsView =  showResultsView;