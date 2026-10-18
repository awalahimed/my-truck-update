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
  IconPackage,
  IconCheck,
  IconBan,
  IconLoader2,
  IconRefresh,
  IconEdit,
  IconSearch,
  IconCategory,
  IconShieldCheck,
  IconScale,
} from "@tabler/icons-react";

const goodsSchema = z.object({
  nameEn: z.string().min(2, "English name is required"),
  nameAm: z.string().min(2, "Amharic name is required (አማርኛ)"),
  nameOm: z.string().min(2, "Afaan Oromoo name is required"),
  defaultUnitId: z.string().min(1, "Default pricing unit is required"),
  category: z.string(),
});

type GoodsFormValues = z.infer<typeof goodsSchema>;

export function GoodsTypesTab() {
  const [open, setOpen] = useState(false);
  const [editingGood, setEditingGood] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const form = useForm<GoodsFormValues>({
    resolver: zodResolver(goodsSchema),
    defaultValues: {
      nameEn: "",
      nameAm: "",
      nameOm: "",
      defaultUnitId: "",
      category: "agricultural",
    },
  });

  const { data: units = [] } = useQuery({
    queryKey: ["admin", "masterData", "units"],
    queryFn: async () => {
      const res = await (orpc as any).admin.masterData.listUnits();
      return (res.data || []).filter((u: any) => u.isActive);
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: goods = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "masterData", "goods"],
    queryFn: async () => {
      const res = await (orpc as any).admin.masterData.listGoods();
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: async (values: GoodsFormValues) => {
      return await (orpc as any).admin.masterData.createGood(values);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Goods type added successfully");
        queryClient.invalidateQueries({ queryKey: ["admin", "masterData", "goods"] });
        queryClient.invalidateQueries({ queryKey: ["masterData", "goods"] });
        form.reset();
        setOpen(false);
      } else {
        toast.error(res.message || "Failed to create goods type");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create goods type");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: GoodsFormValues & { id: string }) => {
      return await (orpc as any).admin.masterData.updateGood(values);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Goods type updated successfully");
        queryClient.invalidateQueries({ queryKey: ["admin", "masterData", "goods"] });
        queryClient.invalidateQueries({ queryKey: ["masterData", "goods"] });
        form.reset();
        setEditingGood(null);
        setOpen(false);
      } else {
        toast.error(res.message || "Failed to update goods type");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update goods type");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive?: boolean }) => {
      return await (orpc as any).admin.masterData.toggleGoodStatus({ id, isActive });
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Goods status updated");
        queryClient.invalidateQueries({ queryKey: ["admin", "masterData", "goods"] });
        queryClient.invalidateQueries({ queryKey: ["masterData", "goods"] });
      } else {
        toast.error(res.message || "Failed to toggle status");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error updating goods status");
    },
  });

  const handleOpenCreate = () => {
    setEditingGood(null);
    form.reset({
      nameEn: "",
      nameAm: "",
      nameOm: "",
      defaultUnitId: units[0]?.id || "",
      category: "agricultural",
    });
    setOpen(true);
  };

  const handleOpenEdit = (good: any) => {
    setEditingGood(good);
    form.reset({
      nameEn: good.nameEn || "",
      nameAm: good.nameAm || "",
      nameOm: good.nameOm || "",
      defaultUnitId: good.defaultUnitId || good.defaultUnit?.id || "",
      category: good.category || "agricultural",
    });
    setOpen(true);
  };

  const onSubmit = (values: GoodsFormValues) => {
    if (editingGood) {
      updateMutation.mutate({ id: editingGood.id, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const filteredGoods = useMemo(() => {
    if (!searchTerm.trim()) return goods;
    const term = searchTerm.toLowerCase();
    return goods.filter(
      (g: any) =>
        g.nameEn?.toLowerCase().includes(term) ||
        g.nameAm?.toLowerCase().includes(term) ||
        g.nameOm?.toLowerCase().includes(term) ||
        g.category?.toLowerCase().includes(term) ||
        g.defaultUnit?.unitCode?.toLowerCase().includes(term)
    );
  }, [goods, searchTerm]);

  const goodsStats = useMemo(() => {
    const total = goods.length;
    const active = goods.filter((g: any) => g.isActive).length;
    const categoriesCount = new Set(goods.map((g: any) => g.category || "general")).size;
    return { total, active, categoriesCount };
  }, [goods]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <IconPackage className="h-5 w-5 text-blue-600" />
            Goods & Cargo Classifications (የጭነት ዕቃ ዓይነቶች)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Commodities that shippers select when posting a load, linked with their standard measurement unit.
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
            Add New Goods Type
          </Button>
        </div>
      </div>

      {/* Executive Commodities KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Commodity Profiles (የሸቀጥ ዓይነቶች)
            </CardTitle>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <IconPackage className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {goodsStats.active} <span className="text-xs font-normal text-muted-foreground">/ {goodsStats.total} active</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Active freight commodities available for shipper posting
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Industry Sectors (የሸቀጥ ዘርፎች)
            </CardTitle>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <IconCategory className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {goodsStats.categoriesCount} <span className="text-xs font-normal text-muted-foreground">Sectors</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Agricultural, Livestock, Industrial, and Construction
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pricing Unit Binding (መለኪያ ማስተሳሰሪያ)
            </CardTitle>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <IconScale className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              100% <span className="text-xs font-normal text-muted-foreground">Linked</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Each commodity is paired with its standard tariff unit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-xs max-w-sm">
        <IconSearch className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search goods commodities, አማርኛ, Oromoo..."
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
              {editingGood ? "Edit Goods Classification" : "Add Goods Classification"}
            </DialogTitle>
            <DialogDescription>
              {editingGood
                ? `Update commodity configuration and default unit for ${editingGood.nameEn}.`
                : "Register a commodity and link its default pricing metric (e.g. Teff to Quintals, Livestock to Head Count)."}
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
                      <Input placeholder="e.g. Teff & Grain, Livestock (Cattle), Cement" className="h-9 text-xs" {...field} />
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
                        <Input placeholder="e.g. ጤፍ እና እህል, የቁም ከብት" className="h-9 text-xs" {...field} />
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
                        <Input placeholder="e.g. Xaafii, Loon" className="h-9 text-xs" {...field} />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="defaultUnitId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Default Unit *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Select default unit..." />
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

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Category..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="agricultural" className="text-xs">Agricultural (ግብርና)</SelectItem>
                          <SelectItem value="livestock" className="text-xs">Livestock (እንስሳት)</SelectItem>
                          <SelectItem value="construction" className="text-xs">Construction (ግንባታ)</SelectItem>
                          <SelectItem value="commercial" className="text-xs">Commercial (ንግድ/የቤት ዕቃ)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>

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
                  ) : editingGood ? (
                    "Update Goods Type"
                  ) : (
                    "Save Goods Type"
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
              <TableHead className="font-semibold text-xs">Goods Commodity</TableHead>
              <TableHead className="font-semibold text-xs">Amharic (አማርኛ)</TableHead>
              <TableHead className="font-semibold text-xs">Afaan Oromoo</TableHead>
              <TableHead className="font-semibold text-xs">Default Unit</TableHead>
              <TableHead className="font-semibold text-xs">Category</TableHead>
              <TableHead className="font-semibold text-xs text-center">Status</TableHead>
              <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <IconLoader2 className="h-4 w-4 animate-spin text-blue-600" />
                    Loading goods classifications...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredGoods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-xs">
                  {searchTerm ? "No matching commodities found." : "No goods types found. Click 'Add New Goods Type' to create one."}
                </TableCell>
              </TableRow>
            ) : (
              filteredGoods.map((item: any) => (
                <TableRow key={item.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium text-xs text-gray-900">{item.nameEn}</TableCell>
                  <TableCell className="text-xs text-gray-700">{item.nameAm}</TableCell>
                  <TableCell className="text-xs text-gray-700">{item.nameOm}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[11px] bg-slate-50 text-slate-800 border-slate-300">
                      {item.defaultUnit?.unitCode || item.defaultUnit?.nameEn || "Unit"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize text-[11px] bg-gray-100 text-gray-700">
                      {item.category || "general"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {item.isActive ? (
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
                        onClick={() => handleOpenEdit(item)}
                        className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                        title="Edit Goods Type"
                      >
                        <IconEdit className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant={item.isActive ? "ghost" : "outline"}
                        size="sm"
                        onClick={() => toggleMutation.mutate({ id: item.id, isActive: !item.isActive })}
                        disabled={toggleMutation.isPending}
                        className={`h-7 px-2 text-[11px] cursor-pointer ${
                          item.isActive
                            ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {item.isActive ? "Deactivate" : "Activate"}
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
