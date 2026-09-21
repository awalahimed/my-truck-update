"use client";

import { useState, useEffect, useCallback } from "react";
import { orpc } from "@/lib/oprc";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconGift,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconCoin,
  IconUsers,
  IconUserCheck,
  IconTrophy,
} from "@tabler/icons-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

interface GiveawayAgent {
  id: string;
  name: string;
  phone: string;
  email: string;
  tier: string;
  assignedCity: string;
  assignedTown: string;
  totalRegistered: number;
  totalDrivers: number;
  activeUsers: number;
  activeDrivers: number;
  inactiveUsers: number;
  conversionRate: number;
  walletBalance: string;
}

interface GiveawayResponse {
  success: boolean;
  agents: GiveawayAgent[];
  total: number;
  offset: number;
  limit: number;
}

const TIER_STYLES: Record<string, string> = {
  new: "bg-gray-100 text-gray-500 border-gray-200",
  bronze: "bg-amber-100 text-amber-700 border-amber-200",
  silver: "bg-slate-100 text-slate-700 border-slate-300",
  gold: "bg-yellow-100 text-yellow-700 border-yellow-300",
  platinum: "bg-cyan-100 text-cyan-700 border-cyan-300",
};

const TierBadge = ({ tier }: { tier: string }) => {
  const style = TIER_STYLES[tier] || TIER_STYLES.new;
  return <Badge variant="outline" className={style + " capitalize"}>{tier}</Badge>;
};

const ConversionBadge = ({ value }: { value: number }) => {
  let color = "";
  if (value >= 50) color = "bg-emerald-100 text-emerald-700 border-emerald-200";
  else if (value >= 20) color = "bg-yellow-100 text-yellow-700 border-yellow-200";
  else color = "bg-red-100 text-red-700 border-red-200";
  return <Badge variant="outline" className={color}>{value}%</Badge>;
};

export function GiveawayView() {
  const [data, setData] = useState<GiveawayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [awardDialogOpen, setAwardDialogOpen] = useState(false);
  const [bonusAmount, setBonusAmount] = useState("");
  const [bonusReason, setBonusReason] = useState("");
  const [awarding, setAwarding] = useState(false);
  const limit = 15;

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const result = await orpc.admin.giveaway.getAgents({
        search: search || undefined,
        offset,
        limit,
      });
      if (result.success) {
        setData(result as any);
      }
    } catch (error) {
      console.error("Failed to fetch giveaway agents:", error);
      toast.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  }, [search, offset]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const totalPages = data ? Math.ceil(data.total / limit) : 0;
  const currentPage = Math.floor(offset / limit) + 1;

  const handleSearch = (val: string) => {
    setSearch(val);
    setOffset(0);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (!data?.agents) return;
    if (selectedIds.size === data.agents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.agents.map(a => a.id)));
    }
  };

  const handleAwardBonus = async () => {
    const amount = parseFloat(bonusAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid bonus amount");
      return;
    }

    try {
      setAwarding(true);
      const result = await orpc.admin.giveaway.awardBonus({
        agentIds: Array.from(selectedIds),
        amount,
        reason: bonusReason || undefined,
      });
      if (result.success) {
        toast.success(`Bonus awarded to ${(result as any).succeeded} agent(s) — ${(result as any).totalAmount} birr`);
        setAwardDialogOpen(false);
        setSelectedIds(new Set());
        setBonusAmount("");
        setBonusReason("");
        fetchAgents();
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to award bonus");
    } finally {
      setAwarding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Giveaway / Bonus</h1>
          <p className="text-muted-foreground">
            Award cash bonuses to agents based on performance
          </p>
        </div>
        {selectedIds.size > 0 && (
          <Button onClick={() => setAwardDialogOpen(true)} className="gap-2">
            <IconCoin className="h-4 w-4" />
            Award Bonus ({selectedIds.size})
          </Button>
        )}
      </div>

      {/* Stats cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{data.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
              <IconUserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {data.agents.reduce((s, a) => s + a.totalRegistered, 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <IconTrophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {data.agents.reduce((s, a) => s + a.activeUsers, 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Selected</CardTitle>
              <IconGift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{selectedIds.size}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search + table */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents by name or phone..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data?.agents?.length ? (
            <p className="text-center text-muted-foreground py-8">No agents found</p>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={data.agents.length > 0 && selectedIds.size === data.agents.length}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-center">Tier</TableHead>
                      <TableHead className="text-center">Conversion</TableHead>
                      <TableHead className="text-center">Users</TableHead>
                      <TableHead className="text-center">Drivers</TableHead>
                      <TableHead className="text-right">Wallet</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.agents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(agent.id)}
                            onCheckedChange={() => toggleSelect(agent.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{agent.name}</p>
                            <p className="text-sm text-muted-foreground">{agent.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{agent.assignedCity || "—"}</p>
                          <p className="text-xs text-muted-foreground">{agent.assignedTown || ""}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <TierBadge tier={agent.tier} />
                        </TableCell>
                        <TableCell className="text-center">
                          <ConversionBadge value={agent.conversionRate} />
                        </TableCell>
                        <TableCell className="text-center">{agent.activeUsers}/{agent.totalRegistered}</TableCell>
                        <TableCell className="text-center">{agent.activeDrivers}/{agent.totalDrivers}</TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {parseFloat(agent.walletBalance).toFixed(2)} birr
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {offset + 1}–{Math.min(offset + limit, data.total)} of {data.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setOffset(offset - limit)}
                    >
                      <IconChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setOffset(offset + limit)}
                    >
                      <IconChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Award Bonus Dialog */}
      <Dialog open={awardDialogOpen} onOpenChange={setAwardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Award Bonus</DialogTitle>
            <DialogDescription>
              Award a cash bonus to {selectedIds.size} selected agent(s)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Bonus Amount (birr)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={bonusAmount}
                onChange={(e) => setBonusAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="e.g. Top performer this month"
                value={bonusReason}
                onChange={(e) => setBonusReason(e.target.value)}
              />
            </div>
            {bonusAmount && parseFloat(bonusAmount) > 0 && (
              <p className="text-sm text-muted-foreground">
                Total: <strong>{(parseFloat(bonusAmount) * selectedIds.size).toFixed(2)} birr</strong> ({parseFloat(bonusAmount).toFixed(2)} birr × {selectedIds.size} agents)
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAwardDialogOpen(false)} disabled={awarding}>
              Cancel
            </Button>
            <Button onClick={handleAwardBonus} disabled={awarding}>
              {awarding ? "Awarding..." : "Confirm Bonus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
