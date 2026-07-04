const express = require('express');
const router = express.Router();

const { lookupUSA, rappelsUSA } = require('../services/usa');
const { lookupFrance } = require('../services/france');
const { lookupEurope } = require('../services/europe');
const { lookupAsie } = require('../services/asie');

// GET /api/vehicules/vin/:vin?region=USA
router.get('/vin/:vin', async (req, res) => {
  const { vin } = req.params;
  const region = (req.query.region || 'USA').toUpperCase();

  try {
    let resultat;
    switch (region) {
      case 'USA':
      case 'CANADA':
        resultat = await lookupUSA(vin);
        break;
      case 'EUROPE':
        resultat = await lookupEurope(vin);
        break;
      case 'ASIE':
        resultat = await lookupAsie(vin);
        break;
      default:
        return res.status(400).json({ erreur: 'Région inconnue. Utilisez USA, EUROPE ou ASIE.' });
    }
    res.json(resultat);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// GET /api/vehicules/plaque/:plaque  (France uniquement, via plaque d'immatriculation)
router.get('/plaque/:plaque', async (req, res) => {
  try {
    const resultat = await lookupFrance(req.params.plaque);
    res.json(resultat);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// GET /api/vehicules/rappels/:vin  (rappels sécurité, USA uniquement pour l'instant)
router.get('/rappels/:vin', async (req, res) => {
  try {
    const resultat = await rappelsUSA(req.params.vin);
    res.json(resultat);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

module.exports = router;
