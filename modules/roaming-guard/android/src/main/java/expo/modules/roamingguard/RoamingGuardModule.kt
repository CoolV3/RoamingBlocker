package expo.modules.roamingguard

import android.app.Activity
import android.content.Intent
import android.net.VpnService
import androidx.core.content.ContextCompat
import expo.modules.kotlin.Promise
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings

class RoamingGuardModule : Module() {

    companion object {
        private const val VPN_PERMISSION_REQUEST_CODE = 7201
        private const val BATTERY_OPTIMIZATION_REQUEST_CODE = 7202


        @Volatile
        var blockingStateListener: ((Boolean) -> Unit)? = null
    }

    private var pendingVpnPermissionPromise: Promise? = null
    private var pendingBatteryOptimizationPromise: Promise? = null

    private val moduleScope =
        CoroutineScope(SupervisorJob() + Dispatchers.IO)

    private val countryStorage: CountryStorage
        get() {
            val context = requireNotNull(appContext.reactContext) {
                "React context not available"
            }

            return CountryStorage(context.applicationContext)
        }

    private fun startRoamingGuardService() {
        val context = requireNotNull(appContext.reactContext) {
            "React context not available"
        }

        val applicationContext = context.applicationContext

        val intent = Intent(
            applicationContext,
            RoamingGuardService::class.java
        ).apply {
            action = RoamingGuardService.ACTION_START
        }

        ContextCompat.startForegroundService(
            applicationContext,
            intent
        )
    }

