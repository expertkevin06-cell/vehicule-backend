// Service Catalogue — CarQuery API (gratuit, sans clé, couverture mondiale)
// Permet de chercher par marque/modèle/motorisation, contrairement aux 4 autres
// services qui décodent une plaque ou un VIN déjà connu.
const fetch = require('node-fetch');

const BASE_URL = 'https://www.carqueryapi.com/api/0.3/';

// Étape 1 — récupérer la liste de toutes les marques disponibles
async function listerMarques() {
  const res = await fetch(`${BASE_URL}?cmd=getMakes`);
  const texte = await res.text();
  const data = JSON.parse(texte);
  return data.Makes.map((m) => ({
    id: m.make_id,
    nom: m.make_display,
  }));
}

// Étape 2 — récupérer les modèles disponibles pour une marque (ex: "peugeot")
async function listerModeles(marque, annee) {
  let url = `${BASE_URL}?cmd=getModels&make=${encodeURIComponent(marque)}`;
  if (annee) url += `&year=${annee}`;

  const res = await fetch(url);
  const texte = await res.text();
  const data = JSON.parse(texte);
  return (data.Models || []).map((m) => ({ nom: m.model_name }));
}

// Étape 3 — récupérer les motorisations/versions pour marque + modèle (+ année en option)
async function listerMotorisations(marque, modele, annee) {
  let url = `${BASE_URL}?cmd=getTrims&make=${encodeURIComponent(marque)}&model=${encodeURIComponent(modele)}`;
  if (annee) url += `&year=${annee}`;

  const res = await fetch(url);
  const texte = await res.text();
  const data = JSON.parse(texte);

  return (data.Trims || []).map((t) => ({
    marque: t.model_make_display,
    modele: t.model_name,
    annee: t.model_year,
    motorisation: t.model_engine_type,
    cylindree: t.model_engine_cc,
    puissance_ch: t.model_engine_power_ps,
    carburant: t.model_engine_fuel,
    boite_vitesse: t.model_transmission_type,
    carrosserie: t.model_body,
  }));
}

module.exports = { listerMarques, listerModeles, listerMotorisations };
