"use client";

import { useState, useMemo, useEffect } from "react";
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
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  IconMapPin,
  IconShieldCheck,
  IconBolt,
  IconTruck,
} from "@tabler/icons-react";

const rateFormSchema = z.object({
  originCityId: z.string().min(1, "Origin city is required"),
  destinationCityId: z.string().min(1, "Destination city is required"),
  pricingUnitId: z.string().min(1, "Pricing unit is required"),
  truckTypeId: z.string().optional(),
  baseRate: z.string().min(1, "Base benchmark rate is required"),
  marketCondition: z.enum(["NORMAL", "HIGH_DEMAND", "POOR_ROAD"]),
  isFixedPrice: z.boolean(),
  notes: z.string().optional(),
});

type RateFormValues = z.infer<typeof rateFormSchema>;

export function DigitalDelalaTab() {
  const [open, setOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [addCityOpen, setAddCityOpen] = useState(false);
  const [newCityNameEn, setNewCityNameEn] = useState("");
  const [newCityNameAm, setNewCityNameAm] = useState("");
  const [newCityNameOm, setNewCityNameOm] = useState("");
  const [newCityRegion, setNewCityRegion] = useState("Oromia");
  const [creatingCity, setCreatingCity] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<RateFormValues>({
    resolver: zodResolver(rateFormSchema),
    defaultValues: {
      originCityId: "",
      destinationCityId: "",
      pricingUnitId: "",
      truckTypeId: "ALL",
      baseRate: "",
      marketCondition: "NORMAL",
      isFixedPrice: true,
      notes: "",
    },
  });

  // Watch baseRate, marketCondition, and isFixedPrice for live preview
  const watchedBaseRate = form.watch("baseRate");
  const watchedCondition = form.watch("marketCondition");
  const watchedIsFixed = form.watch("isFixedPrice");
  const watchedOriginCityId = form.watch("originCityId");

  const calculatedPreview = useMemo(() => {
    const base = parseFloat(watchedBaseRate);
    if (isNaN(base) || base <= 0) return null;

    if (watchedIsFixed) {
      return {
        min: base.toFixed(2),
        max: base.toFixed(2),
        isFixed: true,
      };
    }

    let minMult = 0.90;
    let maxMult = 1.15;
    if (watchedCondition === "HIGH_DEMAND") {
      minMult = 0.95;
      maxMult = 1.25;
    } else if (watchedCondition === "POOR_ROAD") {
      minMult = 1.00;
      maxMult = 1.30;
    }

    return {
      min: (Math.round(base * minMult * 100) / 100).toFixed(2),
      max: (Math.round(base * maxMult * 100) / 100).toFixed(2),
      isFixed: false,
    };
  }, [watchedBaseRate, watchedCondition, watchedIsFixed]);

  // 1. Fetch manager's assigned territory / cities
  const { data: assignedData, isLoading: loadingAssigned } = useQuery({
    queryKey: ["manager", "assignedCities"],
    queryFn: async () => {
      const res = await (orpc as any).townManager.getMyAssignedCities();
      return res;
    },
    staleTime: 1000 * 60 * 5,
  });

  const assignedCities = useMemo(() => assignedData?.cities || [], [assignedData]);
  const isSuperAdmin = assignedData?.isAdmin ?? false;

  // 2. Fetch all active destination cities (public getCities with admin fallback)
  const { data: allCities = [], refetch: refetchCities } = useQuery({
    queryKey: ["masterData", "allCities"],
    queryFn: async () => {
      try {
        const res = await (orpc as any).masterData.getCities();
        if (res?.data && res.data.length > 0) return res.data;
      } catch (e) {}
      const res = await (orpc as any).admin.masterData.listCities();
      return (res?.data || []).filter((c: any) => c.isActive);
    },
  });

  // Filter available destination cities so origin is not duplicated
  const availableDestinations = useMemo(() => {
    return allCities.filter((c: any) => c.id !== watchedOriginCityId);
  }, [allCities, watchedOriginCityId]);

  // 3. Fetch pricing units (public getUnits with admin fallback)
  const { data: units = [], refetch: refetchUnits } = useQuery({
    queryKey: ["masterData", "units"],
    queryFn: async () => {
      try {
        const res = await (orpc as any).masterData.getUnits();
        if (res?.data && res.data.length > 0) return res.data;
      } catch (e) {}
      const res = await (orpc as any).admin.masterData.listUnits();
      return (res?.data || []).filter((u: any) => u.isActive);
    },
  });

  // 3b. Fetch active truck types (public getTrucks with admin fallback)
  const { data: truckTypes = [], refetch: refetchTrucks } = useQuery({
    queryKey: ["masterData", "trucks"],
    queryFn: async () => {
      try {
        const res = await (orpc as any).masterData.getTrucks();
        if (res?.data && res.data.length > 0) return res.data;
      } catch (e) {}
      const res = await (orpc as any).admin.masterData.listTrucks();
      return (res?.data || []).filter((t: any) => t.isActive);
    },
  });

  // 4. Fetch market rates for manager's assigned jurisdiction
  const {
    data: ratesData,
    isLoading: loadingRates,
    refetch: refetchRates,
  } = useQuery({
    queryKey: ["manager", "marketRates"],
    queryFn: async () => {
      const res = await (orpc as any).townManager.listMarketRates();
      return res?.rates || [];
    },
  });

  const rates: any[] = ratesData || [];

  // When opening modal: auto-select origin city and pricing unit
  useEffect(() => {
    if (open && !editingRate) {
      if (assignedCities.length > 0 && !form.getValues("originCityId")) {
        form.setValue("originCityId", assignedCities[0].id);
      }
      if (units.length > 0 && !form.getValues("pricingUnitId")) {
        form.setValue("pricingUnitId", units[0].id);
      }
    }
  }, [open, assignedCities, units, editingRate, form]);

  // Quick Add City Handler
  const handleQuickCreateCity = async () => {
    if (!newCityNameEn.trim()) {
      toast.error("Please enter the city name in English");
      return;
    }
    setCreatingCity(true);
    try {
      const res = await (orpc as any).admin.masterData.createCity({
        nameEn: newCityNameEn.trim(),
        nameAm: newCityNameAm.trim() || newCityNameEn.trim(),
        nameOm: newCityNameOm.trim() || newCityNameEn.trim(),
        region: newCityRegion.trim() || "Oromia",
      });
      if (res?.success && res.id) {
        toast.success(`City '${newCityNameEn}' added successfully!`);
        await queryClient.invalidateQueries({ queryKey: ["masterData", "allCities"] });
        await queryClient.invalidateQueries({ queryKey: ["masterData", "cities"] });
        form.setValue("destinationCityId", res.id);
        setNewCityNameEn("");
        setNewCityNameAm("");
        setNewCityNameOm("");
        setAddCityOpen(false);
      } else {
        toast.error(res?.message || "Failed to create city");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to create city");
    } finally {
      setCreatingCity(false);
    }
  };

  // Mutation to save/publish market rate
  const saveMutation = useMutation({
    mutationFn: async (values: RateFormValues) => {
      return await (orpc as any).townManager.setMarketRate({
        originCityId: values.originCityId,
        destinationCityId: values.destinationCityId,
        pricingUnitId: values.pricingUnitId,
        truckTypeId: values.truckTypeId && values.truckTypeId !== "ALL" ? values.truckTypeId : null,
        baseRate: parseFloat(values.baseRate),
        marketCondition: values.marketCondition,
        isFixedPrice: values.isFixedPrice,
        notes: values.notes || undefined,
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["manager", "marketRates"] });
      toast.success(
        data?.action === "updated"
          ? "Market benchmark rate updated successfully!"
          : "New benchmark rate published successfully!"
      );
      handleCloseDialog();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to set market benchmark rate.");
    },
  });

  // Toggle status mutation
  const toggleMutation = useMutation({
    mutationFn: async (rateId: string) => {
      return await (orpc as any).townManager.toggleMarketRateStatus({ id: rateId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager", "marketRates"] });
      toast.success("Rate status updated.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to toggle status.");
    },
  });

  // 1-Click Toggle between Fixed Constant Price and Dynamic Market Band
  const toggleFixedPriceMutation = useMutation({
    mutationFn: async (rateId: string) => {
      return await (orpc as any).townManager.toggleFixedPriceMode({ id: rateId });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["manager", "marketRates"] });
      toast.success(
        data?.isFixedPrice
          ? "Switched to Guaranteed Constant Price (ቋሚ ዋጋ) mode."
          : "Switched to Flexible Market Band (ተለዋዋጭ ክልል) mode."
      );
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to toggle pricing mode.");
    },
  });

  const handleOpenCreate = () => {
    setEditingRate(null);
    form.reset({
      originCityId: assignedCities.length > 0 ? assignedCities[0].id : "",
      destinationCityId: "",
      pricingUnitId: units.length > 0 ? units[0].id : "",
      truckTypeId: "ALL",
      baseRate: "",
      marketCondition: "NORMAL",
      isFixedPrice: true,
      notes: "",
    });
    setOpen(true);
  };

  const handleEdit = (rate: any) => {
    setEditingRate(rate);
    form.reset({
      originCityId: rate.originCityId,
      destinationCityId: rate.destinationCityId,
      pricingUnitId: rate.pricingUnitId,
      truckTypeId: rate.truckTypeId || "ALL",
      baseRate: rate.baseRate?.toString() || rate.minRate?.toString() || "",
      marketCondition: rate.marketCondition || "NORMAL",
      isFixedPrice: rate.isFixedPrice ?? true,
      notes: rate.notes || "",
    });
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingRate(null);
    form.reset();
  };

  const onSubmit = (values: RateFormValues) => {
    if (!values.originCityId) {
      toast.error("Please select an origin city in your jurisdiction.");
      return;
    }
    if (!values.destinationCityId) {
      toast.error("Please select a destination city.");
      return;
    }
    if (values.originCityId === values.destinationCityId) {
      toast.error("Origin and Destination cannot be the same city.");
      return;
    }
    if (!values.pricingUnitId) {
      toast.error("Please select a pricing unit (e.g. Quintal, Ton, Head Count).");
      return;
    }
    const rateNum = parseFloat(values.baseRate);
    if (isNaN(rateNum) || rateNum <= 0) {
      toast.error("Please enter a valid positive base benchmark rate in ETB.");
      return;
    }
    saveMutation.mutate(values);
  };

  const onFormError = (errors: any) => {
    console.error("Form validation errors:", errors);
    const keys = Object.keys(errors);
    if (keys.length > 0) {
      const firstError = errors[keys[0]];
      toast.error(firstError?.message || `Please provide: ${keys[0]}`);
    } else {
      toast.error("Please fill in all required fields.");
    }
  };

  // Filtered rates for display
  const filteredRates = useMemo(() => {
    if (!searchTerm) return rates;
    const term = searchTerm.toLowerCase();
    return rates.filter((r) =>
      r.originNameEn?.toLowerCase().includes(term) ||
      r.destNameEn?.toLowerCase().includes(term) ||
      r.truckNameEn?.toLowerCase().includes(term) ||
      r.truckNameAm?.toLowerCase().includes(term) ||
      r.unitCode?.toLowerCase().includes(term) ||
      r.notes?.toLowerCase().includes(term)
    );
  }, [rates, searchTerm]);

  const conditionBadge = (cond: string) => {
    switch (cond) {
      case "HIGH_DEMAND":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-medium">
            🔥 High Demand (ከፍተኛ ፍላጎት)
          </Badge>
        );
      case "POOR_ROAD":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300 font-medium">
            ⚠️ Poor Road (አስቸጋሪ መንገድ)
          </Badge>
        );
      default:
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-medium">
            ✅ Normal (መደበኛ)
          </Badge>
        );
    }
  };

  // Executive KPI summary stats
  const stats = useMemo(() => {
    const total = rates.length;
    const active = rates.filter((r) => r.isActive).length;
    const fixed = rates.filter((r) => r.isFixedPrice).length;
    const uniqueTrucks = new Set(rates.filter((r) => r.truckTypeId).map((r) => r.truckTypeId)).size;
    const fixedPercentage = total > 0 ? Math.round((fixed / total) * 100) : 0;
    return { total, active, fixed, uniqueTrucks, fixedPercentage };
  }, [rates]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-xl shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">
              Digital Delala & Market Benchmark Rates (የወቅቱ መነሻ ዋጋ)
            </h1>
            <Badge variant="outline" className="text-blue-200 border-blue-400 bg-blue-950/50">
              Tier 1 Ground Authority
            </Badge>
          </div>
          <p className="text-xs text-blue-200 mt-1 max-w-2xl">
            You hold pricing authority for freight loads originating from your assigned territory. Benchmark rates directly guide shippers and optimize fair matching.
          </p>

          {/* Assigned Territory Badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-blue-300 font-medium flex items-center gap-1">
              <IconMapPin className="h-3.5 w-3.5 text-blue-400" />
              Your Jurisdiction:
            </span>
            {loadingAssigned ? (
              <span className="text-xs text-blue-200 italic">Loading assigned areas...</span>
            ) : assignedCities.length > 0 ? (
              assignedCities.map((c: any) => (
                <Badge
                  key={c.id}
                  className="bg-blue-600/60 hover:bg-blue-600 text-white border-blue-400/50 text-xs py-0.5"
                >
                  {c.nameEn} ({c.nameAm})
                </Badge>
              ))
            ) : isSuperAdmin ? (
              <Badge className="bg-purple-600 text-white text-xs">Platform Super-Admin (All Areas)</Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                No territory assigned yet. Contact Super-Admin.
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={handleOpenCreate}
            disabled={assignedCities.length === 0 && !isSuperAdmin}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-sm gap-1.5"
          >
            <IconPlus className="h-4 w-4" />
            Set Benchmark Rate (አዲስ መነሻ ዋጋ)
          </Button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Published Corridors (ንቁ መስመሮች)
            </CardTitle>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <IconMapPin className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.active} <span className="text-xs font-normal text-muted-foreground">/ {stats.total} total</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Active freight corridors under your ground jurisdiction
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Fleet Classes Covered (የመኪና ዓይነቶች)
            </CardTitle>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <IconTruck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {stats.uniqueTrucks} <span className="text-xs font-normal text-muted-foreground">types</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Vehicle-specific tariffs (Isuzu, FSR, Sino, Trailer)
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Fixed Tariff Coverage (የቋሚ ዋጋ ሽፋን)
            </CardTitle>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <IconBolt className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {stats.fixedPercentage}% <span className="text-xs font-normal text-muted-foreground">({stats.fixed} routes)</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Instant-book constant fares avoiding bidding delays
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-80">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by destination city, unit, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await Promise.all([
                refetchRates(),
                refetchTrucks(),
                refetchCities(),
                refetchUnits(),
              ]);
              toast.success("Corridors & Vehicle types synchronized.");
            }}
            className="gap-1 text-xs h-9"
          >
            <IconRefresh className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Rates Table with Horizontal Scroll Safe Container */}
      <Card className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[1050px]">
          <TableHeader className="bg-gray-50/80">
            <TableRow>
              <TableHead className="font-semibold text-gray-900">Origin City (Jurisdiction)</TableHead>
              <TableHead className="font-semibold text-gray-900">Destination</TableHead>
              <TableHead className="font-semibold text-gray-900">Vehicle Type (የመኪና አይነት)</TableHead>
              <TableHead className="font-semibold text-gray-900">Pricing Unit</TableHead>
              <TableHead className="font-semibold text-gray-900">Pricing Mode (ስልት)</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Base Benchmark Rate</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Calculated Range / Fare</TableHead>
              <TableHead className="font-semibold text-gray-900">Market Condition</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingRates ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10">
                  <IconLoader2 className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
                  <p className="text-sm text-gray-500">Loading benchmark rates for your territory...</p>
                </TableCell>
              </TableRow>
            ) : filteredRates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12">
                  <IconChartBar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-base font-semibold text-gray-700">No benchmark rates set yet</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Publish benchmark rates for your origin cities so shippers get verified price guidance during booking.
                  </p>
                  <Button
                    onClick={handleOpenCreate}
                    variant="outline"
                    size="sm"
                    className="mt-4 gap-1.5"
                    disabled={assignedCities.length === 0 && !isSuperAdmin}
                  >
                    <IconPlus className="h-3.5 w-3.5" />
                    Set First Rate
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              filteredRates.map((rate) => (
                <TableRow key={rate.id} className="hover:bg-gray-50/60 transition-colors">
                  <TableCell className="font-semibold text-gray-900">
                    <div className="flex items-center gap-1.5">
                      <IconShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                      <div>
                        <span>{rate.originNameEn}</span>
                        <span className="text-xs text-gray-500 block">{rate.originNameAm}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <IconArrowRight className="h-3.5 w-3.5 text-gray-400" />
                      <div>
                        <span className="font-medium text-gray-800">{rate.destNameEn}</span>
                        <span className="text-xs text-gray-500 block">{rate.destNameAm}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {rate.truckNameEn ? (
                      <div className="flex items-center gap-1.5">
                        <IconTruck className="h-4 w-4 text-indigo-600 shrink-0" />
                        <div>
                          <span className="font-medium text-xs text-gray-800">{rate.truckNameEn}</span>
                          <span className="text-[11px] text-gray-500 block">
                            {rate.truckNameAm} {rate.truckCapacity ? `(${parseFloat(rate.truckCapacity)} QTL)` : ""}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-[11px] text-gray-600 border-gray-300 bg-gray-50">
                        All Trucks (አጠቃላይ)
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs bg-slate-50">
                      {rate.unitCode} ({rate.unitNameEn})
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => toggleFixedPriceMutation.mutate(rate.id)}
                      disabled={toggleFixedPriceMutation.isPending}
                      className="cursor-pointer transition-transform active:scale-95 text-left"
                      title="Click to toggle between Constant Fixed Price (ቋሚ ዋጋ) and Flexible Market Band"
                    >
                      {rate.isFixedPrice ? (
                        <Badge className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300 gap-1 text-xs py-0.5 font-medium shadow-none">
                          <IconBolt className="h-3 w-3 text-emerald-600" />
                          ቋሚ ዋጋ (Fixed)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 gap-1 text-xs py-0.5 font-medium shadow-none">
                          <IconChartBar className="h-3 w-3 text-blue-600" />
                          የገበያ ክልል (Band)
                        </Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="text-right font-bold text-gray-900">
                    {parseFloat(rate.baseRate || rate.minRate).toLocaleString()} ETB
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-gray-600">
                    {rate.isFixedPrice ? (
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {parseFloat(rate.baseRate || rate.minRate).toLocaleString()} ETB (Constant)
                      </span>
                    ) : (
                      <span>
                        {parseFloat(rate.minRate).toLocaleString()} - {parseFloat(rate.maxRate).toLocaleString()} ETB
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{conditionBadge(rate.marketCondition)}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => toggleMutation.mutate(rate.id)}
                      className="cursor-pointer"
                      title="Click to toggle status"
                    >
                      {rate.isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 text-xs py-0.5">
                          <IconCheck className="h-3 w-3" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-gray-500 gap-1 text-xs py-0.5">
                          <IconBan className="h-3 w-3" /> Inactive
                        </Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(rate)}
                      className="h-8 w-8 p-0"
                      title="Edit rate"
                    >
                      <IconEdit className="h-4 w-4 text-gray-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </Card>

      {/* Modal: Publish or Edit Rate */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <IconChartBar className="h-5 w-5 text-blue-600" />
              {editingRate ? "Update Benchmark Rate" : "Publish Benchmark Rate (የወቅቱ መነሻ ዋጋ)"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Town Managers strictly control rates originating from their assigned jurisdiction.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-4">
              {/* Origin City (Restricted) */}
              <FormField
                control={form.control as any}
                name="originCityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>Origin City (መነሻ ከተማ - Your Territory)</span>
                      {assignedCities.length === 1 && !isSuperAdmin && (
                        <span className="text-[11px] text-blue-600 font-medium">Locked to your jurisdiction</span>
                      )}
                    </FormLabel>
                    <Select
                      disabled={assignedCities.length === 1 && !isSuperAdmin}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select origin city in your area..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assignedCities.map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nameEn} - {c.nameAm} ({c.region})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Destination City */}
              <FormField
                control={form.control as any}
                name="destinationCityId"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Destination City (መድረሻ ከተማ)</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setAddCityOpen(true)}
                        className="h-6 px-1.5 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                      >
                        <IconPlus className="h-3 w-3" />
                        Add New City
                      </Button>
                    </div>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select destination city in Ethiopia..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-56">
                        {availableDestinations.length > 0 ? (
                          availableDestinations.map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.nameEn} {c.nameAm ? `- ${c.nameAm}` : ""} {c.region ? `(${c.region})` : ""}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-xs text-gray-500">
                            No other cities found. Click &quot;Add New City&quot; above.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Truck Type Selection */}
              <FormField
                control={form.control as any}
                name="truckTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <IconTruck className="h-4 w-4 text-indigo-600" />
                      <span>Truck Type (የመኪና አይነት)</span>
                    </FormLabel>
                    <Select value={field.value || "ALL"} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select vehicle type or General corridor..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-56">
                        <SelectItem value="ALL">
                          🚛 All Trucks / General Corridor (አጠቃላይ የተሽከርካሪ ዓይነት)
                        </SelectItem>
                        {truckTypes.map((t: any) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.nameEn} - {t.nameAm} ({parseFloat(t.maxCapacity || "0")} {t.unit?.unitCode || "QTL"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-[11px] text-gray-500">
                      Set vehicle-specific pricing (e.g. Isuzu vs FSR vs Sino Truck vs Trailer) or leave as General corridor benchmark.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pricing Mode Toggle: Constant vs Flexible */}
              <FormField
                control={form.control as any}
                name="isFixedPrice"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-gray-50/70">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-semibold flex items-center gap-1.5 text-gray-900 cursor-pointer">
                        <IconBolt className="h-4 w-4 text-emerald-600" />
                        <span>Constant Fixed Price Mode (ቋሚ ዋጋ)</span>
                      </FormLabel>
                      <FormDescription className="text-xs text-gray-500">
                        {field.value
                          ? "ON: Instant Book flat rate. Drivers accept at exact base price without bidding."
                          : "OFF: Flexible Bidding. System creates a safe corridor based on market condition."}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                {/* Pricing Unit */}
                <FormField
                  control={form.control as any}
                  name="pricingUnitId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pricing Unit (መለኪያ)</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.map((u: any) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.unitCode} - {u.nameEn} ({u.nameAm})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Base Rate */}
                <FormField
                  control={form.control as any}
                  name="baseRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {watchedIsFixed ? "Fixed Tariff (ቋሚ ዋጋ ETB)" : "Base Rate (የወቅቱ መነሻ ETB)"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="e.g. 60000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Market Condition (Only shown if Flexible Band mode is selected) */}
              {!watchedIsFixed && (
                <FormField
                  control={form.control as any}
                  name="marketCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Market Road & Demand Condition (የገበያ/መንገድ ሁኔታ)</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NORMAL">
                            🟢 NORMAL (መደበኛ - Standard seasonal rate)
                          </SelectItem>
                          <SelectItem value="HIGH_DEMAND">
                            🔥 HIGH_DEMAND (ከፍተኛ ፍላጎት - Harvest peak / truck scarcity)
                          </SelectItem>
                          <SelectItem value="POOR_ROAD">
                            ⚠️ POOR_ROAD (አስቸጋሪ መንገድ - Rainy season / unpaved terrain)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Live Preview Box */}
              {calculatedPreview && (
                <div
                  className={`p-3 rounded-lg text-xs space-y-1.5 border transition-all ${
                    watchedIsFixed
                      ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                      : "bg-blue-50/80 border-blue-200 text-blue-950"
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1.5">
                      {watchedIsFixed ? (
                        <>
                          <IconBolt className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Instant Fixed Tariff Preview:</span>
                        </>
                      ) : (
                        <>
                          <IconChartBar className="h-3.5 w-3.5 text-blue-600" />
                          <span>Automated Market Range Preview:</span>
                        </>
                      )}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        watchedIsFixed
                          ? "bg-white text-emerald-800 border-emerald-300 font-medium"
                          : "bg-white text-blue-800 border-blue-300 font-medium"
                      }
                    >
                      {watchedIsFixed ? "⚡ Constant ቋሚ ዋጋ" : "Auto-Calculated Band"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span>{watchedIsFixed ? "Guaranteed Job Fare:" : "Suggested Driver Corridor:"}</span>
                    <span className="font-mono font-bold text-sm">
                      {watchedIsFixed
                        ? `${calculatedPreview.min} ETB (Flat Rate)`
                        : `${calculatedPreview.min} ETB - ${calculatedPreview.max} ETB`}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80 italic">
                    {watchedIsFixed
                      ? "Drivers accept jobs instantly at this exact price. No negotiation delays or bidding."
                      : "Corridor enforces anti-gouging and fair-wage floors while allowing driver bidding."}
                  </p>
                </div>
              )}

              {/* Notes */}
              <FormField
                control={form.control as any}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Notes & Operational Guidance (ማስታወሻ)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Includes loading buffer, seasonal coffee transport rate..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {saveMutation.isPending ? (
                    <>
                      <IconLoader2 className="h-4 w-4 animate-spin mr-1.5" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Benchmark Rate"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Mini-Dialog: Quick Add New Destination City */}
      <Dialog open={addCityOpen} onOpenChange={setAddCityOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <IconMapPin className="h-4 w-4 text-emerald-600" />
              Add New Destination City (አዲስ መድረሻ ከተማ)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add a new Ethiopian destination city to set corridor benchmark rates.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-semibold text-gray-700">City Name (English) *</label>
              <Input
                placeholder="e.g. Bedele, Shambu, Gimbi, Dembi Dolo"
                value={newCityNameEn}
                onChange={(e) => setNewCityNameEn(e.target.value)}
                className="h-9 text-xs mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-gray-700">Name (አማርኛ)</label>
                <Input
                  placeholder="e.g. በደሌ"
                  value={newCityNameAm}
                  onChange={(e) => setNewCityNameAm(e.target.value)}
                  className="h-9 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Name (Afaan Oromoo)</label>
                <Input
                  placeholder="e.g. Baddallee"
                  value={newCityNameOm}
                  onChange={(e) => setNewCityNameOm(e.target.value)}
                  className="h-9 text-xs mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Region</label>
              <Input
                placeholder="e.g. Oromia, Amhara, Sidama, Somali"
                value={newCityRegion}
                onChange={(e) => setNewCityRegion(e.target.value)}
                className="h-9 text-xs mt-1"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddCityOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleQuickCreateCity}
              disabled={creatingCity || !newCityNameEn.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              {creatingCity ? (
                <>
                  <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <IconPlus className="h-3.5 w-3.5" />
                  Save & Select Destination
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default DigitalDelalaTab;
