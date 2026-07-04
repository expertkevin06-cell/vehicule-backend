package com.tonapp.vehicules

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {

    // ⚠️ Remplace par l'adresse de ton serveur une fois en ligne.
    // Pour tester en local depuis l'émulateur Android, utilise 10.0.2.2
    // (c'est l'alias spécial de l'émulateur pour "localhost" de ton PC).
    // Sur un vrai téléphone, mets l'adresse publique de ton serveur (ex: https://tonapi.com/)
    private const val BASE_URL = "http://10.0.2.2:3000/"

    val api: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
