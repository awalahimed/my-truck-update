"use client";

import { useState, useEffect } from "react";
import { orpc } from "@/lib/oprc";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { IconSettings, IconCoin, IconCalendar, IconCheck } from "@tabler/icons-react";

interface ReferralConfig {
  id?: string;
  referrerRewardAmount: string;
  refereeRewardAmount: string;
  minOrderAmount: string;
  expiryDays: number;
  enabled: boolean;
}

export function ReferralConfig() {
  const [config, setConfig] = useState<ReferralConfig>({
    referrerRewardAmount: '50.00',
    refereeRewardAmount: '25.00',
    minOrderAmount: '100.00',
    expiryDays: 30,
    enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await orpc.admin.referral.getConfig();
      if (data.success && data.config) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const result = await orpc.admin.referral.updateConfig({
        referrerRewardAmount: config.referrerRewardAmount,
        refereeRewardAmount: config.refereeRewardAmount,
        minOrderAmount: config.minOrderAmount,
        expiryDays: config.expiryDays,
        enabled: config.enabled,
      });
      
      if (result.success) {
        toast.success('Configuration updated successfully');
        fetchConfig();
      } else {
        toast.error('Failed to update configuration');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Referral Configuration</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="h-64 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Referral Configuration</h2>
        <p className="text-muted-foreground">Manage referral program settings and rewards</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconSettings className="h-5 w-5" />
            Program Settings
          </CardTitle>
          <CardDescription>Configure referral program parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Program */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base font-medium">Enable Referral Program</Label>
              <p className="text-sm text-muted-foreground">
                Turn the referral program on or off
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
            />
          </div>

          {/* Reward Amounts */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="referrerReward" className="flex items-center gap-2">
                <IconCoin className="h-4 w-4" />
                Referrer Reward (ETB)
              </Label>
              <Input
                id="referrerReward"
                type="number"
                step="0.01"
                value={config.referrerRewardAmount}
                onChange={(e) => setConfig({ ...config, referrerRewardAmount: e.target.value })}
                placeholder="50.00"
              />
              <p className="text-xs text-muted-foreground">
                Amount the referrer earns when referee completes first order
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refereeReward" className="flex items-center gap-2">
                <IconCoin className="h-4 w-4" />
                Referee Reward (ETB)
              </Label>
              <Input
                id="refereeReward"
                type="number"
                step="0.01"
                value={config.refereeRewardAmount}
                onChange={(e) => setConfig({ ...config, refereeRewardAmount: e.target.value })}
                placeholder="25.00"
              />
              <p className="text-xs text-muted-foreground">
                Amount the new user earns when they complete first order
              </p>
            </div>
          </div>

          {/* Minimum Order Amount */}
          <div className="space-y-2">
            <Label htmlFor="minOrder" className="flex items-center gap-2">
              <IconCheck className="h-4 w-4" />
              Minimum Order Amount (ETB)
            </Label>
            <Input
              id="minOrder"
              type="number"
              step="0.01"
              value={config.minOrderAmount}
              onChange={(e) => setConfig({ ...config, minOrderAmount: e.target.value })}
              placeholder="100.00"
            />
            <p className="text-xs text-muted-foreground">
              Minimum order value required to qualify for referral rewards
            </p>
          </div>

          {/* Expiry Days */}
          <div className="space-y-2">
            <Label htmlFor="expiryDays" className="flex items-center gap-2">
              <IconCalendar className="h-4 w-4" />
              Referral Expiry (Days)
            </Label>
            <Input
              id="expiryDays"
              type="number"
              value={config.expiryDays}
              onChange={(e) => setConfig({ ...config, expiryDays: parseInt(e.target.value) || 30 })}
              placeholder="30"
            />
            <p className="text-xs text-muted-foreground">
              Number of days after signup before referral expires
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Current Configuration Preview</CardTitle>
          <CardDescription>How the referral program currently works</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <p>
                User shares their referral code with a friend
              </p>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <p>
                Friend signs up using the referral code
              </p>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <p>
                Friend completes their first order of at least <strong>{config.minOrderAmount} ETB</strong> within <strong>{config.expiryDays} days</strong>
              </p>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">4</span>
              </div>
              <p>
                Referrer earns <strong>{config.referrerRewardAmount} ETB</strong> and referee earns <strong>{config.refereeRewardAmount} ETB</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
