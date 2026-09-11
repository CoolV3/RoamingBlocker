package expo.modules.roamingguard

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

        val getAllowedCountriesCoroutine:
            suspend () -> List<String> = {
                countryStorage.getAllowedCountries()
            }

        AsyncFunction("getAllowedCountries") Coroutine
            getAllowedCountriesCoroutine

        AsyncFunction("addCountry") Coroutine { countryCode: String ->
            countryStorage.addCountry(countryCode)
        }

        AsyncFunction("removeCountry") Coroutine { countryCode: String ->
            countryStorage.removeCountry(countryCode)
        }

        AsyncFunction("isCountryAllowed") Coroutine { countryCode: String ->
            countryStorage.isCountryAllowed(countryCode)
        }
    }
}

