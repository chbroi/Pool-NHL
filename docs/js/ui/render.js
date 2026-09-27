/* ==================================================
   RENDER INDEX

   Point d'accès central des modules
   de rendu de l'application.

   Ce fichier simplifie les imports
   en regroupant tous les renderers.

   ================================================== */
export { renderHome } from "./home/renderHome.js";
export { renderAdmin } from "./admin/renderAdmin.js";
export { renderProfile,renderSubmissionStatus} from "./profile/renderProfile.js";
export { renderFullLeaderboard } from "./leaderboard/renderLeaderboard.js";
export { loadPredictionsDetails, generateRound,renderScoring}from "./results/renderResults.js";
export { renderStats} from "./stats/renderPoolStats.js";
export { renderNhlStats, renderNhlStatsTable, attachNhlStatsListeners} from "./stats/renderNhlStats.js";
export { reloadFeedbackSection } from "./admin/renderAdminFeedback.js";
