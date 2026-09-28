package expo.modules.roamingguard

import android.content.Intent
import androidx.core.content.ContextCompat
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class RoamingGuardModule : Module() {

    private val countryStorage: CountryStorage
        get() {
            val context = requireNotNull(appContext.reactContext) {
                "React context not available"
            }

            return CountryStorage(context.applicationContext)
        }

    override fun definition() = ModuleDefinition {

        Name("RoamingGuard")

        /*
         * Explicitly typed suspend functions prevent Kotlin from
         * choosing the wrong Coroutine overload.
         */

        val enableCountryWatchingCoroutine:
            suspend () -> Unit = {
                val context = requireNotNull(
                    appContext.reactContext
                ) {
                    "React context not available"
                }

                val applicationContext =
                    context.applicationContext

                countryStorage.setCountryWatchingEnabled(true)

                try {
                    val intent = Intent(
                        applicationContext,
                        RoamingGuardService::class.java
                    ).apply {
                        action =
                            RoamingGuardService.ACTION_START
                    }

                    ContextCompat.startForegroundService(
                        applicationContext,
                        intent
                    )
                } catch (exception: Exception) {
                    countryStorage.setCountryWatchingEnabled(
                        false
                    )

                    throw exception
                }
            }

        val disableCountryWatchingCoroutine:
            suspend () -> Unit = {
                val context = requireNotNull(
                    appContext.reactContext
                ) {
                    "React context not available"
                }

                val applicationContext =
                    context.applicationContext

                countryStorage.setCountryWatchingEnabled(false)

                val intent = Intent(
                    applicationContext,
                    RoamingGuardService::class.java
                )

                applicationContext.stopService(intent)
            }

        val isCountryWatchingCoroutine:
            suspend () -> Boolean = {
                countryStorage.isCountryWatchingEnabled()
            }

        val getAllowedCountriesCoroutine:
            suspend () -> List<String> = {
                countryStorage.getAllowedCountries()
            }

        val getStandaloneCountriesCoroutine:
            suspend () -> List<String> = {
                countryStorage.getStandaloneCountries()
            }

        val getSelectedZoneIdsCoroutine:
            suspend () -> List<String> = {
                countryStorage.getSelectedZoneIds()
            }

        /*
         * Country-watching functions.
         */

        AsyncFunction("enableCountryWatching") Coroutine
            enableCountryWatchingCoroutine

        AsyncFunction("disableCountryWatching") Coroutine
            disableCountryWatchingCoroutine

        AsyncFunction("isCountryWatching") Coroutine
            isCountryWatchingCoroutine

        Function("isCountryWatchingServiceRunning") {
            RoamingGuardService.isRunning
        }

        /*
         * Country and zone storage functions.
         */

        AsyncFunction("getAllowedCountries") Coroutine
            getAllowedCountriesCoroutine

        AsyncFunction("getStandaloneCountries") Coroutine
            getStandaloneCountriesCoroutine

        AsyncFunction("getSelectedZoneIds") Coroutine
            getSelectedZoneIdsCoroutine

        AsyncFunction("addCountry") Coroutine {
                countryCode: String ->

            countryStorage.addCountry(countryCode)
        }

        AsyncFunction("removeCountry") Coroutine {
                countryCode: String ->

            countryStorage.removeCountry(countryCode)
        }

        AsyncFunction("isCountryAllowed") Coroutine {
                countryCode: String ->

            countryStorage.isCountryAllowed(countryCode)
        }

        AsyncFunction("addZone") Coroutine {
                zoneId: String ->

            countryStorage.addZone(zoneId)
        }

        AsyncFunction("removeZone") Coroutine {
                zoneId: String ->

            countryStorage.removeZone(zoneId)
        }

        Function("getAvailableZones") {
            countryStorage.getAvailableZones()
        }
    }
}