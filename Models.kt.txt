package com.tonapp.vehicules

// Résultat renvoyé par la recherche véhicule (France/Europe/USA/Asie)
data class VehiculeResult(
    val vin: String? = null,
    val plaque: String? = null,
    val marque: String? = null,
    val modele: String? = null,
    val annee: String? = null,
    val carrosserie: String? = null,
    val source: String? = null,
    val erreur: String? = null
)

// Résultat structuré renvoyé par l'IA après analyse du texte VROOM collé
data class VroomVehicule(
    val marque: String? = null,
    val modele: String? = null,
    val immatriculation: String? = null,
    val vin: String? = null
)

data class VroomResult(
    val numero_dossier: String? = null,
    val vehicule: VroomVehicule? = null,
    val statut_dossier: String? = null,
    val date: String? = null,
    val assureur: String? = null,
    val reparateur: String? = null,
    val montant: String? = null,
    val notes_libres: String? = null,
    val erreur: String? = null
)

data class VroomRequest(val texte: String)
