// Service Rappels France — RappelConso (data.economie.gouv.fr)
// Gratuit, officiel (gouvernement français), sans clé nécessaire.
// Couvre les campagnes de rappel sécurité pour tous les véhicules vendus en France.
const fetch = require('node-fetch');

const BASE_URL = 'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/rappelconso0/records';

// Cherche les rappels en cours pour une marque (ex: "Peugeot") et/ou un modèle (ex: "3008")
async function chercherRappelsFrance(marque, modele) {
  let filtre = `categorie_de_produit="Alimentation" OR sous_categorie_de_produit="Véhicules"`;
  // On filtre surtout par mots-clés dans le nom du produit, plus fiable que les catégories
  let recherche = marque || '';
  if (modele) recherche += ` ${modele}`;

  const url = `${BASE_URL}?where=${encodeURIComponent(
    `search(noms_des_modeles_ou_references, "${recherche}")`
  )}&limit=20&order_by=date_de_publication desc`;

  const res = await fetch(url);
  const data = await res.json();

  return (data.results || []).map((r) => ({
    marque: r.nom_de_la_marque_du_produit || null,
    modeles_concernes: r.noms_des_modeles_ou_references || null,
    motif: r.motif_du_rappel || null,
    risque: r.risques_encourus_par_le_consommateur || null,
    date_publication: r.date_de_publication || null,
    conduite_a_tenir: r.conduites_a_tenir_par_le_consommateur || null,
    lien_fiche: r.lien_vers_la_fiche_rappel || null,
  }));
}

module.exports = { chercherRappelsFrance };
