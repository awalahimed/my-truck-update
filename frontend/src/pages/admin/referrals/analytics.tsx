"use client";

import { useState, useEffect } from "react";
import { orpc } from "@/lib/oprc";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EnhancedDataTable } from "@/components/enhanced-data-table";
import { IconUsers, IconCheck, IconClock, IconCoin, IconTrendingUp, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
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

interface ReferralAnalytics {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  expiredReferrals: number;
  totalRewardsPaid: string;
  conversionRate: string;
  referralsByMonth: Record<string, number>;
}

interface TopReferrer {
  userId: string;
  name: string;
  phoneNumber: string | null;
  referralCode: string | null;
  referralCount: number | null;
  totalEarned: string;
  completedReferrals: number;
}

const chartConfig = {
  referrals: {
    label: "Referrals",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ReferralAnalytics() {
  const [analytics, setAnalytics] = useState<ReferralAnalytics | null>(null);
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("90d");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics
      const analyticsData = await orpc.admin.referral.getAnalytics();
      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
      }
      
      // Fetch top referrers (get more for pagination)
      const referrersData = await orpc.admin.referral.getTopReferrers({ limit: 50 });
      if (referrersData.success) {
        setTopReferrers(referrersData.topReferrers);
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
      toast.error('Failed to load referral analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Prepare chart data from referralsByMonth
  const chartData = analytics?.referralsByMonth 
    ? Object.entries(analytics.referralsByMonth)
        .map(([date, count]) => ({
          date,
          referrals: count,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  // Filter chart data based on time range
  const filteredChartData = chartData.filter((item) => {
    if (chartData.length === 0) return false;
    
    const date = new Date(item.date);
    const referenceDate = new Date(chartData[chartData.length - 1].date);
    let daysToSubtract = 180;
    
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "90d") {
      daysToSubtract = 90;
    }
    
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    
    return date >= startDate;
  });

  // Pagination for top referrers
  const totalPages = Math.ceil(topReferrers.length / pageSize);
  const paginatedReferrers = topReferrers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
      cell: (value: string | null) => <span>{value || 'N/A'}</span>,
    },
    {
      accessorKey: "referralCode",
      header: "Code",
      cell: (value: string | null) => (
        <Badge variant="outline" className="font-mono">{value || 'N/A'}</Badge>
      ),
    },
    {
      accessorKey: "completedReferrals",
      header: "Completed",
      cell: (value: number) => (
        <div className="flex items-center gap-1">
          <IconCheck className="h-4 w-4 text-green-600" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      accessorKey: "totalEarned",
      header: "Total Earned",
      cell: (value: string) => (
        <span className="font-semibold text-green-600">{value} ETB</span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Referral Analytics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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

  if (!analytics) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Referral Analytics</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No analytics data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Referral Analytics</h2>
        <p className="text-muted-foreground">Track referral program performance and top referrers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">
              All time referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <IconCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.completedReferrals}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.pendingReferrals} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Signup to completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards Paid</CardTitle>
            <IconCoin className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{analytics.totalRewardsPaid} ETB</div>
            <p className="text-xs text-muted-foreground">
              All time payouts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Trend Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle>Referral Trends</CardTitle>
              <CardDescription>Monthly referral signups over time</CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="w-[160px] rounded-lg sm:ml-auto"
                aria-label="Select a value"
              >
                <SelectValue placeholder="Last 3 months" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="180d" className="rounded-lg">Last 6 months</SelectItem>
                <SelectItem value="90d" className="rounded-lg">Last 3 months</SelectItem>
                <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart data={filteredChartData}>
                <defs>
                  <linearGradient id="fillReferrals" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-referrals)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-referrals)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="referrals"
                  type="natural"
                  fill="url(#fillReferrals)"
                  stroke="var(--color-referrals)"
                  stackId="a"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Status</CardTitle>
          <CardDescription>Breakdown of referral statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{analytics.completedReferrals}</p>
              </div>
              <IconCheck className="h-8 w-8 text-green-600" />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{analytics.pendingReferrals}</p>
              </div>
              <IconClock className="h-8 w-8 text-yellow-600" />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold text-gray-600">{analytics.expiredReferrals}</p>
              </div>
              <IconClock className="h-8 w-8 text-gray-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Referrers Table with Pagination */}
      <Card>
        <CardHeader>
          <CardTitle>Top Referrers</CardTitle>
          <CardDescription>Users with the most successful referrals</CardDescription>
        </CardHeader>
        <CardContent>
          <EnhancedDataTable
            columns={columns}
            data={paginatedReferrers}
            loading={loading}
            onAdd={() => {}}
          />
          
          {/* Custom Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, topReferrers.length)} of {topReferrers.length} referrers
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <IconChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <IconChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
