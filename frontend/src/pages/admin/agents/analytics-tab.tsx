"use client";

import { useState, useEffect } from "react";
import { orpc } from "@/lib/oprc";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconUsers,
  IconTargetArrow,
  IconClock,
  IconCircleCheck,
  IconTrophy,
  IconTrendingDown,
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

interface AgentAnalytic {
  agentId: string;
  agentName: string;
  totalOrders: number;
  completedOrders: number;
  rejectedOrders: number;
  cancelledOrders: number;
  lateDeliveries: number;
  reliability: number;
}

interface ReliabilityTrend {
  month: string;
  totalOrders: number;
  completedOrders: number;
  reliability: number;
}

interface AnalyticsData {
  stats: {
    totalAgents: number;
    avgReliability: number;
    totalLateDeliveries: number;
    totalCompleted: number;
  };
  topAgents: AgentAnalytic[];
  lowestAgents: AgentAnalytic[];
  allAgents: AgentAnalytic[];
  reliabilityTrends: ReliabilityTrend[];
}

const chartConfig = {
  reliability: {
    label: "Reliability",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const ReliabilityBadge = ({ value }: { value: number }) => {
  let color = "";
  if (value >= 80) color = "bg-emerald-100 text-emerald-700 border-emerald-200";
  else if (value >= 60) color = "bg-yellow-100 text-yellow-700 border-yellow-200";
  else color = "bg-red-100 text-red-700 border-red-200";
  return <Badge variant="outline" className={color}>{value}%</Badge>;
};

export function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const result = await orpc.admin.agents.getAnalytics();
      if (result.success) {
        setData(result as any);
      }
    } catch (error) {
      console.error("Failed to fetch agent analytics:", error);
      toast.error("Failed to load agent analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
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

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  const { stats, topAgents, lowestAgents, allAgents, reliabilityTrends } = data;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
            <p className="text-xs text-muted-foreground">With completed orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Reliability</CardTitle>
            <IconTargetArrow className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.avgReliability}%</div>
            <p className="text-xs text-muted-foreground">Across all agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Deliveries</CardTitle>
            <IconClock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalLateDeliveries}</div>
            <p className="text-xs text-muted-foreground">Delivery &gt; 4hr after assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Completed</CardTitle>
            <IconCircleCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.totalCompleted}</div>
            <p className="text-xs text-muted-foreground">Orders across all agents</p>
          </CardContent>
        </Card>
      </div>

      {/* Top & Lowest Agents */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrophy className="h-5 w-5 text-yellow-500" />
              Top 10 Agents
            </CardTitle>
            <CardDescription>Highest reliability scores</CardDescription>
          </CardHeader>
          <CardContent>
            {topAgents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No agents with enough data yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Completed</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topAgents.map((agent, i) => (
                    <TableRow key={agent.agentId}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{agent.agentName}</TableCell>
                      <TableCell className="text-right">{agent.completedOrders}/{agent.totalOrders}</TableCell>
                      <TableCell className="text-right">
                        <ReliabilityBadge value={agent.reliability} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrendingDown className="h-5 w-5 text-red-500" />
              Lowest 10 Agents
            </CardTitle>
            <CardDescription>Lowest reliability scores</CardDescription>
          </CardHeader>
          <CardContent>
            {lowestAgents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No agents with enough data yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Completed</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowestAgents.map((agent, i) => (
                    <TableRow key={agent.agentId}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{agent.agentName}</TableCell>
                      <TableCell className="text-right">{agent.completedOrders}/{agent.totalOrders}</TableCell>
                      <TableCell className="text-right">
                        <ReliabilityBadge value={agent.reliability} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reliability Trends Chart */}
      {reliabilityTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reliability Trends</CardTitle>
            <CardDescription>Monthly average reliability across all agents</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart data={reliabilityTrends}>
                <defs>
                  <linearGradient id="fillReliability" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-reliability)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-reliability)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const [y, m] = value.split("-");
                    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                    return `${months[parseInt(m) - 1]} ${y}`;
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        const [y, m] = value.split("-");
                        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                        return `${months[parseInt(m) - 1]} ${y}`;
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="reliability"
                  type="natural"
                  fill="url(#fillReliability)"
                  stroke="var(--color-reliability)"
                  stackId="a"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* All Agents Reliability Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Reliability Scores</CardTitle>
          <CardDescription>Detailed breakdown of all agents</CardDescription>
        </CardHeader>
        <CardContent>
          {allAgents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No agent data available</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Rejected</TableHead>
                  <TableHead className="text-right">Cancelled</TableHead>
                  <TableHead className="text-right">Late Del.</TableHead>
                  <TableHead className="text-right">Reliability</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allAgents
                  .sort((a, b) => b.reliability - a.reliability)
                  .map((agent) => (
                    <TableRow key={agent.agentId}>
                      <TableCell className="font-medium">{agent.agentName}</TableCell>
                      <TableCell className="text-right">{agent.completedOrders}</TableCell>
                      <TableCell className="text-right">{agent.totalOrders}</TableCell>
                      <TableCell className="text-right text-red-600">{agent.rejectedOrders}</TableCell>
                      <TableCell className="text-right text-gray-500">{agent.cancelledOrders}</TableCell>
                      <TableCell className="text-right text-orange-600">{agent.lateDeliveries}</TableCell>
                      <TableCell className="text-right">
                        <ReliabilityBadge value={agent.reliability} />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
