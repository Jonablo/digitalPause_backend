import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ExpoAppusage from '../modules/expo-appusage';

interface AppUsageItem {
  packageName: string;
  appName: string;
  totalTimeInForeground: number;
  firstTimeStamp: number;
  lastTimeStamp: number;
  lastTimeUsed: number;
}

type TimeRange = 'TODAY' | 'WEEK' | 'MONTH';

export default function UsageStatsScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appUsageStats, setAppUsageStats] = useState<AppUsageItem[]>([]);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('TODAY');

  const loadUsageStats = useCallback(async () => {
    if (!hasPermission) return;
    
    setLoading(true);
    try {
      const stats = await ExpoAppusage.getAppUsageStats(selectedRange);
      setAppUsageStats(stats || []);
    } catch (error) {
      console.error('Error loading usage stats:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('Error', `No se pudieron cargar las estadísticas: ${errorMessage}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedRange, hasPermission]);

  const checkPermission = useCallback(async () => {
    try {
      const permission = await ExpoAppusage.hasUsagePermission();
      setHasPermission(permission);
      setLoading(false);
      if (permission) {
        await loadUsageStats();
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      setLoading(false);
    }
  }, [loadUsageStats]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const requestPermission = async () => {
    try {
      await ExpoAppusage.requestUsagePermission();
      setTimeout(() => {
        checkPermission();
      }, 1000);
    } catch (error) {
      console.error('Error requesting permission:', error);
      Alert.alert('Error', 'No se pudo abrir la configuración de permisos');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUsageStats();
  };

  const handleRangeChange = (range: TimeRange) => {
    setSelectedRange(range);
  };

  useEffect(() => {
    if (hasPermission) {
      loadUsageStats();
    }
  }, [selectedRange, hasPermission, loadUsageStats]);

  const renderAppItem = ({ item, index }: { item: AppUsageItem; index: number }) => (
    <View style={styles.appItem}>
      <View style={styles.rank}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>
      <View style={styles.appInfo}>
        <Text style={styles.appName} numberOfLines={1}>{item.appName}</Text>
        <Text style={styles.packageName} numberOfLines={1}>{item.packageName}</Text>
      </View>
      <View style={styles.timeContainer}>
        <Text style={styles.usageTime}>
          {ExpoAppusage.formatTime(item.totalTimeInForeground)}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Verificando permisos...</Text>
        </View>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.emoji}>📊</Text>
          <Text style={styles.title}>App Usage Tracker</Text>
          <Text style={styles.description}>
            Para ver tus estadísticas de uso, necesitamos acceso a los datos de uso de aplicaciones.
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Otorgar Permiso</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>
            Se abrirá la configuración del sistema. Busca esta app y activa el permiso `Acceso de uso`.
          </Text>
        </View>
      </View>
    );
  }

  const totalTime = appUsageStats.reduce((acc, app) => acc + app.totalTimeInForeground, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Uso de Apps</Text>
        <View style={styles.rangeSelector}>
          {(['TODAY', 'WEEK', 'MONTH'] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.rangeButton,
                selectedRange === range && styles.rangeButtonActive,
              ]}
              onPress={() => handleRangeChange(range)}
            >
              <Text
                style={[
                  styles.rangeButtonText,
                  selectedRange === range && styles.rangeButtonTextActive,
                ]}
              >
                {range === 'TODAY' ? 'Hoy' : range === 'WEEK' ? 'Semana' : 'Mes'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Apps usadas</Text>
          <Text style={styles.summaryValue}>{appUsageStats.length}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Tiempo total</Text>
          <Text style={styles.summaryValue}>
            {ExpoAppusage.formatTime(totalTime)}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={appUsageStats}
          renderItem={renderAppItem}
          keyExtractor={(item, index) => `${item.packageName}-${index}`}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📱</Text>
              <Text style={styles.emptyText}>No hay datos disponibles</Text>
              <Text style={styles.emptyHint}>
                Usa algunas apps y vuelve a cargar
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#8E8E93',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 2,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  rangeButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rangeButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  rangeButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    flexDirection: 'row',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  appItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  rank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8E8E93',
  },
  appInfo: {
    flex: 1,
    marginRight: 12,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  packageName: {
    fontSize: 12,
    color: '#8E8E93',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  usageTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#C7C7CC',
  },
});