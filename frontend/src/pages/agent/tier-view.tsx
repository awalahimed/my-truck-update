"use client";

import { useState, useEffect } from "react";
import { orpc } from "@/lib/oprc";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { IconMedal, IconTrophy, IconStar, IconCrown } from "@tabler/icons-react";

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; text: string; border: string; icon: any }> = {
  new: {
    label: "New",
    color: "#9CA3AF",
    bg: "bg-gray-50 dark:bg-gray-900",
    text: "text-gray-500 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-700",
    icon: IconMedal,
  },
  bronze: {
    label: "Bronze",
    color: "#CD7F32",
    bg: "bg-amber-50 dark:bg-amber-950",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    icon: IconMedal,
  },
  silver: {
    label: "Silver",
    color: "#A0A0A0",
    bg: "bg-slate-50 dark:bg-slate-950",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-800",
    icon: IconTrophy,
  },
  gold: {
    label: "Gold",
    color: "#FFD700",
    bg: "bg-yellow-50 dark:bg-yellow-950",
    text: "text-yellow-700 dark:text-yellow-300",
    border: "border-yellow-200 dark:border-yellow-800",
    icon: IconStar,
  },
  platinum: {
    label: "Platinum",
    color: "#E5E4E2",
    bg: "bg-gray-50 dark:bg-gray-950",
    text: "text-gray-700 dark:text-gray-300",
    border: "border-gray-200 dark:border-gray-800",
    icon: IconCrown,
  },
};

const METRIC_LABELS: Record<string, string> = {
  trucksRegistered: "Trucks Registered",
  usersRegistered: "Users Registered",
  completedDeliveries: "Completed Deliveries",
  conversionRate: "Conversion Rate",
  reliabilityScore: "Reliability Score",
  totalRevenue: "Revenue Contribution",
  monthlyActivity: "Monthly Activity",
  fraudFree: "Fraud-Free Record",
};

interface TierProgress {
  currentTier: string;
  qualifiedTier: string;
  nextTier: string | null;
  stats: {
    trucksRegistered: number;
    usersRegistered: number;
    completedDeliveries: number;
    conversionRate: number;
    reliabilityScore: number;
    totalRevenue: number;
    monthlyActivity: boolean;
    fraudFree: boolean;
  };
  progress: Record<string, { current: number; required: number; met: boolean }>;
  benefits: string[];
  nextTierBenefits: string[] | null;
}

export function TierView() {
  const [data, setData] = useState<TierProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTier = async () => {
    try {
      setLoading(true);
      const result = await orpc.agent.getTier();
      if (result.success) {
        setData(result as any);
      }
    } catch (error) {
      console.error("Failed to fetch tier:", error);
      toast.error("Failed to load tier information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTier();
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
        <p className="text-muted-foreground">Failed to load tier data</p>
      </div>
    );
  }
  const currentConfig = TIER_CONFIG[data.currentTier] || TIER_CONFIG.new;

  const qualifiedConfig = TIER_CONFIG[data.qualifiedTier] || TIER_CONFIG.new;
  const TierIcon = currentConfig.icon;
  const nextConfig = data.nextTier ? TIER_CONFIG[data.nextTier] : null;

  return (
    <div className="space-y-6">
      {/* Current Tier Hero */}
      <Card className={`${currentConfig.bg} ${currentConfig.border} border-2`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-white dark:bg-gray-900 shadow">
              <TierIcon className="h-8 w-8" style={{ color: currentConfig.color }} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Tier</p>
              <h2 className="text-3xl font-bold" style={{ color: currentConfig.color }}>
                {currentConfig.label}
              </h2>
              {data.qualifiedTier !== data.currentTier && (
                <Badge className="mt-1 bg-emerald-100 text-emerald-700 border-emerald-200">
                  Eligible for {qualifiedConfig.label}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress to Next Tier */}
      {data.nextTier && nextConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Progress to {nextConfig.label}
              <nextConfig.icon className="h-5 w-5" style={{ color: nextConfig.color }} />
            </CardTitle>
            <CardDescription>
              Meet all requirements below to advance to {nextConfig.label}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(data.progress).map(([key, prog]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{METRIC_LABELS[key] || key}</span>
                  <span className={prog.met ? "text-emerald-600 font-medium" : "text-muted-foreground"}>
                    {key === "conversionRate" || key === "reliabilityScore"
                      ? `${prog.current}% / ${prog.required}%`
                      : key === "totalRevenue"
                        ? `$${prog.current.toFixed(0)} / $${prog.required}`
                        : key === "monthlyActivity" || key === "fraudFree"
                          ? prog.met ? "Yes" : "No"
                          : `${prog.current} / ${prog.required}`}
                  </span>
                </div>
                {typeof prog.current === "number" && typeof prog.required === "number" && prog.required > 0 && (
                  <Progress
                    value={Math.min((prog.current / prog.required) * 100, 100)}
                    className={prog.met ? "bg-emerald-100" : ""}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Current Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>{currentConfig.label} Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">&#10003;</span>
                <span className="text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Next Tier Benefits Preview */}
      {data.nextTierBenefits && nextConfig && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <nextConfig.icon className="h-4 w-4" />
              Next Tier: {nextConfig.label} Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.nextTierBenefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-muted-foreground mt-0.5">&#8594;</span>
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
