"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/oprc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  IconWallet,
  IconLock,
  IconArrowUpRight,
  IconArrowDownLeft,
  IconRefresh,
  IconShieldCheck,
  IconInfoCircle,
  IconCheck,
  IconCreditCard,
  IconSparkles,
} from "@tabler/icons-react";

export function WalletDashboard() {
  // Task 4: Fetch user's wallet via getWallet query
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["wallet", "current"],
    queryFn: async () => {
      const res = await (orpc as any).wallet.getWallet();
      return res;
    },
    staleTime: 1000 * 30, // 30 seconds
  });

  const availableBalance = Number(data?.availableBalance ?? data?.wallet?.balance ?? 0);
  const reservedBalance = Number(data?.reservedBalance ?? data?.wallet?.reservedBalance ?? 0);
  const totalBalance = availableBalance + reservedBalance;

  // Top Up Modal State
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(1000);
  const [firstName, setFirstName] = useState("Shipper");
  const [lastName, setLastName] = useState("Demo");
  const [isProcessingChapa, setIsProcessingChapa] = useState(false);
  const [isProcessingDirect, setIsProcessingDirect] = useState(false);

  // Ethiopian Birr formatter
  const formatETB = (amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount).replace("ETB", "").trim() + " ETB";
  };

  const handleChapaDeposit = async () => {
    if (!topUpAmount || topUpAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setIsProcessingChapa(true);
    try {
      const res = await (orpc as any).payment.initialize({
        amount: String(topUpAmount),
        currency: "ETB",
        first_name: firstName || "Shipper",
        last_name: lastName || "User",
        return_url: window.location.href,
      });

      if (res?.checkout_url) {
        toast.success("Redirecting to Chapa secure checkout...");
        window.location.href = res.checkout_url;
      } else {
        toast.error("Could not obtain checkout URL from payment gateway");
      }
    } catch (err: any) {
      console.error("Chapa checkout error:", err);
      toast.error(err?.message || "Payment initialization failed. You can use Instant Top-Up below for testing.");
    } finally {
      setIsProcessingChapa(false);
    }
  };

  const handleDirectTopUp = async () => {
    if (!topUpAmount || topUpAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setIsProcessingDirect(true);
    try {
      const res = await (orpc as any).wallet.topUp({
        amount: Number(topUpAmount),
        description: `Direct Account Top-Up of ${topUpAmount} ETB`,
      });

      if (res?.success) {
        toast.success(`Successfully deposited ${topUpAmount.toLocaleString()} ETB!`);
        setIsTopUpOpen(false);
        refetch();
      } else {
        toast.error("Top-up could not be processed");
      }
    } catch (err: any) {
      console.error("Direct topup error:", err);
      toast.error(err?.message || "Failed to complete top-up");
    } finally {
      setIsProcessingDirect(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <IconWallet className="h-6 w-6" />
            </div>
            Escrow Wallet & Payout Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage your operational balances, active transit escrow holds, and payment transfers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 text-xs gap-1.5"
          >
            <IconRefresh className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setIsTopUpOpen(true)}
            className="h-9 text-xs bg-blue-600 hover:bg-blue-700 gap-1.5"
          >
            <IconArrowDownLeft className="h-3.5 w-3.5" />
            Top Up (Chapa)
          </Button>
        </div>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="flex items-center gap-3 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900">
        <IconShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
        <div className="leading-relaxed">
          <span className="font-semibold">MyTruck Escrow Protection:</span> When an order is accepted, funds are held in
          strict multi-signature escrow. Drivers are guaranteed payout upon delivery, and shippers' funds remain protected.
        </div>
      </div>

      {/* Distinct Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Metric 1: Available Balance */}
        <Card className="border shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-emerald-50/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md">
                  <IconWallet className="h-4 w-4" />
                </div>
                Available Balance
              </CardTitle>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] gap-1">
                <IconCheck className="h-3 w-3" />
                Ready to Use
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-1">
            <div>
              <div className="text-3xl font-extrabold font-mono text-gray-950 tracking-tight">
                {formatETB(availableBalance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Funds ready for booking shipments, accepting driver bids, or withdrawing to your bank.
              </p>
            </div>

            <div className="pt-2 border-t flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsTopUpOpen(true)}
                className="flex-1 h-8 text-xs text-emerald-800 hover:bg-emerald-50"
              >
                Deposit (Chapa)
              </Button>
              <Button size="sm" variant="outline" className="flex-1 h-8 text-xs text-gray-700">
                Withdraw to Bank
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Reserved Balance (Escrow) */}
        <Card className="border shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-amber-50/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 text-amber-700 rounded-md">
                  <IconLock className="h-4 w-4" />
                </div>
                Reserved Balance (Escrow)
              </CardTitle>
              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] gap-1">
                <IconLock className="h-3 w-3" />
                Locked in Transit
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-1">
            <div>
              <div className="text-3xl font-extrabold font-mono text-amber-950 tracking-tight">
                {formatETB(reservedBalance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Locked in active freight transit. Automatically released to the driver upon delivery confirmation.
              </p>
            </div>

            <div className="pt-2 border-t flex items-center justify-between text-xs text-amber-800 bg-amber-50/60 p-2 rounded-md">
              <div className="flex items-center gap-1.5">
                <IconInfoCircle className="h-4 w-4 text-amber-600" />
                <span>Active Loads Escrow Hold</span>
              </div>
              <span className="font-mono font-semibold">{formatETB(reservedBalance)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consolidated Portfolio Summary */}
      <Card className="border shadow-xs bg-gray-50/50">
        <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Account Value
            </div>
            <div className="text-xl font-bold font-mono text-gray-900 mt-0.5">
              {formatETB(totalBalance)}
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <div>
              <span>Total Topups: </span>
              <span className="font-semibold text-gray-800 font-mono">
                {formatETB(Number(data?.totalTopup ?? 0))}
              </span>
            </div>
            <div>
              <span>Total Withdrawn: </span>
              <span className="font-semibold text-gray-800 font-mono">
                {formatETB(Number(data?.totalWithdrawn ?? 0))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapa & Direct Top-Up Dialog */}
      <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-md">
                <IconCreditCard className="h-5 w-5" />
              </div>
              Top Up Wallet (ክፍያ ማስተላለፍ)
            </DialogTitle>
            <DialogDescription>
              Add funds in Ethiopian Birr (ETB) to cover your shipment escrow budget.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                Amount (ETB)
              </label>
              <Input
                type="number"
                min="10"
                step="50"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(Number(e.target.value))}
                placeholder="Enter amount in ETB"
                className="font-mono text-base font-semibold"
              />
              <div className="flex gap-2 mt-2">
                {[500, 1000, 3000, 5000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTopUpAmount(preset)}
                    className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-colors ${
                      topUpAmount === preset
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                    }`}
                  >
                    +{preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  First Name
                </label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  Last Name
                </label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-lg text-xs text-amber-900 flex items-start gap-2">
              <IconShieldCheck className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                100% Secure Transaction. Supports Telebirr, CBE Birr, Awash, and Bank Cards via Chapa.
              </span>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleDirectTopUp}
              disabled={isProcessingDirect || isProcessingChapa}
              className="text-xs border-dashed gap-1.5"
            >
              <IconSparkles className="h-3.5 w-3.5 text-blue-600" />
              {isProcessingDirect ? "Processing..." : "Instant Simulation (Test)"}
            </Button>
            <Button
              type="button"
              onClick={handleChapaDeposit}
              disabled={isProcessingChapa || isProcessingDirect}
              className="bg-blue-600 hover:bg-blue-700 text-xs gap-1.5 flex-1"
            >
              <IconCreditCard className="h-3.5 w-3.5" />
              {isProcessingChapa ? "Connecting Chapa..." : "Pay with Chapa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default WalletDashboard;
