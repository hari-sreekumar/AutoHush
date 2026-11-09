package com.autohush

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat

/** Foreground service: tracks location and the clock, and applies matching rules. */
class HushService : Service(), LocationListener {
  private val handler = Handler(Looper.getMainLooper())
  private var lastLocation: Location? = null
  private var lm: LocationManager? = null

  private val tick = object : Runnable {
    override fun run() {
      RuleEngine.evaluate(this@HushService, lastLocation)
      handler.postDelayed(this, 30_000)
    }
  }

  override fun onCreate() {
    super.onCreate()
    val granted = checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
    if (!granted) {
      stopSelf()
      return
    }

    val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      nm.createNotificationChannel(NotificationChannel(CHANNEL, "AutoHush", NotificationManager.IMPORTANCE_LOW))
    }
    val n: Notification = NotificationCompat.Builder(this, CHANNEL)
      .setContentTitle("AutoHush is running")
      .setContentText("Watching your schedules and locations")
      .setSmallIcon(android.R.drawable.ic_lock_silent_mode)
      .setOngoing(true)
      .build()
    ServiceCompat.startForeground(
      this, 1, n,
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION else 0,
    )

    val manager = getSystemService(Context.LOCATION_SERVICE) as LocationManager
    lm = manager
    try {
      for (p in listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER)) {
        if (manager.isProviderEnabled(p)) {
          manager.requestLocationUpdates(p, 60_000L, 30f, this, Looper.getMainLooper())
          if (lastLocation == null) lastLocation = manager.getLastKnownLocation(p)
        }
      }
    } catch (e: SecurityException) {
      stopSelf()
      return
    }
    RuleEngine.reset(this)
    handler.post(tick)
  }

  override fun onLocationChanged(location: Location) {
    lastLocation = location
    RuleEngine.evaluate(this, location)
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    // Re-evaluate right away (rules may have just been edited).
    handler.removeCallbacks(tick)
    handler.post(tick)
    return START_STICKY
  }

  override fun onDestroy() {
    handler.removeCallbacks(tick)
    lm?.removeUpdates(this)
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  companion object {
    private const val CHANNEL = "autohush_service"
  }
}
