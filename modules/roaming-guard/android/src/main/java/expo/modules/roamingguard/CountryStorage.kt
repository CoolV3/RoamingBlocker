package expo.modules.roamingguard

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first

private val Context.countryDataStorage by preferencesDataStore(name = "roaming_guard")

class CountryStorage(private val context: Context) {

    private companion object {
        val ALLOWED_COUNTRIES_KEY = stringSetPreferencesKey("allowed_countries")
    }

    suspend fun getAllowedCountries() : List<String> {
        val preferences = context.countryDataStorage.data.first()

        return preferences[ALLOWED_COUNTRIES_KEY]
            ?.toList()
            ?: emptyList()
    }

    suspend fun addCountry(countryCode: String) {
        val storageCountryCode = countryCode.trim().uppercase()

        context.countryDataStorage.edit { preferences ->
            val currentCountries =
                preferences[ALLOWED_COUNTRIES_KEY]
                    ?.toMutableSet()
                    ?: mutableSetOf()
            currentCountries.add(storageCountryCode)

            preferences[ALLOWED_COUNTRIES_KEY] = currentCountries
        }
    }

    suspend fun removeCountry(countryCode: String) {
        context.countryDataStorage.edit { preferences ->
            val countries = preferences[ALLOWED_COUNTRIES_KEY]
                ?.toMutableSet()
                ?: mutableSetOf()
            countries.remove(countryCode.uppercase())
            preferences[ALLOWED_COUNTRIES_KEY] = countries
        }
    }

    suspend fun isCountryAllowed(countryCode: String): Boolean {
        val preferences = context.countryDataStorage.data.first()
        val countries = preferences[ALLOWED_COUNTRIES_KEY] ?: emptySet()

        return countries.contains(countryCode.uppercase())
    }
}

/*
class CountryStoraged {

    private val allowedCountries = mutableSetOf<String>()

    fun getAllowedCountries() : List<String> {
        return allowedCountries.toList()
    }

    fun addCountry(countryCode: String) {
        allowedCountries.add(countryCode.uppercase())
    }

    fun removeCountry(countryCode: String) {
        allowedCountries.remove(countryCode.uppercase())
    }

    fun isCountryAllowed(countryCode: String): Boolean {
        return allowedCountries.contains(countryCode.uppercase())
    }

    fun clearCountries() {
        allowedCountries.clear()
    }

}
*/