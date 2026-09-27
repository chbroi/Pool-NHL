/* ==================================================
   TAB NAVIGATION

   Gestion de la navigation de l'application.

   Responsabilités :
   - changement d'onglet
   - validation des accès
   - mise en évidence de l'onglet actif
   - chargement du contenu associé

   ================================================== */

import { appState } from "./state.js";
import { isSubmissionOpen } from "../utils/helpers.js";
import { TABS } from "../constants.js";
import { showRulesModal } from "./rulesModal.js";
import { renderHome, renderScoring, renderProfile, renderStats, renderAdmin, renderNhlStats, loadPredictionsDetails, renderFullLeaderboard, renderSubmissionStatus} from "../ui/render.js";
import { loadExistingSubmission } from "../services/predictionService.js";
import { showWarning} from "../ui/dialogs.js";

/*
   Association entre les onglets et les
   fonctions responsables de leur rendu.
*/
const tabRenderers = { 
  home: () => renderHome(),
  results: () => loadPredictionsDetails(),
  leaderboard: () => renderFullLeaderboard(),
  scoring: () => renderScoring(),
  stats: () => renderStats(),
  statsNHL: () => renderNhlStats(),
  profile: () => renderProfile(),
  admin: () => renderAdmin(),
  rules: () => handleRulesTab(),
  submit: () => handleSubmitTab()
};

/*
   Prépare l'onglet de sou*ission.

   Vérifie :
   - l'accep*ation des règlements
   - l'ouvert*re des soumissions
   - l'existenc* d'une soumission précédente

   Charge ensuite les données sauvegardées.
*/
async function handleSubmitTab() {
    if (!appState.acceptedRules) {
        showRulesModal();
        return;
      }
  
    const form = document.getElementById("predictionForm");
    const tab = document.getElementById("submitTab");
  
    if (!form || !tab) return;
const currentDeadline = appState[`round${appState.submission}Deadline`];

if (!isSubmissionOpen()) {
  
  tab.innerHTML = `
    <div class="card">

      <h3>
        🔒 Soumissions fermées
      </h3>

      <p>
        Les prédictions pour cette ronde sont terminées.
      </p>

    </div>
  `;

  return;
}
  if (appState.hasSubmitted) {

  tab.innerHTML = `
    <div class="card">

      <h3>
        ✅ Soumission enregistrée
      </h3>

      <p>
        Vous pouvez modifier votre soumission
        jusqu'à la date limite.
      </p>

      <p>
        Dernière version enregistrée chargée automatiquement.
      </p>

    </div>

    <div class="card legendCard">

      <div>
        🟧 Choix à compléter
      </div>

      <div>
        🟩 Modifié depuis la dernière sauvegarde
      </div>

    </div>
  `;
}
    
  
      // IMPORTANT → remettre le form si effacé
      if (!tab.querySelector("#predictionForm")) {
        tab.appendChild(form);
      }
      for (let i = 1; i <= 4; i++) {
        const roundDiv =
          document.getElementById(`round${i}`);
        if (!roundDiv) continue;
        if (i < appState.submission) {
          roundDiv.style.display = "none";
        } else {
          roundDiv.style.display = "block";
        }
      }
      
      await renderSubmissionStatus();
      await loadExistingSubmission();
      form.style.display = "block";
    }  

/*
   Affiche l'onglet des règlements.
*/    
function handleRulesTab() {

 document
   .getElementById("rulesTab")
   .style.display = "block";

}

/*
   Met visuellement en évidence
   l'onglet actuellement sélectionné.
*/
function updateActiveTab(tabName) {

  document
    .querySelectorAll("#tabs button")
    .forEach(btn => {
      btn.classList.remove("activeTab");
    });

  const clickedButton =
    document.querySelector(
      `#tabs button[onclick="showTab('${tabName}')"]`
    );

  if (clickedButton) {
    clickedButton.classList.add(
      "activeTab"
    );
  }
}

/*
   Affiche ou masque le message d'aide
   selon l'onglet actif.
*/
function toggleHelperMessage(tabName) {

  const helper =
    document.getElementById(
      "helperMessage"
    );

  helper.style.display =
    ["home","submit","results"]
      .includes(tabName)
      ? "block"
      : "none";

}
/**   Fonction centrale de navigation*

   Vérifie les permissions d'accès,
   masque les autres onglets puis
   déclenche le rendu de l'*nglet demandé.

   Le dernier onglet visité est conservé
   dans le stockage local du navigateur.
*/
export async function showTab(tabName) {
  
  localStorage.setItem("activeTab",tabName);
  if (!appState.user && (tabName === "submit"|| tabName === "profile" )) {

      await showWarning(
            "Attention!",
            "Connecte-toi pour participer."
          );

      showTab("home");
      return;
  }
  if ( tabName === "admin" && !appState.isAdmin) {  
    showTab("home");
    return;
  }
  
  // mise en valeur de l'onglet actif
updateActiveTab(tabName);
toggleHelperMessage(tabName);


 
  TABS.forEach(t => {

  const tab =
    document.getElementById(t + "Tab");

  if (tab) {
    tab.style.display = "none";
  }

});

  // cacher les règles par défaut
  
const rules = document.getElementById("rulesTab");
if (rules) rules.style.display = "none";
  document.getElementById("scoringTab").innerHTML = "";
  document.getElementById(tabName + "Tab").style.display = "block";
  document.getElementById("predictionForm").style.display = "none";

 await tabRenderers[tabName]?.();
}
