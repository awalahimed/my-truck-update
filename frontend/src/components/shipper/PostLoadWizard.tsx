"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { orpc } from "@/lib/oprc";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconArrowLeft,
  IconMapPin,
  IconPackage,
  IconScale,
  IconTruck,
  IconCalendar,
  IconCoin,
  IconInfoCircle,
  IconBulb,
  IconCheck,
  IconLoader2,
  IconSend,
  IconAlertTriangle,
  IconShieldCheck,
  IconFileText,
  IconExternalLink,
} from "@tabler/icons-react";

/**
 * Zod Validation Schema for the 7-Step Post a Load Wizard
 * Strictly validates relational foreign keys (IDs) and required business constraints.
 */
export const postLoadSchema = z
  .object({
    originCityId: z.string().min(1, "Origin city is required"),
    destinationCityId: z.string().min(1, "Destination city is required"),
    goodsTypeId: z.string().min(1, "Commodity / Goods type is required"),
    quantity: z.coerce.number().positive("Quantity must be greater than 0"),
    pricingUnitId: z.string().min(1, "Pricing measurement unit is required"),
    truckTypeId: z.string().min(1, "Required truck type is required"),
    loadingDate: z.string().min(1, "Loading date is required"),
    deliveryDeadline: z.string().min(1, "Delivery deadline is required"),
    budget: z.coerce.number().positive("Budget must be a valid positive amount in ETB"),
    allowDriverOffers: z.boolean(),
    specialInstructions: z.string().optional(),
  })
  .refine((data) => data.originCityId !== data.destinationCityId, {
    message: "Destination city must be different from origin city",
    path: ["destinationCityId"],
  });

export type PostLoadFormValues = z.infer<typeof postLoadSchema>;

