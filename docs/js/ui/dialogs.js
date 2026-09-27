/* ==================================================
   DIALOG SERVICE

   Couche d'abstraction autour de SweetAlert2.

   Responsabilités :
   - Messages de succès
   - Messages d'erreur
   - Messages d'avertissement
   - Dialogues de confirmation

   Permet de centraliser l'apparence
   et le comportement des boîtes de dialogue.

   ================================================== */
import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm";

/*
   Affiche un message de succès.
*/
export async function showSuccess(title,text) {

  return Swal.fire({
    icon: "success",
    title,
    text
  });

}
/*
   Affiche un message d'erreur.
*/
export async function showError( title, text) {

  return Swal.fire({
    icon: "error",
    title,
    text
  });

}

/*
   Affiche un message d'avertissement.
*/
export async function showWarning( title, text) {

  return Swal.fire({
    icon: "warning",
    title,
    text
  });

}

/*
   Affiche une boite de confirmation.
*/
export async function confirmDialog( title, text) {

  return Swal.fire({

    icon: "question",

    title,

    text,

    showCancelButton: true,

    confirmButtonText: "Confirmer",

    cancelButtonText: "Annuler"

  });

}