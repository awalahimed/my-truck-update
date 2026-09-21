"use client";

import { useEffect, useState } from "react";
import { orpc } from "@/lib/oprc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconUsers,
  IconUserCheck,
  IconTruck,
  IconBuildingCommunity,
  IconTrophy,
} from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AgentStat {
  agentId: string;
  agentName: string;
  agentPhone: string;
  assignedCity: string;
  assignedTown: string;
  tier: string;
  totalRegistered: number;
  totalDrivers: number;
  activeUsers: number;
  activeDrivers: number;
  completedOrders: number;
  totalRevenue: number;
  conversionRate: number;
}

interface Totals {
  totalAgents: number;
  totalRegistered: number;
  totalActive: number;
  totalDrivers: number;
  totalOrders: number;
  totalRevenue: string;
}

const tierBadge = (tier: string) => {
  const styles: Record<string, string> = {
    new: "bg-gray-100 text-gray-500 border-gray-200",
    bronze: "bg-amber-100 text-amber-700 border-amber-200",
    silver: "bg-slate-100 text-slate-700 border-slate-300",
    gold: "bg-yellow-100 text-yellow-700 border-yellow-300",
    platinum: "bg-cyan-100 text-cyan-700 border-cyan-300",
  };
  return <Badge variant="outline" className={(styles[tier] || styles.new) + " capitalize"}>{tier}</Badge>;
};

export default function DashboardView() {
  const [agents, setAgents] = useState<AgentStat[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await (orpc as any).manager.dashboard.getStats();
        if (result.success) {
          setAgents(result.agents || []);
          setTotals(result.totals);
          setProfile(result.profile);
        }
      } catch (e) {
        console.error("Failed to fetch dashboard data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        {profile && (
          <p className="text-muted-foreground">
            {profile.cityName}{profile.townName ? `, ${profile.townName}` : ""}{profile.region ? ` — ${profile.region}` : ""}
          </p>
        )}
      </div>

      {/* Stats cards */}
      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
              <IconBuildingCommunity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totals.totalAgents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totals.totalRegistered}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <IconUserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totals.totalActive}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <IconTrophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{parseFloat(totals.totalRevenue).toFixed(2)} birr</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Drivers</CardTitle>
              <IconTruck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totals.totalDrivers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
              <IconTrophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totals.totalOrders}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Agents table */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Agents Under Your Territory</h3>
          {agents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No agents found in your territory</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-center">Tier</TableHead>
                    <TableHead className="text-center">Users</TableHead>
                    <TableHead className="text-center">Active</TableHead>
                    <TableHead className="text-center">Drivers</TableHead>
                    <TableHead className="text-center">Orders</TableHead>
                    <TableHead className="text-center">Conversion</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((a) => (
                    <TableRow key={a.agentId}>
                      <TableCell>
                        <p className="font-medium">{a.agentName}</p>
                        <p className="text-xs text-muted-foreground">{a.agentPhone}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{a.assignedCity || "—"}</p>
                        <p className="text-xs text-muted-foreground">{a.assignedTown || ""}</p>
                      </TableCell>
                      <TableCell className="text-center">{tierBadge(a.tier)}</TableCell>
                      <TableCell className="text-center">{a.totalRegistered}</TableCell>
                      <TableCell className="text-center">{a.activeUsers}</TableCell>
                      <TableCell className="text-center">{a.totalDrivers}</TableCell>
                      <TableCell className="text-center">{a.completedOrders}</TableCell>
                      <TableCell className="text-center">{a.conversionRate}%</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {a.totalRevenue.toFixed(2)} birr
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
