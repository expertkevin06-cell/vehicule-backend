// Service USA / Canada — NHTSA (gratuit, aucune clé nécessaire)
const fetch = require('node-fetch');

async function lookupUSA(vin) {
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`;
  const res = await fetch(url);
  const data = await res.json();
  const r = data.Results[0];

  return {
    vin,
    marque: r.Make,
    modele: r.Model,
    annee: r.ModelYear,
    carrosserie: r.BodyClass,
    moteur: r.EngineModel,
    source: 'NHTSA (USA)',
  };
}

async function rappelsUSA(vin) {
  const url = `https://api.nhtsa.gov/recalls/recallsByVin?vin=${vin}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
}

module.exports = { lookupUSA, rappelsUSA };
