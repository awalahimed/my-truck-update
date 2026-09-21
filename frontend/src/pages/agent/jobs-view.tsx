"use client";

import { useEffect, useState } from "react";
import { orpc } from "@/lib/oprc";
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Navigation, Check, X, Package } from 'lucide-react';
import { Map, MapMarker, MarkerContent, MapControls, MapRoute, type MapViewport } from '@/components/ui/map';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const mapStyles = {
  default: undefined,
  openstreetmap: "https://tiles.openfreemap.org/styles/bright",
  openstreetmap3d: "https://tiles.openfreemap.org/styles/liberty",
};

// Calculate distance between two coordinates in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function JobsView() {

  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState<any[]>([]);
  const [cancelled, setCancelled] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [tab, setTab] = useState<'pending'|'map'>('pending');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [agentLocation, setAgentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isWithinPickupRadius, setIsWithinPickupRadius] = useState(false);
  const [rejectConfirmation, setRejectConfirmation] = useState<{ show: boolean; jobId: string | null }>({ show: false, jobId: null });

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        // Assigned (orders assigned to this agent)
        let assignedRes = { orders: [] } as any;
        try { assignedRes = await orpc.agent.getAssignedOrders(); } catch (e) { console.warn('getAssignedOrders unavailable', e); }

        const all = [...(assignedRes.orders || [])];

        // Classify orders by status
        const comp: any[] = [];
        const canc: any[] = [];
        const pend: any[] = [];

        all.forEach((o: any) => {
          const status = (o.status || '').toString();
          if (['completed', 'delivered'].includes(status)) comp.push(o);
          else if (['cancelled', 'rejected'].includes(status)) canc.push(o);
          else pend.push(o);
        });

        setCompleted(comp);
        setCancelled(canc);
        setPending(pend);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Geolocation tracking effect
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }

    // Get current position immediately
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setAgentLocation({ lat: latitude, lng: longitude });
        
        // Check if within 5m of pickup
        if (selectedJob) {
          const distance = calculateDistance(
            latitude,
            longitude,
            parseFloat(selectedJob.pickupLatitude),
            parseFloat(selectedJob.pickupLongitude)
          );
          setIsWithinPickupRadius(distance <= 5);
        }
      },
      (error) => console.warn('Geolocation error:', error)
    );

    // Watch position continuously
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setAgentLocation({ lat: latitude, lng: longitude });
        
        // Check if within 5m of pickup
        if (selectedJob) {
          const distance = calculateDistance(
            latitude,
            longitude,
            parseFloat(selectedJob.pickupLatitude),
            parseFloat(selectedJob.pickupLongitude)
          );
          setIsWithinPickupRadius(distance <= 5);
        }
      },
      (error) => console.warn('Geolocation watch error:', error),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [selectedJob]);

  const renderList = (items: any[]) => {
    if (!items.length) return (<div className="text-sm text-muted-foreground">No jobs</div>);
    return (
      <div className="space-y-3">
        {items.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{job.customerName || 'Customer'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-2">{job.id}</div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {job.customerPhone}</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {job.pickupAddress || '—'}</div>
                <div className="flex items-center gap-2"><Navigation className="w-4 h-4" /> {job.deliveryAddress || '—'}</div>
                {job.materials && job.materials.length > 0 && (
                  <div className="border-t pt-2 mt-2">
                    <p className="text-xs font-semibold flex items-center gap-1"><Package className="w-4 h-4" /> Materials:</p>
                    <ul className="text-xs text-muted-foreground ml-5 list-disc">
                      {job.materials.map((m: any, i: number) => (
                        <li key={i}>{m.name || m} {m.quantity ? `x${m.quantity}` : ''}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {tab === 'pending' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => {
                      setSelectedJob(job);
                      setTab('map');
                    }}>
                      <MapPin className="w-4 h-4 mr-1" /> View Map
                    </Button>
                    <Button 
                      size="sm" 
                      variant="default" 
                      disabled={!isWithinPickupRadius}
                      onClick={async () => {
                        try {
                          await orpc.order.agentApproveOrder({ orderId: job.id });
                          toast && toast.success && toast.success('Order approved');
                          window.location.reload();
                        } catch (e) {
                          console.error('Approve failed', e);
                          toast && toast.error && toast.error('Approve failed');
                        }
                      }}
                      title={isWithinPickupRadius ? 'Approve order' : 'Must be within 5m of pickup location'}
                    >
                      <Check className="w-4 h-4" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => {
                      setRejectConfirmation({ show: true, jobId: job.id });
                    }}>
                      <X className="w-4 h-4" /> Reject
                    </Button>
                  </>
                )}
                {tab !== 'pending' && (
                  <Button size="sm" variant="outline" onClick={() => {
                    setSelectedJob(job);
                    setTab('map');
                  }}>
                    <MapPin className="w-4 h-4 mr-1" /> View Map
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderMap = (job: any) => {
    const pickup = {
      lng: parseFloat(job.pickupLongitude),
      lat: parseFloat(job.pickupLatitude),
    };

    const currentLoc = agentLocation || {
      lng: 3.3792,
      lat: 6.5244, // Default Lagos coords
    };

    // Calculate distance from current location to pickup
    const distanceToPickup = agentLocation 
      ? calculateDistance(agentLocation.lat, agentLocation.lng, pickup.lat, pickup.lng)
      : null;

    const viewport: MapViewport = {
      center: [currentLoc.lng, currentLoc.lat],
      zoom: 14,
      bearing: 0,
      pitch: 0,
    };

    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">📍 Real-time Tracking: {job.customerName}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="font-medium text-blue-600">🚗 Your Location</p>
              <p className="text-xs text-muted-foreground">{agentLocation ? 'Live' : 'Loading...'}</p>
              <p className="text-xs">{currentLoc.lat.toFixed(4)}, {currentLoc.lng.toFixed(4)}</p>
            </div>
            <div>
              <p className="font-medium text-green-600">📍 Pickup</p>
              <p className="text-muted-foreground">{job.pickupAddress}</p>
              <p className="text-xs">{pickup.lat.toFixed(4)}, {pickup.lng.toFixed(4)}</p>
              {distanceToPickup !== null && (
                <p className={`text-xs font-semibold ${distanceToPickup <= 5 ? 'text-green-600' : 'text-orange-600'}`}>
                  {distanceToPickup.toFixed(1)}m away {distanceToPickup <= 5 ? '✓ Ready to approve' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="rounded-lg overflow-hidden border" style={{ height: '400px' }}>
          <Map
            viewport={viewport}
            styles={{
              light: mapStyles.openstreetmap,
              dark: mapStyles.openstreetmap3d,
            }}
          >
            {agentLocation && (
              <MapMarker longitude={currentLoc.lng} latitude={currentLoc.lat}>
                <MarkerContent>
                  <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold animate-pulse">
                    🚗 You
                  </div>
                </MarkerContent>
              </MapMarker>
            )}
            <MapMarker longitude={pickup.lng} latitude={pickup.lat}>
              <MarkerContent>
                <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  📍 Pickup
                </div>
              </MarkerContent>
            </MapMarker>
            {agentLocation && (
              <MapRoute 
                coordinates={[[currentLoc.lng, currentLoc.lat], [pickup.lng, pickup.lat]]}
                color={distanceToPickup && distanceToPickup <= 5 ? "#10b981" : "#f59e0b"}
                width={4}
              />
            )}
            <MapControls />
          </Map>
        </div>

        <Button onClick={() => setTab('pending')} variant="outline">← Back to Jobs</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Jobs</h2>
        <div className="flex gap-2 flex-wrap">
          <Button variant={tab === 'pending' ? 'default' : 'outline'} size="sm" onClick={() => setTab('pending')}>Pending ({pending.length})</Button>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading jobs...</div>
        ) : tab === 'map' && selectedJob ? renderMap(selectedJob) : renderList(pending)}
      </div>

      <AlertDialog open={rejectConfirmation.show} onOpenChange={(open) => {
        setRejectConfirmation({ show: open, jobId: open ? rejectConfirmation.jobId : null });
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this order? This action will send it back to pending status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!rejectConfirmation.jobId) return;
                try {
                  await orpc.order.agentRejectOrder({ orderId: rejectConfirmation.jobId });
                  toast && toast.success && toast.success('Order rejected and sent back to pending');
                  setRejectConfirmation({ show: false, jobId: null });
                  window.location.reload();
                } catch (e) {
                  console.error('Reject failed', e);
                  toast && toast.error && toast.error('Reject failed');
                  setRejectConfirmation({ show: false, jobId: null });
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reject Order
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
