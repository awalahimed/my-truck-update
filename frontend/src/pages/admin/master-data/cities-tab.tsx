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
  IconMapPin,
  IconCheck,
  IconBan,
  IconLoader2,
  IconRefresh,
  IconEdit,
  IconSearch,
} from "@tabler/icons-react";

const citySchema = z.object({
  nameEn: z.string().min(2, "English name is required"),
  nameAm: z.string().min(2, "Amharic name is required (አማርኛ)"),
  nameOm: z.string().min(2, "Afaan Oromoo name is required"),
  region: z.string().optional(),
});

type CityFormValues = z.infer<typeof citySchema>;

export function CitiesTab() {
  const [open, setOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const form = useForm<CityFormValues>({
    resolver: zodResolver(citySchema),
    defaultValues: {
      nameEn: "",
      nameAm: "",
      nameOm: "",
      region: "",
    },
  });

  // Fetch Cities with TanStack Query
  const { data = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "masterData", "cities"],
    queryFn: async () => {
      const res = await (orpc as any).admin.masterData.listCities();
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create City Mutation
  const createMutation = useMutation({
    mutationFn: async (values: CityFormValues) => {
      return await (orpc as any).admin.masterData.createCity(values);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "City added successfully");
        queryClient.invalidateQueries({ queryKey: ["admin", "masterData", "cities"] });
        queryClient.invalidateQueries({ queryKey: ["masterData", "cities"] });
        form.reset();
        setOpen(false);
      } else {
        toast.error(res.message || "Failed to create city");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create city");
    },
  });

  // Update City Mutation
  const updateMutation = useMutation({
    mutationFn: async (values: CityFormValues & { id: string }) => {
      return await (orpc as any).admin.masterData.updateCity(values);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "City updated successfully");
        queryClient.invalidateQueries({ queryKey: ["admin", "masterData", "cities"] });
        queryClient.invalidateQueries({ queryKey: ["masterData", "cities"] });
        form.reset();
        setEditingCity(null);
        setOpen(false);
      } else {
        toast.error(res.message || "Failed to update city");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update city");
    },
  });

  // Toggle Status Mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive?: boolean }) => {
      return await (orpc as any).admin.masterData.toggleCityStatus({ id, isActive });
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "City status updated");
        queryClient.invalidateQueries({ queryKey: ["admin", "masterData", "cities"] });
        queryClient.invalidateQueries({ queryKey: ["masterData", "cities"] });
      } else {
        toast.error(res.message || "Failed to toggle status");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error updating city status");
    },
  });

  const handleOpenCreate = () => {
    setEditingCity(null);
    form.reset({
      nameEn: "",
      nameAm: "",
      nameOm: "",
      region: "",
    });
    setOpen(true);
  };

  const handleOpenEdit = (city: any) => {
    setEditingCity(city);
    form.reset({
      nameEn: city.nameEn || "",
      nameAm: city.nameAm || "",
      nameOm: city.nameOm || "",
      region: city.region || "",
    });
    setOpen(true);
  };

  const onSubmit = (values: CityFormValues) => {
    if (editingCity) {
      updateMutation.mutate({ id: editingCity.id, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Filtered cities based on search
  const filteredCities = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(
      (c: any) =>
        c.nameEn?.toLowerCase().includes(term) ||
        c.nameAm?.toLowerCase().includes(term) ||
        c.nameOm?.toLowerCase().includes(term) ||
        c.region?.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Tab Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <IconMapPin className="h-5 w-5 text-blue-600" />
            Standardized Ethiopian Cities (የከተሞች ዝርዝር)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Standard hub for origins, destinations, and Town Manager pricing benchmarks.
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
            Add New City
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-xs max-w-sm">
        <IconSearch className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by English, አማርኛ, Oromoo or region..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 shadow-none focus-visible:ring-0 text-xs h-7 p-0"
        />
      </div>

      {/* CRUD Modal Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px] bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingCity ? "Edit Standardized City" : "Add Standardized City"}
            </DialogTitle>
            <DialogDescription>
              {editingCity
                ? `Update trilingual details and region for ${editingCity.nameEn}.`
                : "Enter the trilingual city name to ensure uniformity across the shipper wizard and regional pricing."}
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
                      <Input placeholder="e.g. Hawassa" className="h-9 text-xs" {...field} />
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
                        <Input placeholder="e.g. ሀዋሳ" className="h-9 text-xs" {...field} />
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
                        <Input placeholder="e.g. Hawaasaa" className="h-9 text-xs" {...field} />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Region / Zone</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Sidama, Oromia, Addis Ababa" className="h-9 text-xs" {...field} />
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
                  ) : editingCity ? (
                    "Update City"
                  ) : (
                    "Save City"
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
              <TableHead className="font-semibold text-xs">English Name</TableHead>
              <TableHead className="font-semibold text-xs">Amharic (አማርኛ)</TableHead>
              <TableHead className="font-semibold text-xs">Afaan Oromoo</TableHead>
              <TableHead className="font-semibold text-xs">Region</TableHead>
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
                    Loading standardized cities...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-xs">
                  {searchTerm ? "No matching cities found." : "No cities found. Click 'Add New City' above to create one."}
                </TableCell>
              </TableRow>
            ) : (
              filteredCities.map((city: any) => (
                <TableRow key={city.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium text-xs text-gray-900">{city.nameEn}</TableCell>
                  <TableCell className="text-xs text-gray-700">{city.nameAm}</TableCell>
                  <TableCell className="text-xs text-gray-700">{city.nameOm}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{city.region || "—"}</TableCell>
                  <TableCell className="text-center">
                    {city.isActive ? (
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
                        onClick={() => handleOpenEdit(city)}
                        className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                        title="Edit City"
                      >
                        <IconEdit className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant={city.isActive ? "ghost" : "outline"}
                        size="sm"
                        onClick={() => toggleMutation.mutate({ id: city.id, isActive: !city.isActive })}
                        disabled={toggleMutation.isPending}
                        className={`h-7 px-2 text-[11px] cursor-pointer ${
                          city.isActive
                            ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {city.isActive ? "Deactivate" : "Activate"}
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
