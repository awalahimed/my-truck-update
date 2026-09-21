"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/hooks/auth/auth-client";
import { orpc } from "@/lib/oprc";
import { URL } from "@/config";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconSearch, IconEye, IconX, IconCheck } from "@tabler/icons-react";
import { EnhancedDataTable } from "@/components/enhanced-data-table";
import { formatRelativeTime } from "@/lib/time-utils";

interface PendingDriver {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  image?: string;
  driverLicense?: string;
  driverLicenseImage?: string;
  vehicleImage?: string;
  licenseFrontImage?: string;
  licenseBackImage?: string;
  createdAt: string;
  accountStatus?: string;
  phoneNumberVerified?: boolean;
  banned?: boolean;
}

interface ApprovalAction {
  type: "approve" | "reject";
  driverId: string;
  reason?: string;
}

export function ApprovalView() {
  const [pendingDrivers, setPendingDrivers] = useState<PendingDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<PendingDriver | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectedDocument, setRejectedDocument] = useState<"license" | "vehicle">("license");
  const [actionLoading, setActionLoading] = useState(false);
  const [imageZoomOpen, setImageZoomOpen] = useState(false);

  const fetchPendingDrivers = async () => {
    try {
      setLoading(true);
      const response = await authClient.admin.listUsers({
        query: {
          filterField: "role",
          filterValue: "driver",
          filterOperator: "eq",
        },
      });

      if (response.data) {
        // Filter drivers who need approval (pending or re-uploaded status)
        const drivers = response.data.users
          .filter((user: any) => {
            // Show drivers with pending or re-uploaded status
            return user.role === "driver" && (user.accountStatus === "pending" || user.accountStatus === "re-uploaded");
          })
          .map((user: any) => ({
            id: user.id,
            name: user.name || "",
            phoneNumber: user.phoneNumber || "",
            email: user.email || "",
            image: user.image || "",
            driverLicense: user.driverLicense || "",
            driverLicenseImage: user.driverLicenseImage || "",
            accountStatus: user.accountStatus || "pending",
            phoneNumberVerified: user.phoneNumberVerified || false,
            banned: user.banned || false,
            createdAt: user.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "",
          }));

        setPendingDrivers(drivers);
      }
    } catch (error) {
      toast.error("Failed to fetch pending drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDrivers();
  }, []);

  const handleApproval = async (action: ApprovalAction) => {
    try {
      setActionLoading(true);

      if (action.type === "approve") {
        // Call approve API
        const response = await authClient.admin.updateUser({
          userId: action.driverId,
          data: {
            // Change status from pending to active
            accountStatus: "active",
          },
        });

        if (response.error) {
          toast.error(response.error.message || "Failed to approve driver");
          return;
        }
        toast.success("Driver approved successfully");
      } else {
        // Call reject API with document selection
        try {
          await orpc.admin.driver.rejectDriver({
            driverId: action.driverId,
            reason: action.reason!,
            rejectedDocument: rejectedDocument,
          });
          toast.success("Driver rejected");
        } catch (error: any) {
          console.error('Reject driver error:', error);
          toast.error(error?.message || "Failed to reject driver");
          return;
        }
      }

      setIsApproveDialogOpen(false);
      setIsRejectDialogOpen(false);
      setRejectReason("");
      fetchPendingDrivers();
    } catch (error) {
      toast.error("Failed to process approval");
    } finally {
      setActionLoading(false);
    }
  };

  const openView = async (driver: PendingDriver) => {
    setSelectedDriver(driver);
    setIsViewOpen(true);
    
    // Fetch driver details including all images
    try {
      const data = await orpc.admin.driver.getDriverDetails({ driverId: driver.id });
      if (data.driver) {
        setSelectedDriver({ 
          ...driver,
          image: data.driver.image || driver.image,
          vehicleImage: data.driver.vehicleImage || undefined,
          licenseFrontImage: data.driver.licenseFrontImage || undefined,
          licenseBackImage: data.driver.licenseBackImage || undefined,
        });
      }
    } catch (error) {
      console.error('Failed to fetch driver details:', error);
    }
  };

  const openApprove = (driver: PendingDriver) => {
    setSelectedDriver(driver);
    setIsApproveDialogOpen(true);
  };

  const openReject = (driver: PendingDriver) => {
    setSelectedDriver(driver);
    setIsRejectDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter drivers based on search
  const filteredDrivers = pendingDrivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phoneNumber.includes(searchTerm) ||
      driver.driverLicense?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Define columns for the table
  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: (_value: any, row: PendingDriver) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {row.image && <AvatarImage src={`${URL.IMAGE}${row.image}`} alt={row.name} />}
            <AvatarFallback>{getInitials(row.name)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.name || "Driver"}</span>
        </div>
      ),
    },
    { accessorKey: "phoneNumber", header: "Phone Number" },
    { 
      accessorKey: "createdAt", 
      header: "Submitted",
      cell: (value: string) => formatRelativeTime(value)
    },
    {
      accessorKey: "accountStatus",
      header: "Status",
      cell: (_value: any, row: PendingDriver) => {
        const status = row.accountStatus || "pending";
        const isReUploaded = status === "re-uploaded";
        const isPending = status === "pending";

        let bgClass = "bg-yellow-100 text-yellow-700";
        let label = "Pending";

        if (isReUploaded) {
          bgClass = "bg-blue-100 text-blue-700";
          label = "Re-uploaded";
        }

        return (
          <Badge variant="outline" className={bgClass}>
            {label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "phoneNumberVerified",
      header: "Phone Verified",
      cell: (value: boolean) => (
        <Badge variant="outline" className={
          value
            ? "bg-green-100 text-green-700 border-green-200"
            : "bg-yellow-100 text-yellow-700 border-yellow-200"
        }>
          {value ? "Verified" : "Pending"}
        </Badge>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: (_value: any, row: PendingDriver) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openView(row)}
            title="View Details"
          >
            <IconEye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openApprove(row)}
            title="Approve Driver"
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <IconCheck className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openReject(row)}
            title="Reject Driver"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <IconX className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Driver Approval</h2>
        <Badge variant="secondary" className="text-sm">
          {filteredDrivers.length} Pending Driver{filteredDrivers.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or license..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <EnhancedDataTable
        columns={columns}
        data={filteredDrivers}
        onAdd={() => {}}
        loading={loading}
        pagination
        pageSize={10}
      />

      {/* View Side Panel */}
      <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
        <SheetContent side="right" className="sm:max-w-2xl p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetTitle>Driver Details</SheetTitle>
          </SheetHeader>
          {selectedDriver && (
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
              {/* Profile Section */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 text-xl">
                  {selectedDriver.image && <AvatarImage src={`${URL.IMAGE}${selectedDriver.image}`} alt={selectedDriver.name} />}
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(selectedDriver.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedDriver.name}</h3>
                  <p className="text-muted-foreground">Driver</p>
                  <Badge variant="outline" className="mt-1 bg-yellow-50 text-yellow-700 border-yellow-200">
                    Pending Approval
                  </Badge>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Contact Information</h4>
                <dl className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">Phone Number</dt>
                    <dd className="font-medium">{selectedDriver.phoneNumber}</dd>
                  </div>
                  {selectedDriver.email && (
                    <div className="flex justify-between py-2 border-b">
                      <dt className="text-muted-foreground">Email</dt>
                      <dd className="font-medium">{selectedDriver.email}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Driver License */}
              {(selectedDriver.licenseFrontImage || selectedDriver.licenseBackImage) && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Driver License</h4>
                  
                  {/* License Images */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDriver.licenseFrontImage && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">License Front</p>
                        <img
                          src={`${URL.IMAGE}/uploads/${selectedDriver.licenseFrontImage}`}
                          alt="License Front"
                          className="w-full h-auto rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setImageZoomOpen(true)}
                        />
                      </div>
                    )}
                    {selectedDriver.licenseBackImage && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">License Back</p>
                        <img
                          src={`${URL.IMAGE}/uploads/${selectedDriver.licenseBackImage}`}
                          alt="License Back"
                          className="w-full h-auto rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setImageZoomOpen(true)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Vehicle Image */}
              {selectedDriver.vehicleImage && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Vehicle Photo</h4>
                  <div className="relative">
                    <img
                      src={`${URL.IMAGE}/uploads/${selectedDriver.vehicleImage}`}
                      alt="Vehicle"
                      className="w-full h-auto rounded-lg border"
                    />
                  </div>
                </div>
              )}

              {/* Submitted Date */}
              <div className="border-t pt-4">
                <dl className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">Submitted On</dt>
                    <dd className="font-medium">
                      {selectedDriver.createdAt ? (
                        <span title={new Date(selectedDriver.createdAt).toLocaleString()}>
                          {formatRelativeTime(selectedDriver.createdAt)}
                        </span>
                      ) : "N/A"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-4 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsViewOpen(false);
                    openApprove(selectedDriver);
                  }}
                >
                  <IconCheck className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setIsViewOpen(false);
                    openReject(selectedDriver);
                  }}
                >
                  <IconX className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Image Zoom Dialog */}
      <Dialog open={imageZoomOpen} onOpenChange={setImageZoomOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Driver License Image</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {selectedDriver?.driverLicenseImage && (
              <img
                src={selectedDriver.driverLicenseImage}
                alt="Driver License"
                className="max-h-[70vh] w-auto object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Driver</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve {selectedDriver?.name}? This will grant them access to the platform as a driver.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() =>
                selectedDriver &&
                handleApproval({ type: "approve", driverId: selectedDriver.id })
              }
              disabled={actionLoading}
            >
              {actionLoading ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Driver</DialogTitle>
            <DialogDescription>
              Select which document is rejected and provide a reason for {selectedDriver?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rejected Document</label>
              <Select value={rejectedDocument} onValueChange={(value: "license" | "vehicle") => setRejectedDocument(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="license">Driver License</SelectItem>
                  <SelectItem value="vehicle">Vehicle Photo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Rejection Reason</label>
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedDriver &&
                handleApproval({
                  type: "reject",
                  driverId: selectedDriver.id,
                  reason: rejectReason,
                })
              }
              disabled={actionLoading || !rejectReason.trim()}
            >
              {actionLoading ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
