"use client";

import { useState, useEffect } from "react";
import { orpc } from "@/lib/oprc";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconUsers, IconShoppingCart, IconCoin, IconTruck, IconChartBar, IconMedal } from "@tabler/icons-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AgentDashboardStats {
  totalCustomers: number;
  totalDrivers: number;
  totalOrders: number;
  activeOrders: number;
  recentTransactions: number;
  currentBalance: number;
  totalCommissionEarnings: number;
  userCommissionEarnings: number;
  driverCommissionEarnings: number;
  assistedCommissionEarnings: number;
  statusBreakdown: Record<string, number>;
  ordersByDay: Record<string, number>;
  revenueByDay: Record<string, number>;
  referredCustomers?: number;
  referredDrivers?: number;
}

interface ConversionMetrics {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  customerConversionRate: number;
  totalVehicles: number;
  activeVehicles: number;
  inactiveVehicles: number;
  vehicleConversionRate: number;
}

const chartConfig = {
  orders: { label: "Orders", color: "var(--chart-1)" },
  revenue: { label: "Revenue (ETB)", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function AgentDashboardView() {
  const [stats, setStats] = useState<AgentDashboardStats | null>(null);
  const [metrics, setMetrics] = useState<ConversionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [statsRes, metricsRes] = await Promise.all([
          orpc.agent.dashboard.getStats(),
          orpc.agent.commissions.getConversionMetrics(),
        ]);
        if (statsRes.success && statsRes.stats) setStats(statsRes.stats as AgentDashboardStats);
        if (metricsRes.success && metricsRes.metrics) setMetrics(metricsRes.metrics as unknown as ConversionMetrics);
      } catch (error) {
        console.error('Failed to fetch agent dashboard stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const chartData = stats
    ? Object.entries(stats.ordersByDay)
        .map(([date, orders]) => ({ date, orders, revenue: stats.revenueByDay[date] || 0 }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  const filteredChartData = chartData.filter((item) => {
    if (!chartData.length) return false;
    const date = new Date(item.date);
    const ref = new Date(chartData[chartData.length - 1].date);
    const days = timeRange === "7d" ? 7 : timeRange === "90d" ? 90 : 30;
    const start = new Date(ref);
    start.setDate(start.getDate() - days);
    return date >= start;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No dashboard data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <IconCoin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.currentBalance.toLocaleString()} ETB</div>
            <p className="text-xs text-muted-foreground">Available to withdraw</p>
          </CardContent>
        </Card>

        {/* Tier Badge Card */}
        <TierBadgeCard />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            <IconChartBar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalCommissionEarnings.toLocaleString()} ETB</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Customers</CardTitle>
            <IconUsers className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics ? `${metrics.activeCustomers} active (${metrics.customerConversionRate}%)` : 'Loading...'}
            </p>
            {typeof stats.referredCustomers !== 'undefined' && (
              <p className="text-xs text-muted-foreground mt-1">Referred: <strong>{stats.referredCustomers}</strong></p>
            )}
            <div className="mt-2">
              <button className="text-sm text-muted-foreground" onClick={async () => { setLoading(true); try { const s = await orpc.agent.dashboard.getStats(); if (s.success) setStats(s.stats); } catch (e) { console.error(e); } finally { setLoading(false); } }}>
                Refresh
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Drivers</CardTitle>
            <IconTruck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalDrivers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics ? `${metrics.activeVehicles} active (${metrics.vehicleConversionRate}%)` : 'Loading...'}
            </p>
            {typeof stats.referredDrivers !== 'undefined' && (
              <p className="text-xs text-muted-foreground mt-1">Referred: <strong>{stats.referredDrivers}</strong></p>
            )}
          </CardContent>
        </Card>
      </div>

      

      {/* Commission Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Customer Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.userCommissionEarnings.toLocaleString()} ETB</div>
            <p className="text-xs text-muted-foreground">35% → 25% → 15% staged</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Driver Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.driverCommissionEarnings.toLocaleString()} ETB</div>
            <p className="text-xs text-muted-foreground">15% → 13.5% → 10% staged</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assisted Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.assistedCommissionEarnings.toLocaleString()} ETB</div>
            <p className="text-xs text-muted-foreground">15% flat rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders & Revenue Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle>Orders & Revenue Trends</CardTitle>
              <CardDescription>Daily orders and commission revenue</CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto" aria-label="Select time range">
                <SelectValue placeholder="Last 30 days" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="90d" className="rounded-lg">Last 90 days</SelectItem>
                <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
                <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
              <AreaChart data={filteredChartData}>
                <defs>
                  <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-orders)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-orders)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      indicator="dot"
                    />
                  }
                />
                <Area dataKey="revenue" type="natural" fill="url(#fillRevenue)" stroke="var(--color-revenue)" stackId="a" />
                <Area dataKey="orders" type="natural" fill="url(#fillOrders)" stroke="var(--color-orders)" stackId="a" />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

       
    </div>
  );
}

function TierBadgeCard() {
  const [tier, setTier] = useState<string | null>(null);

  useEffect(() => {
    orpc.agent.getTier().then((res: any) => {
      if (res?.currentTier) setTier(res.currentTier);
    }).catch(() => {});
  }, []);

  const config: Record<string, { label: string; color: string; icon: any }> = {
    new: { label: "New", color: "#9CA3AF", icon: IconMedal },
    bronze: { label: "Bronze", color: "#CD7F32", icon: IconMedal },
    silver: { label: "Silver", color: "#A0A0A0", icon: IconMedal },
    gold: { label: "Gold", color: "#FFD700", icon: IconMedal },
    platinum: { label: "Platinum", color: "#E5E4E2", icon: IconMedal },
  };

  const c = tier ? config[tier] || config.new : null;
  const TierIcon = c?.icon || IconMedal;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Agent Tier</CardTitle>
        <TierIcon className="h-4 w-4" style={{ color: c?.color }} />
      </CardHeader>
      <CardContent>
        {c ? (
          <div className="text-2xl font-bold" style={{ color: c.color }}>{c.label}</div>
        ) : (
          <div className="text-sm text-muted-foreground">Loading...</div>
        )}
        <p className="text-xs text-muted-foreground">Performance tier</p>
      </CardContent>
    </Card>
  );
}
