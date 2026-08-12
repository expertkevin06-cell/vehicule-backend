// routes/pannes.js
// Route qui interroge Gemini AVEC recherche web réelle (grounding Google Search)
// pour trouver les pannes connues d'un véhicule identifié, en croisant
// plusieurs types de sources (forums, presse auto, retours ateliers, bases constructeurs).

const express = require("express");
const router = express.Router();
const fetch = require("node-fetch"); // si absent: npm install node-fetch@2

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

router.post("/pannes-connues", async (req, res) => {
  try {
    const { marque, modele, motorisation, annee } = req.body;

    if (!marque || !modele) {
      return res.status(400).json({ error: "Marque et modèle requis." });
    }

    const vehiculeDesc = `${marque} ${modele} ${motorisation || ""} ${annee || ""}`.trim();

    const prompt = `
Tu es un expert automobile chargé d'un audit fiabilité. Effectue une recherche web approfondie et croisée sur PLUSIEURS types de sources différentes pour identifier les pannes et défauts connus de ce véhicule :

Véhicule : ${vehiculeDesc}

Cherche spécifiquement dans ces catégories de sources, et croise les résultats :
1. Forums automobiles spécialisés (ex: forums-auto.com, forum-auto.caradisiac.com, forums de marque)
2. Presse automobile et essais longue durée (ex: Caradisiac, L'Argus, AutoPlus, Que Choisir)
3. Bases de données de rappels et signalements officiels (RappelConso, NHTSA si pertinent)
4. Retours de garages et professionnels de la réparation (blogs de mécaniciens, sites pro)
5. Statistiques de fiabilité si disponibles (études constructeur, associations consommateurs)

Consignes strictes de précision :
- Ne mentionne QUE des pannes que tu as réellement trouvées via la recherche, n'invente rien
- Pour chaque panne, indique le kilométrage ou l'âge typique d'apparition si l'information existe
- Indique le NOMBRE APPROXIMATIF de sources différentes qui mentionnent chaque panne (recoupement = fiabilité)
- Si les sources se contredisent sur un point, mentionne-le plutôt que de trancher arbitrairement
- Classe par fréquence réelle observée, pas par gravité
- Si peu ou pas d'information fiable n'est trouvée, dis-le clairement plutôt que de compléter avec des suppositions

Réponds UNIQUEMENT avec un JSON valide, sans texte autour, sans balises markdown, format strict :

{
  "vehicule_identifie": "${vehiculeDesc}",
  "pannes": [
    {
      "titre": "string, nom court de la panne",
      "systeme": "string, ex: Moteur, Électronique, Châssis, Freinage, Boîte de vitesse, Direction/Suspension",
      "frequence": "Très fréquent | Fréquent | Occasionnel | Rare",
      "km_apparition_typique": "string, ex: '80 000 - 120 000 km' ou 'non déterminé'",
      "description": "string, description du symptôme et du contexte",
      "nb_sources_recoupees": "number, nombre approximatif de sources indépendantes confirmant cette panne",
      "types_sources": ["array de strings, ex: 'forum', 'presse', 'rappel officiel', 'atelier'"]
    }
  ],
  "fiabilite_recherche": "string, évaluation honnête: 'Bonne couverture' / 'Couverture partielle' / 'Peu de données trouvées'",
  "avertissement": "Ces informations sont issues d'une recherche web automatisée et doivent être vérifiées avant tout diagnostic professionnel."
}

Si aucune information fiable n'est trouvée, renvoie "pannes": [] et explique pourquoi dans "fiabilite_recherche".
`;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }], // active la recherche web réelle (grounding)
        generationConfig: {
          temperature: 0.15,      // réponses factuelles, peu de "créativité"
          topP: 0.9,
          maxOutputTokens: 2048
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Erreur API Gemini:", data.error);
      return res.status(502).json({ error: "Erreur API Gemini", details: data.error.message });
    }

    let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      console.error("Erreur parsing JSON Gemini:", e, rawText);
      return res.status(500).json({ error: "Réponse Gemini invalide", raw: rawText });
    }

    // Récupération des sources web réellement consultées par Gemini (grounding metadata)
    const groundingChunks = data?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sourcesUrls = groundingChunks
      .map(chunk => chunk?.web?.uri)
      .filter(Boolean);

    parsed.sources_web_consultees = sourcesUrls;

    return res.json(parsed);

  } catch (err) {
    console.error("Erreur route /pannes-connues:", err);
    return res.status(500).json({ error: "Erreur serveur lors de la recherche des pannes." });
  }
});

module.exports = router;
