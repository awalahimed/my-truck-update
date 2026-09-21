"use client";

import { useState, useEffect } from "react";
import { orpc } from "@/lib/oprc";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconUsers,
  IconUserCheck,
  IconUserOff,
  IconTargetArrow,
  IconTruck,
} from "@tabler/icons-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AgentConversion {
  agentId: string;
  agentName: string;
  totalRegistered: number;
  totalDrivers: number;
  activeUsers: number;
  activeDrivers: number;
  inactiveUsers: number;
  userConversionRate: number;
  driverConversionRate: number;
}

interface ConversionTrend {
  month: string;
  newRegistrations: number;
  firstOrders: number;
  conversionRate: number;
}

interface ConversionData {
  overall: {
    totalRegistered: number;
    totalActiveUsers: number;
    totalDrivers: number;
    totalActiveDrivers: number;
    totalInactive: number;
    overallConversion: number;
  };
  agents: AgentConversion[];
  trends: ConversionTrend[];
}

const userChartConfig = {
  newRegistrations: {
    label: "New Registrations",
    color: "var(--chart-1)",
  },
  firstOrders: {
    label: "First Orders",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const ConversionBadge = ({ value }: { value: number }) => {
  let color = "";
  if (value >= 50) color = "bg-emerald-100 text-emerald-700 border-emerald-200";
  else if (value >= 20) color = "bg-yellow-100 text-yellow-700 border-yellow-200";
  else color = "bg-red-100 text-red-700 border-red-200";
  return <Badge variant="outline" className={color}>{value}%</Badge>;
};

export function ConversionView() {
  const [data, setData] = useState<ConversionData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConversion = async () => {
    try {
      setLoading(true);
      const result = await orpc.admin.agents.getConversionStats();
      if (result.success) {
        setData(result as any);
      }
    } catch (error) {
      console.error("Failed to fetch conversion stats:", error);
      toast.error("Failed to load conversion stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversion();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Conversion Tracking</h1>
        <p className="text-muted-foreground">
          Agent registration-to-usage conversion analytics
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registered</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overall.totalRegistered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <IconUserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overall.totalActiveUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <IconTargetArrow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overall.overallConversion}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <IconUserOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overall.totalInactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
          <CardDescription>New registrations vs first-time orders (12 months)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={userChartConfig} className="aspect-[4/1]">
            <AreaChart data={data.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickFormatter={(v) => {
                  const [y, m] = v.split("-");
                  return `${m}/${y.slice(2)}`;
                }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="newRegistrations"
                stroke="var(--color-newRegistrations)"
                fill="var(--color-newRegistrations)"
                fillOpacity={0.1}
              />
              <Area
                type="monotone"
                dataKey="firstOrders"
                stroke="var(--color-firstOrders)"
                fill="var(--color-firstOrders)"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Agent Conversion Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Conversion Rates</CardTitle>
          <CardDescription>How each agent's registrations convert to active users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead className="text-center">Registered Users</TableHead>
                    <TableHead className="text-center">Active Users</TableHead>
                    <TableHead className="text-center">User Conversion</TableHead>
                    <TableHead className="text-center">Drivers</TableHead>
                    <TableHead className="text-center">Active Drivers</TableHead>
                    <TableHead className="text-center">Driver Conv.</TableHead>
                    <TableHead className="text-center">Total Conversion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.agents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No agents found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.agents.map((agent) => {
                      const totalConversion = (agent.totalRegistered + agent.totalDrivers) > 0
                        ? parseFloat((((agent.activeUsers + agent.activeDrivers) / (agent.totalRegistered + agent.totalDrivers)) * 100).toFixed(1))
                        : 0;
                      return (
                        <TableRow key={agent.agentId}>
                          <TableCell className="font-medium">{agent.agentName}</TableCell>
                          <TableCell className="text-center">{agent.totalRegistered}</TableCell>
                          <TableCell className="text-center">{agent.activeUsers}</TableCell>
                          <TableCell className="text-center">
                            <ConversionBadge value={agent.userConversionRate} />
                          </TableCell>
                          <TableCell className="text-center">{agent.totalDrivers}</TableCell>
                          <TableCell className="text-center">{agent.activeDrivers}</TableCell>
                          <TableCell className="text-center">
                            <ConversionBadge value={agent.driverConversionRate} />
                          </TableCell>
                          <TableCell className="text-center">
                            <ConversionBadge value={totalConversion} />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
