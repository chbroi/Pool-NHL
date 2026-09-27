/* ==================================================
   RENDER ADMIN

   Point d'entrée principal de l'interface
   d'administration.

   Responsabilités :
   - Construction des différentes cartes admin
   - Chargement des données administratives
   - Restauration des commentaires reçus
   - Initialisation des listes et formulaires

   ================================================== */
import { appState } from "../../app/state.js";
import { renderAdminSubmissionCard, loadDeadlineFields, loadAdminSubmission,loadConnSmytheDatalist } from "./renderAdminSubmission.js";
import { renderAdminPaymentsCard, loadAdminPayments } from "./renderAdminPayments.js";
import { renderAdminFeedbackCard, reloadFeedbackSection } from "./renderAdminFeedback.js";
import { renderAdminHistoryCard,loadAdminHistory} from "./renderAdminHistory.js";

/*
   Génère l'ensemble de l'interface
   d'administration.

   Regroupe :
   - la gestion des soumissions
   - la gestion des paiements
   - les commentaires
   - l'historique administratif
*/
export async function renderAdmin() {

  const container =
    document.getElementById("adminTab");

  container.innerHTML = `
    ${renderAdminSubmissionCard()}
    ${renderAdminPaymentsCard()}
    ${renderAdminFeedbackCard()}
    ${renderAdminHistoryCard()}
  `;
  if (appState.feedbackSnapshot) { 
    reloadFeedbackSection(appState.feedbackSnapshot);
}

  await loadAdminPayments();
  await loadAdminSubmission();
  await loadAdminHistory();
  await loadDeadlineFields();
  loadConnSmytheDatalist();

}
