const express = require('express');
const router = express.Router();
const { chercherRappelsFrance } = require('../services/rappels');
const { rappelsUSA } = require('../services/usa');

router.get('/france', async (req, res) => {
  const { marque, modele } = req.query;
  try {
    res.json(await chercherRappelsFrance(marque, modele));
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

router.get('/usa/:vin', async (req, res) => {
  try {
    res.json(await rappelsUSA(req.params.vin));
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

module.exports = router;
