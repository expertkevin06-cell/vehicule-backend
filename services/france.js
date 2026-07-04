// Service France — ApiPlaqueImmatriculation.com (payant, clé requise)
// Alternative officielle gratuite : API Particulier (ANTS) — nécessite habilitation + FranceConnect
const fetch = require('node-fetch');

async function lookupFrance(plaque) {
  if (!process.env.FRANCE_API_KEY) {
    throw new Error('Clé API France manquante. Voir .env.example');
  }

  const url = `https://api.apiplaqueimmatriculation.com/plaque?plaque=${plaque}&apikey=${process.env.FRANCE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  return {
    plaque,
    marque: data.marque,
    modele: data.modele,
    vin: data.vin,
    co2: data.co2,
    carburant: data.energie,
    source: 'ApiPlaqueImmatriculation (France)',
  };
}

module.exports = { lookupFrance };
