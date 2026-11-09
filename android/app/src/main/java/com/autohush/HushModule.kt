package com.autohush

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class HushModule(private val ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {
  override fun getName() = "Hush"

  @ReactMethod
  fun getRules(promise: Promise) = promise.resolve(RuleEngine.rulesJson(ctx))

  /** Persists rules and starts/stops the background service accordingly. */
  @ReactMethod
  fun saveRules(json: String, promise: Promise) {
    try {
      RuleEngine.parse(json) // validate
      RuleEngine.saveRules(ctx, json)
      val intent = Intent(ctx, HushService::class.java)
      if (RuleEngine.hasEnabledRules(ctx)) {
        ContextCompat.startForegroundService(ctx, intent)
      } else {
        ctx.stopService(intent)
        RuleEngine.evaluate(ctx, null) // releases the ringer if a rule was holding it
      }
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("E_SAVE", e)
    }
  }

  @ReactMethod
  fun hasPolicyAccess(promise: Promise) {
    val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    promise.resolve(nm.isNotificationPolicyAccessGranted)
  }

  @ReactMethod
  fun openPolicySettings() {
    val i = Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    ctx.startActivity(i)
  }

  @ReactMethod
  fun getStatus(promise: Promise) {
    val m = Arguments.createMap()
    m.putString("activeNames", RuleEngine.activeNames(ctx))
    promise.resolve(m)
  }

  private fun resolveLocation(promise: Promise, loc: Location) {
    val m = Arguments.createMap()
    m.putDouble("lat", loc.latitude)
    m.putDouble("lng", loc.longitude)
    promise.resolve(m)
  }

  /** Best last-known fix, used by the "use my current location" button. */
  @ReactMethod
  fun getCurrentLocation(promise: Promise) {
    try {
      val lm = ctx.getSystemService(Context.LOCATION_SERVICE) as LocationManager
      val best: Location? = lm.getProviders(true)
        .mapNotNull { lm.getLastKnownLocation(it) }
        .maxByOrNull { it.time }
      if (best != null) {
        resolveLocation(promise, best)
        return
      }
      // No cached fix (common on emulators / fresh boots): ask for a fresh one.
      val provider = listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER)
        .firstOrNull { lm.isProviderEnabled(it) }
      if (provider == null) {
        promise.reject("E_LOCATION_OFF", "Location is turned off. Enable it in system settings and retry.")
        return
      }
      val handler = Handler(Looper.getMainLooper())
      var done = false
      lateinit var listener: LocationListener
      val timeout = Runnable {
        if (!done) {
          done = true
          lm.removeUpdates(listener)
          promise.reject("E_NO_FIX", "Couldn't get a location fix. Go outside or set a location in the emulator, then retry.")
        }
      }
      listener = LocationListener { loc ->
        if (!done) {
          done = true
          handler.removeCallbacks(timeout)
          lm.removeUpdates(listener)
          resolveLocation(promise, loc)
        }
      }
      lm.requestLocationUpdates(provider, 0L, 0f, listener, Looper.getMainLooper())
      handler.postDelayed(timeout, 20_000)
    } catch (e: SecurityException) {
      promise.reject("E_PERMISSION", "Location permission not granted")
    }
  }
}
