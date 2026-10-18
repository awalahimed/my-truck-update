"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  IconBuildingCommunity,
  IconScale,
  IconTruck,
  IconPackage,
  IconChartLine,
  IconDatabase,
} from "@tabler/icons-react";
import { CitiesTab } from "./cities-tab";
import { PricingUnitsTab } from "./pricing-units-tab";
import { TruckTypesTab } from "./truck-types-tab";
import { GoodsTypesTab } from "./goods-types-tab";
import { MarketRatesTab } from "./market-rates-tab";

export function MasterDataAdmin() {
  const [activeTab, setActiveTab] = useState("cities");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl shadow-xs">
              <IconDatabase className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Master Data & Rates Management
                </h1>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                  Central Registry
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
                Configure verified transport entities, fleet payload specifications, and Town Manager corridor market rate benchmarks.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full bg-gray-100/80 p-1 rounded-xl">
          <TabsTrigger
            value="cities"
            className="flex items-center gap-2 text-xs sm:text-sm font-medium py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <IconBuildingCommunity className="h-4 w-4" />
            <span>Cities (ከተሞች)</span>
          </TabsTrigger>

          <TabsTrigger
            value="units"
            className="flex items-center gap-2 text-xs sm:text-sm font-medium py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <IconScale className="h-4 w-4" />
            <span>Pricing Units (መለኪያዎች)</span>
          </TabsTrigger>

          <TabsTrigger
            value="trucks"
            className="flex items-center gap-2 text-xs sm:text-sm font-medium py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <IconTruck className="h-4 w-4" />
            <span>Truck Types (ተሽከርካሪዎች)</span>
          </TabsTrigger>

          <TabsTrigger
            value="goods"
            className="flex items-center gap-2 text-xs sm:text-sm font-medium py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <IconPackage className="h-4 w-4" />
            <span>Goods Types (ሸቀጦች)</span>
          </TabsTrigger>

          <TabsTrigger
            value="rates"
            className="flex items-center gap-2 text-xs sm:text-sm font-medium py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <IconChartLine className="h-4 w-4" />
            <span>Market Rates (ደላላ መነሻ ዋጋ)</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cities" className="mt-0 outline-none">
          <CitiesTab />
        </TabsContent>

        <TabsContent value="units" className="mt-0 outline-none">
          <PricingUnitsTab />
        </TabsContent>

        <TabsContent value="trucks" className="mt-0 outline-none">
          <TruckTypesTab />
        </TabsContent>

        <TabsContent value="goods" className="mt-0 outline-none">
          <GoodsTypesTab />
        </TabsContent>

        <TabsContent value="rates" className="mt-0 outline-none">
          <MarketRatesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MasterDataAdmin;