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
  IconChartBar,
  IconCheck,
  IconBan,
  IconLoader2,
  IconRefresh,
  IconArrowRight,
  IconEdit,
  IconSearch,
} from "@tabler/icons-react";

const rateSchema = z.object({
  originCityId: z.string().min(1, "Origin city is required"),
  destinationCityId: z.string().min(1, "Destination city is required"),
  pricingUnitId: z.string().min(1, "Pricing unit is required"),
  minRate: z.string().min(1, "Minimum rate is required"),
  maxRate: z.string().min(1, "Maximum rate is required"),
});

type RateFormValues = z.infer<typeof rateSchema>;

export function MarketRatesTab() {
  const [open, setOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const form = useForm<RateFormValues>({
    resolver: zodResolver(rateSchema),
    defaultValues: {
      originCityId: "",
      destinationCityId: "",
      pricingUnitId: "",
      minRate: "",
      maxRate: "",
    },
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["admin", "masterData", "cities"],
    queryFn: async () => {
      const res = await (orpc as any).admin.masterData.listCities();
      return (res.data || []).filter((c: any) => c.isActive);
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: units = [] } = useQuery({
    queryKey: ["admin", "masterData", "units"],
    queryFn: async () => {
      const res = await (orpc as any).admin.masterData.listUnits();
      return (res.data || []).filter((u: any) => u.isActive);
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: rates = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "masterData", "rates"],
    queryFn: async () => {
      const res = await (orpc as any).admin.masterData.listRates();
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: async (values: RateFormValues) => {
      return await (orpc as any).admin.masterData.createRate(values);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Market benchmark rate added successfully");
        queryClient.invalidateQueries({ queryKey: ["admin", "masterData", "rates"] });
        form.reset();
        setOpen(false);
      } else {
        toast.error(res.message || "Failed to create rate");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create market rate");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: { id: string; minRate?: string; maxRate?: string }) => {
      return await (orpc as any).admin.masterData.updateRate(values);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Market benchmark rate updated successfully");
        queryClient.invalidateQueries({ queryKey: ["admin", "masterData", "rates"] });
        form.reset();
        setEditingRate(null);
        setOpen(false);
      } else {
        toast.error(res.message || "Failed to update rate");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update market rate");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive?: boolean }) => {
      return await (orpc as any).admin.masterData.toggleRateStatus({ id, isActive });
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Rate status updated");
        queryClient.invalidateQueries({ queryKey: ["admin", "masterData", "rates"] });
      } else {
        toast.error(res.message || "Failed to toggle status");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error updating rate status");
    },
  });

  const handleOpenCreate = () => {
    setEditingRate(null);
    form.reset({
      originCityId: cities[0]?.id || "",
      destinationCityId: cities[1]?.id || "",
      pricingUnitId: units[0]?.id || "",
      minRate: "",
      maxRate: "",
    });
    setOpen(true);
  };

  const handleOpenEdit = (rate: any) => {
    setEditingRate(rate);
    form.reset({
      originCityId: rate.originCityId,
      destinationCityId: rate.destinationCityId,
      pricingUnitId: rate.pricingUnitId,
      minRate: rate.minRate ? String(rate.minRate) : "",
      maxRate: rate.maxRate ? String(rate.maxRate) : "",
    });
    setOpen(true);
  };

  const onSubmit = (values: RateFormValues) => {
    if (editingRate) {
      updateMutation.mutate({
        id: editingRate.id,
        minRate: values.minRate,
        maxRate: values.maxRate,
      });
    } else {
      createMutation.mutate(values);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const getCityName = (id: string) => {
    const c = cities.find((item: any) => item.id === id);
    return c ? `${c.nameEn} (${c.nameAm})` : id;
  };

  const getUnitCode = (id: string) => {
    const u = units.find((item: any) => item.id === id);
    return u ? `${u.nameEn} (${u.unitCode})` : id;
  };

  const filteredRates = useMemo(() => {
    if (!searchTerm.trim()) return rates;
    const term = searchTerm.toLowerCase();
    return rates.filter((r: any) => {
      const origin = getCityName(r.originCityId).toLowerCase();
      const dest = getCityName(r.destinationCityId).toLowerCase();
      const unit = getUnitCode(r.pricingUnitId).toLowerCase();
      return origin.includes(term) || dest.includes(term) || unit.includes(term);
    });
  }, [rates, searchTerm, cities, units]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <IconChartBar className="h-5 w-5 text-blue-600" />
            Regional Benchmark Rates (የከተማ አስተዳዳሪ የገበያ ዋጋ መነሻ)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verified local tariff benchmarks used by the Hybrid Pricing Engine to compute instant quotes for shippers.
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
            Add Benchmark Rate
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-xs max-w-sm">
        <IconSearch className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by origin, destination or unit..."
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
              {editingRate ? "Edit Route Benchmark Rate" : "Add Route Benchmark Rate"}
            </DialogTitle>
            <DialogDescription>
              {editingRate
                ? `Update tariff benchmark range for ${getCityName(editingRate.originCityId)} to ${getCityName(editingRate.destinationCityId)}.`
                : "Set the current ground market rate (ደላላ መነሻ ዋጋ) for a specific route and measurement unit."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5 py-2">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="originCityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Origin City *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!!editingRate}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Origin..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cities.map((c: any) => (
                            <SelectItem key={c.id} value={c.id} className="text-xs">
                              {c.nameEn} ({c.nameAm})
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
                  name="destinationCityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Destination City *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!!editingRate}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Destination..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cities.map((c: any) => (
                            <SelectItem key={c.id} value={c.id} className="text-xs">
                              {c.nameEn} ({c.nameAm})
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
                name="pricingUnitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Pricing Unit *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!!editingRate}
                    >
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

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="minRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Min Rate (ETB) *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 50.00" className="h-9 text-xs font-mono" {...field} />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Max Rate (ETB) *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 65.00" className="h-9 text-xs font-mono" {...field} />
                      </FormControl>
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
                  ) : editingRate ? (
                    "Update Rate"
                  ) : (
                    "Save Benchmark Rate"
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
              <TableHead className="font-semibold text-xs">Route</TableHead>
              <TableHead className="font-semibold text-xs">Unit</TableHead>
              <TableHead className="font-semibold text-xs text-right">Ground Tariff</TableHead>
              <TableHead className="font-semibold text-xs text-center">Status</TableHead>
              <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <IconLoader2 className="h-4 w-4 animate-spin text-blue-600" />
                    Loading regional benchmark tariffs...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredRates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-xs">
                  {searchTerm ? "No matching benchmark rates found." : "No benchmark rates set. Click 'Add Benchmark Rate' to create one."}
                </TableCell>
              </TableRow>
            ) : (
              filteredRates.map((rate: any) => (
                <TableRow key={rate.id} className="hover:bg-gray-50/50">
                  <TableCell>
                    <div className="flex items-center gap-1.5 font-medium text-xs text-gray-900">
                      <span>{getCityName(rate.originCityId)}</span>
                      <IconArrowRight className="h-3 w-3 text-gray-400" />
                      <span>{getCityName(rate.destinationCityId)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[11px] bg-slate-50 text-slate-800 border-slate-300">
                      {getUnitCode(rate.pricingUnitId)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-mono text-xs text-emerald-700 font-semibold">
                      {parseFloat(rate.minRate).toLocaleString()} – {parseFloat(rate.maxRate).toLocaleString()} ETB
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {rate.isActive ? (
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
                        onClick={() => handleOpenEdit(rate)}
                        className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                        title="Edit Market Rate"
                      >
                        <IconEdit className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant={rate.isActive ? "ghost" : "outline"}
                        size="sm"
                        onClick={() => toggleMutation.mutate({ id: rate.id, isActive: !rate.isActive })}
                        disabled={toggleMutation.isPending}
                        className={`h-7 px-2 text-[11px] cursor-pointer ${
                          rate.isActive
                            ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {rate.isActive ? "Deactivate" : "Activate"}
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