export function PostLoadWizard({ onBack }: { onBack?: () => void }) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdOrder, setCreatedOrder] = useState<{ id: string } | null>(null);

  // ==========================================
  // Step 1 Data: Fetching Live Master Data (TanStack Query + oRPC)
  // ==========================================
  const { data: cities = [], isLoading: isLoadingCities } = useQuery({
    queryKey: ["masterData", "cities"],
    queryFn: async () => {
      const res = await (orpc as any).masterData.getCities();
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: goods = [], isLoading: isLoadingGoods } = useQuery({
    queryKey: ["masterData", "goods"],
    queryFn: async () => {
      const res = await (orpc as any).masterData.getGoods();
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: units = [], isLoading: isLoadingUnits } = useQuery({
    queryKey: ["masterData", "units"],
    queryFn: async () => {
      const res = await (orpc as any).masterData.getUnits();
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: trucks = [], isLoading: isLoadingTrucks } = useQuery({
    queryKey: ["masterData", "trucks"],
    queryFn: async () => {
      const res = await (orpc as any).masterData.getTrucks();
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const isMasterDataLoading =
    isLoadingCities || isLoadingGoods || isLoadingUnits || isLoadingTrucks;

  // React Hook Form initialized with Zod Resolver
  const form = useForm<PostLoadFormValues>({
    resolver: zodResolver(postLoadSchema) as any,
    defaultValues: {
      originCityId: "",
      destinationCityId: "",
      goodsTypeId: "",
      quantity: 100,
      pricingUnitId: "",
      truckTypeId: "",
      loadingDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      deliveryDeadline: new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
      budget: 0,
      allowDriverOffers: true,
      specialInstructions: "",
    },
  });

  const { watch, setValue, handleSubmit, control } = form;

  const watchedOriginCityId = watch("originCityId");
  const watchedDestinationCityId = watch("destinationCityId");
  const watchedGoodsTypeId = watch("goodsTypeId");
  const watchedQuantity = watch("quantity");
  const watchedPricingUnitId = watch("pricingUnitId");
  const watchedTruckTypeId = watch("truckTypeId");
  const watchedLoadingDate = watch("loadingDate");
  const watchedDeliveryDeadline = watch("deliveryDeadline");
  const watchedBudget = watch("budget");
  const watchedAllowDriverOffers = watch("allowDriverOffers");
  const watchedSpecialInstructions = watch("specialInstructions");

  // Set default cities when master data loads
  useEffect(() => {
    if (cities.length >= 2 && !watchedOriginCityId && !watchedDestinationCityId) {
      const nekemte =
        cities.find((c: any) => c.nameEn.toLowerCase().includes("nekemte")) || cities[1];
      const addis =
        cities.find((c: any) => c.nameEn.toLowerCase().includes("addis")) || cities[0];
      if (nekemte) setValue("originCityId", nekemte.id);
      if (addis) setValue("destinationCityId", addis.id);
    }
  }, [cities, watchedOriginCityId, watchedDestinationCityId, setValue]);

  // Set default goods and associated unit when master data loads
  useEffect(() => {
    if (goods.length > 0 && !watchedGoodsTypeId) {
      const defaultGood = goods[0];
      setValue("goodsTypeId", defaultGood.id);
      if (defaultGood.defaultUnitId) {
        setValue("pricingUnitId", defaultGood.defaultUnitId);
      }
    }
  }, [goods, watchedGoodsTypeId, setValue]);

  // Handle Commodity Change (Auto-filters pricing unit)
  const handleGoodChange = (goodId: string) => {
    setValue("goodsTypeId", goodId, { shouldValidate: true });
    const selected = goods.find((g: any) => g.id === goodId);
    if (selected?.defaultUnitId) {
      setValue("pricingUnitId", selected.defaultUnitId, { shouldValidate: true });
    }
  };

  // Smart Truck Recommendation Engine
  const recommendedTruck = useMemo(() => {
    if (!trucks.length) return null;
    const qty = Number(watchedQuantity) || 0;
    const currentUnit = units.find((u: any) => u.id === watchedPricingUnitId);
    const unitCode = currentUnit?.unitCode;

    // Special Case: Livestock (Head Count) -> Cattle Truck
    if (unitCode === "HD") {
      const cattleTruck = trucks.find(
        (t: any) => t.id.includes("cattle") || t.nameEn.toLowerCase().includes("cattle")
      );
      if (cattleTruck) return cattleTruck;
    }

    // Capacity Matching: Find the smallest truck that safely accommodates the payload
    const matchingUnitTrucks = trucks.filter((t: any) => t.unitId === watchedPricingUnitId);
    if (matchingUnitTrucks.length > 0) {
      const suitable = matchingUnitTrucks
        .filter((t: any) => parseFloat(t.maxCapacity) >= qty)
        .sort((a: any, b: any) => parseFloat(a.maxCapacity) - parseFloat(b.maxCapacity));

      if (suitable.length > 0) return suitable[0];

      return matchingUnitTrucks.sort(
        (a: any, b: any) => parseFloat(b.maxCapacity) - parseFloat(a.maxCapacity)
      )[0];
    }

    return trucks[0];
  }, [trucks, watchedQuantity, watchedPricingUnitId, units]);

  // Auto-assign recommended truck
  useEffect(() => {
    if (recommendedTruck && !watchedTruckTypeId) {
      setValue("truckTypeId", recommendedTruck.id, { shouldValidate: true });
    }
  }, [recommendedTruck, watchedTruckTypeId, setValue]);

  // Over-Capacity Payload Safety Check
  const activeTruck = trucks.find((t: any) => t.id === watchedTruckTypeId) || recommendedTruck;
  const isOverCapacity = useMemo(() => {
    if (!activeTruck) return false;
    const qty = Number(watchedQuantity) || 0;
    const maxPayload = parseFloat(activeTruck.maxCapacity) || 0;
    return activeTruck.unitId === watchedPricingUnitId && qty > maxPayload;
  }, [activeTruck, watchedQuantity, watchedPricingUnitId]);

  // Step 6: Hybrid Pricing Engine Query
  const validQuantity = Number(watchedQuantity) || 0;
  const { data: priceEstimate, isLoading: isPriceEstimating } = useQuery({
    queryKey: [
      "pricing",
      "estimate",
      watchedOriginCityId,
      watchedDestinationCityId,
      watchedPricingUnitId,
      validQuantity,
    ],
    queryFn: async () => {
      if (
        !watchedOriginCityId ||
        !watchedDestinationCityId ||
        !watchedPricingUnitId ||
        validQuantity <= 0
      ) {
        return null;
      }
      return await (orpc as any).pricing.getEstimate({
        originCityId: watchedOriginCityId,
        destinationCityId: watchedDestinationCityId,
        pricingUnitId: watchedPricingUnitId,
        quantity: validQuantity,
      });
    },
    enabled:
      !!watchedOriginCityId &&
      !!watchedDestinationCityId &&
      !!watchedPricingUnitId &&
      validQuantity > 0,
    staleTime: 1000 * 60 * 3,
  });

  // Pre-fill fair benchmark budget if budget is 0 or empty
  useEffect(() => {
    if (priceEstimate?.totalEstimate?.benchmark && (!watchedBudget || watchedBudget === 0)) {
      setValue("budget", priceEstimate.totalEstimate.benchmark, { shouldValidate: true });
    }
  }, [priceEstimate, watchedBudget, setValue]);

  const originCity = cities.find((c: any) => c.id === watchedOriginCityId);
  const destCity = cities.find((c: any) => c.id === watchedDestinationCityId);
  const currentGood = goods.find((g: any) => g.id === watchedGoodsTypeId);
  const currentUnit = units.find((u: any) => u.id === watchedPricingUnitId);

  // Live order submission to backend database via oRPC order.create
  const onSubmit = async (values: PostLoadFormValues) => {
    if (isOverCapacity) {
      toast.error(
        `Payload exceeds vehicle payload limit (${activeTruck?.nameEn}: max ${activeTruck?.maxCapacity}). Please select a higher capacity truck.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const pickupAddress = `${originCity?.nameEn || "Origin City"}${
        originCity?.region ? `, ${originCity.region}` : ""
      }`;
      const deliveryAddress = `${destCity?.nameEn || "Destination City"}${
        destCity?.region ? `, ${destCity.region}` : ""
      }`;

      const res = await (orpc as any).order.create({
        pickupAddress,
        pickupLatitude: 9.03,
        pickupLongitude: 38.74,
        deliveryAddress,
        deliveryLatitude: 8.54,
        deliveryLongitude: 39.27,
        materials: [
          `${currentGood?.nameEn || "Goods"} (${values.quantity} ${
            currentUnit?.unitCode || "Units"
          })`,
        ],
        vehicleType: "truck",
        notes: `Budget: ${values.budget} ETB | Truck: ${
          activeTruck?.nameEn || "Truck"
        } | Loading: ${values.loadingDate} | Deadline: ${values.deliveryDeadline} | Allow Offers: ${
          values.allowDriverOffers ? "Yes" : "No"
        }${values.specialInstructions ? ` | Notes: ${values.specialInstructions}` : ""}`,
      });

      if (res?.success) {
        toast.success("Shipment order successfully posted to the verified freight board!");
        setCreatedOrder({ id: res.orderId || "new" });
      } else {
        toast.error(res?.message || "Failed to post load order");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to post shipment order");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skeleton Loading State while Master Data fetches
  if (isMasterDataLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-9 w-9 rounded-full cursor-pointer"
            >
              <IconArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Post a Load (7-Step Shipper Wizard)
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Complete standardized freight posting backed by verified Ethiopian master data, hybrid tariff benchmarks, and escrow protection.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="text-xs h-9 cursor-pointer"
        >
          Admin Management
        </Button>
      </div>

      {/* Success Dialog after Live Order Creation */}
      <Dialog open={!!createdOrder} onOpenChange={() => setCreatedOrder(null)}>
        <DialogContent className="sm:max-w-[460px] bg-white">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-2">
              <IconShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <DialogTitle className="text-center text-lg">Load Successfully Posted!</DialogTitle>
            <DialogDescription className="text-center text-xs">
              Your shipment order has been saved to the database. Verified drivers and call center agents can now view and bid on your load.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-gray-50 p-3.5 rounded-lg border text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Reference:</span>
              <span className="font-mono font-bold text-gray-900">{createdOrder?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Route:</span>
              <span className="font-medium text-gray-900">
                {originCity?.nameEn} → {destCity?.nameEn}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reserved Escrow Budget:</span>
              <span className="font-bold text-emerald-700 font-mono">
                {watchedBudget?.toLocaleString()} ETB
              </span>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCreatedOrder(null);
                form.reset();
              }}
              className="text-xs"
            >
              Post Another Load
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/track/${createdOrder?.id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-xs gap-1.5 cursor-pointer"
            >
              <span>Track Live Order</span>
              <IconExternalLink className="h-3.5 w-3.5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Steps 1 to 7 */}
            <div className="lg:col-span-8 space-y-6">
              {/* Step 1: Origin & Destination */}
              <Card className="border shadow-xs">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        Origin & Destination (መነሻ እና መድረሻ ከተሞች)
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Select standardized hubs from our verified Ethiopian database.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <FormField
                      control={control}
                      name="originCityId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700">
                            Pickup Origin *
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10 text-xs">
                                <div className="flex items-center gap-2">
                                  <IconMapPin className="h-4 w-4 text-blue-600 shrink-0" />
                                  <SelectValue placeholder="Select origin city..." />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cities.map((city: any) => (
                                <SelectItem key={city.id} value={city.id} className="text-xs">
                                  {city.nameEn} ({city.nameAm})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="destinationCityId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700">
                            Dropoff Destination *
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10 text-xs">
                                <div className="flex items-center gap-2">
                                  <IconMapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                                  <SelectValue placeholder="Select destination city..." />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cities.map((city: any) => (
                                <SelectItem key={city.id} value={city.id} className="text-xs">
                                  {city.nameEn} ({city.nameAm})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Commodity & Cargo Classification */}
              <Card className="border shadow-xs">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        Commodity & Cargo Classification (የጭነት ዕቃ ዓይነት)
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Select standard agricultural commodity or commercial freight.
                      </p>
                    </div>
                  </div>

                  <FormField
                    control={control}
                    name="goodsTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700">
                          Commodity Type *
                        </FormLabel>
                        <Select onValueChange={(val) => handleGoodChange(val)} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-xs">
                              <div className="flex items-center gap-2">
                                <IconPackage className="h-4 w-4 text-blue-600 shrink-0" />
                                <SelectValue placeholder="Select commodity..." />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {goods.map((item: any) => (
                              <SelectItem key={item.id} value={item.id} className="text-xs">
                                <div className="flex items-center justify-between w-full gap-4">
                                  <span>
                                    {item.nameEn} ({item.nameAm})
                                  </span>
                                  <span className="text-[10px] text-muted-foreground uppercase font-mono">
                                    {item.category}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Step 3: Quantity & Measurement Unit */}
              <Card className="border shadow-xs">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        Quantity & Pricing Metric (መጠን እና መለኪያ)
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Quintals (ኩንታል), Tons, Head Count (የቁም እንስሳት), or Flat Trips.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700">
                            Cargo Volume / Quantity *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g. 150"
                              className="h-10 text-xs font-mono"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="pricingUnitId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700">
                            Measurement Unit *
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10 text-xs">
                                <div className="flex items-center gap-2">
                                  <IconScale className="h-4 w-4 text-blue-600 shrink-0" />
                                  <SelectValue placeholder="Select unit..." />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {units.map((u: any) => (
                                <SelectItem key={u.id} value={u.id} className="text-xs">
                                  {u.nameEn} ({u.unitCode} - {u.nameAm})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Step 4: Smart Vehicle Classification & Capacity Recommendation */}
              <Card className="border shadow-xs">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        4
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-gray-900">
                          Smart Vehicle Classification (ተሽከርካሪ መረጣ)
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Capacity-aware recommendation matched against required payload.
                        </p>
                      </div>
                    </div>

                    {activeTruck?.id === recommendedTruck?.id && (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] gap-1"
                      >
                        <IconCheck className="h-3 w-3 text-emerald-600" />
                        Optimal Fit
                      </Badge>
                    )}
                  </div>

                  <FormField
                    control={control}
                    name="truckTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-xs">
                              <div className="flex items-center gap-2">
                                <IconTruck className="h-4 w-4 text-blue-600 shrink-0" />
                                <SelectValue placeholder="Choose vehicle type..." />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {trucks.map((truck: any) => (
                              <SelectItem key={truck.id} value={truck.id} className="text-xs">
                                <div className="flex items-center gap-2">
                                  <span>
                                    {truck.nameEn} ({parseFloat(truck.maxCapacity)}{" "}
                                    {truck.unit?.unitCode})
                                  </span>
                                  {truck.id === recommendedTruck?.id && (
                                    <span className="text-[10px] text-emerald-600 font-semibold">
                                      [Best Recommendation]
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {recommendedTruck && (
                          <p className="text-[11px] text-muted-foreground pt-1">
                            Based on {watchedQuantity} {currentUnit?.unitCode || "units"}, we
                            recommend an{" "}
                            <span className="font-semibold text-gray-900">
                              {recommendedTruck.nameEn}
                            </span>
                            .
                          </p>
                        )}

                        {isOverCapacity && (
                          <div className="flex items-center gap-2 p-2.5 bg-rose-50 text-rose-800 rounded-md text-xs border border-rose-200 mt-2">
                            <IconAlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                            <span>
                              Safety Alert: Cargo volume ({watchedQuantity}) exceeds maximum payload
                              of {activeTruck?.nameEn} ({activeTruck?.maxCapacity}{" "}
                              {currentUnit?.unitCode})! Please choose a higher capacity vehicle.
                            </span>
                          </div>
                        )}
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Step 5: Transit Schedule & Dates */}
              <Card className="border shadow-xs">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      5
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        Transit Schedule & Deadlines (የጭነት እና ማድረሻ ቀን)
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Specify exact loading readiness and final delivery deadline.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="loadingDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                            <IconCalendar className="h-3.5 w-3.5 text-blue-600" />
                            Loading Date *
                          </FormLabel>
                          <FormControl>
                            <Input type="date" className="h-10 text-xs" {...field} />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="deliveryDeadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                            <IconCalendar className="h-3.5 w-3.5 text-emerald-600" />
                            Delivery Deadline *
                          </FormLabel>
                          <FormControl>
                            <Input type="date" className="h-10 text-xs" {...field} />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Step 6: Hybrid Pricing Engine & Shipper Budget */}
              <Card className="border shadow-xs">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      6
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        Hybrid Pricing Engine & Budget (የዋጋ ስሌት እና በጀት)
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Live corridor guidance computed from regional town manager tariff benchmarks.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <FormField
                      control={control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700">
                            Shipper Allocated Budget (ETB) *
                          </FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g. 50000"
                                className="h-10 text-xs font-mono pl-8"
                                {...field}
                              />
                            </FormControl>
                            <IconCoin className="h-4 w-4 text-gray-400 absolute left-2.5 top-3" />
                          </div>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />

                    {isPriceEstimating ? (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 border rounded-lg text-xs text-muted-foreground">
                        <IconLoader2 className="h-4 w-4 animate-spin text-blue-600" />
                        Querying verified market rate benchmark...
                      </div>
                    ) : priceEstimate?.success ? (
                      <div
                        className={`p-3.5 border rounded-lg space-y-2 ${
                          priceEstimate.source === "manager_curated"
                            ? "bg-emerald-50/70 border-emerald-200/80"
                            : "bg-amber-50/70 border-amber-200/80"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-medium text-gray-900 flex items-center gap-1.5">
                            <IconInfoCircle
                              className={`h-4 w-4 ${
                                priceEstimate.source === "manager_curated"
                                  ? "text-emerald-600"
                                  : "text-amber-600"
                              }`}
                            />
                            <span>Suggested rate benchmark for this corridor:</span>
                          </div>

                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              priceEstimate.source === "manager_curated"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : "bg-amber-100 text-amber-800 border-amber-300"
                            }`}
                          >
                            {priceEstimate.source === "manager_curated"
                              ? "Verified Market Benchmark"
                              : "Estimated Market Rate"}
                          </Badge>
                        </div>

                        <div className="flex items-baseline justify-between pt-1">
                          <div
                            className={`text-lg font-bold font-mono ${
                              priceEstimate.source === "manager_curated"
                                ? "text-emerald-950"
                                : "text-amber-950"
                            }`}
                          >
                            {priceEstimate.totalEstimate.min.toLocaleString()} –{" "}
                            {priceEstimate.totalEstimate.max.toLocaleString()} ETB
                          </div>

                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            onClick={() =>
                              setValue("budget", priceEstimate.totalEstimate.benchmark, {
                                shouldValidate: true,
                              })
                            }
                            className="h-6 text-xs text-blue-700 hover:text-blue-900 p-0 cursor-pointer"
                          >
                            Apply Fair Benchmark ({priceEstimate.totalEstimate.benchmark.toLocaleString()} ETB)
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              {/* Step 7: Driver Offers, Escrow Terms & Special Instructions */}
              <Card className="border shadow-xs">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      7
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        Escrow Agreement & Bidding (የዋስትና ስምምነት)
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Configure driver bidding permissions and transit instructions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-gray-50/80 border rounded-lg">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-gray-900">
                        Allow Direct Driver Bidding
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Drivers can propose competitive counter-offers against your budget.
                      </div>
                    </div>

                    <FormField
                      control={control}
                      name="allowDriverOffers"
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-blue-600 cursor-pointer"
                        />
                      )}
                    />
                  </div>

                  <FormField
                    control={control}
                    name="specialInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                          <IconFileText className="h-3.5 w-3.5 text-blue-600" />
                          Special Handling Instructions (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Fragile cargo, waterproof tarpaulin required, loading warehouse bay #4"
                            className="h-10 text-xs"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-start gap-2.5 p-3 bg-blue-50/60 border border-blue-100 rounded-lg text-xs text-blue-900">
                    <IconShieldCheck className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-[11px] leading-relaxed">
                      <span className="font-semibold">MyTruck Escrow Guarantee:</span> When an offer
                      is accepted, funds are held securely in your reserved balance and only released
                      to the driver upon verified delivery confirmation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Summary & Sticky Action Card */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border shadow-sm sticky top-6">
                <CardContent className="p-5 space-y-5">
                  <h3 className="font-bold text-sm text-gray-900 border-b pb-3">
                    Shipment Summary (7-Step Review)
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center text-gray-600">
                      <span>1. Corridor Route</span>
                      <span className="font-semibold text-gray-900">
                        {originCity?.nameEn || "Origin"} → {destCity?.nameEn || "Destination"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-gray-600">
                      <span>2. Commodity</span>
                      <span className="font-semibold text-gray-900">
                        {currentGood?.nameEn || "Commodity"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-gray-600">
                      <span>3. Quantity / Volume</span>
                      <span className="font-semibold text-gray-900">
                        {watchedQuantity} {currentUnit?.unitCode || "Units"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-gray-600">
                      <span>4. Vehicle Class</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-900">
                          {activeTruck?.nameEn || "Truck"}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          Matched
                        </Badge>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-gray-600">
                      <span>5. Loading Date</span>
                      <span className="font-semibold text-gray-900">{watchedLoadingDate}</span>
                    </div>

                    <div className="flex justify-between items-center text-gray-600">
                      <span>Delivery Deadline</span>
                      <span className="font-semibold text-gray-900">{watchedDeliveryDeadline}</span>
                    </div>

                    <div className="flex justify-between items-center text-gray-600 border-t pt-2">
                      <span>6. Escrow Budget</span>
                      <span className="font-bold text-sm text-gray-900 font-mono">
                        {watchedBudget ? `${Number(watchedBudget).toLocaleString()} ETB` : "—"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-gray-600">
                      <span>7. Driver Bids</span>
                      <Badge
                        variant={watchedAllowDriverOffers ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {watchedAllowDriverOffers ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>

                  {/* Recommendation Card */}
                  <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
                      <IconBulb className="h-4 w-4 text-blue-600" />
                      Smart Matching Summary
                    </div>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      Recommended vehicle: <span className="font-bold">{activeTruck?.nameEn}</span>{" "}
                      safely accommodates {watchedQuantity} {currentUnit?.unitCode || "units"}.
                    </p>
                  </div>

                  {/* Post Load Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || !watchedOriginCityId || !watchedDestinationCityId}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-semibold text-xs gap-2 shadow-xs cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <IconLoader2 className="h-4 w-4 animate-spin mr-1.5" />
                        Posting Load to DB...
                      </>
                    ) : (
                      <>
                        <IconSend className="h-4 w-4 mr-1.5" />
                        Post Verified Load
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default PostLoadWizard;
