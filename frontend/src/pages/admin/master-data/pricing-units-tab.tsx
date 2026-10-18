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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  IconScale,
  IconCheck,
  IconBan,
  IconLoader2,
  IconRefresh,
  IconEdit,
  IconSearch,
} from "@tabler/icons-react";

const unitSchema = z.object({
  unitCode: z.string().min(2, "Unit code is required (e.g. QTL, TON, HD, TRP)").toUpperCase(),
  nameEn: z.string().min(2, "English name is required"),
  nameAm: z.string().min(2, "Amharic name is required (አማርኛ)"),
  nameOm: z.string().min(2, "Afaan Oromoo name is required"),
  description: z.string().optional(),
});

type UnitFormValues = z.infer<typeof unitSchema>;

export function PricingUnitsTab() {
  const [open, setOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      unitCode: "",
      nameEn: "",
      nameAm: "",
      nameOm: "",
      description: "",
    },
  });

  const { data: units = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "masterData", "units"],
    queryFn: async () => {
      const res = await (orpc as any).admin.masterData.listUnits();
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: async (values: UnitFormValues) => {
      return await (orpc as any).admin.masterData.createUnit(values);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Pricing unit added successfully");
        queryClient.invalidateQueries({ queryKey: ["admin", "masterData", "units"] });
        queryClient.invalidateQueries({ queryKey: ["masterData", "units"] });
        form.reset();
        setOpen(false);
      } else {
        toast.error(res.message || "Failed to create pricing unit");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create pricing unit");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: UnitFormValues & { id: string }) => {
      return await (orpc as any).admin.masterData.updateUnit(values);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Pricing unit updated successfully");
        queryClient.invalidateQueries({ queryKey: ["admin", "masterData", "units"] });
        queryClient.invalidateQueries({ queryKey: ["masterData", "units"] });
        form.reset();
        setEditingUnit(null);
        setOpen(false);
      } else {
        toast.error(res.message || "Failed to update pricing unit");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update pricing unit");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive?: boolean }) => {
      return await (orpc as any).admin.masterData.toggleUnitStatus({ id, isActive });
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Unit status updated");
        queryClient.invalidateQueries({ queryKey: ["admin", "masterData", "units"] });
        queryClient.invalidateQueries({ queryKey: ["masterData", "units"] });
      } else {
        toast.error(res.message || "Failed to toggle status");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error updating unit status");
    },
  });

  const handleOpenCreate = () => {
    setEditingUnit(null);
    form.reset({
      unitCode: "",
      nameEn: "",
      nameAm: "",
      nameOm: "",
      description: "",
    });
    setOpen(true);
  };

  const handleOpenEdit = (unit: any) => {
    setEditingUnit(unit);
    form.reset({
      unitCode: unit.unitCode || "",
      nameEn: unit.nameEn || "",
      nameAm: unit.nameAm || "",
      nameOm: unit.nameOm || "",
      description: unit.description || "",
    });
    setOpen(true);
  };

  const onSubmit = (values: UnitFormValues) => {
    if (editingUnit) {
      updateMutation.mutate({ id: editingUnit.id, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const filteredUnits = useMemo(() => {
    if (!searchTerm.trim()) return units;
    const term = searchTerm.toLowerCase();
    return units.filter(
      (u: any) =>
        u.unitCode?.toLowerCase().includes(term) ||
        u.nameEn?.toLowerCase().includes(term) ||
        u.nameAm?.toLowerCase().includes(term) ||
        u.nameOm?.toLowerCase().includes(term)
    );
  }, [units, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <IconScale className="h-5 w-5 text-blue-600" />
            Pricing Units (የዋጋ መለኪያዎች)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Logistical metrics configured for Ethiopian freight: Quintals, Tons, Livestock Head Count, and Flat Trips.
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
            Add New Unit
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-xs max-w-sm">
        <IconSearch className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by code, English, አማርኛ, Oromoo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 shadow-none focus-visible:ring-0 text-xs h-7 p-0"
        />
      </div>

      {/* CRUD Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px] bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingUnit ? "Edit Pricing Unit" : "Add Pricing Unit"}
            </DialogTitle>
            <DialogDescription>
              {editingUnit
                ? `Update measurement details and code for ${editingUnit.nameEn}.`
                : "Register a standard measurement metric with localized translations and code."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5 py-2">
              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="unitCode"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel className="text-xs">Unit Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. QTL" className="h-9 text-xs uppercase" {...field} />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-xs">English Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Quintal (100kg)" className="h-9 text-xs" {...field} />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="nameAm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Amharic (አማርኛ) *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. ኩንታል" className="h-9 text-xs" {...field} />
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
                        <Input placeholder="e.g. Kuntaala" className="h-9 text-xs" {...field} />
                      </FormControl>
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
                    <FormLabel className="text-xs">Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Traditional bag used for agricultural commodities" className="h-9 text-xs" {...field} />
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
                  ) : editingUnit ? (
                    "Update Unit"
                  ) : (
                    "Save Unit"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/75">
            <TableRow>
              <TableHead className="font-semibold text-xs">Code</TableHead>
              <TableHead className="font-semibold text-xs">English Name</TableHead>
              <TableHead className="font-semibold text-xs">Amharic (አማርኛ)</TableHead>
              <TableHead className="font-semibold text-xs">Afaan Oromoo</TableHead>
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
                    Loading pricing metrics...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUnits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-xs">
                  {searchTerm ? "No matching pricing units found." : "No pricing units found. Click 'Add New Unit' to create one."}
                </TableCell>
              </TableRow>
            ) : (
              filteredUnits.map((unit: any) => (
                <TableRow key={unit.id} className="hover:bg-gray-50/50">
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs bg-slate-50 text-slate-800 border-slate-300">
                      {unit.unitCode}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-xs text-gray-900">{unit.nameEn}</TableCell>
                  <TableCell className="text-xs text-gray-700">{unit.nameAm}</TableCell>
                  <TableCell className="text-xs text-gray-700">{unit.nameOm}</TableCell>
                  <TableCell className="text-center">
                    {unit.isActive ? (
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
                        onClick={() => handleOpenEdit(unit)}
                        className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                        title="Edit Unit"
                      >
                        <IconEdit className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant={unit.isActive ? "ghost" : "outline"}
                        size="sm"
                        onClick={() => toggleMutation.mutate({ id: unit.id, isActive: !unit.isActive })}
                        disabled={toggleMutation.isPending}
                        className={`h-7 px-2 text-[11px] cursor-pointer ${
                          unit.isActive
                            ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {unit.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
