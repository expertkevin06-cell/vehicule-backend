const express = require('express');
const router = express.Router();
const { interpreterTexteVroom } = require('../services/aiParser');

// POST /api/vroom/interpreter   { "texte": "...ce que l'utilisateur a collé..." }
router.post('/interpreter', async (req, res) => {
  const { texte } = req.body;

  if (!texte || texte.trim().length < 10) {
    return res.status(400).json({ erreur: 'Merci de coller un texte plus complet.' });
  }

  try {
    const resultat = await interpreterTexteVroom(texte);
    res.json(resultat);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

module.exports = router;
