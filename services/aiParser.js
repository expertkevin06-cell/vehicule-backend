const fetch = require('node-fetch');

const CONSIGNE = (texteCollé) => `Tu reçois un texte copié manuellement depuis le site VROOM.PRO
(gestion de dossiers d'expertise automobile). Extrais les informations utiles et
réponds UNIQUEMENT en JSON valide, sans aucun texte autour, avec ce format :

{
  "numero_dossier": "",
  "vehicule": { "marque": "", "modele": "", "immatriculation": "", "vin": "" },
  "statut_dossier": "",
  "date": "",
  "assureur": "",
  "reparateur": "",
  "montant": "",
  "notes_libres": ""
}

Si une information est absente du texte, laisse le champ vide ("").
Voici le texte à analyser :
"""
${texteCollé}
"""`;

function nettoyerJSON(texte) {
  const nettoye = texte.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(nettoye);
  } catch (e) {
    throw new Error("L'IA n'a pas réussi à structurer ce texte.");
  }
}

async function interpreterAvecGemini(texteCollé) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Clé GEMINI_API_KEY manquante.');
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: CONSIGNE(texteCollé) }] }] }),
  });
  const data = await res.json();
  const texteReponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return nettoyerJSON(texteReponse);
}

async function interpreterTexteVroom(texteCollé) {
  return interpreterAvecGemini(texteCollé);
}

module.exports = { interpreterTexteVroom };
