"use client";

import { useState, useEffect } from "react";
import { orpc } from "@/lib/oprc";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconMedal,
  IconTrophy,
  IconStar,
  IconCrown,
  IconRefresh,
} from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TIER_STYLES: Record<string, { label: string; color: string; bg: string; text: string; border: string; icon: any }> = {
  new: {
    label: "New",
    color: "#9CA3AF",
    bg: "bg-gray-50",
    text: "text-gray-500",
    border: "border-gray-200",
    icon: IconMedal,
  },
  bronze: {
    label: "Bronze",
    color: "#CD7F32",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: IconMedal,
  },
  silver: {
    label: "Silver",
    color: "#A0A0A0",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: IconTrophy,
  },
  gold: {
    label: "Gold",
    color: "#FFD700",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    icon: IconStar,
  },
  platinum: {
    label: "Platinum",
    color: "#E5E4E2",
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    icon: IconCrown,
  },
};

function TierBadge({ tier }: { tier: string }) {
  const s = TIER_STYLES[tier] || TIER_STYLES.new;
  const Icon = s.icon;
  return (
    <Badge variant="outline" className={`${s.bg} ${s.text} ${s.border} gap-1`}>
      <Icon className="h-3 w-3" style={{ color: s.color }} />
      {s.label}
    </Badge>
  );
}

interface AgentTierRow {
  agentId: string;
  agentName: string;
  tier: string;
  qualifiedTier: string;
  canUpgrade: boolean;
  stats: {
    trucksRegistered: number;
    usersRegistered: number;
    completedDeliveries: number;
    conversionRate: number;
    reliabilityScore: number;
  };
}

interface TierBreakdown {
  distribution: Record<string, number>;
  allAgents: AgentTierRow[];
}

export function AdminTiersView() {
  const [data, setData] = useState<TierBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const fetchBreakdown = async () => {
    try {
      setLoading(true);
      const result = await orpc.admin.agents.getTierBreakdown();
      if (result.success) {
        setData(result as any);
      }
    } catch (error) {
      console.error("Failed to fetch tier breakdown:", error);
      toast.error("Failed to load tier data");
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      const result = await orpc.admin.agents.recalculateTiers();
      if (result.success) {
        toast.success(`Recalculated ${result.total} agents. ${result.upgrades} upgrades.`);
        fetchBreakdown();
      }
    } catch (error) {
      console.error("Failed to recalculate tiers:", error);
      toast.error("Failed to recalculate tiers");
    } finally {
      setRecalculating(false);
    }
  };

  useEffect(() => {
    fetchBreakdown();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const totalAgents = data ? Object.values(data.distribution).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Tiers</h1>
          <p className="text-muted-foreground">
            Performance tier distribution across {totalAgents} agents
          </p>
        </div>
        <Button onClick={handleRecalculate} disabled={recalculating}>
          <IconRefresh className={`h-4 w-4 mr-2 ${recalculating ? "animate-spin" : ""}`} />
          {recalculating ? "Recalculating..." : "Recalculate All Tiers"}
        </Button>
      </div>

      {/* Distribution Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(TIER_STYLES).map(([key, style]) => {
          const count = data?.distribution[key] || 0;
          const Icon = style.icon;
          return (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{style.label}</CardTitle>
                <Icon className="h-4 w-4" style={{ color: style.color }} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: style.color }}>{count}</div>
                <p className="text-xs text-muted-foreground">
                  {totalAgents > 0 ? `${((count / totalAgents) * 100).toFixed(1)}% of agents` : "No agents"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Agents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Tier Details</CardTitle>
          <CardDescription>All agents with their current tier and upgrade eligibility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Current Tier</TableHead>
                  <TableHead>Qualified Tier</TableHead>
                  <TableHead className="text-center">Trucks</TableHead>
                  <TableHead className="text-center">Users</TableHead>
                  <TableHead className="text-center">Deliveries</TableHead>
                  <TableHead className="text-center">Conversion</TableHead>
                  <TableHead className="text-center">Reliability</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!data || data.allAgents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No agents found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.allAgents.map((agent) => (
                    <TableRow key={agent.agentId}>
                      <TableCell className="font-medium">{agent.agentName}</TableCell>
                      <TableCell><TierBadge tier={agent.tier} /></TableCell>
                      <TableCell>
                        {agent.canUpgrade ? (
                          <span className="flex items-center gap-1">
                            <TierBadge tier={agent.qualifiedTier} />
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                              Eligible
                            </Badge>
                          </span>
                        ) : (
                          <TierBadge tier={agent.tier} />
                        )}
                      </TableCell>
                      <TableCell className="text-center">{agent.stats.trucksRegistered}</TableCell>
                      <TableCell className="text-center">{agent.stats.usersRegistered}</TableCell>
                      <TableCell className="text-center">{agent.stats.completedDeliveries}</TableCell>
                      <TableCell className="text-center">{agent.stats.conversionRate}%</TableCell>
                      <TableCell className="text-center">{agent.stats.reliabilityScore}%</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
