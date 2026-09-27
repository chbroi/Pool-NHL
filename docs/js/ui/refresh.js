/* =================================*================
   PUBLIC PAGE REFRESH

   Chargement des pages publiques.

   Responsabilités :
   - Accueil
   - Classement
   - Résultats
   - Statistiques du pool
   - Statistiques NHL

   Utilisé principalement lors des
   changements d'état de connexion.

   ================================================== */
import { renderHome } from "./home/renderHome.js";
import { loadPredictionsDetails } from "./results/renderResults.js";
import { renderStats} from "./stats/renderPoolStats.js";
import { renderFullLeaderboard } from "./leaderboard/renderLeaderboard.js";
import { renderNhlStats } from "./stats/renderNhlStats.js";

/*
   Recharge l'ensemble des pages publiques.

   Permet de reconstruire rapidement
   l'interface lorsqu'un utilisateur
   se connecte ou se déconnecte.
*/

export async function loadPublicPages() {

  await renderHome();

  await renderFullLeaderboard();

  await loadPredictionsDetails();

  await renderStats();

  await renderNhlStats();

}