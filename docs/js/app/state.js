/* ==========================*=======================
   APPLICATION STATE

   État central partagé par l'ensemble
   des modules de l*application.

   Contient :
   - utilisateur connecté
   - configuration active
   - résultats officiels
   - données mises en cache
   - informations administratives

   ================================================== */
export const appState = {
  user: null,
  submission: 0,
  results: {},
  players: [],
  hasSubmitted: false,
  acceptedRules: false,
  round1Deadline: null,
  round2Deadline: null,
  round3Deadline: null,
  round4Deadline: null,
  isAdmin: false,
  submissionOpen: false,
  paid:false,
  feedbackSnapshot: null,
  currentSeason: null,
  predictions: [],
  participants: [],
  leaderboard: []
};
