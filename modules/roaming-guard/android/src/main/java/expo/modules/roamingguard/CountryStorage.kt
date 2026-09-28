package expo.modules.roamingguard

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import java.util.Locale

private val Context.countryDataStorage by preferencesDataStore(
    name = "roaming_guard"
)

class CountryStorage(private val context: Context) {

    private companion object {
        val STANDALONE_COUNTRIES_KEY =
            stringSetPreferencesKey("standalone_countries")

        val SELECTED_ZONE_IDS_KEY =
            stringSetPreferencesKey("selected_zone_ids")

        val COUNTRY_WATCHING_ENABLED_KEY =
            booleanPreferencesKey("country_watching_enabled")
    }

    suspend fun setCountryWatchingEnabled(enabled: Boolean) {
        context.countryDataStorage.edit { preferences ->
            preferences[COUNTRY_WATCHING_ENABLED_KEY] = enabled
        }
    }

    suspend fun isCountryWatchingEnabled(): Boolean {
        val preferences =
            context.countryDataStorage.data.first()

        return preferences[COUNTRY_WATCHING_ENABLED_KEY] ?: false
    }

    suspend fun getAllowedCountries(): List<String> {
        val preferences =
            context.countryDataStorage.data.first()

        val standaloneCountries =
            preferences[STANDALONE_COUNTRIES_KEY] ?: emptySet()

        val selectedZoneIds =
            preferences[SELECTED_ZONE_IDS_KEY] ?: emptySet()

        val countriesFromZones = selectedZoneIds
            .mapNotNull { zoneId ->
                RoamingZones.findById(zoneId)
            }
            .flatMap { zone ->
                zone.countries
            }
            .toSet()

        return (
            standaloneCountries + countriesFromZones
        ).sorted()
    }

    suspend fun getStandaloneCountries(): List<String> {
        val preferences =
            context.countryDataStorage.data.first()

        return preferences[STANDALONE_COUNTRIES_KEY]
            ?.sorted()
            ?: emptyList()
    }

    suspend fun getSelectedZoneIds(): List<String> {
        val preferences =
            context.countryDataStorage.data.first()

        return preferences[SELECTED_ZONE_IDS_KEY]
            ?.sorted()
            ?: emptyList()
    }

    suspend fun addCountry(countryCode: String) {
        val normalizedCountryCode =
            countryCode.trim().uppercase(Locale.ROOT)

        require(normalizedCountryCode.length == 2) {
            "Invalid country code: $countryCode"
        }

        context.countryDataStorage.edit { preferences ->
            val selectedZoneIds =
                preferences[SELECTED_ZONE_IDS_KEY]
                    ?: emptySet()

            val countryAlreadyIncludedInZone =
                selectedZoneIds.any { zoneId ->
                    RoamingZones.findById(zoneId)
                        ?.countries
                        ?.contains(normalizedCountryCode) == true
                }

            if (!countryAlreadyIncludedInZone) {
                val standaloneCountries =
                    preferences[STANDALONE_COUNTRIES_KEY]
                        ?.toMutableSet()
                        ?: mutableSetOf()

                standaloneCountries.add(
                    normalizedCountryCode
                )

                preferences[STANDALONE_COUNTRIES_KEY] =
                    standaloneCountries.toSet()
            }
        }
    }

    suspend fun removeCountry(countryCode: String) {
        val normalizedCountryCode =
            countryCode.trim().uppercase(Locale.ROOT)

        context.countryDataStorage.edit { preferences ->
            val standaloneCountries =
                preferences[STANDALONE_COUNTRIES_KEY]
                    ?.toMutableSet()
                    ?: mutableSetOf()

            standaloneCountries.remove(
                normalizedCountryCode
            )

            preferences[STANDALONE_COUNTRIES_KEY] =
                standaloneCountries.toSet()
        }
    }

    suspend fun addZone(zoneId: String) {
        val normalizedZoneId =
            zoneId.trim().lowercase(Locale.ROOT)

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

            /*
             * Countries covered by the zone no longer need to be
             * stored separately.
             */
            standaloneCountries.removeAll(zone.countries)

            selectedZoneIds.add(zone.id)

            preferences[STANDALONE_COUNTRIES_KEY] =
                standaloneCountries.toSet()

            preferences[SELECTED_ZONE_IDS_KEY] =
                selectedZoneIds.toSet()
        }
    }

    suspend fun removeZone(zoneId: String) {
        val normalizedZoneId =
            zoneId.trim().lowercase(Locale.ROOT)

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

    suspend fun isCountryAllowed(
        countryCode: String
    ): Boolean {
        val normalizedCountryCode =
            countryCode.trim().uppercase(Locale.ROOT)

        return normalizedCountryCode in getAllowedCountries()
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