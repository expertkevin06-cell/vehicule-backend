// Service Asie (Japon, Corée, Chine) — Vincario (payant, clé + signature requises)
const fetch = require('node-fetch');
const crypto = require('crypto');

async function lookupAsie(vin) {
  if (!process.env.VINCARIO_API_KEY || !process.env.VINCARIO_SECRET) {
    throw new Error('Clé API Asie (Vincario) manquante. Voir .env.example');
  }

  const controlSum = crypto
    .createHash('md5')
    .update(`${vin}|decode|${process.env.VINCARIO_API_KEY}|${process.env.VINCARIO_SECRET}`)
    .digest('hex')
    .substring(0, 10);

  const url = `https://api.vindecoder.eu/3.2/${process.env.VINCARIO_API_KEY}/${controlSum}/decode/${vin}.json`;
  const res = await fetch(url);
  const data = await res.json();

  const champ = (label) =>
    data.decode?.find((d) => d.label === label)?.value || null;

  return {
    vin,
    marque: champ('Make'),
    modele: champ('Model'),
    annee: champ('Model Year'),
    source: 'Vincario (Asie)',
  };
}

module.exports = { lookupAsie };
