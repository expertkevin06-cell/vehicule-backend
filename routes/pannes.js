// routes/pannes.js
// Route robuste : recherche web réelle (grounding Gemini) des pannes connues
// pour N'IMPORTE QUEL véhicule (toute marque, tout modèle, toute motorisation).
// Conçue pour ne JAMAIS crasher : en cas de problème, elle renvoie toujours
// une réponse JSON propre et compréhensible plutôt qu'une erreur 502/500 brute.

const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Délai maximum qu'on s'autorise à attendre Gemini avant d'abandonner proprement
// (Render coupe les requêtes trop longues côté proxy, donc on abandonne AVANT lui
// et on renvoie une réponse propre plutôt que de laisser Render renvoyer un 502 brut)
const TIMEOUT_MS = 45000;

function reponseVide(message) {
  return {
    vehicule_identifie: null,
    pannes: [],
    fiabilite_recherche: "Peu de données trouvées",
    avertissement: message,
    sources_web_consultees: []
  };
}

router.post("/pannes-connues", async (req, res) => {
  // 1. Vérification de la config serveur AVANT tout appel réseau
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY manquante dans les variables d'environnement Render.");
    return res.status(200).json(
      reponseVide("Configuration serveur incomplète (clé API manquante). Contactez le support.")
    );
  }

  // 2. Validation des données reçues — fonctionne pour toute marque/modèle
  const marque = (req.body?.marque || "").trim();
  const modele = (req.body?.modele || "").trim();
  const motorisation = (req.body?.motorisation || "").trim();
  const annee = (req.body?.annee || "").trim();

  if (!marque || !modele) {
    return res.status(400).json({ error: "Marque et modèle sont obligatoires." });
  }

  const vehiculeDesc = [marque, modele, motorisation, annee].filter(Boolean).join(" ");

  const prompt = `
Tu es un expert automobile chargé d'un audit fiabilité. Effectue une recherche web approfondie et croisée sur PLUSIEURS types de sources différentes pour identifier les pannes et défauts connus de ce véhicule :

Véhicule : ${vehiculeDesc}

Cherche spécifiquement dans ces catégories de sources, et croise les résultats :
1. Forums automobiles spécialisés
2. Presse automobile et essais longue durée
3. Bases de données de rappels et signalements officiels
4. Retours de garages et professionnels de la réparation
5. Statistiques de fiabilité si disponibles

Consignes strictes de précision :
- Ne mentionne QUE des pannes réellement trouvées via la recherche, n'invente rien
- Indique le kilométrage ou l'âge typique d'apparition si connu
- Indique le nombre approximatif de sources différentes qui confirment chaque panne
- Si les sources se contredisent, signale-le plutôt que de trancher arbitrairement
- Classe par fréquence réelle observée
- Si peu d'information fiable existe pour ce véhicule précis, dis-le clairement

Réponds UNIQUEMENT avec un JSON valide, sans texte autour, sans balises markdown :

{
  "vehicule_identifie": "${vehiculeDesc}",
  "pannes": [
    {
      "titre": "string",
      "systeme": "string (Moteur, Électronique, Châssis, Freinage, Boîte de vitesse, Direction/Suspension, etc.)",
      "frequence": "Très fréquent | Fréquent | Occasionnel | Rare",
      "km_apparition_typique": "string ou null",
      "description": "string",
      "nb_sources_recoupees": number,
      "types_sources": ["array de strings"]
    }
  ],
  "fiabilite_recherche": "Bonne couverture | Couverture partielle | Peu de données trouvées",
  "avertissement": "Ces informations sont issues d'une recherche web automatisée et doivent être vérifiées avant tout diagnostic professionnel."
}

Si aucune information fiable n'est trouvée, renvoie "pannes": [] et explique pourquoi dans "fiabilite_recherche".
`;

  // 3. Appel Gemini protégé par un timeout manuel (évite de laisser Render trancher brutalement)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let data;
  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: {
          temperature: 0.15,
          topP: 0.9,
          maxOutputTokens: 2048
        }
      })
    });

    // Gemini a répondu mais avec un code HTTP d'erreur (clé invalide, quota, etc.)
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error(`Gemini a répondu avec le code ${response.status}:`, errText);
      return res.status(200).json(
        reponseVide(`Le service de recherche a rencontré un problème temporaire (code ${response.status}). Réessayez dans quelques instants.`)
      );
    }

    data = await response.json();

  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      console.error("Timeout : Gemini n'a pas répondu dans le délai imparti.");
      return res.status(200).json(
        reponseVide("La recherche a pris trop de temps et a été interrompue. Réessayez — le serveur est peut-être en train de se réveiller (Render gratuit).")
      );
    }
    console.error("Erreur réseau lors de l'appel à Gemini:", err);
    return res.status(200).json(
      reponseVide("Impossible de contacter le service de recherche pour le moment.")
    );
  } finally {
    clearTimeout(timeoutId);
  }

  // 4. Vérification du contenu retourné par Gemini (blocage sécurité, réponse vide, etc.)
  if (data.error) {
    console.error("Erreur API Gemini:", data.error);
    return res.status(200).json(
      reponseVide(`Erreur du service de recherche : ${data.error.message || "inconnue"}.`)
    );
  }

  const candidat = data?.candidates?.[0];
  if (!candidat) {
    console.error("Réponse Gemini sans candidat exploitable:", JSON.stringify(data).slice(0, 500));
    return res.status(200).json(
      reponseVide("Le service de recherche n'a renvoyé aucun résultat exploitable pour ce véhicule.")
    );
  }

  let rawText = candidat?.content?.parts?.[0]?.text || "";
  rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

  // 5. Parsing JSON protégé — si Gemini a mal formaté sa réponse, on ne plante pas
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (e) {
    console.error("Erreur parsing JSON Gemini. Texte brut reçu:", rawText.slice(0, 800));
    return res.status(200).json(
      reponseVide("La recherche a renvoyé un format inattendu. Réessayez, ou reformulez la motorisation/année.")
    );
  }

  // 6. On s'assure que la structure attendue est bien présente (pour tout véhicule)
  if (!Array.isArray(parsed.pannes)) {
    parsed.pannes = [];
  }
  if (!parsed.vehicule_identifie) {
    parsed.vehicule_identifie = vehiculeDesc;
  }
  if (!parsed.avertissement) {
    parsed.avertissement = "Ces informations sont issues d'une recherche web automatisée et doivent être vérifiées avant tout diagnostic professionnel.";
  }

  // 7. Récupération des sources web réellement consultées (grounding metadata)
  const groundingChunks = candidat?.groundingMetadata?.groundingChunks || [];
  parsed.sources_web_consultees = groundingChunks
    .map(chunk => chunk?.web?.uri)
    .filter(Boolean);

  return res.status(200).json(parsed);
});

module.exports = router;
