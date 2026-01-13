import ExpoAppusageModule from './src/ExpoAppusageModule';

export interface AppUsageStats {
  packageName: string;
  appName: string;
  totalTimeInForeground: number; // en milisegundos
  firstTimeStamp: number;
  lastTimeStamp: number;
  lastTimeUsed: number;
}

export type TimeRangeKey = 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR';

export const TIME_RANGE = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
} as const;

/**
 * Verifica si la app tiene permiso para acceder a las estadísticas de uso
 */
export async function hasUsagePermission(): Promise<boolean> {
  return await ExpoAppusageModule.hasUsagePermission();
}

/**
 * Abre la configuración del sistema para que el usuario otorgue el permiso
 */
export async function requestUsagePermission(): Promise<void> {
  return await ExpoAppusageModule.requestUsagePermission();
}

/**
 * Obtiene las estadísticas de uso de todas las apps
 * @param timeRange - Rango de tiempo: 'TODAY', 'WEEK', 'MONTH', 'YEAR'
 */
export async function getAppUsageStats(
  timeRange: TimeRangeKey = 'TODAY'
): Promise<AppUsageStats[]> {
  return await ExpoAppusageModule.getAppUsageStats(TIME_RANGE[timeRange]);
}

/**
 * Obtiene las estadísticas de uso de una app específica
 * @param packageName - Nombre del paquete de la app (ej: 'com.android.chrome')
 * @param timeRange - Rango de tiempo: 'TODAY', 'WEEK', 'MONTH', 'YEAR'
 */
export async function getAppUsage(
  packageName: string,
  timeRange: TimeRangeKey = 'TODAY'
): Promise<AppUsageStats | null> {
  return await ExpoAppusageModule.getAppUsage(packageName, TIME_RANGE[timeRange]);
}

/**
 * Convierte milisegundos a formato legible
 */
export function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}