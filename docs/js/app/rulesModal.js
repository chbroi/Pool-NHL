import { appState } from "./state.js";
import { acceptRules } from "../services/userService.js";
import { showTab } from "./tabs.js";
import { POOL_CONFIG } from "../constants.js";
import { formatDeadline} from "../functions.js";

export function showRulesModal() {

  const modal =
  document.getElementById("rulesModal");

if (!modal) {

  console.error(
    "rulesModal introuvable"
  );

  return;
}

modal.style.display = "flex";

  const checkbox =
    document.getElementById(
      "rulesAcceptedCheckbox"
    );

  const btn =
    document.getElementById(
      "acceptModalBtn"
    );
  const closeBtn =
    document.getElementById(
      "closeRulesModal"
    );
  closeBtn.onclick = () => {
    modal.style.display = "none";
    showTab("home");
  };
  const viewRulesBtn =
    document.getElementById(
      "viewRulesBtn"
    );
  
    viewRulesBtn.onclick = () => {
      modal.style.display = "none";
      const backContainer =
        document.getElementById(
          "rulesBackContainer"
        );
    
      if (backContainer) {
        backContainer.style.display =
          "block";
      }
      showTab("rules");
    };

  checkbox.onchange = () => {
    btn.disabled = !checkbox.checked;
  };

  btn.onclick = async () => {

    await acceptRules(appState.user);
    const backContainer =
      document.getElementById(
        "rulesBackContainer"
      );
    
    if (backContainer) {
      backContainer.style.display =
        "none";
    }

    appState.acceptedRules = true;

    modal.style.display = "none";

    showTab("submit");
  };
};

export function initializeRulesUi() {

  const rulesTab = document.getElementById("rulesTab");
  if (rulesTab) {
  rulesTab.innerHTML =getRulesHtml();
  }
  

  document
    .querySelectorAll(
      ".rulesEntryFee"
    )
    .forEach(el => {
      el.textContent =
        POOL_CONFIG.entryFee;
    });

  const entryFeeAmount =
    document.getElementById(
      "entryFeeAmount"
    );

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
        ).style.display =
          "none";

        showRulesModal();

      }
    );

  }
  document.getElementById(
    "round1DeadlineDisplay"
  ).textContent =
    formatDeadline(
      appState.round1Deadline
    );

  document.getElementById(
    "round2DeadlineDisplay"
  ).textContent =
    formatDeadline(
      appState.round2Deadline
    );

  document.getElementById(
    "round3DeadlineDisplay"
  ).textContent =
    formatDeadline(
      appState.round3Deadline
    );

  document.getElementById(
    "round4DeadlineDisplay"
  ).textContent =
    formatDeadline(
      appState.round4Deadline
    );
}


export function getRulesHtml() {

  return `
          <div id="rulesBackContainer"
         style="display:none; margin-bottom:15px;">

      <button
        id="backToModalBtn"
        class="actionBtn secondary">
        ← Retour à la participation
      </button>
    
    </div>
<div id="rulesContainer">
    <div class="ruleArticle">
        <div class="ruleNumber">
          Article 1
        </div>
      
        <h3>
          Structure des séries éliminatoires
        </h3>
       <p>Les séries éliminatoires sont composés de quatres rondes: la première ronde, la deuxième ronde, les finales de conférences et la finale de la Coupe Stanley </p>
          <p>Le gagnant d’un affrontement est la première équipe à remporter quatre matchs dans une série pouvant comporter jusqu’à sept matchs.</p>
          <p>La LNH est divisé entre deux conférences: l'Est et l'Ouest et chacune des conférences est divisée de la manière suivante:</p>
          <ul>
            <li>Conférence Est: Division Metropolitaine (MET) et Atlantique (ATL)</li>
            <li>Conférence Ouest: Division Pacifique (PAC) et Centrale (CEN) </li>
          </ul>
          <p>Le trophée Conn Smythe est remis au joueur par excellence des séries éliminatoires dans la LNH. </p>
    </div>
    <div class="ruleArticle">
        <div class="ruleNumber">
          Article 2
        </div>
          <h3>
            Définitions et règles du pool
          </h3>
        
            <p>Une personne est considérée comme participante lorsqu’elle verse le montant de participation de <span class="rulesEntryFee"></span> $ et soumet sa prédiction de première ronde avant la date limite prévue.
              Ce montant doit être envoyer à Charles Brosseau (via virement interac à charles.brosseau@hotmail.com).</p>
            <p>Pour chaque affrontement, le participant doit sélectionner :</p>
            <ul>
              <li>L’équipe gagnante.</li>
              <li>Le nombre de matchs nécessaires pour remporter la série (4 à 7).</li>
            </ul>
            <p>La prédiction du participant comprend tous les choix décrits ci-haut, ainsi qu’un choix pour le récipiendaire du trophée Conn Smythe.</p>
            <p>Les participants doivent effectuer jusqu’à quatre soumissions au cours des séries :</p>
            <ul>
              <li>
              Choix des rondes 1 et 2, des finales de conférence, de la finale de la Coupe Stanley et du trophée Conn Smythe.
              </li>
              <li>
              Choix de la ronde 2, des finales de conférence, de la finale de la Coupe Stanley et du trophée Conn Smythe.
              </li>
              <li>
              Choix des finales de conférence, de la finale de la Coupe Stanley et du trophée Conn Smythe.
              </li>
              <li>
              Choix de la finale de la Coupe Stanley du trophée Conn Smythe.
              </li>
            </ul>
            <p>Une soumission est considérée valide uniquement si elle est enregistrée avant le début du premier match de la ronde concernée:</p>
              <ul>
                <li>
                  <strong>1re prédiction :</strong>
                  <span id="round1DeadlineDisplay"></span>
                </li>
              
                <li>
                  <strong>2e prédiction :</strong>
                  <span id="round2DeadlineDisplay"></span>
                </li>
              
                <li>
                  <strong>3e prédiction :</strong>
                  <span id="round3DeadlineDisplay"></span>
                </li>
              
                <li>
                  <strong>4e prédiction :</strong>
                  <span id="round4DeadlineDisplay"></span>
                </li>
              </ul>
            <p>Si un participant n'effectue pas une prédiction valide, ses choix précédents seront reconduits à la prochaine ronde.
                S'il s'agit de la première ronde, le participant est de facto éliminé.</p>
     </div>
    <div class="ruleArticle">  
    <div class="ruleNumber">
      Article 3
    </div>
      <h3>
        Système de pointage
      </h3>
        <p>Le système de pointage est illustré dans le tableau sous l'onglet système de pointage.</p> 
        <p>Pour obtenir les points associés au nombre de matchs, le participant doit également avoir correctement identifié l’équipe gagnante..</p> 
        <p>Les trois participants ayant accumulé le plus de points au terme des séries éliminatoires sont déclarés gagnants du pool.</p>
        <p>Le montant attribué aux 3 gagnants est calculé de la manière suivante:
        <ul> 
          <li>1ere place: Nombre de participants*<span class="rulesEntryFee"></span>$*4/7</li>
          <li>2e place: Nombre de participants*<span class="rulesEntryFee"></span>$*2/7</li>
          <li>3e place: Nombre de participants*<span class="rulesEntryFee"></span>$*1/7</li>
        </ul>
  </div>
  `;

}
