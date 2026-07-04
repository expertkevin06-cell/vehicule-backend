// Service Europe — Vehicle Databases Europe VIN Decoder (payant, clé requise)
const fetch = require('node-fetch');

async function lookupEurope(vin) {
  if (!process.env.EUROPE_API_KEY) {
    throw new Error('Clé API Europe manquante. Voir .env.example');
  }

  const url = `https://api.vehicledatabases.com/vin-decode/europe/${vin}`;
  const res = await fetch(url, {
    headers: { 'x-AuthKey': process.env.EUROPE_API_KEY },
  });
  const data = await res.json();

  return {
    vin,
    marque: data.make,
    modele: data.model,
    annee: data.year,
    pays: data.country,
    source: 'Vehicle Databases (Europe)',
  };
}

module.exports = { lookupEurope };
