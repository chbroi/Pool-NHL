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
