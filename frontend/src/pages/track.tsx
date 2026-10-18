import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { orpc } from "@/lib/oprc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Navigation, Truck, Phone } from "lucide-react";
import { Map, MapMarker, MarkerContent, MapControls } from "@/components/ui/map";

export default function TrackOrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;
      try {
        const res = await orpc.order.publicTrackOrder({ orderId });
        setOrder(res.order);
      } catch (err: any) {
        setError(err.message || "Failed to load order. Please ensure the link is correct.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchOrder, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading && !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading tracking details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-red-200">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format Status for UI
  const formatStatus = (s: string) => s.replace(/_/g, ' ').toUpperCase();

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'completed':
      case 'delivered': return 'bg-green-500';
      case 'on_the_way': return 'bg-blue-500';
      case 'approved': return 'bg-yellow-500';
      case 'agent_selected': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left panel: Order Info */}
      <div className="w-full md:w-1/3 p-4 md:p-8 flex flex-col gap-6 bg-white shadow-xl z-10 md:overflow-y-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Track Your Load</h1>
          <p className="text-muted-foreground mt-1 font-mono text-xs text-gray-500">ID: {order.id}</p>
        </div>

        <Card className="border-0 shadow-none bg-blue-50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="font-semibold text-blue-900">Current Status</div>
            <Badge className={`${getStatusColor(order.status)} text-white px-3 py-1 font-bold`}>
              {formatStatus(order.status)}
            </Badge>
          </CardContent>
        </Card>

        {order.driverName && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" /> Driver Assigned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{order.driverName}</span>
                </div>
                {order.driverPhone && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Phone</span>
                    <a href={`tel:${order.driverPhone}`} className="font-bold text-blue-600 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {order.driverPhone}
                    </a>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle Plate</span>
                  <span className="font-medium bg-gray-200 px-2 rounded font-mono">{order.vehiclePlate || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="relative pl-6 border-l-2 border-gray-200 space-y-8 ml-2 mt-4">
          <div className="relative">
            <div className="absolute -left-[31px] bg-white p-1 rounded-full border-2 border-gray-300">
              <MapPin className="w-4 h-4 text-gray-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Pickup Location</h3>
            <p className="text-sm text-gray-600 mt-1">{order.pickupAddress}</p>
          </div>
          
          <div className="relative">
            <div className="absolute -left-[31px] bg-white p-1 rounded-full border-2 border-primary">
              <Navigation className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Delivery Location</h3>
            <p className="text-sm text-gray-600 mt-1">{order.deliveryAddress}</p>
          </div>
        </div>
      </div>

      {/* Right panel: Map */}
      <div className="w-full md:w-2/3 h-[50vh] md:h-screen sticky top-0 bg-gray-200">
        <Map
          center={[parseFloat(order.pickupLatitude || '9.145'), parseFloat(order.pickupLongitude || '38.799')]}
          zoom={12}
          className="w-full h-full"
        >
          <MapControls />
          {order.pickupLatitude && order.pickupLongitude && (
            <MapMarker
              latitude={parseFloat(order.pickupLatitude)}
              longitude={parseFloat(order.pickupLongitude)}
              color="gray"
            >
              <MarkerContent>
                <div className="text-xs font-bold whitespace-nowrap">Pickup</div>
              </MarkerContent>
            </MapMarker>
          )}
          
          {order.deliveryLatitude && order.deliveryLongitude && (
            <MapMarker
              latitude={parseFloat(order.deliveryLatitude)}
              longitude={parseFloat(order.deliveryLongitude)}
              color="blue"
            >
              <MarkerContent>
                <div className="text-xs font-bold whitespace-nowrap">Delivery</div>
              </MarkerContent>
            </MapMarker>
          )}
        </Map>
      </div>
    </div>
  );
}
