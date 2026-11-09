package com.autohush

import android.content.Context
import android.location.Location
import android.media.AudioManager
import org.json.JSONArray
import java.util.Calendar

/** Rule evaluation + applying the ringer mode. Shared by the service and the React module. */
object RuleEngine {
  const val PREFS = "autohush"
  private const val KEY_RULES = "rules"
  private const val KEY_SAVED_MODE = "savedMode" // ringer mode before AutoHush touched it, -1 if none
  private const val KEY_ACTIVE_KEY = "activeKey" // last applied target, so we only act on transitions
  private const val KEY_ACTIVE_NAMES = "activeNames"

  data class Place(val lat: Double, val lng: Double, val radius: Double)
  data class Rule(
    val id: String,
    val name: String,
    val enabled: Boolean,
    val mode: String, // "silent" | "vibrate" | "ring"
    val days: Set<Int>, // 0..6, Sunday = 0
    val startMin: Int,
    val endMin: Int,
    val place: Place?,
  )

  private fun prefs(ctx: Context) = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  fun saveRules(ctx: Context, json: String) = prefs(ctx).edit().putString(KEY_RULES, json).apply()

  fun rulesJson(ctx: Context): String = prefs(ctx).getString(KEY_RULES, "[]") ?: "[]"

  fun activeNames(ctx: Context): String = prefs(ctx).getString(KEY_ACTIVE_NAMES, "") ?: ""

  fun parse(json: String): List<Rule> {
    val arr = JSONArray(json)
    return (0 until arr.length()).map { i ->
      val o = arr.getJSONObject(i)
      val d = o.getJSONArray("days")
      val days = (0 until d.length()).map { d.getInt(it) }.toSet()
      val p = o.optJSONObject("place")
      Rule(
        id = o.getString("id"),
        name = o.optString("name", ""),
        enabled = o.optBoolean("enabled", true),
        mode = o.optString("mode", "silent"),
        days = days,
        startMin = o.optInt("startMin", 0),
        endMin = o.optInt("endMin", 0),
        place = p?.let { Place(it.getDouble("lat"), it.getDouble("lng"), it.optDouble("radius", 100.0)) },
      )
    }
  }

  fun hasEnabledRules(ctx: Context): Boolean =
    try { parse(rulesJson(ctx)).any { it.enabled } } catch (e: Exception) { false }

  fun timeMatches(r: Rule, now: Calendar): Boolean {
    val today = now.get(Calendar.DAY_OF_WEEK) - 1
    val yesterday = (today + 6) % 7
    val minute = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE)
    return when {
      r.startMin == r.endMin -> today in r.days // whole day
      r.startMin < r.endMin -> today in r.days && minute >= r.startMin && minute < r.endMin
      // overnight window (e.g. 22:00 -> 07:00): the morning part belongs to yesterday's rule day
      else -> (today in r.days && minute >= r.startMin) || (yesterday in r.days && minute < r.endMin)
    }
  }

  fun isActive(r: Rule, now: Calendar, loc: Location?): Boolean {
    if (!r.enabled || !timeMatches(r, now)) return false
    val p = r.place ?: return true
    if (loc == null) return false
    val out = FloatArray(1)
    Location.distanceBetween(loc.latitude, loc.longitude, p.lat, p.lng, out)
    return out[0] <= p.radius
  }

  private fun rank(mode: String) = when (mode) { "silent" -> 2; "vibrate" -> 1; else -> 0 }

  /** Evaluates all rules and changes the ringer mode on transitions only, so manual changes aren't fought. */
  fun evaluate(ctx: Context, loc: Location?) {
    val prefs = prefs(ctx)
    val rules = try { parse(rulesJson(ctx)) } catch (e: Exception) { emptyList() }
    val active = rules.filter { isActive(it, Calendar.getInstance(), loc) }
    val target = active.maxByOrNull { rank(it.mode) }?.mode
    val key = target ?: ""
    prefs.edit().putString(KEY_ACTIVE_NAMES, active.joinToString(", ") { it.name }).apply()
    if (key == (prefs.getString(KEY_ACTIVE_KEY, "") ?: "")) return

    val am = ctx.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    try {
      if (target != null) {
        if (prefs.getInt(KEY_SAVED_MODE, -1) == -1) prefs.edit().putInt(KEY_SAVED_MODE, am.ringerMode).apply()
        am.ringerMode = when (target) {
          "silent" -> AudioManager.RINGER_MODE_SILENT
          "vibrate" -> AudioManager.RINGER_MODE_VIBRATE
          else -> AudioManager.RINGER_MODE_NORMAL
        }
      } else {
        val saved = prefs.getInt(KEY_SAVED_MODE, -1)
        if (saved != -1) am.ringerMode = saved
        prefs.edit().putInt(KEY_SAVED_MODE, -1).apply()
      }
      prefs.edit().putString(KEY_ACTIVE_KEY, key).apply()
    } catch (e: SecurityException) {
      // Do Not Disturb access not granted yet; retried on the next tick.
    }
  }

  /** Forget the last applied state (used when the service starts) so the current state is re-applied. */
  fun reset(ctx: Context) {
    prefs(ctx).edit().putString(KEY_ACTIVE_KEY, "").apply()
  }
}
