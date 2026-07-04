package com.tonapp.vehicules

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

@Composable
fun VroomScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var texteCollé by remember { mutableStateOf("") }
    var resultat by remember { mutableStateOf<VroomResult?>(null) }
    var chargement by remember { mutableStateOf(false) }
    var erreur by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp)
    ) {
        Text("Dossier VROOM Expertise", style = MaterialTheme.typography.titleLarge)
        Spacer(Modifier.height(16.dp))

        // Bouton qui ouvre VROOM.PRO dans le navigateur
        Button(
            onClick = {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://vroom.pro/"))
                context.startActivity(intent)
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Ouvrir VROOM.PRO")
        }

        Spacer(Modifier.height(16.dp))
        Text("Fais ta recherche sur le site, puis colle ici ce que tu as copié :")
        Spacer(Modifier.height(8.dp))

        OutlinedTextField(
            value = texteCollé,
            onValueChange = { texteCollé = it },
            modifier = Modifier
                .fillMaxWidth()
                .height(140.dp),
            placeholder = { Text("Colle ici les infos copiées depuis VROOM.PRO") }
        )

        Spacer(Modifier.height(12.dp))

        Button(
            onClick = {
                erreur = null
                resultat = null
                chargement = true
                scope.launch {
                    try {
                        val reponse = RetrofitClient.api.interpreterTexteVroom(
                            VroomRequest(texte = texteCollé)
                        )
                        if (reponse.erreur != null) {
                            erreur = reponse.erreur
                        } else {
                            resultat = reponse
                        }
                    } catch (e: Exception) {
                        erreur = "Impossible de contacter le serveur : ${e.message}"
                    } finally {
                        chargement = false
                    }
                }
            },
            enabled = texteCollé.isNotBlank() && !chargement,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(if (chargement) "Analyse en cours..." else "Organiser avec l'IA")
        }

        erreur?.let {
            Spacer(Modifier.height(8.dp))
            Text(it, color = MaterialTheme.colorScheme.error)
        }

        resultat?.let { r ->
            Spacer(Modifier.height(16.dp))
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("N° dossier : ${r.numero_dossier ?: "—"}")
                    Text("Véhicule : ${r.vehicule?.marque ?: ""} ${r.vehicule?.modele ?: ""}")
                    Text("Immatriculation : ${r.vehicule?.immatriculation ?: "—"}")
                    Text("VIN : ${r.vehicule?.vin ?: "—"}")
                    Text("Statut : ${r.statut_dossier ?: "—"}")
                    Text("Assureur : ${r.assureur ?: "—"}")
                    Text("Réparateur : ${r.reparateur ?: "—"}")
                    Text("Montant : ${r.montant ?: "—"}")
                }
            }
        }
    }
}
