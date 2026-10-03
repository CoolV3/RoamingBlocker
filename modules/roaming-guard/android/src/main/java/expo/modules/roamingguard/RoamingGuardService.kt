package expo.modules.roamingguard

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.content.pm.ServiceInfo
import android.net.Uri
import android.net.VpnService
import android.os.ParcelFileDescriptor
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import java.io.FileInputStream
import java.io.IOException

class RoamingGuardService : VpnService() {

    companion object {
        const val ACTION_START =
            "expo.modules.roamingguard.action.START"

        const val ACTION_STOP =
            "expo.modules.roamingguard.action.STOP"

        const val NOTIFICATION_CHANNEL_ID =
            "roaming_guard_protection"

        const val COUNTRY_CHANGE_ALERT_NOTIFICATION_CHANNEL_ID =
            "roaming_guard_country_alert"

        const val NOTIFICATION_ID = 1001

        const val COUNTRY_CHANGE_ALERT_NOTIFICATION_ID = 1065

        private const val OPEN_BLOCKED_SCREEN_REQUEST_CODE = 1065

        const val EXTRA_OPEN_BLOCKED_SCREEN =
            "expo.modules.roamingguard.extra.OPEN_BLOCKED_SCREEN"

        const val EXTRA_BLOCKED_COUNTRY_CODE =
            "expo.modules.roamingguard.extra.BLOCKED_COUNTRY_CODE"

        @Volatile
        var isRunning = false
            private set

        @Volatile
        var isBlocking = false
            private set
    }

    private val vpnLock = Any()

    private var countryChangeDetector: DetectCountryChange? = null
    private var vpnInterface: ParcelFileDescriptor? = null
    private var packetDropThread: Thread? = null

    override fun onCreate() {
        super.onCreate()

        createNotificationChannels()

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
        if (isRunning) {
            return
        }

        ServiceCompat.startForeground(
            this,
            NOTIFICATION_ID,
            createNotification(
                title = "RoamingGuard is active",
                message = "Monitoring mobile network country"
            ),
            ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
        )

        isRunning = true
        countryChangeDetector?.start()
    }

