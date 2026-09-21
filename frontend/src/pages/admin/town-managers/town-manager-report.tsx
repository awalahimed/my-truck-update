"use client";

import { useState, useEffect } from "react";
import { orpc } from "@/lib/oprc";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconBuildingCommunity,
  IconUsers,
  IconUserCheck,
  IconTruck,
  IconSearch,
} from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ManagerReport {
  userId: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  approvalStatus: string;
  townName: string;
  cityName: string;
  region: string;
  agentCount: number;
  totalRegisteredUsers: number;
  activeUsers: number;
  totalDrivers: number;
  totalOrders: number;
  totalRevenue: string;
  conversionRate: number;
}

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700 border-green-200",
    suspended: "bg-orange-100 text-orange-700 border-orange-200",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  };
  return <Badge variant="outline" className={styles[status] || ""}>{status}</Badge>;
};

const conversionBadge = (value: number) => {
  let color = "";
  if (value >= 50) color = "bg-emerald-100 text-emerald-700 border-emerald-200";
  else if (value >= 20) color = "bg-yellow-100 text-yellow-700 border-yellow-200";
  else color = "bg-red-100 text-red-700 border-red-200";
  return <Badge variant="outline" className={color}>{value}%</Badge>;
};

export function TownManagerReport() {
  const [data, setData] = useState<{ managers: ManagerReport[]; totals: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const result = await orpc.admin.townManager.getReport();
        if (result.success) {
          setData(result as any);
        }
      } catch (error) {
        console.error("Failed to fetch town manager report:", error);
        toast.error("Failed to load report");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const filteredManagers = data?.managers.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.townName.toLowerCase().includes(search.toLowerCase()) ||
    m.cityName.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Town Manager Report</h1>
        <p className="text-muted-foreground">
          Overview of all town managers and their territory analytics
        </p>
      </div>

      {/* Stats cards */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Managers</CardTitle>
              <IconBuildingCommunity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{data.totals.totalManagers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{data.totals.totalAgents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
              <IconUserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{data.totals.totalUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <IconTruck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{parseFloat(data.totals.totalRevenue).toFixed(2)} birr</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="relative mb-4">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, town, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredManagers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No town managers found</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Manager</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Agents</TableHead>
                    <TableHead className="text-center">Users</TableHead>
                    <TableHead className="text-center">Active</TableHead>
                    <TableHead className="text-center">Drivers</TableHead>
                    <TableHead className="text-center">Orders</TableHead>
                    <TableHead className="text-center">Conversion</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredManagers.map((m) => (
                    <TableRow key={m.userId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.phone || m.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{m.cityName}</p>
                        <p className="text-xs text-muted-foreground">{m.townName}{m.region ? `, ${m.region}` : ""}</p>
                      </TableCell>
                      <TableCell className="text-center">{statusBadge(m.status)}</TableCell>
                      <TableCell className="text-center font-medium">{m.agentCount}</TableCell>
                      <TableCell className="text-center">{m.totalRegisteredUsers}</TableCell>
                      <TableCell className="text-center">{m.activeUsers}</TableCell>
                      <TableCell className="text-center">{m.totalDrivers}</TableCell>
                      <TableCell className="text-center">{m.totalOrders}</TableCell>
                      <TableCell className="text-center">{conversionBadge(m.conversionRate)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {parseFloat(m.totalRevenue).toFixed(2)} birr
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
