"use client";

import { useState, useEffect } from "react";
import { orpc } from "@/lib/oprc";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EnhancedDataTable } from "@/components/enhanced-data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconTruckDelivery,
  IconCalendarStats,
  IconProgressCheck,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconCoin,
  IconSearch,
  IconEye,
} from "@tabler/icons-react";
import { formatRelativeTime } from "@/lib/time-utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface OrderStats {
  totalToday: number;
  active: number;
  completed: number;
  cancelled: number;
  delayed: number;
  avgRevenue: string;
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  driverId: string | null;
  driverName: string | null;
  driverPhone: string | null;
  pickupAddress: string;
  deliveryAddress: string;
  materials: any;
  vehicleType: string;
  status: string;
  estimatedPrice: string | null;
  finalPrice: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GetAllOrdersResponse {
  success: boolean;
  stats: OrderStats;
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "agent_selected", label: "Agent Selected" },
  { value: "approved_by_agent", label: "Approved by Agent" },
  { value: "rejected", label: "Rejected" },
  { value: "approved", label: "Approved" },
  { value: "has_offers", label: "Has Offers" },
  { value: "assigned", label: "Assigned" },
  { value: "on_the_way", label: "On The Way" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_COLORS: Record<string, string> = {
  pending_approval: "bg-yellow-100 text-yellow-700 border-yellow-200",
  agent_selected: "bg-blue-100 text-blue-700 border-blue-200",
  approved_by_agent: "bg-indigo-100 text-indigo-700 border-indigo-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  has_offers: "bg-purple-100 text-purple-700 border-purple-200",
  assigned: "bg-cyan-100 text-cyan-700 border-cyan-200",
  on_the_way: "bg-orange-100 text-orange-700 border-orange-200",
  delivered: "bg-teal-100 text-teal-700 border-teal-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200",
};

export function ShipmentOrdersView() {
  const [data, setData] = useState<GetAllOrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await orpc.admin.order.getAllOrders({
        page: 1,
        pageSize: 100,
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      if (result.success) {
        setData(result as any);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load shipments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = () => {
    fetchOrders();
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const columns = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: (value: string) => (
        <span className="font-mono text-xs truncate max-w-[120px] inline-block">
          {value.substring(0, 20)}...
        </span>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: (value: string) => (
        <span className="font-medium">{value || "N/A"}</span>
      ),
    },
    {
      accessorKey: "driverName",
      header: "Driver",
      cell: (value: string | null) => (
        <span>{value || "—"}</span>
      ),
    },
    {
      accessorKey: "pickupAddress",
      header: "Pickup",
      cell: (value: string) => (
        <span className="text-xs truncate max-w-[150px] inline-block">{value}</span>
      ),
    },
    {
      accessorKey: "deliveryAddress",
      header: "Delivery",
      cell: (value: string) => (
        <span className="text-xs truncate max-w-[150px] inline-block">{value}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (_value: any, row: Order) => (
        <Badge
          variant="outline"
          className={STATUS_COLORS[row.status] || "bg-gray-100 text-gray-700"}
        >
          {formatStatus(row.status)}
        </Badge>
      ),
    },
    {
      accessorKey: "finalPrice",
      header: "Amount",
      cell: (value: string | null) => (
        <span className="font-semibold">
          {value ? `${parseFloat(value).toLocaleString()} ETB` : "—"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: (value: string) => (
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(value)}
        </span>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: (_value: any, row: Order) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedOrder(row);
            setIsViewOpen(true);
          }}
        >
          <IconEye className="h-4 w-4 mr-1" />
          View
        </Button>
      ),
    },
  ];

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <IconTruckDelivery className="h-6 w-6" />
          Shipment Operations
        </h2>
        <p className="text-muted-foreground">
          Monitor and manage all shipment orders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Today</CardTitle>
            <IconCalendarStats className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalToday ?? "—"}</div>
            <p className="text-xs text-muted-foreground">Orders created today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <IconProgressCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.active ?? "—"}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <IconCircleCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats?.completed ?? "—"}</div>
            <p className="text-xs text-muted-foreground">Delivered & confirmed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <IconCircleX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.cancelled ?? "—"}</div>
            <p className="text-xs text-muted-foreground">Cancelled orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed</CardTitle>
            <IconClock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.delayed ?? "—"}</div>
            <p className="text-xs text-muted-foreground">Older than 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue</CardTitle>
            <IconCoin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.avgRevenue ? `${parseFloat(stats.avgRevenue).toLocaleString()} ETB` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">Per completed order</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            {data ? `${data.total} total order${data.total !== 1 ? "s" : ""}` : "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID or customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} variant="secondary">
              Filter
            </Button>
          </div>

          <EnhancedDataTable
            columns={columns}
            data={data?.orders || []}
            onAdd={() => {}}
            loading={loading}
            pagination
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* View Order Sheet */}
      <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
        <SheetContent side="right" className="sm:max-w-xl p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetTitle>Order Details</SheetTitle>
          </SheetHeader>
          {selectedOrder && (
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
              {/* Order ID & Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono">ID</p>
                  <p className="font-mono text-sm">{selectedOrder.id}</p>
                </div>
                <Badge
                  variant="outline"
                  className={STATUS_COLORS[selectedOrder.status] || ""}
                >
                  {formatStatus(selectedOrder.status)}
                </Badge>
              </div>

              {/* Customer */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Customer</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Name:</span> {selectedOrder.customerName || "N/A"}</p>
                  <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.customerPhone || "N/A"}</p>
                </div>
              </div>

              {/* Driver */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Driver</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Name:</span> {selectedOrder.driverName || "Not assigned"}</p>
                  <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.driverPhone || "—"}</p>
                </div>
              </div>

              {/* Locations */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Locations</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Pickup</p>
                    <p>{selectedOrder.pickupAddress}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Delivery</p>
                    <p>{selectedOrder.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Vehicle:</span> {selectedOrder.vehicleType || "N/A"}</p>
                  <p><span className="text-muted-foreground">Materials:</span> {
                    selectedOrder.materials 
                      ? (Array.isArray(selectedOrder.materials) 
                        ? selectedOrder.materials.join(", ") 
                        : typeof selectedOrder.materials === 'string' 
                          ? selectedOrder.materials 
                          : JSON.stringify(selectedOrder.materials))
                      : "N/A"
                  }</p>
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Pricing</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Estimated:</span> {selectedOrder.estimatedPrice ? `${parseFloat(selectedOrder.estimatedPrice).toLocaleString()} ETB` : "N/A"}</p>
                  <p><span className="text-muted-foreground">Final:</span> {selectedOrder.finalPrice ? `${parseFloat(selectedOrder.finalPrice).toLocaleString()} ETB` : "Pending"}</p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Timeline</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Created:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  <p><span className="text-muted-foreground">Updated:</span> {new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
