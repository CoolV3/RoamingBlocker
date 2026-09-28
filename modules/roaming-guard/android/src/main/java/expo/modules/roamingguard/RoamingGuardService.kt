package expo.modules.roamingguard

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat
import android.content.pm.ServiceInfo
import androidx.core.app.ServiceCompat

class RoamingGuardService : Service() {

    companion object {
        const val ACTION_START =
            "expo.modules.roamingguard.action.START"

        const val ACTION_STOP =
            "expo.modules.roamingguard.action.STOP"

        const val NOTIFICATION_CHANNEL_ID =
            "roaming_guard_protection"

        const val NOTIFICATION_ID = 1001

        @Volatile
        var isRunning = false
            private set
    }

    private var countryChangeDetector: DetectCountryChange? = null

    override fun onCreate() {
        super.onCreate()

        createNotificationChannel()

        countryChangeDetector = DetectCountryChange(
            applicationContext
        ) { result ->
            handleCountryResult(result)
        }
    }

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int
    ): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                stopRoamingGuard()
                return START_NOT_STICKY
            }

            ACTION_START, null -> {
                startRoamingGuard()
            }
        }

        /*
         * Android may recreate the service after process termination.
         */
        return START_STICKY
    }

    private fun startRoamingGuard() {
        if (isRunning) return

        ServiceCompat.startForeground(
            this,
            NOTIFICATION_ID,
            createNotification(
                title = "RoamingGuard is active",
                message = "Monitoring mobile network country"
            ),
            ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
        )

        countryChangeDetector?.start()
        isRunning = true
    }

    private fun stopRoamingGuard() {
        countryChangeDetector?.stop()
        isRunning = false

        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun handleCountryResult(
        result: CountryChangeResult
    ) {
        val message = if (result.isAllowed) {
            "Connected country: ${result.currentCountryCode}"
        } else {
            "Warning: ${result.currentCountryCode} is not allowed"
        }

        val notificationManager =
            getSystemService(NotificationManager::class.java)

        notificationManager.notify(
            NOTIFICATION_ID,
            createNotification(
                title = if (result.isAllowed) {
                    "RoamingGuard is active"
                } else {
                    "RoamingGuard warning"
                },
                message = message
            )
        )

        /*
         * Add your roaming blocking or warning behavior here.
         *
         * Do not depend on React Native receiving an event because
         * JavaScript may not be running while the app is closed.
         */
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            NOTIFICATION_CHANNEL_ID,
            "RoamingGuard is active",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description =
                "Shows when RoamingGuard country monitoring is active"
        }

        val notificationManager =
            getSystemService(NotificationManager::class.java)

        notificationManager.createNotificationChannel(channel)
    }

    private fun createNotification(
        title: String,
        message: String
    ): Notification {
        return NotificationCompat.Builder(
            this,
            NOTIFICATION_CHANNEL_ID
        )
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setContentTitle(title)
            .setContentText(message)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    override fun onDestroy() {
        countryChangeDetector?.destroy()
        countryChangeDetector = null
        isRunning = false

        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}