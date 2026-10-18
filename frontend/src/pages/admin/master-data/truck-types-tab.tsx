"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/oprc";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  IconPlus,
  IconTruck,
  IconCheck,
  IconBan,
  IconLoader2,
  IconRefresh,
  IconEdit,
  IconSearch,
  IconScale,
  IconShieldCheck,
} from "@tabler/icons-react";

const truckSchema = z.object({
  nameEn: z.string().min(2, "English name is required"),
  nameAm: z.string().min(2, "Amharic name is required (አማርኛ)"),
  nameOm: z.string().min(2, "Afaan Oromoo name is required"),
  maxCapacity: z.string().min(1, "Maximum capacity is required"),
  unitId: z.string().min(1, "Pricing unit is required"),
  description: z.string().optional(),
});

type TruckFormValues = z.infer<typeof truckSchema>;

export function TruckTypesTab() {
  const [open, setOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const form = useForm<TruckFormValues>({
    resolver: zodResolver(truckSchema),
    defaultValues: {
      nameEn: "",
      nameAm: "",
      nameOm: "",
      maxCapacity: "",
      unitId: "",
      description: "",
    },
  });

  // Fetch Pricing Units for the dropdown
  const { data: units = [] } = useQuery({
    queryKey: ["admin", "masterData", "units"],
    queryFn: async () => {
      const res = await (orpc as any).admin.masterData.listUnits();
      return (res.data || []).filter((u: any) => u.isActive);
    },
    staleTime: 1000 * 60 * 5,
  });

  // Fetch Truck Types with TanStack Query
  const { data: trucks = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "masterData", "trucks"],
    queryFn: async () => {
      const res = await (orpc as any).admin.masterData.listTrucks();
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Create Truck Mutation
  const createMutation = useMutation({
    mutationFn: async (values: TruckFormValues) => {
      return await (orpc as any).admin.masterData.createTruck(values);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Truck type added successfully");
        queryClient.invalidateQueries({ queryKey: ["admin", "masterData", "trucks"] });
        queryClient.invalidateQueries({ queryKey: ["masterData", "trucks"] });
        queryClient.invalidateQueries({ queryKey: ["masterData", "truckTypes"] });
        form.reset();
        setOpen(false);
      } else {
        toast.error(res.message || "Failed to create truck type");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create truck type");
    },
  });

  // Update Truck Mutation
  const updateMutation = useMutation({
    mutationFn: async (values: TruckFormValues & { id: string }) => {
      return await (orpc as any).admin.masterData.updateTruck(values);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Truck type updated successfully");
        queryClient.invalidateQueries({ queryKey: ["admin", "masterData", "trucks"] });
        queryClient.invalidateQueries({ queryKey: ["masterData", "trucks"] });
        queryClient.invalidateQueries({ queryKey: ["masterData", "truckTypes"] });
        form.reset();
        setEditingTruck(null);
        setOpen(false);
      } else {
        toast.error(res.message || "Failed to update truck type");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update truck type");
    },
  });

  // Toggle Truck Status Mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive?: boolean }) => {
      return await (orpc as any).admin.masterData.toggleTruckStatus({ id, isActive });
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Truck status updated");
        queryClient.invalidateQueries({ queryKey: ["admin", "masterData", "trucks"] });
        queryClient.invalidateQueries({ queryKey: ["masterData", "trucks"] });
        queryClient.invalidateQueries({ queryKey: ["masterData", "truckTypes"] });
      } else {
        toast.error(res.message || "Failed to toggle status");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error updating truck status");
    },
  });

  const handleOpenCreate = () => {
    setEditingTruck(null);
    form.reset({
      nameEn: "",
      nameAm: "",
      nameOm: "",
      maxCapacity: "",
      unitId: units[0]?.id || "",
      description: "",
    });
    setOpen(true);
  };

  const handleOpenEdit = (truck: any) => {
    setEditingTruck(truck);
    form.reset({
      nameEn: truck.nameEn || "",
      nameAm: truck.nameAm || "",
      nameOm: truck.nameOm || "",
      maxCapacity: truck.maxCapacity ? String(truck.maxCapacity) : "",
      unitId: truck.unitId || truck.unit?.id || "",
      description: truck.description || "",
    });
    setOpen(true);
  };

  const onSubmit = (values: TruckFormValues) => {
    if (editingTruck) {
      updateMutation.mutate({ id: editingTruck.id, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const filteredTrucks = useMemo(() => {
    if (!searchTerm.trim()) return trucks;
    const term = searchTerm.toLowerCase();
    return trucks.filter(
      (t: any) =>
        t.nameEn?.toLowerCase().includes(term) ||
        t.nameAm?.toLowerCase().includes(term) ||
        t.nameOm?.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term) ||
        t.unit?.unitCode?.toLowerCase().includes(term)
    );
  }, [trucks, searchTerm]);

  const truckStats = useMemo(() => {
    const total = trucks.length;
    const active = trucks.filter((t: any) => t.isActive).length;
    const capacities = trucks
      .map((t: any) => parseFloat(t.maxCapacity || "0"))
      .filter((c: number) => !isNaN(c) && c > 0);
    const minCap = capacities.length > 0 ? Math.min(...capacities) : 0;
    const maxCap = capacities.length > 0 ? Math.max(...capacities) : 0;
    return { total, active, minCap, maxCap };
  }, [trucks]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <IconTruck className="h-5 w-5 text-blue-600" />
            Truck Types & Capacities (የጭነት መኪና ዓይነቶች)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure vehicle classes, maximum payloads, and primary measurement units for smart wizard recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 gap-1 text-xs"
          >
            <IconRefresh className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="h-9 gap-1 bg-blue-600 hover:bg-blue-700 text-xs shadow-sm cursor-pointer"
          >
            <IconPlus className="h-3.5 w-3.5" />
            Add New Truck Type
          </Button>
        </div>
      </div>

      {/* Executive Fleet KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Fleet Classes (የተመዘገቡ መኪኖች)
            </CardTitle>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <IconTruck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {truckStats.active} <span className="text-xs font-normal text-muted-foreground">/ {truckStats.total} active</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Active vehicle profiles available for shipper booking
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Payload Capacity Span (የመጫን አቅም)
            </CardTitle>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <IconScale className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {truckStats.minCap} – {truckStats.maxCap} <span className="text-xs font-normal text-muted-foreground">QTL</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              From light pickup to heavy long-haul 40-ton trailer
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Town Manager Sync (የደላላ ዝግጁነት)
            </CardTitle>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <IconShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              100% <span className="text-xs font-normal text-muted-foreground">Synchronized</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Directly mapped to corridor benchmark pricing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-xs max-w-sm">
        <IconSearch className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search truck classifications, አማርኛ, Oromoo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 shadow-none focus-visible:ring-0 text-xs h-7 p-0"
        />
      </div>

      {/* CRUD Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingTruck ? "Edit Truck Type" : "Add Truck Type"}
            </DialogTitle>
            <DialogDescription>
              {editingTruck
                ? `Update specifications and capacity parameters for ${editingTruck.nameEn}.`
                : "Define a new vehicle classification and link its capacity rule for the hybrid matching wizard."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5 py-2">
              <FormField
                control={form.control}
                name="nameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">English Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. FSR Truck, Sino Truck, Cattle Truck" className="h-9 text-xs" {...field} />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="nameAm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Amharic (አማርኛ) *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. ኤፍ ኤስ አር, የከብት መጫኛ" className="h-9 text-xs" {...field} />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nameOm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Afaan Oromoo *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. FSR, Makiinaa Horii" className="h-9 text-xs" {...field} />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="maxCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Max Capacity *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 100 or 200" className="h-9 text-xs" {...field} />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Measurement Unit *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Select unit..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.map((u: any) => (
                            <SelectItem key={u.id} value={u.id} className="text-xs">
                              {u.nameEn} ({u.unitCode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Operational Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Enclosed vehicle suited for long-distance grain or cattle transport" className="h-9 text-xs" {...field} />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <IconLoader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Saving...
                    </>
                  ) : editingTruck ? (
                    "Update Truck Type"
                  ) : (
                    "Save Truck Type"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Table Container with Horizontal Scroll Safety */}
      <Card className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[850px]">
          <TableHeader className="bg-gray-50/75">
            <TableRow>
              <TableHead className="font-semibold text-xs">Truck Classification</TableHead>
              <TableHead className="font-semibold text-xs">Amharic (አማርኛ)</TableHead>
              <TableHead className="font-semibold text-xs">Afaan Oromoo</TableHead>
              <TableHead className="font-semibold text-xs">Max Capacity</TableHead>
              <TableHead className="font-semibold text-xs text-center">Status</TableHead>
              <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <IconLoader2 className="h-4 w-4 animate-spin text-blue-600" />
                    Loading truck classifications...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTrucks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-xs">
                  {searchTerm ? "No matching trucks found." : "No truck types registered. Click 'Add New Truck Type' to create one."}
                </TableCell>
              </TableRow>
            ) : (
              filteredTrucks.map((truck: any) => (
                <TableRow key={truck.id} className="hover:bg-gray-50/50">
                  <TableCell>
                    <div className="font-medium text-xs text-gray-900">{truck.nameEn}</div>
                    {truck.description && (
                      <div className="text-[11px] text-muted-foreground truncate max-w-xs">{truck.description}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-700">{truck.nameAm}</TableCell>
                  <TableCell className="text-xs text-gray-700">{truck.nameOm}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {parseFloat(truck.maxCapacity).toLocaleString()} {truck.unit?.unitCode || truck.unit?.nameEn || "Units"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {truck.isActive ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] gap-1">
                        <IconCheck className="h-3 w-3 text-emerald-600" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[11px] gap-1">
                        <IconBan className="h-3 w-3 text-rose-600" />
                        Deactivated
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(truck)}
                        className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                        title="Edit Truck Type"
                      >
                        <IconEdit className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant={truck.isActive ? "ghost" : "outline"}
                        size="sm"
                        onClick={() => toggleMutation.mutate({ id: truck.id, isActive: !truck.isActive })}
                        disabled={toggleMutation.isPending}
                        className={`h-7 px-2 text-[11px] cursor-pointer ${
                          truck.isActive
                            ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {truck.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </Card>
    </div>
  );
}
