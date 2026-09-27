/* ==================================================
   ADMIN PAYMENTS

   Gestion de l'état de paiement
   des participants.

   Responsabilités :
   - Affichage des participants
   - Validation des paiements
   - Mise à jour des statuts

   ================================================== */
import { getAllParticipants } from "../../services/firestoreService.js";

/*
   Génère la carte de gestion
   des paiements.
*/
export function renderAdminPaymentsCard() {

  return `

    <div class="card">

      <h3>
        💰 Gestion des paiements
      </h3>

      <div id="paymentsContainer">

      </div>

    </div>

  `;
}

/*
   Charge la liste des participants
   et affiche leur statut de paiement.

   Chaque case à cocher permet
   de mettre à jour directement
   l'information dans Firestore.
*/
export async function loadAdminPayments() {

  const participants = await getAllParticipants();
  const container = document.getElementById("paymentsContainer");
if (!container) return;
  participants.forEach(p => {
  
  container.innerHTML += `
  
    <div>
  
      <label>
  
        <input
          type="checkbox"
          ${
            p.paid
              ? "checked"
              : ""
          }
          onchange="
            togglePayment(
              '${p.id}',
              this.checked
            )
          "
        >
  
        ${p.name || p.displayName}
  
      </label>
  
    </div>
  
  `;
  
  });;

}
