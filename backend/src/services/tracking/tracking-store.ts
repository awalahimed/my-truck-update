import { db } from '../../database/db.js';
import { tripWaypoints } from '../../database/schema/order-tracking-schema.js';
import { getUserWebSocket, notifyCustomerOrderUpdate } from '../../utils/websocket-broadcast.js';
import { randomUUID } from 'crypto';

export interface LiveTruckLocation {
  orderId: string;
  driverId: string;
  latitude: number;
  longitude: number;
  bearing?: number; // 0-360 degrees
  speedKmh?: number;
  accuracy?: number;
  timestamp: string; // ISO string
}

export interface WaypointInput {
  latitude: number;
  longitude: number;
  bearing?: number;
  speedKmh?: number;
  accuracy?: number;
  timestamp: string;
}

export interface ITripTrackingStore {
  setLatestLocation(location: LiveTruckLocation): Promise<void>;
  getLatestLocation(orderId: string): Promise<LiveTruckLocation | null>;
  subscribeToTrip(orderId: string, userId: string): void;
  unsubscribeFromTrip(orderId: string, userId: string): void;
  broadcastLocation(orderId: string, location: LiveTruckLocation): void;
  recordBatchWaypoints(orderId: string, driverId: string, waypoints: WaypointInput[]): Promise<void>;
}

/**
 * High-performance In-Memory tracking store for single-instance Dokploy deployments.
 * Stores latest coordinates in memory for sub-millisecond retrieval and broadcasts
 * live updates to active WebSocket connections with throttled DB waypoint persistence.
 */
class InMemoryTripTrackingStore implements ITripTrackingStore {
  // Ephemeral cache of current truck locations: orderId -> LiveTruckLocation
  private latestLocations = new Map<string, LiveTruckLocation>();

  // Subscriptions: orderId -> Set of subscriber userIds (shippers, consignees, admins)
  private tripSubscriptions = new Map<string, Set<string>>();

  // Last time a waypoint was persisted to MySQL: orderId -> timestamp (ms)
  private lastPersistTime = new Map<string, number>();

  // Throttle interval for MySQL waypoint writes (90 seconds to prevent DB connection exhaustion)
  private readonly DB_PERSIST_INTERVAL_MS = 90 * 1000;

  async setLatestLocation(location: LiveTruckLocation): Promise<void> {
    const { orderId, driverId, latitude, longitude, bearing, speedKmh, accuracy, timestamp } = location;

    // 1. Update in-memory ephemeral cache (sub-millisecond)
    this.latestLocations.set(orderId, location);

    // 2. Broadcast immediately to all active listeners (shippers/admins)
    this.broadcastLocation(orderId, location);

    // 3. Throttled MySQL persistence: Save historical trail without flooding the database
    const now = Date.now();
    const lastSaved = this.lastPersistTime.get(orderId) || 0;

    if (now - lastSaved >= this.DB_PERSIST_INTERVAL_MS) {
      this.lastPersistTime.set(orderId, now);
      
      // Async non-blocking DB insert
      db.insert(tripWaypoints)
        .values({
          id: randomUUID(),
          orderId,
          driverId,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          bearing: bearing !== undefined ? bearing.toString() : null,
          speedKmh: speedKmh !== undefined ? speedKmh.toString() : null,
          accuracy: accuracy !== undefined ? accuracy.toString() : null,
          isMilestone: false,
          recordedAt: new Date(timestamp || now),
        })
        .catch((err) => {
          console.error(`[TrackingStore] Failed to persist waypoint for order ${orderId}:`, err);
        });
    }
  }

  async getLatestLocation(orderId: string): Promise<LiveTruckLocation | null> {
    return this.latestLocations.get(orderId) || null;
  }

  subscribeToTrip(orderId: string, userId: string): void {
    if (!this.tripSubscriptions.has(orderId)) {
      this.tripSubscriptions.set(orderId, new Set());
    }
    this.tripSubscriptions.get(orderId)!.add(userId);
  }

  unsubscribeFromTrip(orderId: string, userId: string): void {
    const subscribers = this.tripSubscriptions.get(orderId);
    if (subscribers) {
      subscribers.delete(userId);
      if (subscribers.size === 0) {
        this.tripSubscriptions.delete(orderId);
      }
    }
  }

  broadcastLocation(orderId: string, location: LiveTruckLocation): void {
    const subscribers = this.tripSubscriptions.get(orderId);
    if (!subscribers || subscribers.size === 0) return;

    const trackingPayload = {
      type: 'trip:location:broadcast',
      data: {
        orderId: location.orderId,
        driverId: location.driverId,
        latitude: location.latitude,
        longitude: location.longitude,
        bearing: location.bearing ?? 0,
        speedKmh: location.speedKmh ?? 0,
        accuracy: location.accuracy ?? 0,
        timestamp: location.timestamp,
      },
    };

    // Also support backward-compatible order_update payload for existing tracking cards
    const legacyPayload = {
      type: 'order_update',
      orderId: location.orderId,
      status: 'on_the_way',
      driverLocation: {
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        bearing: location.bearing ?? 0,
        speed: location.speedKmh ?? 0,
      },
    };

    subscribers.forEach((userId) => {
      const ws = getUserWebSocket(userId);
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify(trackingPayload));
        ws.send(JSON.stringify(legacyPayload));
      }
    });
  }

  async recordBatchWaypoints(orderId: string, driverId: string, waypoints: WaypointInput[]): Promise<void> {
    if (!waypoints || waypoints.length === 0) return;

    // If offline points arrived, update latest location to the most recent one
    const latest = waypoints[waypoints.length - 1];
    if (latest) {
      await this.setLatestLocation({
        orderId,
        driverId,
        latitude: latest.latitude,
        longitude: latest.longitude,
        bearing: latest.bearing,
        speedKmh: latest.speedKmh,
        accuracy: latest.accuracy,
        timestamp: latest.timestamp,
      });
    }

    // Insert batch points to DB
    const insertValues = waypoints.map((wp) => ({
      id: randomUUID(),
      orderId,
      driverId,
      latitude: wp.latitude.toString(),
      longitude: wp.longitude.toString(),
      bearing: wp.bearing !== undefined ? wp.bearing.toString() : null,
      speedKmh: wp.speedKmh !== undefined ? wp.speedKmh.toString() : null,
      accuracy: wp.accuracy !== undefined ? wp.accuracy.toString() : null,
      isMilestone: false,
      recordedAt: new Date(wp.timestamp),
    }));

    // In chunks of 50 to protect connection
    const chunkSize = 50;
    for (let i = 0; i < insertValues.length; i += chunkSize) {
      const chunk = insertValues.slice(i, i + chunkSize);
      await db.insert(tripWaypoints).values(chunk).catch((err) => {
        console.error(`[TrackingStore] Failed to insert batch waypoints:`, err);
      });
    }
  }
}

/**
 * Singleton factory providing the active tracking store.
 * 
 * Future Multi-Instance Horizontal Scaling:
 * When scaling Dokploy to run multiple backend replicas behind a load balancer,
 * create a `RedisTripTrackingStore` implementing `ITripTrackingStore` that uses
 * `ioredis` Pub/Sub and `SET/GET` commands, then return it here based on
 * `process.env.TRACKING_STORE === 'redis'`. The rest of the application will
 * continue to function seamlessly without any changes!
 */
let trackingStoreInstance: ITripTrackingStore | null = null;

export const getTrackingStore = (): ITripTrackingStore => {
  if (!trackingStoreInstance) {
    trackingStoreInstance = new InMemoryTripTrackingStore();
  }
  return trackingStoreInstance;
};
