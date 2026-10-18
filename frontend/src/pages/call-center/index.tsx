"use client";

import { useState, useEffect } from 'react';
import { Map, MapMarker, MarkerContent, MapControls, MapRoute, type MapViewport } from '@/components/ui/map';
import { Menu, Package, LogOut, Users, Map as MapIcon, Globe, Building, Phone, MapPin, Navigation, Clock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCallCenterWebSocket } from '@/hooks/call-center/use-call-center-ws';
import { AgentSelectionDialog } from '@/components/call-center/AgentSelectionDialog';
import { CallCenterOrderForm } from '@/components/call-center/CallCenterOrderForm';
import { StatsCards } from '@/components/call-center/StatsCards';
import { OrderCard } from '@/components/call-center/OrderCard';
import { DriversDrawer } from '@/components/call-center/DriversDrawer';
import { formatTimeAgo, formatNumber } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';

const defaultCenter: [number, number] = [40.489, 9.145];

const mapStyles = {
  default: undefined,
  openstreetmap: "https://tiles.openfreemap.org/styles/bright",
  openstreetmap3d: "https://tiles.openfreemap.org/styles/liberty",
};

type MapStyleKey = keyof typeof mapStyles;

// Gebeta API key for routing - from environment variable
const GEBETA_API_KEY = import.meta.env.VITE_GEBETA_MAPS_API_KEY || '';

type RouteData = {
  coordinates: [number, number][];
  distance: number;
  duration: number;
};