    private fun isIgnoringBatteryOptimizations(): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            return true
        }

        val context = requireNotNull(appContext.reactContext) {
            "React context not available"
        }

        val powerManager = context.getSystemService(
            Context.POWER_SERVICE
        ) as PowerManager

        return powerManager.isIgnoringBatteryOptimizations(
            context.packageName
        )
    }

    override fun definition() = ModuleDefinition {
        Name("RoamingGuard")
        Events("onBlockingStateChanged")

        OnCreate {
            blockingStateListener = { isBlocked ->
                sendEvent(
                    "onBlockingStateChanged",
                    mapOf("isBlocked" to isBlocked)
                )
            }
        }

        OnDestroy {
            blockingStateListener = null
        }

        OnActivityResult { _, payload ->
            when (payload.requestCode) {
                BATTERY_OPTIMIZATION_REQUEST_CODE -> {
                    val promise = pendingBatteryOptimizationPromise
                        ?: return@OnActivityResult

                    pendingBatteryOptimizationPromise = null

                    val context = requireNotNull(appContext.reactContext) {
                        "React context not available"
                    }

                    val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager


                    val ignoresBatteryOptimizations =
                        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
                            true
                        } else {
                            powerManager.isIgnoringBatteryOptimizations(
                                context.packageName
                            )
                        }

                    if (!ignoresBatteryOptimizations) {
                        promise.reject(
                            "ERR_BATTERY_OPTIMIZATION_DENIED",
                            "Battery optimization exemption was denied.",
                            null
                        )

                        return@OnActivityResult
                    }


                    val prepareIntent = VpnService.prepare(context.applicationContext)

                    if (prepareIntent == null) {
                        moduleScope.launch {
                            try {
                                countryStorage.setCountryWatchingEnabled(true)
                                startRoamingGuardService()
                                promise.resolve(null)
                            } catch (exception: Exception) {
                                countryStorage.setCountryWatchingEnabled(false)

                                promise.reject(
                                    "ERR_ROAMING_GUARD_START",
                                    "Failed to start RoamingGuard.",
                                    exception
                                )
                            }
                        }

                        return@OnActivityResult
                    }

                    val activity = appContext.currentActivity

                    if (activity == null) {
                        promise.reject(
                            "ERR_ACTIVITY_UNAVAILABLE",
                            "RoamingGuard needs an open activity to request VPN permission.",
                            null
                        )

                        return@OnActivityResult
                    }

                    pendingVpnPermissionPromise = promise

                    try {
                        activity.startActivityForResult(
                            prepareIntent,
                            VPN_PERMISSION_REQUEST_CODE
                        )
                    } catch (exception: Exception) {
                        pendingVpnPermissionPromise = null

                        promise.reject(
                            "ERR_VPN_PERMISSION_REQUEST",
                            "Failed to open the Android VPN permission dialog.",
                            exception
                        )
                    }
                }

                VPN_PERMISSION_REQUEST_CODE -> {
                    val promise = pendingVpnPermissionPromise
                        ?: return@OnActivityResult

                    pendingVpnPermissionPromise = null

                    moduleScope.launch {
                        if (payload.resultCode != Activity.RESULT_OK) {
                            countryStorage.setCountryWatchingEnabled(false)

                            promise.reject(
                                "ERR_VPN_PERMISSION_DENIED",
                                "VPN permission was denied.",
                                null
                            )

                            return@launch
                        }

                        try {
                            countryStorage.setCountryWatchingEnabled(true)
                            startRoamingGuardService()
                            promise.resolve(null)
                        } catch (exception: Exception) {
                            countryStorage.setCountryWatchingEnabled(false)

                            promise.reject(
                                "ERR_ROAMING_GUARD_START",
                                "VPN permission was granted, but RoamingGuard could not be started.",
                                exception
                            )
                        }
                    }
                }
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

                if (RoamingGuardService.isRunning) {
                    val intent = Intent(
                        applicationContext,
                        RoamingGuardService::class.java
                    ).apply {
                        action = RoamingGuardService.ACTION_STOP
                    }

                    applicationContext.startService(intent)
                }
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

        AsyncFunction("enableCountryWatching") { promise: Promise ->
            if (
                pendingVpnPermissionPromise != null ||
                pendingBatteryOptimizationPromise != null
            ) {
                promise.reject(
                    "ERR_PERMISSION_REQUEST_IN_PROGRESS",
                    "A permission request is already in progress.",
                    null
                )

                return@AsyncFunction
            }

            val context = requireNotNull(appContext.reactContext) {"React context not available"}

            val activity = appContext.currentActivity

            if (activity == null) {
                promise.reject(
                    "ERR_ACTIVITY_UNAVAILABLE",
                    "RoamingGuard needs an open activity to request permissions.",
                    null
                )

                return@AsyncFunction
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val powerManager = context.getSystemService(
                    Context.POWER_SERVICE
                ) as PowerManager

                val ignoresBatteryOptimizations =
                    powerManager.isIgnoringBatteryOptimizations(
                        context.packageName
                    )

                if (!ignoresBatteryOptimizations) {
                    val batteryOptimizationIntent = Intent(
                        Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS
                    ).apply {
                        data = Uri.parse(
                            "package:${context.packageName}"
                        )
                    }

                    pendingBatteryOptimizationPromise = promise

                    try {
                        activity.startActivityForResult(
                            batteryOptimizationIntent,
                            BATTERY_OPTIMIZATION_REQUEST_CODE
                        )
                    } catch (exception: Exception) {
                        pendingBatteryOptimizationPromise = null

                        promise.reject(
                            "ERR_BATTERY_OPTIMIZATION_REQUEST",
                            "Failed to open the Android battery optimization dialog.",
                            exception
                        )
                    }

                    return@AsyncFunction
                }
            }

            val prepareIntent = VpnService.prepare(
                context.applicationContext
            )

            if (prepareIntent == null) {
                moduleScope.launch {
                    try {
                        countryStorage.setCountryWatchingEnabled(true)
                        startRoamingGuardService()
                        promise.resolve(null)
                    } catch (exception: Exception) {
                        countryStorage.setCountryWatchingEnabled(false)

                        promise.reject(
                            "ERR_ROAMING_GUARD_START",
                            "Failed to start RoamingGuard.",
                            exception
                        )
                    }
                }

                return@AsyncFunction
            }

            pendingVpnPermissionPromise = promise

            try {
                activity.startActivityForResult(
                    prepareIntent,
                    VPN_PERMISSION_REQUEST_CODE
                )
            } catch (exception: Exception) {
                pendingVpnPermissionPromise = null

                promise.reject(
                    "ERR_VPN_PERMISSION_REQUEST",
                    "Failed to open the Android VPN permission dialog.",
                    exception
                )
            }
        }

        AsyncFunction("disableCountryWatching") Coroutine
            disableCountryWatchingCoroutine

        AsyncFunction("isCountryWatching") Coroutine
            isCountryWatchingCoroutine

        Function("isCountryWatchingServiceRunning") {
            RoamingGuardService.isRunning
        }

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

        Function("isInternetBlocked") {
            RoamingGuardService.isBlocking
        }

    }
}