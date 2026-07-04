# Backend Véhicules — France / Europe / USA / Asie

Ce petit serveur permet à ton app (web ou mobile) de rechercher des infos sur
n'importe quel véhicule dans le monde, en tapant simplement une plaque
ou un numéro VIN.

## Comment ça marche, simplement

Ton app envoie une adresse web (ex: chercher un VIN américain) → ce serveur
va chercher l'info sur internet auprès du bon fournisseur → il te renvoie
un résultat propre et simple à afficher.

## Démarrage (3 étapes)

1. Installer les dépendances :
   ```
   npm install
   ```

2. Copier le fichier `.env.example` en `.env`, et remplir les clés
   que tu auras obtenues sur les sites des fournisseurs (voir plus bas).
   **Pour les USA, aucune clé n'est nécessaire, ça marche tout de suite.**

3. Démarrer le serveur :
   ```
   npm start
   ```

## Exemples d'utilisation (dans le navigateur ou depuis l'app)

- Véhicule américain (fonctionne sans inscription) :
  `http://localhost:3000/api/vehicules/vin/1HGCM82633A004352?region=USA`

- Véhicule français, par plaque :
  `http://localhost:3000/api/vehicules/plaque/AB-123-CD`

- Véhicule européen, par VIN :
  `http://localhost:3000/api/vehicules/vin/WF0NXXGCHNJU66992?region=EUROPE`

- Véhicule asiatique, par VIN :
  `http://localhost:3000/api/vehicules/vin/JTDBR32E720012345?region=ASIE`

- Rappels sécurité (USA) :
  `http://localhost:3000/api/vehicules/rappels/1HGCM82633A004352`

## Où obtenir les clés API (gratuites au départ)

| Région | Site | Gratuit ? |
|---|---|---|
| USA | déjà inclus (NHTSA) | ✅ Oui, toujours gratuit |
| France | apiplaqueimmatriculation.com | 10 recherches offertes |
| Europe | vehicledatabases.com | Essai limité |
| Asie | vincario.com | Essai limité |

## Prochaine étape

Une fois que ton app mobile/web est prête, elle n'a qu'à appeler les
adresses ci-dessus (en remplaçant `localhost:3000` par l'adresse de ton
serveur en ligne) pour récupérer les infos véhicule.