    private fun stopRoamingGuard() {
        stopBlocking()

        countryChangeDetector?.stop()
        isRunning = false

        getSystemService(NotificationManager::class.java)
            .cancel(COUNTRY_CHANGE_ALERT_NOTIFICATION_ID)

        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun handleCountryResult(
        result: CountryChangeResult
    ) {
        if (result.isAllowed) {
            stopBlocking()

            getSystemService(NotificationManager::class.java)
                .cancel(COUNTRY_CHANGE_ALERT_NOTIFICATION_ID)

            updateForegroundNotification(
                title = "RoamingGuard is active",
                message =
                    "Connected country: ${result.currentCountryCode}",
                blockedCountryCode = null
            )

            return
        }

        val blockingStarted = startBlocking()

        if (!blockingStarted) {
            updateForegroundNotification(
                title = "RoamingGuard VPN error",
                message = "Internet blocking could not be started.",
                blockedCountryCode = null
            )

            return
        }

        updateForegroundNotification(
            title = "Mobile data blocked",
            message =
                "Internet access is blocked in ${result.currentCountryCode}.",
            blockedCountryCode = result.currentCountryCode
        )

        getSystemService(NotificationManager::class.java).notify(
            COUNTRY_CHANGE_ALERT_NOTIFICATION_ID,
            createBlockedAlertNotification(
                countryCode = result.currentCountryCode
            )
        )
    }

    private fun startBlocking(): Boolean {
        synchronized(vpnLock) {
            if (isBlocking && vpnInterface != null) {
                return true
            }

            stopBlockingLocked()

            val establishedInterface = try {
                val builder = Builder()
                    .setSession("RoamingGuard")
                    .setMtu(1500)
                    .setBlocking(true)
                    .addAddress("10.111.222.1", 32)
                    .addRoute("0.0.0.0", 0)
                    .addAddress("fd00:1:fd00:1::1", 128)
                    .addRoute("::", 0)

                createOpenAppPendingIntent()?.let { pendingIntent ->
                    builder.setConfigureIntent(pendingIntent)
                }

            builder.establish()
            } catch (_: Exception) {
                null
            }

            if (establishedInterface == null) {
                vpnInterface = null
                isBlocking = false
                return false
            }

            vpnInterface = establishedInterface
            isBlocking = true

            packetDropThread = Thread(
                {
                    discardPackets(establishedInterface)
                },
                "RoamingGuardPacketDropper"
            ).apply {
                start()
            }

            return true
        }
    }

    private fun discardPackets(
        vpnDescriptor: ParcelFileDescriptor
    ) {
        val packetBuffer = ByteArray(32767)

        try {
            FileInputStream(
                vpnDescriptor.fileDescriptor
            ).use { inputStream ->
                while (
                    isBlocking &&
                    !Thread.currentThread().isInterrupted
                ) {
                    val packetLength =
                        inputStream.read(packetBuffer)

                    if (packetLength < 0) {
                        break
                    }
                }
            }
        } catch (_: IOException) {
        } catch (_: Exception) {
        } finally {
            synchronized(vpnLock) {
                if (vpnInterface === vpnDescriptor) {
                    try {
                        vpnInterface?.close()
                    } catch (_: Exception) {
                    }

                    vpnInterface = null
                    isBlocking = false
                }
            }
        }
    }

    private fun stopBlocking() {
        synchronized(vpnLock) {
            stopBlockingLocked()
        }
    }

    private fun stopBlockingLocked() {
        isBlocking = false

        try {
            vpnInterface?.close()
        } catch (_: Exception) {
        }

        vpnInterface = null

        packetDropThread?.interrupt()
        packetDropThread = null
    }

    private fun updateForegroundNotification(
        title: String,
        message: String,
        blockedCountryCode: String?
    ) {
        getSystemService(NotificationManager::class.java).notify(
            NOTIFICATION_ID,
            createNotification(
                title = title,
                message = message,
                blockedCountryCode = blockedCountryCode
            )
        )
    }

    private fun createNotificationChannels() {
        val protectionChannel = NotificationChannel(
            NOTIFICATION_CHANNEL_ID,
            "RoamingGuard protection",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description =
                "Shows when RoamingGuard protection is active"

            setShowBadge(false)
        }

        val countryChangeAlertChannel = NotificationChannel(
            COUNTRY_CHANGE_ALERT_NOTIFICATION_CHANNEL_ID,
            "Country change detected",
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description =
                "Alerts when RoamingGuard detects a blocked country"

            enableVibration(true)
            setShowBadge(true)
        }

        getSystemService(NotificationManager::class.java)
            .createNotificationChannels(
                listOf(
                    protectionChannel,
                    countryChangeAlertChannel
                )
            )
    }

    private fun createNotification(
        title: String,
        message: String,
        blockedCountryCode: String? = null
    ): Notification {
        val contentIntent =
            if (blockedCountryCode != null) {
                createOpenBlockedScreenPendingIntent(
                    blockedCountryCode
                )
            } else {
                createOpenAppPendingIntent()
            }

        return NotificationCompat.Builder(
            this,
            NOTIFICATION_CHANNEL_ID
        )
            .setSmallIcon(
                if (blockedCountryCode != null) {
                    android.R.drawable.stat_sys_warning
                } else {
                    android.R.drawable.ic_lock_lock
                }
            )
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText(message)
            )
            .setContentIntent(contentIntent)
            .setOngoing(true)
            .setAutoCancel(false)
            .setOnlyAlertOnce(true)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun createBlockedAlertNotification(
        countryCode: String
    ): Notification {
        val contentIntent =
            createOpenBlockedScreenPendingIntent(countryCode)

        return NotificationCompat.Builder(
            this,
            COUNTRY_CHANGE_ALERT_NOTIFICATION_CHANNEL_ID
        )
            .setSmallIcon(
                android.R.drawable.stat_sys_warning
            )
            .setContentTitle("Mobile data blocked")
            .setContentText(
                "RoamingGuard detected a disallowed network in $countryCode."
            )
            .setStyle(
                NotificationCompat.BigTextStyle().bigText(
                    "RoamingGuard detected a disallowed mobile network in $countryCode. Tap to view more information."
                )
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

    private fun createOpenAppPendingIntent(): PendingIntent? {
        val launchIntent =
            packageManager.getLaunchIntentForPackage(packageName)
                ?: return null

        launchIntent.addFlags(
            Intent.FLAG_ACTIVITY_NEW_TASK or
                Intent.FLAG_ACTIVITY_CLEAR_TOP or
                Intent.FLAG_ACTIVITY_SINGLE_TOP
        )

        return PendingIntent.getActivity(
            this,
            NOTIFICATION_ID,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or
                PendingIntent.FLAG_IMMUTABLE
        )
    }

    private fun createOpenBlockedScreenPendingIntent(
        countryCode: String
    ): PendingIntent? {
        val launchIntent =
            packageManager.getLaunchIntentForPackage(packageName)
                ?: return null

        launchIntent.apply {
            action = Intent.ACTION_VIEW

            data = Uri.Builder()
                .scheme("roamingguard")
                .path("/blockedInternetAccessScreen")
                .appendQueryParameter(
                    "countryCode",
                    countryCode
                )
                .build()

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

    override fun onRevoke() {
        stopRoamingGuard()
        super.onRevoke()
    }

    override fun onDestroy() {
        stopBlocking()

        countryChangeDetector?.destroy()
        countryChangeDetector = null

        isRunning = false

        super.onDestroy()
    }
}