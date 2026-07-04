const express = require('express');
const router = express.Router();
const { listerMarques, listerModeles, listerMotorisations } = require('../services/catalogue');

router.get('/marques', async (req, res) => {
  try {
    res.json(await listerMarques());
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

router.get('/modeles', async (req, res) => {
  const { marque, annee } = req.query;
  if (!marque) return res.status(400).json({ erreur: 'Le paramètre "marque" est obligatoire.' });
  try {
    res.json(await listerModeles(marque, annee));
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

router.get('/motorisations', async (req, res) => {
  const { marque, modele, annee } = req.query;
  if (!marque || !modele) {
    return res.status(400).json({ erreur: 'Les paramètres "marque" et "modele" sont obligatoires.' });
  }
  try {
    res.json(await listerMotorisations(marque, modele, annee));
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

module.exports = router;
