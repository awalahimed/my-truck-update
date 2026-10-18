"use client";

import { useState, useEffect } from "react";
import { orpc } from "@/lib/oprc";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconShieldCheck,
  IconFileCheck,
  IconAlertTriangle,
  IconRefresh,
  IconCheck,
  IconX,
  IconExternalLink,
  IconTruck,
  IconUser,
  IconMapPin,
  IconClock,
} from "@tabler/icons-react";
import { URL } from "@/config";
import { formatRelativeTime } from "@/lib/time-utils";

interface PendingPoDOrder {
  id: string;
  customerId: string;
  customerName: string | null;
  customerPhone: string | null;
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
  deliveryPin: string | null;
  consigneeName: string | null;
  consigneePhone: string | null;
  podWaybillPhoto: string | null;
  podCargoPhoto: string | null;
  podCompletedBy: string | null;
  podLatitude: string | null;
  podLongitude: string | null;
  podDisputeReason: string | null;
  podDisputedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

export function PoDReviewTab() {
  const [orders, setOrders] = useState<PendingPoDOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PendingPoDOrder | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [fullPhotoUrl, setFullPhotoUrl] = useState<string | null>(null);

  const getMediaUrl = (photoId?: string | null) => {
    if (!photoId) return null;
    if (photoId.startsWith("http") || photoId.startsWith("data:")) return photoId;
    return `${URL.BASE}/uploads/${photoId}`;
  };

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const res = await orpc.order.getPendingPoDOrders();
      if (res.success && res.orders) {
        setOrders(res.orders as any);
      }
    } catch (err: any) {
      console.error("Failed to load pending PoD reviews:", err);
      toast.error(err?.message || "Failed to load pending delivery reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 20000); // 20s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (orderId: string) => {
    try {
      setProcessingId(orderId);
      const res = await orpc.order.managerApprovePoD({
        orderId,
        approved: true,
      });
      if (res.success) {
        toast.success(`Waybill approved! ${res.driverPayout ? `${res.driverPayout.toLocaleString()} ETB credited to driver.` : ""}`);
        fetchPendingOrders();
      } else {
        toast.error(res.message || "Approval failed");
      }
    } catch (err: any) {
      toast.error(err?.message || "Approval failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedOrder) return;
    try {
      setProcessingId(selectedOrder.id);
      const res = await orpc.order.managerApprovePoD({
        orderId: selectedOrder.id,
        approved: false,
        rejectionReason: rejectReason || "Paper receipt photo is unclear or missing stamp/signature.",
      });
      if (res.success) {
        toast.warning("Delivery receipt rejected. Driver has been notified to re-upload clear proof.");
        setRejectDialogOpen(false);
        setRejectReason("");
        fetchPendingOrders();
      }
    } catch (err: any) {
      toast.error(err?.message || "Rejection failed");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      o.id.toLowerCase().includes(term) ||
      (o.driverName && o.driverName.toLowerCase().includes(term)) ||
      (o.driverPhone && o.driverPhone.includes(term)) ||
      (o.customerName && o.customerName.toLowerCase().includes(term)) ||
      (o.deliveryAddress && o.deliveryAddress.toLowerCase().includes(term))
    );
  });

  const totalPendingAmount = orders.reduce((sum, o) => {
    return sum + parseFloat(o.finalPrice || o.estimatedPrice || "0");
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <IconShieldCheck className="h-6 w-6 text-primary" />
            Proof of Delivery Reviews (የደረሰኝ ማረጋገጫ)
          </h2>
          <p className="text-muted-foreground text-sm">
            Review stamped paper waybills submitted by drivers (Option A) and release escrow funds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPendingOrders}
            disabled={loading}
          >
            <IconRefresh className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Waybill Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{orders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Drivers awaiting review to get paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Escrow Pending Release
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {totalPendingAmount.toLocaleString()} ETB
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Protected in shipper escrow accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Target Review Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">2–3 min</div>
            <p className="text-xs text-muted-foreground mt-1">
              Quick review for driver satisfaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter / Search */}
      <div className="flex items-center gap-2 max-w-sm">
        <Input
          placeholder="Search by order ID, driver, customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Pending Orders Table / List */}
      <Card>
        <CardContent className="p-0">
          {loading && orders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <IconRefresh className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading pending receipts...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <IconCheck className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-foreground text-base">All caught up!</p>
              <p className="text-sm">There are no paper waybills awaiting review at this moment.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order & Amount</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Receiver / Customer</TableHead>
                  <TableHead>Delivery Location</TableHead>
                  <TableHead>Signed Waybill Photo</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((o) => {
                  const amount = o.finalPrice || o.estimatedPrice || "0";
                  const photoUrl = getMediaUrl(o.podWaybillPhoto);
                  const isProcessing = processingId === o.id;

                  return (
                    <TableRow key={o.id}>
                      {/* Order & Amount */}
                      <TableCell>
                        <div className="font-semibold text-sm">
                          {parseFloat(amount).toLocaleString()} ETB
                        </div>
                        <div className="font-mono text-xs text-muted-foreground truncate max-w-[130px]">
                          #{o.id}
                        </div>
                        <Badge variant="outline" className="text-[10px] mt-1 capitalize">
                          {o.vehicleType}
                        </Badge>
                      </TableCell>

                      {/* Driver */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <IconTruck className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium text-sm">{o.driverName || "Driver"}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{o.driverPhone || "—"}</div>
                      </TableCell>

                      {/* Customer / Consignee */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <IconUser className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium text-sm">
                            {o.consigneeName || o.customerName || "Customer"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {o.consigneePhone || o.customerPhone || "—"}
                        </div>
                      </TableCell>

                      {/* Destination */}
                      <TableCell>
                        <div className="text-xs max-w-[180px] truncate" title={o.deliveryAddress}>
                          {o.deliveryAddress}
                        </div>
                        {o.podLatitude && o.podLongitude && (
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <IconMapPin className="h-3 w-3 text-emerald-600" />
                            GPS: {Number(o.podLatitude).toFixed(4)}, {Number(o.podLongitude).toFixed(4)}
                          </div>
                        )}
                      </TableCell>

                      {/* Photo Thumbnail */}
                      <TableCell>
                        {photoUrl ? (
                          <div
                            className="relative group rounded border bg-black/5 w-16 h-12 overflow-hidden cursor-pointer hover:border-primary transition-all"
                            onClick={() => setFullPhotoUrl(photoUrl)}
                          >
                            <img
                              src={photoUrl}
                              alt="Signed Waybill"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <IconExternalLink className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No Photo</span>
                        )}
                      </TableCell>

                      {/* Time */}
                      <TableCell>
                        <div className="text-xs flex items-center gap-1 text-muted-foreground">
                          <IconClock className="h-3 w-3" />
                          {o.deliveredAt ? formatRelativeTime(o.deliveredAt) : "Just now"}
                        </div>
                        {o.podCompletedBy === "waybill_rejected_reupload_required" && (
                          <Badge variant="destructive" className="text-[9px] mt-1">
                            Re-upload
                          </Badge>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-2.5"
                            disabled={isProcessing}
                            onClick={() => handleApprove(o.id)}
                          >
                            <IconCheck className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 px-2"
                            disabled={isProcessing}
                            onClick={() => {
                              setSelectedOrder(o);
                              setRejectDialogOpen(true);
                            }}
                          >
                            <IconX className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Delivery Receipt</DialogTitle>
            <DialogDescription>
              Explain why this receipt is rejected. The driver will receive an instant notification to take a clearer photo or enter receiver PIN.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="e.g. Photo is too blurry, signature is missing, or wrong order paper..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!!processingId}
              onClick={handleReject}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Photo Dialog */}
      <Dialog open={!!fullPhotoUrl} onOpenChange={() => setFullPhotoUrl(null)}>
        <DialogContent className="max-w-3xl p-3">
          <DialogHeader className="p-1">
            <DialogTitle>Signed Paper Waybill Receipt (ተቀባይ ደረሰኝ)</DialogTitle>
          </DialogHeader>
          {fullPhotoUrl && (
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center p-2 bg-black/5 rounded">
              <img
                src={fullPhotoUrl}
                alt="Full size signed waybill"
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
