/* =========*==================================*=====
   ADMIN FEEDBACK

   Gestion de l'affichage des commentaires
   transmis par les participants.

   Responsabilités :
   - Construction de la section feedback
   - Rafraîchissement en temps réel
   - Génération des liens de réponse

   ==*==================================*============ */
import { appState } from "../../app/state.js";

/**   Génère la carte affichant
   les commentaires reçus.
*/
export function renderAdminFeedbackCard() {

  return `

    <div class="card">

      <h3>
        💬 Commentaires reçus
      </h3>

      <div id="feedbackContainer">

      </div>

    </div>

  `;
}
/*
   Recharge la liste complète
   des commentaires.

   Le dernier snapshot reçu est conservé
   dans appState afin de permettre
   une reconstruction rapide lors
   du rechargement de l'interface admin.
*/
export function reloadFeedbackSection(snapshot) {

  appState.feedbackSnapshot = snapshot;   

const feedbackContainer =
  document.getElementById(
    "feedbackContainer"
  );
 
if (!feedbackContainer) return;
feedbackContainer.innerHTML = "";
snapshot.forEach(doc => {

  const f = {
    id: doc.id,
    ...doc.data()
  };

const body = encodeURIComponent(
`Bonjour ${f.userName},

Pour faire suite à votre commentaire :

"${f.message}"

Insérer votre réponse ici.

Merci pour votre commentaire.

Charles Brosseau

https://chbroi.github.io/Pool-NHL-2025/`
);

 feedbackContainer.innerHTML += `
  <div class="card">

   <strong>${f.userName}</strong>

    <br>

    <small>
      ${new Date(f.timestamp).toLocaleString("fr-CA")}
    </small>
    
    <br><br>

  <a
  href="mailto:${f.email}?subject=Réponse au commentaire Pool LNH&body=${body}"
  style="color:#4da3ff; text-decoration:none;"
>
  📧 Répondre à ${f.userName}
</a>

<br><br>
<strong>
  Commentaire :
</strong>

<br>

${f.message}

<br><br>

    <button
      class="actionBtn"
      onclick="deleteFeedback('${f.id}')"
    >
      Supprimer
    </button>

  </div>
`;
  
})
  

}