export default function CallCenterPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [driversDrawerOpen, setDriversDrawerOpen] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [driverFilter, setDriverFilter] = useState<'active' | 'pending' | 'rejected' | 'banned' | 'all'>('active');
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyleKey>('default');
  const [viewport, setViewport] = useState<MapViewport>({
    center: defaultCenter,
    zoom: 12,
    bearing: 0,
    pitch: 0,
  });
  const [routes, setRoutes] = useState<Record<string, RouteData>>({});
  
  // Agent selection state
  const [agentSelectionOpen, setAgentSelectionOpen] = useState(false);
  const [agentSelectionOrderId, setAgentSelectionOrderId] = useState<string | null>(null);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  // Tab state for call center orders
  const [orderTab, setOrderTab] = useState<'pending' | 'assigned' | 'agent_approved'>('pending');
  const [agentApprovedOrders, setAgentApprovedOrders] = useState<any[]>([]);
  const [approvedOrdersLoading, setApprovedOrdersLoading] = useState(false);

  const { pendingOrders, allOrders, loading, connected, approveOrder, approveOrderWithAgent, callCenterFinalApprove, rejectOrder, getNearbyAgents } = useCallCenterWebSocket();
  const assignedOrders = allOrders.filter(order => order.status === 'agent_selected');

  // Fetch routes for all orders when they load
  useEffect(() => {
    if (allOrders.length > 0) {
      console.log('📦 Fetching routes for', allOrders.length, 'orders');
      allOrders.forEach(order => {
        // Only fetch if not already cached
        if (!routes[order.id]) {
          fetchRoute(
            order.id,
            parseFloat(order.pickupLatitude),
            parseFloat(order.pickupLongitude),
            parseFloat(order.deliveryLatitude),
            parseFloat(order.deliveryLongitude)
          );
        }
      });
    }
  }, [allOrders.length]); // Re-fetch when orders count changes

  // Fetch agent-approved orders when tab changes
  useEffect(() => {
    if (orderTab === 'agent_approved') {
      fetchAgentApprovedOrders();
    }
  }, [orderTab]);

  // Prefetch agents on mount so Call Center Order Form has available agents immediately
  useEffect(() => {
    const prefetchAgents = async () => {
      try {
        const agents = await getNearbyAgents();
        if (agents && agents.length > 0) {
          setAvailableAgents(agents);
        }
      } catch (err) {
        console.warn('Failed to prefetch agents:', err);
      }
    };
    prefetchAgents();
  }, []);

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  const handleStyleChange = (style: MapStyleKey) => {
    setMapStyle(style);
    // Adjust pitch for 3D view
    if (style === 'openstreetmap3d') {
      setViewport(prev => ({ ...prev, pitch: 60 }));
    } else {
      setViewport(prev => ({ ...prev, pitch: 0 }));
    }
  };

  const selectedMapStyle = mapStyles[mapStyle];

  const fetchRoute = async (orderId: string, pickupLat: number, pickupLng: number, deliveryLat: number, deliveryLng: number) => {
    try {
      const origin = `{${pickupLat},${pickupLng}}`;
      const destination = `{${deliveryLat},${deliveryLng}}`;
      
      console.log('🚗 Fetching route for order:', orderId);
      console.log('📍 From:', origin, 'To:', destination);
      
      const response = await fetch(
        `https://mapapi.gebeta.app/api/route/direction/?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&apiKey=${GEBETA_API_KEY}`
      );
      
      if (!response.ok) {
        console.error('❌ Failed to fetch route:', response.status);
        return null;
      }
      
      const data = await response.json();
      console.log('✅ Route data received:', data);
      
      if (data.direction && Array.isArray(data.direction)) {
        // Convert from [lat, lng] to [lng, lat] for MapLibre
        const coordinates: [number, number][] = data.direction.map((point: number[]) => [point[1], point[0]]);
        
        console.log('📊 Route coordinates count:', coordinates.length);
        console.log('📏 Distance:', data.totalDistance, 'Duration:', data.timetaken);
        
        const routeData: RouteData = {
          coordinates,
          distance: data.totalDistance || 0,
          duration: data.timetaken || 0,
        };
        
        setRoutes(prev => {
          const updated = { ...prev, [orderId]: routeData };
          console.log('💾 Routes state updated:', Object.keys(updated));
          return updated;
        });
        return routeData;
      } else {
        console.warn('⚠️ No direction data in response');
      }
    } catch (error) {
      console.error('❌ Error fetching route:', error);
    }
    return null;
  };

  const fetchDrivers = async () => {
    setDriversLoading(true);
    try {
      const { orpc } = await import('@/lib/oprc');
      const result = await orpc.admin.driver.getAllDrivers();
      if (result.success) {
        setDrivers(result.drivers || []);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setDriversLoading(false);
    }
  };

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrder(orderId);
    const order = allOrders.find((o) => o.id === orderId);
    if (order) {
      // Center map on the order's pickup location
      setViewport(prev => ({
        ...prev,
        center: [parseFloat(order.pickupLongitude), parseFloat(order.pickupLatitude)],
        zoom: 14,
      }));
      
      // Fetch route if not already cached
      if (!routes[orderId]) {
        fetchRoute(
          orderId,
          parseFloat(order.pickupLatitude),
          parseFloat(order.pickupLongitude),
          parseFloat(order.deliveryLatitude),
          parseFloat(order.deliveryLongitude)
        );
      }
    }
  };

  const handleApprove = async (orderId: string) => {
    console.log('[CallCenter] Approve clicked for order:', orderId)
    // Open agent selection dialog instead of directly approving
    setAgentSelectionOrderId(orderId);
    setSelectedAgentId(null);
    setAgentsLoading(true);
    setAgentSelectionOpen(true);
    
    // Fetch nearby agents
    console.log('[CallCenter] Fetching nearby agents...')
    const agents = await getNearbyAgents(orderId);
    console.log('[CallCenter] Got agents:', agents.length)
    setAvailableAgents(agents);
    setAgentsLoading(false);
  };

  const handleAgentSelected = (agentId: string) => {
    setSelectedAgentId(agentId);
  };

  const handleAgentConfirm = async () => {
    if (!agentSelectionOrderId || !selectedAgentId) {
      console.warn('[CallCenter] Missing orderId or agentId')
      return;
    }
    
    console.log('[CallCenter] Confirming agent assignment:', { agentSelectionOrderId, selectedAgentId })
    const success = await approveOrderWithAgent(agentSelectionOrderId, selectedAgentId);
    console.log('[CallCenter] Agent confirmation result:', success)
    if (success) {
      setAgentSelectionOpen(false);
      setSelectedOrder(null);
      setAgentSelectionOrderId(null);
      setSelectedAgentId(null);
    }
  };
  const fetchAgentApprovedOrders = async () => {
    try {
      setApprovedOrdersLoading(true);
      const { orpc } = await import('@/lib/oprc');
      const result = await (orpc.agent as any).getApprovedByAgentOrders();
      setAgentApprovedOrders(result.orders || []);
    } catch (error) {
      console.error('Error fetching agent-approved orders:', error);
    } finally {
      setApprovedOrdersLoading(false);
    }
  };

  const handleFinalApprove = async (orderId: string) => {
    console.log('[CallCenter] Final approve for order:', orderId);
    const success = await callCenterFinalApprove(orderId);
    if (success) {
      setSelectedOrder(null);
      await fetchAgentApprovedOrders();
    }
  };

  const handleRejectClick = (orderId: string) => {
    setRejectingOrderId(orderId);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectingOrderId) return;
    
    const success = await rejectOrder(rejectingOrderId, rejectReason || 'No reason provided');
    if (success) {
      setRejectDialogOpen(false);
      setRejectReason('');
      setRejectingOrderId(null);
      setSelectedOrder(null);
    }
  };

  const filteredOrders = pendingOrders
    .filter(
      (order) =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerPhone.includes(searchQuery)
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'has_offers':
        return 'bg-purple-100 text-purple-800';
      case 'assigned':
        return 'bg-indigo-100 text-indigo-800';
      case 'on_the_way':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="h-screen w-full relative">
      {/* Full Screen Map */}
      <div className="absolute inset-0">
        <Map 
          viewport={viewport} 
          onViewportChange={setViewport}
          className="w-full h-full"
          styles={selectedMapStyle ? { light: selectedMapStyle, dark: selectedMapStyle } : undefined}
        >
          {/* Render markers for all orders */}
          {allOrders.map((order) => {
            const isPending = order.status === 'pending_approval';
            const isSelected = selectedOrder === order.id;
            
            return (
              <div key={order.id}>
                {/* Pickup Marker - Yellow for pending, Green for approved */}
                <MapMarker
                  longitude={parseFloat(order.pickupLongitude)}
                  latitude={parseFloat(order.pickupLatitude)}
                  onClick={() => handleOrderSelect(order.id)}
                >
                  <MarkerContent>
                    <div className={`relative h-6 w-6 rounded-full border-2 shadow-lg cursor-pointer hover:scale-110 transition-transform ${
                      isSelected 
                        ? 'border-blue-500 ring-2 ring-blue-400 ring-offset-2' 
                        : 'border-white'
                    } ${
                      isPending ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                  </MarkerContent>
                </MapMarker>

                {/* Delivery Marker - Orange for pending, Red for approved */}
                <MapMarker
                  longitude={parseFloat(order.deliveryLongitude)}
                  latitude={parseFloat(order.deliveryLatitude)}
                  onClick={() => handleOrderSelect(order.id)}
                >
                  <MarkerContent>
                    <div className={`relative h-6 w-6 rounded-full border-2 shadow-lg cursor-pointer hover:scale-110 transition-transform ${
                      isSelected 
                        ? 'border-blue-500 ring-2 ring-blue-400 ring-offset-2' 
                        : 'border-white'
                    } ${
                      isPending ? 'bg-orange-500' : 'bg-red-500'
                    }`} />
                  </MarkerContent>
                </MapMarker>

                {/* Route line between pickup and delivery - Show for all orders */}
                {routes[order.id] && (
                  <>
                    {console.log('🗺️ Rendering route for order:', order.id, 'Status:', order.status, 'Coordinates:', routes[order.id].coordinates.length)}
                    <MapRoute
                      id={`route-${order.id}`}
                      coordinates={routes[order.id].coordinates}
                      color={isSelected ? '#3b82f6' : (isPending ? '#f59e0b' : '#10b981')}
                      width={isSelected ? 5 : 3}
                      opacity={isSelected ? 0.9 : 0.6}
                    />
                  </>
                )}
              </div>
            );
          })}

          {/* Map Controls */}
          <MapControls position="bottom-right" showZoom showCompass showLocate />
        </Map>
      </div>

      {/* Viewport Info Display - Top Center - Hidden on mobile */}
      <div className="hidden md:flex absolute top-2 left-1/2 -translate-x-1/2 z-10 flex-wrap gap-x-3 gap-y-1 text-xs font-mono bg-background/80 backdrop-blur px-3 py-1.5 rounded-lg border shadow-lg">
        <span>
          <span className="text-muted-foreground">lng:</span>{" "}
          {viewport.center[0].toFixed(3)}
        </span>
        <span>
          <span className="text-muted-foreground">lat:</span>{" "}
          {viewport.center[1].toFixed(3)}
        </span>
        <span>
          <span className="text-muted-foreground">zoom:</span>{" "}
          {viewport.zoom.toFixed(1)}
        </span>
        <span>
          <span className="text-muted-foreground">bearing:</span>{" "}
          {viewport.bearing.toFixed(1)}°
        </span>
        <span>
          <span className="text-muted-foreground">pitch:</span>{" "}
          {viewport.pitch.toFixed(1)}°
        </span>
      </div>

      <StatsCards
        pendingCount={pendingOrders.length}
        totalCount={allOrders.length}
        connected={connected}
        formatNumber={formatNumber}
      />

      {/* Route Info Display - Bottom Left (above menu button) */}
      {selectedOrder && routes[selectedOrder] && (
        <div className="absolute bottom-20 left-4 z-10 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg px-3 py-2">
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Distance:</span>
              <span className="font-semibold">{(routes[selectedOrder].distance / 1000).toFixed(2)} km</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-semibold">{Math.round(routes[selectedOrder].duration / 60)} min</span>
            </div>
          </div>
        </div>
      )}

      {/* Map Style Controls and Actions - Top Right */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10 flex flex-col gap-1.5 md:gap-2">
        {/* Map Style Buttons Group */}
        <div className="flex flex-col rounded-lg border border-border bg-background shadow-lg overflow-hidden">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleStyleChange('default')}
            className={`h-8 w-8 md:h-10 md:w-10 rounded-none border-b transition-all ${
              mapStyle === 'default' 
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white' 
                : 'hover:bg-accent'
            }`}
            title="Default (Carto)"
          >
            <MapIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleStyleChange('openstreetmap')}
            className={`h-8 w-8 md:h-10 md:w-10 rounded-none border-b transition-all ${
              mapStyle === 'openstreetmap' 
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white' 
                : 'hover:bg-accent'
            }`}
            title="OpenStreetMap"
          >
            <Globe className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleStyleChange('openstreetmap3d')}
            className={`h-8 w-8 md:h-10 md:w-10 rounded-none transition-all ${
              mapStyle === 'openstreetmap3d' 
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white' 
                : 'hover:bg-accent'
            }`}
            title="OpenStreetMap 3D"
          >
            <Building className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </Button>
        </div>
        
        {/* Create Manual Order Button */}
        <Button
          variant="default"
          onClick={async () => {
            setCreateOrderOpen(true);
            try {
              const { orpc } = await import('@/lib/oprc');
              const result = await orpc.admin.agents.list();
              setAvailableAgents(result.agents || []);
            } catch (err) {
              console.error(err);
            }
          }}
          className="h-8 md:h-10 px-4 rounded-lg shadow-lg hidden md:flex items-center gap-2"
          title="Create Order"
        >
          <Package className="w-4 h-4" />
          <span>Create Order</span>
        </Button>
        
        {/* Mobile Create Button */}
        <Button
          size="icon"
          variant="default"
          onClick={async () => {
            setCreateOrderOpen(true);
            try {
              const { orpc } = await import('@/lib/oprc');
              const result = await orpc.admin.agents.list();
              setAvailableAgents(result.agents || []);
            } catch (err) {
              console.error(err);
            }
          }}
          className="h-8 w-8 md:hidden rounded-lg shadow-lg"
          title="Create Order"
        >
          <Package className="w-3.5 h-3.5" />
        </Button>

        {/* Drivers Button */}
        <Button
          size="icon"
          variant="outline"
          onClick={() => {
            setDriversDrawerOpen(true);
            fetchDrivers();
          }}
          className="h-8 w-8 md:h-10 md:w-10 rounded-lg shadow-lg bg-background hover:bg-accent"
          title="Drivers"
        >
          <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </Button>
        
        {/* Logout Button */}
        <Button
          size="icon"
          variant="destructive"
          onClick={handleLogoutClick}
          className="h-8 w-8 md:h-10 md:w-10 rounded-lg shadow-lg"
          title="Logout"
        >
          <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </Button>
      </div>

      {/* Bottom Left Menu Buttons */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-3">
        <Button
          size="lg"
          className="h-12 w-12 md:h-14 md:w-14 rounded-full shadow-xl bg-gray-900 hover:bg-gray-800"
          onClick={() => {
            setOrderTab('pending');
            setDrawerOpen(true);
          }}
        >
          <Menu className="w-6 h-6" />
        </Button>
        <Button
          size="lg"
          className="h-12 w-12 md:h-14 md:w-14 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => {
            setOrderTab('agent_approved');
            setDrawerOpen(true);
          }}
          title="Agent Approved Orders"
        >
          <Check className="w-6 h-6" />
        </Button>
      </div>

      {/* Sliding Drawer for Orders */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="bottom" className="h-[80vh] p-0">
          <SheetHeader className="p-6 border-b">
            <SheetTitle className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {orderTab === 'pending' ? 'Pending Orders' : 'Agent Approved Orders'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {orderTab === 'pending' 
                    ? `${pendingOrders.length} orders awaiting approval`
                    : `${agentApprovedOrders.length} orders awaiting final approval`
                  }
                </p>
              </div>
            </SheetTitle>
          </SheetHeader>

          {/* Tab Buttons */}
          <div className="flex gap-2 px-6 py-3 border-b bg-gray-50">
            <Button
              variant={orderTab === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOrderTab('pending')}
              className="gap-2"
            >
              Pending Orders
              <span className="ml-1 px-2 py-0.5 bg-gray-200 rounded text-xs font-semibold">
                {pendingOrders.length}
              </span>
            </Button>
            <Button
              variant={orderTab === 'assigned' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOrderTab('assigned')}
              className="gap-2"
            >
              Assigned Orders
              <span className="ml-1 px-2 py-0.5 bg-gray-200 rounded text-xs font-semibold">
                {assignedOrders.length}
              </span>
            </Button>
            <Button
              variant={orderTab === 'agent_approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOrderTab('agent_approved')}
              className="gap-2"
            >
              Agent Approved
              <span className="ml-1 px-2 py-0.5 bg-gray-200 rounded text-xs font-semibold">
                {agentApprovedOrders.length}
              </span>
            </Button>
          </div>

          <div className="p-4">
            <Input
              type="text"
              placeholder="Search orders, customers, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
          </div>

          <div className="overflow-y-auto h-[calc(80vh-260px)] px-4 pb-4">
            {orderTab === 'pending' ? (
              // Pending Orders Tab
              <>
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-400">Loading orders...</div>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Package className="w-12 h-12 mb-2" />
                    <p className="text-sm">No pending orders</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        isSelected={selectedOrder === order.id}
                        onSelect={() => handleOrderSelect(order.id)}
                        onApprove={() => handleApprove(order.id)}
                        onReject={() => handleRejectClick(order.id)}
                        getStatusColor={getStatusColor}
                        getStatusText={getStatusText}
                        formatTimeAgo={formatTimeAgo}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : orderTab === 'assigned' ? (
              // Assigned Orders Tab
              <>
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-400">Loading orders...</div>
                  </div>
                ) : assignedOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Package className="w-12 h-12 mb-2" />
                    <p className="text-sm">No assigned orders</p>
                    <p className="text-xs text-gray-500">Select an agent for a pending order to see it here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignedOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">{order.customerName}</p>
                            <p className="text-xs text-gray-500">{order.id.slice(0, 16)}...</p>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Agent Assigned
                          </span>
                        </div>
                        <div className="space-y-2 text-xs text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{order.customerPhone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{order.pickupAddress || (order as any).pickupLocation?.latitude}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Navigation className="w-4 h-4" />
                            <span>{order.deliveryAddress || (order as any).deliveryLocation?.latitude}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Agent Approved Orders Tab
              <>
                {approvedOrdersLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-400">Loading approved orders...</div>
                  </div>
                ) : agentApprovedOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Package className="w-12 h-12 mb-2" />
                    <p className="text-sm">No agent-approved orders</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {agentApprovedOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">{order.customerName}</p>
                            <p className="text-xs text-gray-500">{order.id.slice(0, 16)}...</p>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Approved by Agent
                          </span>
                        </div>

                        <div className="space-y-2 text-xs text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{order.customerPhone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{order.pickupAddress}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Navigation className="w-4 h-4" />
                            <span>{order.deliveryAddress}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <span>{Array.isArray(order.materials) ? order.materials.join(', ') : order.materials}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{formatTimeAgo(new Date(order.createdAt))}</span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleFinalApprove(order.id)}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Final Approve
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this order. The customer will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm}>
              Reject Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout from the call center? You will need to login again to access this page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogoutConfirm}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agent Selection Dialog */}
      <AgentSelectionDialog
        open={agentSelectionOpen}
        onOpenChange={setAgentSelectionOpen}
        agents={availableAgents}
        loading={agentsLoading}
        selectedAgentId={selectedAgentId}
        onAgentSelect={handleAgentSelected}
        onConfirm={handleAgentConfirm}
        orderId={agentSelectionOrderId || ''}
        orderPickupAddress={allOrders.find(o => o.id === agentSelectionOrderId)?.pickupAddress}
      />

      <DriversDrawer
        open={driversDrawerOpen}
        onOpenChange={setDriversDrawerOpen}
        drivers={drivers}
        loading={driversLoading}
        filter={driverFilter}
        onFilterChange={setDriverFilter}
        formatTimeAgo={formatTimeAgo}
      />

      {/* Create Order Dialog */}
      <Dialog open={createOrderOpen} onOpenChange={setCreateOrderOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Call Center Order</DialogTitle>
            <DialogDescription>
              Create a new order on behalf of a customer and assign it to an agent.
            </DialogDescription>
          </DialogHeader>
          <CallCenterOrderForm 
            onSuccess={() => setCreateOrderOpen(false)}
            onCancel={() => setCreateOrderOpen(false)}
            availableAgents={availableAgents}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
