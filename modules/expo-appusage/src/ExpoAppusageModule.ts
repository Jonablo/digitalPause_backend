import { requireNativeModule } from 'expo-modules-core';

// Definir el tipo del módulo nativo
interface ExpoAppusageModuleType {
  hasUsagePermission(): Promise<boolean>;
  requestUsagePermission(): Promise<void>;
  getAppUsageStats(timeRange: string): Promise<any[]>;
  getAppUsage(packageName: string, timeRange: string): Promise<any | null>;
}

// Importar el módulo nativo
const ExpoAppusageModule: ExpoAppusageModuleType = requireNativeModule('ExpoAppusage');

export default ExpoAppusageModule;