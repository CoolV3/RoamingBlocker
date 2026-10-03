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
import android.app.PendingIntent
import android.net.Uri

class RoamingGuardService : Service() {

    companion object {
        const val ACTION_START =
            "expo.modules.roamingguard.action.START"

        const val ACTION_STOP =
            "expo.modules.roamingguard.action.STOP"

        const val NOTIFICATION_CHANNEL_ID =
            "roaming_guard_protection"

        const val CountryChangeAlert_NOTIFICATION_CHANNEL_ID =
            "roaming_guard_country_alert"

        const val NOTIFICATION_ID = 1001

        const val CountryChangeAlert_NOTIFICATION_ID = 1065

        private const val OPEN_BLOCKED_SCREEN_REQUEST_CODE = 1065
        const val EXTRA_OPEN_BLOCKED_SCREEN = "expo.modules.roamingguard.extra.OPEN_BLOCKED_SCREEN"
        const val EXTRA_BLOCKED_COUNTRY_CODE = "expo.modules.roamingguard.extra.BLOCKED_COUNTRY_CODE"

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

        val notificationManager = getSystemService(NotificationManager::class.java)

        if (result.isAllowed) {
            notificationManager.notify(
                NOTIFICATION_ID,
                createNotification(
                    title = "RoamingGuard is active",
                    message = "Connected country: ${result.currentCountryCode}"
                )
            )

            return
        }



        notificationManager.notify(
            CountryChangeAlert_NOTIFICATION_ID,
            createBlockedAlertNotification(
                countryCode = result.currentCountryCode
            )
        )


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

        val countryChangeAlertChannel = NotificationChannel(
                    CountryChangeAlert_NOTIFICATION_CHANNEL_ID,
                    "CountryChange Detected",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description =
                        "Click here to see details."
                    enableVibration(true)
                    setShowBadge(true)
                }

        val notificationManager =
            getSystemService(NotificationManager::class.java)

        notificationManager.createNotificationChannels(
            listOf(
                channel,
                countryChangeAlertChannel
            )
        )
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



    private fun createBlockedAlertNotification(countryCode: String): Notification {

        val contentIntent = createOpenBlockedScreenPendingIntent(countryCode = countryCode)

        return NotificationCompat.Builder(this, CountryChangeAlert_NOTIFICATION_CHANNEL_ID)
        .setSmallIcon(android.R.drawable.stat_sys_warning)
        .setContentTitle("Mobile data blocked")
        .setContentText("RoamingGuard detected a disallowed network in $countryCode.")
        .setStyle(
        NotificationCompat.BigTextStyle()
        .bigText("RoamingGuard detected a disallowed mobile network in $countryCode. Tap to view more information.")
        )
        .setContentIntent(contentIntent)
        .setAutoCancel(true)
        .setOngoing(false)
        .setOnlyAlertOnce(false)
        .setCategory(NotificationCompat.CATEGORY_ERROR)
        .setPriority(NotificationCompat.PRIORITY_HIGH)
        .setDefaults(NotificationCompat.DEFAULT_ALL)
        .build()
    }

    private fun createOpenBlockedScreenPendingIntent(countryCode: String): PendingIntent? {

        val launchIntent = packageManager.getLaunchIntentForPackage(packageName) ?: return null



        launchIntent.apply {
            action = Intent.ACTION_VIEW
            data = Uri.Builder().scheme("roamingguard").path("/blockedInternetAccessScreen").appendQueryParameter("countryCode", countryCode).build()

            addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK or
                Intent.FLAG_ACTIVITY_CLEAR_TOP or
                Intent.FLAG_ACTIVITY_SINGLE_TOP
            )

        }
        return PendingIntent.getActivity(
            this,
            OPEN_BLOCKED_SCREEN_REQUEST_CODE,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or
            PendingIntent.FLAG_IMMUTABLE
        )
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