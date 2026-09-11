package expo.modules.roamingguard

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import java.util.Locale

private val Context.countryDataStorage by preferencesDataStore(name = "roaming_guard")

class CountryStorage(private val context: Context) {

    private companion object {
        val STANDALONE_COUNTRIES_KEY = stringSetPreferencesKey("standalone_countries")
        val SELECTED_ZONE_IDS_KEY = stringSetPreferencesKey("selected_zone_ids")
    }

    suspend fun getAllowedCountries() : List<String> {
        val preferences = context.countryDataStorage.data.first()

        val standaloneCountries = preferences[STANDALONE_COUNTRIES_KEY] ?: emptySet()
        val selectedZoneIDs = preferences[SELECTED_ZONE_IDS_KEY] ?: emptySet()

        val countriesFromZones = selectedZoneIDs.mapNotNull {zoneId -> RoamingZones.findById(zoneId)}.flatMap {zone -> zone.countries}.toSet()

        return (standaloneCountries + countriesFromZones).sorted()
    }

    suspend fun getStandaloneCountries(): List<String> {
        val preferences = context.countryDataStorage.data.first()
        return preferences[STANDALONE_COUNTRIES_KEY]
            ?. sorted()
            ?: emptyList()
        }

    suspend fun getSelectedZoneIds(): List<String> {
        val preferences = context.countryDataStorage.data.first()
        return preferences[SELECTED_ZONE_IDS_KEY]
            ?. sorted()
            ?: emptyList()
    }

    suspend fun addCountry(countryCode: String) {
        val storageCountryCode = countryCode.trim().uppercase()

        require(storageCountryCode.length == 2) {
            "Invalid country code: ${countryCode}"
        }

        context.countryDataStorage.edit { preferences ->
            val selectedZones = preferences[SELECTED_ZONE_IDS_KEY] ?: emptySet()

            val countriesInZone = selectedZones.any { zoneID ->
                RoamingZones.findById(zoneID)
                    ?.countries
                    ?.contains(storageCountryCode) == true
            }

            if (!countriesInZone) {
                val standaloneCountries = preferences[STANDALONE_COUNTRIES_KEY]
                    ?. toMutableSet()
                    ?: mutableSetOf()

                standaloneCountries.add(storageCountryCode)
                preferences[STANDALONE_COUNTRIES_KEY] = standaloneCountries.toSet()

            }
        }
    }

    suspend fun removeCountry(countryCode: String) {
        val normalCountryCode = countryCode.trim().uppercase()
        context.countryDataStorage.edit { preferences ->

            val countries = preferences[STANDALONE_COUNTRIES_KEY]
                ?.toMutableSet()
                ?: mutableSetOf()

            countries.remove(normalCountryCode)

            preferences[STANDALONE_COUNTRIES_KEY] = countries.toSet()
        }
    }

    suspend fun addZone(zoneId: String) {
            val normalizedZoneId = zoneId.trim().lowercase(Locale.ROOT)

            val zone = requireNotNull(
                RoamingZones.findById(normalizedZoneId)
            ) {
                "Unknown roaming zone: $zoneId"
            }

            context.countryDataStorage.edit { preferences ->
                val standaloneCountries =
                    preferences[STANDALONE_COUNTRIES_KEY]
                        ?.toMutableSet()
                        ?: mutableSetOf()

                val selectedZoneIds =
                    preferences[SELECTED_ZONE_IDS_KEY]
                        ?.toMutableSet()
                        ?: mutableSetOf()


                standaloneCountries.removeAll(zone.countries)

                selectedZoneIds.add(zone.id)

                preferences[STANDALONE_COUNTRIES_KEY] =
                    standaloneCountries.toSet()

                preferences[SELECTED_ZONE_IDS_KEY] =
                    selectedZoneIds.toSet()
            }
        }

        suspend fun removeZone(zoneId: String) {
            val normalizedZoneId = zoneId.trim().lowercase(Locale.ROOT)

            context.countryDataStorage.edit { preferences ->
                val selectedZoneIds =
                    preferences[SELECTED_ZONE_IDS_KEY]
                        ?.toMutableSet()
                        ?: mutableSetOf()

                selectedZoneIds.remove(normalizedZoneId)

                preferences[SELECTED_ZONE_IDS_KEY] =
                    selectedZoneIds.toSet()
            }
        }

    suspend fun isCountryAllowed(countryCode: String): Boolean {
        val normalCountryCode = countryCode.trim().uppercase()

        return getAllowedCountries().contains(normalCountryCode)
    }

    fun getAvailableZones(): List<Map<String, Any>> {
        return RoamingZones.getAll().map { zone ->
            mapOf(
                "id" to zone.id,
                "name" to zone.name,
                "countries" to zone.countries.sorted()
                )
        }
    }




}
