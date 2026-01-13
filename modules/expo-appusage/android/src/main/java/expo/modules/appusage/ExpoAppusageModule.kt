package expo.modules.appusage

import android.app.AppOpsManager
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.Calendar

class ExpoAppusageModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoAppusage")

    // Función para verificar si tenemos el permiso de UsageStats
    AsyncFunction("hasUsagePermission") {
      return@AsyncFunction hasUsageStatsPermission()
    }

    // Función para abrir la configuración de UsageStats
    AsyncFunction("requestUsagePermission") {
      openUsageAccessSettings()
    }

    // Función principal para obtener el uso de apps
    AsyncFunction("getAppUsageStats") { timeRange: String ->
      if (!hasUsageStatsPermission()) {
        throw Exception("Usage stats permission not granted")
      }

      val usageStats = getUsageStatsList(timeRange)
      return@AsyncFunction usageStats
    }

    // Función para obtener el uso de una app específica
    AsyncFunction("getAppUsage") { packageName: String, timeRange: String ->
      if (!hasUsageStatsPermission()) {
        throw Exception("Usage stats permission not granted")
      }

      val usageStats = getSpecificAppUsage(packageName, timeRange)
      return@AsyncFunction usageStats
    }
  }

  private val context
    get() = requireNotNull(appContext.reactContext)

  private fun hasUsageStatsPermission(): Boolean {
    return try {
      val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
      val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        @Suppress("DEPRECATION")
        appOps.unsafeCheckOpNoThrow(
          AppOpsManager.OPSTR_GET_USAGE_STATS,
          android.os.Process.myUid(),
          context.packageName
        )
      } else {
        @Suppress("DEPRECATION")
        appOps.checkOpNoThrow(
          AppOpsManager.OPSTR_GET_USAGE_STATS,
          android.os.Process.myUid(),
          context.packageName
        )
      }
      mode == AppOpsManager.MODE_ALLOWED
    } catch (e: Exception) {
      false
    }
  }

  private fun openUsageAccessSettings() {
    val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
    context.startActivity(intent)
  }

  private fun getTimeRange(timeRange: String): Pair<Long, Long> {
    val calendar = Calendar.getInstance()
    val endTime = calendar.timeInMillis

    calendar.apply {
      when (timeRange) {
        "today" -> {
          set(Calendar.HOUR_OF_DAY, 0)
          set(Calendar.MINUTE, 0)
          set(Calendar.SECOND, 0)
          set(Calendar.MILLISECOND, 0)
        }
        "week" -> add(Calendar.DAY_OF_YEAR, -7)
        "month" -> add(Calendar.MONTH, -1)
        "year" -> add(Calendar.YEAR, -1)
        else -> add(Calendar.DAY_OF_YEAR, -1) // Por defecto último día
      }
    }

    val startTime = calendar.timeInMillis
    return Pair(startTime, endTime)
  }

  private fun getUsageStatsList(timeRange: String): List<Map<String, Any>> {
    val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    val (startTime, endTime) = getTimeRange(timeRange)

    val usageStatsList = usageStatsManager.queryUsageStats(
      UsageStatsManager.INTERVAL_DAILY,
      startTime,
      endTime
    )

    val packageManager = context.packageManager
    val appUsageList = mutableListOf<Map<String, Any>>()

    usageStatsList
      ?.filter { it.totalTimeInForeground > 0 }
      ?.sortedByDescending { it.totalTimeInForeground }
      ?.forEach { usageStats ->
        try {
          val appInfo = packageManager.getApplicationInfo(usageStats.packageName, 0)
          val appName = packageManager.getApplicationLabel(appInfo).toString()

          appUsageList.add(
            mapOf(
              "packageName" to usageStats.packageName,
              "appName" to appName,
              "totalTimeInForeground" to usageStats.totalTimeInForeground,
              "firstTimeStamp" to usageStats.firstTimeStamp,
              "lastTimeStamp" to usageStats.lastTimeStamp,
              "lastTimeUsed" to usageStats.lastTimeUsed
            )
          )
        } catch (e: Exception) {
          // Ignorar apps que no se pueden resolver
        }
      }

    return appUsageList
  }

  private fun getSpecificAppUsage(packageName: String, timeRange: String): Map<String, Any>? {
    val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    val (startTime, endTime) = getTimeRange(timeRange)

    val usageStatsList = usageStatsManager.queryUsageStats(
      UsageStatsManager.INTERVAL_DAILY,
      startTime,
      endTime
    )

    val usageStats = usageStatsList?.find { it.packageName == packageName }

    return if (usageStats != null && usageStats.totalTimeInForeground > 0) {
      try {
        val packageManager = context.packageManager
        val appInfo = packageManager.getApplicationInfo(packageName, 0)
        val appName = packageManager.getApplicationLabel(appInfo).toString()

        mapOf(
          "packageName" to usageStats.packageName,
          "appName" to appName,
          "totalTimeInForeground" to usageStats.totalTimeInForeground,
          "firstTimeStamp" to usageStats.firstTimeStamp,
          "lastTimeStamp" to usageStats.lastTimeStamp,
          "lastTimeUsed" to usageStats.lastTimeUsed
        )
      } catch (e: Exception) {
        null
      }
    } else {
      null
    }
  }
}