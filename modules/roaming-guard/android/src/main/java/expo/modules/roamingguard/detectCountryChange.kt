package expo.modules.roamingguard

import android.content.Context
import android.os.Build
import android.telephony.PhoneStateListener
import android.telephony.ServiceState
import android.telephony.TelephonyCallback
import android.telephony.TelephonyManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.util.Locale
import java.util.concurrent.Executor

data class CountryChangeResult(
    val previousCountryCode: String?,
    val currentCountryCode: String,
    val isAllowed: Boolean
)

class DetectCountryChange(
    context: Context,
    private val onCountryChanged: (CountryChangeResult) -> Unit
) {
    private val appContext = context.applicationContext

    private val telephonyManager = appContext.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager

    private val countryStorage = CountryStorage(appContext)

    private val scope = CoroutineScope(
        SupervisorJob() + Dispatchers.IO
    )

    private var checkingJob: Job? = null
    private var isStarted = false
    private var lastCountryCode: String? = null

    private val callbackExecutor = Executor { command ->
        scope.launch {
            command.run()
        }
    }


    private val telephonyCallback: TelephonyCallback? =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            object : TelephonyCallback(),
                TelephonyCallback.ServiceStateListener {

                override fun onServiceStateChanged(serviceState: ServiceState) {
                    checkCurrentCountry()
                }
            }
        } else {
            null
        }


    fun start() {
        if (isStarted) {
            return
        }




        val callback = telephonyCallback ?: return

        telephonyManager.registerTelephonyCallback(
            callbackExecutor,
            callback
        )
        isStarted = true

        checkCurrentCountry(force = true)
    }

    fun stop() {
        if (!isStarted) {
            return
        }

        isStarted = false
        checkingJob?.cancel()
        checkingJob = null


        telephonyCallback?.let {
            telephonyManager.unregisterTelephonyCallback(it)
        }

    }

    fun isWatching(): Boolean {
        return isStarted
    }

    fun checkCurrentCountry(force: Boolean = false) {
        checkingJob?.cancel()

        checkingJob = scope.launch {
            val countryCode = getCurrentNetworkCountryCode()
                ?: return@launch


            if (!force && countryCode == lastCountryCode) {
                return@launch
            }

            val previousCountryCode = lastCountryCode
            lastCountryCode = countryCode

            val isAllowed = countryStorage.isCountryAllowed(countryCode)

            onCountryChanged(
                CountryChangeResult(
                    previousCountryCode = previousCountryCode,
                    currentCountryCode = countryCode,
                    isAllowed = isAllowed
                )
            )
        }
    }

    fun getLastDetectedCountry(): String? {
        return lastCountryCode
    }

    fun destroy() {
        stop()
        scope.cancel()
    }

    private fun getCurrentNetworkCountryCode(): String? {
        val countryCode = telephonyManager.networkCountryIso
            ?.trim()
            ?.uppercase(Locale.ROOT)

        return countryCode
            ?.takeIf { it.length == 2 }
    }
}