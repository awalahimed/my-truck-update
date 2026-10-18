import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWebSocketContext } from './WebSocketContext';
import { useNetworkState } from './useNetworkState';

export interface TripLocationData {
  latitude: number;
  longitude: number;
  bearing?: number;
  speedKmh?: number;
  accuracy?: number;
  timestamp: string;
}

interface UseTripTrackingProps {
  orderId?: string | null;
  role: 'driver' | 'user';
  isTripActive?: boolean; // True when order status is 'on_the_way'
}

const OFFLINE_QUEUE_KEY_PREFIX = '@mytruck_offline_waypoints_';

export function useTripTracking({ orderId, role, isTripActive = false }: UseTripTrackingProps) {
  const { orpcClient, connected, liveTripLocation, orderUpdate } = useWebSocketContext();
  const { isConnected: isNetworkConnected } = useNetworkState();

  const [currentLocation, setCurrentLocation] = useState<TripLocationData | null>(null);
  const [driverLocation, setDriverLocation] = useState<TripLocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  const prevCoordRef = useRef<{ lat: number; lng: number } | null>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const orderIdRef = useRef<string | null>(orderId || null);

  useEffect(() => {
    orderIdRef.current = orderId || null;
  }, [orderId]);

  // Calculate bearing angle between two coordinates (0° to 360°)
  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x =
      Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
      Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

    let brng = toDeg(Math.atan2(y, x));
    return (brng + 360) % 360;
  };

  // ==========================================
  // DRIVER MODE: High-Precision Live Location Publishing
  // ==========================================

  // Flush offline buffered waypoints to server
  const flushOfflineQueue = useCallback(async (activeOrderId: string) => {
    if (!orpcClient || !connected) return;

    try {
      const queueKey = `${OFFLINE_QUEUE_KEY_PREFIX}${activeOrderId}`;
      const savedQueue = await AsyncStorage.getItem(queueKey);
      if (!savedQueue) return;

      const waypoints: TripLocationData[] = JSON.parse(savedQueue);
      if (waypoints && waypoints.length > 0) {
        console.log(`📡 [useTripTracking] Flushing ${waypoints.length} offline waypoints for order ${activeOrderId}...`);
        await orpcClient.driver.syncBatchLocations({
          orderId: activeOrderId,
          waypoints,
        });
        await AsyncStorage.removeItem(queueKey);
        setOfflineQueueCount(0);
        console.log('✅ [useTripTracking] Offline waypoints synced successfully');
      }
    } catch (err) {
      console.warn('[useTripTracking] Failed to flush offline waypoints:', err);
    }
  }, [orpcClient, connected]);

  // Start Driver GPS Location Publisher
  const startDriverTracking = useCallback(async (activeOrderId: string) => {
    try {
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== 'granted') {
        console.warn('[useTripTracking] Location permission not granted');
        return;
      }

      // Check background permission
      try {
        await Location.requestBackgroundPermissionsAsync();
      } catch (e) {
        // Continue with high accuracy foreground tracking if background is not available
      }

      // Clear any existing subscription
      if (locationSubRef.current) {
        locationSubRef.current.remove();
        locationSubRef.current = null;
      }

      console.log(`🚀 [useTripTracking] Starting live tracking for order ${activeOrderId}...`);
      setIsTracking(true);

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 8000, // Every 8 seconds
          distanceInterval: 15, // Or vehicle moves 15 meters
        },
        async (loc) => {
          const lat = loc.coords.latitude;
          const lng = loc.coords.longitude;
          const speedKmh = loc.coords.speed && loc.coords.speed > 0 ? loc.coords.speed * 3.6 : 0;

          // Calculate heading/bearing
          let bearing = loc.coords.heading && loc.coords.heading >= 0 ? loc.coords.heading : 0;
          if (bearing === 0 && prevCoordRef.current) {
            bearing = calculateBearing(
              prevCoordRef.current.lat,
              prevCoordRef.current.lng,
              lat,
              lng
            );
          }
          prevCoordRef.current = { lat, lng };

          const payload: TripLocationData = {
            latitude: lat,
            longitude: lng,
            bearing: Math.round(bearing),
            speedKmh: Math.round(speedKmh * 10) / 10,
            accuracy: loc.coords.accuracy ? Math.round(loc.coords.accuracy) : undefined,
            timestamp: new Date(loc.timestamp).toISOString(),
          };

          setCurrentLocation(payload);

          // If online and connected, transmit directly via WebSocket RPC
          if (connected && orpcClient && isNetworkConnected) {
            try {
              await orpcClient.driver.updateLocation({
                orderId: activeOrderId,
                ...payload,
              });
            } catch (err) {
              console.warn('[useTripTracking] Send location failed, buffering locally:', err);
              await bufferOfflineLocation(activeOrderId, payload);
            }
          } else {
            // Buffer in local storage for later batch sync
            await bufferOfflineLocation(activeOrderId, payload);
          }
        }
      );

      locationSubRef.current = sub;
    } catch (error) {
      console.error('[useTripTracking] Failed to start location watch:', error);
      setIsTracking(false);
    }
  }, [connected, orpcClient, isNetworkConnected]);

  const bufferOfflineLocation = async (activeOrderId: string, payload: TripLocationData) => {
    try {
      const queueKey = `${OFFLINE_QUEUE_KEY_PREFIX}${activeOrderId}`;
      const existingStr = await AsyncStorage.getItem(queueKey);
      const queue: TripLocationData[] = existingStr ? JSON.parse(existingStr) : [];
      queue.push(payload);
      // Keep maximum 300 points to prevent storage bloat
      if (queue.length > 300) queue.shift();
      await AsyncStorage.setItem(queueKey, JSON.stringify(queue));
      setOfflineQueueCount(queue.length);
    } catch (e) {
      console.warn('[useTripTracking] Buffer error:', e);
    }
  };

  const stopDriverTracking = useCallback(() => {
    if (locationSubRef.current) {
      locationSubRef.current.remove();
      locationSubRef.current = null;
    }
    setIsTracking(false);
    prevCoordRef.current = null;
    console.log('🛑 [useTripTracking] Stopped location tracking');
  }, []);

  // Driver: Auto start/stop tracking based on active delivery trip status
  useEffect(() => {
    if (role !== 'driver') return;

    if (orderId && isTripActive) {
      startDriverTracking(orderId);
    } else {
      stopDriverTracking();
    }

    return () => {
      stopDriverTracking();
    };
  }, [role, orderId, isTripActive, startDriverTracking, stopDriverTracking]);

  // Driver: Attempt to flush offline queue whenever connection restores
  useEffect(() => {
    if (role === 'driver' && connected && orderId && isNetworkConnected) {
      flushOfflineQueue(orderId);
    }
  }, [role, connected, orderId, isNetworkConnected, flushOfflineQueue]);

  // ==========================================
  // SHIPPER (USER) MODE: Live Location Subscription
  // ==========================================
  useEffect(() => {
    if (role !== 'user' || !orderId || !orpcClient || !connected) return;

    let isSubscribed = true;

    const subscribe = async () => {
      try {
        console.log(`📡 [useTripTracking] Subscribing to live updates for order ${orderId}...`);
        const res = await orpcClient.customer.subscribeToOrderUpdates({ orderId });
        if (isSubscribed && res?.latestLocation) {
          setDriverLocation({
            latitude: res.latestLocation.latitude,
            longitude: res.latestLocation.longitude,
            bearing: res.latestLocation.bearing,
            speedKmh: res.latestLocation.speedKmh,
            accuracy: res.latestLocation.accuracy,
            timestamp: res.latestLocation.timestamp,
          });
        }
      } catch (err) {
        console.warn('[useTripTracking] Subscription failed:', err);
      }
    };

    subscribe();

    return () => {
      isSubscribed = false;
      if (orpcClient) {
        orpcClient.customer.unsubscribeFromOrderUpdates({ orderId }).catch(() => {});
      }
    };
  }, [role, orderId, orpcClient, connected]);

  // Shipper: Update live driver location when broadcast arrives
  useEffect(() => {
    if (role !== 'user' || !orderId) return;

    // Check high-precision live trip location broadcast
    if (liveTripLocation && liveTripLocation.orderId === orderId) {
      setDriverLocation({
        latitude: parseFloat(liveTripLocation.latitude),
        longitude: parseFloat(liveTripLocation.longitude),
        bearing: liveTripLocation.bearing ? parseFloat(liveTripLocation.bearing) : undefined,
        speedKmh: liveTripLocation.speedKmh ? parseFloat(liveTripLocation.speedKmh) : undefined,
        accuracy: liveTripLocation.accuracy ? parseFloat(liveTripLocation.accuracy) : undefined,
        timestamp: liveTripLocation.timestamp || new Date().toISOString(),
      });
    }

    // Check legacy orderUpdate driverLocation fallback
    if (orderUpdate && orderUpdate.orderId === orderId && orderUpdate.driverLocation) {
      setDriverLocation({
        latitude: parseFloat(orderUpdate.driverLocation.latitude),
        longitude: parseFloat(orderUpdate.driverLocation.longitude),
        bearing: (orderUpdate.driverLocation as any).bearing,
        speedKmh: (orderUpdate.driverLocation as any).speed,
        timestamp: new Date().toISOString(),
      });
    }
  }, [role, orderId, liveTripLocation, orderUpdate]);

  return {
    isTracking,
    currentLocation, // Driver's own published location
    driverLocation,  // Shipper's received driver location
    offlineQueueCount,
    startDriverTracking,
    stopDriverTracking,
    flushOfflineQueue,
  };
}
