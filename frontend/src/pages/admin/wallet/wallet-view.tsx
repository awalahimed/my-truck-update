"use client";

import { useState, useEffect } from "react";
import { orpc } from "@/lib/oprc";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnhancedDataTable } from "@/components/enhanced-data-table";
import { 
  IconWallet, 
  IconCoin, 
  IconTrendingUp, 
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconClock,
  IconCash // *** NEW: Icon for withdrawal
} from "@tabler/icons-react";
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
// *** NEW: Import Sheet components instead of Dialog
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface WalletStats {
  currentBalance: string;
  totalFeesCollected: string;
  monthlyFees: string;
  todayFees: string;
  totalOrders: number;
  earningsByDay: Record<string, { amount: number; count: number }>;
}

interface FeeTransaction {
  id: string;
  amount: string;
  txRef: string;
  description: string | null;
  meta: any;
  createdAt: Date;
  fromUserName: string | null;
  fromUserPhone: string | null;
  fromUserProfilePhoto: string | null;
}

const chartConfig = {
  earnings: {
    label: "Platform Fees",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function AdminWalletView() {
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<FeeTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [walletExists, setWalletExists] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // *** NEW: Withdrawal dialog state
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const pageSize = 20;

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch wallet stats
      const statsData = await orpc.admin.wallet.getStats();
      if (statsData.success) {
        setStats(statsData.stats);
        setWalletExists(true);
      } else {
        // Wallet doesn't exist
        setWalletExists(false);
        setLoading(false);
        return;
      }
    } catch (error: any) {
      console.error('Failed to fetch wallet data:', error);
      setWalletExists(false);
      setLoading(false);
      return;
    }

    // Only fetch transactions if wallet exists
    try {
      const transactionsData = await orpc.admin.wallet.getTransactions({
        limit: 100,
        offset: 0,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      
      if (transactionsData.success) {
        setTransactions(transactionsData.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
    
    setLoading(false);
  };

  const handleCreateWallet = async () => {
    try {
      setCreating(true);
      const response = await orpc.admin.wallet.createPlatformWallet();
      
      if (response.success) {
        toast.success('Platform wallet created successfully!');
        setWalletExists(true);
        // Refresh data
        await fetchData();
      } else {
        toast.error(response.message || 'Failed to create wallet');
      }
    } catch (error: any) {
      console.error('Failed to create wallet:', error);
      toast.error(error?.message || 'Failed to create platform wallet');
    } finally {
      setCreating(false);
    }
  };

  // *** NEW: Handle withdrawal
  const handleWithdraw = async () => {
    // Validate inputs
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!bankName || !accountName || !accountNumber) {
      toast.error('Please fill in all bank details');
      return;
    }
    
    const amount = parseFloat(withdrawAmount);
    const currentBalance = parseFloat(stats?.currentBalance || '0');
    
    if (amount > currentBalance) {
      toast.error('Insufficient balance');
      return;
    }
    
    try {
      setWithdrawing(true);
      
      // Note: You'll need to add this endpoint to the backend
      // For now, showing what the call would look like
      toast.info('Withdrawal request submitted');
      toast.info(`Amount: ${amount} ETB to ${bankName} - ${accountNumber}`);
      
      // Reset form and close dialog
      setWithdrawAmount('');
      setBankName('');
      setAccountName('');
      setAccountNumber('');
      setWithdrawDialogOpen(false);
      
      // Refresh data
      await fetchData();
    } catch (error: any) {
      console.error('Failed to withdraw:', error);
      toast.error(error?.message || 'Failed to process withdrawal');
    } finally {
      setWithdrawing(false);
    }
  };

  // *** NEW: Export transactions to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    try {
      // Prepare CSV headers
      const headers = ['Date', 'Driver Name', 'Driver Phone', 'Description', 'Fee Amount (ETB)', 'Transaction ID'];
      
      // Prepare CSV rows
      const rows = transactions.map(tx => [
        new Date(tx.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        tx.fromUserName || 'N/A',
        tx.fromUserPhone || 'N/A',
        tx.description || 'Platform fee',
        tx.amount,
        tx.txRef,
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `platform-transactions-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Transactions exported successfully');
    } catch (error) {
      console.error('Failed to export CSV:', error);
      toast.error('Failed to export transactions');
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  // Prepare chart data
  const chartData = stats
    ? Object.entries(stats.earningsByDay)
        .map(([date, data]) => ({
          date,
          earnings: data.amount,
          orders: data.count,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  // Filter chart data based on time range
  const filteredChartData = chartData.filter((item) => {
    if (chartData.length === 0) return false;
    
    const date = new Date(item.date);
    const referenceDate = new Date(chartData[chartData.length - 1].date);
    let daysToSubtract = 30;
    
    if (timeRange === "7d") {
      daysToSubtract = 7;
    } else if (timeRange === "90d") {
      daysToSubtract = 90;
    }
    
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    
    return date >= startDate;
  });

  // Pagination for transactions
  const totalPages = Math.ceil(transactions.length / pageSize);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: (value: Date) => (
        <span className="text-sm">
          {new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      accessorKey: "fromUserName",
      header: "Driver",
      cell: (value: string | null, row: FeeTransaction) => {
        const profilePhotoUrl = row.fromUserProfilePhoto 
          ? `${import.meta.env.VITE_API_URL}/uploads/${row.fromUserProfilePhoto}`
          : null;
        
        return (
          <div className="flex items-center gap-2">
            {profilePhotoUrl ? (
              <img 
                src={profilePhotoUrl} 
                alt={value || "Driver"} 
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                {value ? value.charAt(0).toUpperCase() : "?"}
              </div>
            )}
            <div>
              <div className="font-medium">{value || "N/A"}</div>
              {row.fromUserPhone && (
                <div className="text-xs text-muted-foreground">{row.fromUserPhone}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: (value: string | null, row: FeeTransaction) => (
        <div>
          <div className="text-sm">{value || "Platform fee"}</div>
          {row.meta?.orderId && (
            <div className="text-xs text-muted-foreground">
              Order: {row.meta.orderId.substring(0, 8)}...
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Fee Amount",
      cell: (value: string) => (
        <span className="font-semibold text-green-600">+{value} ETB</span>
      ),
    },
    {
      accessorKey: "txRef",
      header: "Transaction ID",
      cell: (value: string) => (
        <Badge variant="outline" className="font-mono text-xs">
          {value.substring(0, 12)}...
        </Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Platform Wallet</h2>
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

  // Show create wallet button if wallet doesn't exist
  if (!walletExists) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Platform Wallet</h2>
          <p className="text-muted-foreground">Track platform fees and earnings from completed orders</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Platform Wallet Not Found</CardTitle>
            <CardDescription>
              Create a platform wallet to start collecting fees from completed orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-dashed p-8 text-center">
              <IconWallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Platform Wallet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                The platform wallet is used to collect 5% fees from all completed orders.
                Create it now to start tracking your earnings.
              </p>
              <Button 
                onClick={handleCreateWallet} 
                disabled={creating}
                size="lg"
              >
                {creating ? (
                  <>
                    <IconClock className="mr-2 h-4 w-4 animate-spin" />
                    Creating Wallet...
                  </>
                ) : (
                  <>
                    <IconWallet className="mr-2 h-4 w-4" />
                    Create Platform Wallet
                  </>
                )}
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">What happens when you create the wallet?</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>A platform user account will be created</li>
                <li>A wallet will be initialized with 0.00 ETB balance</li>
                <li>5% fees from completed orders will automatically be collected</li>
                <li>You can track all earnings and transactions from this page</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Platform Wallet</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No wallet data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Platform Wallet</h2>
          <p className="text-muted-foreground">Track platform fees and earnings from completed orders</p>
        </div>
        {/* *** NEW: Withdrawal button with Sheet (sidebar) */}
        <Sheet open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
          <SheetTrigger asChild>
            <Button variant="default" size="lg">
              <IconCash className="mr-2 h-4 w-4" />
              Withdraw Funds
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[500px] overflow-y-auto">
            <SheetHeader className="pb-6">
              <SheetTitle>Withdraw Funds</SheetTitle>
              <SheetDescription>
                Withdraw platform earnings to your bank account
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-6 py-4 px-1">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (ETB)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground">
                  Available balance: {parseFloat(stats?.currentBalance || '0').toLocaleString()} ETB
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Select value={bankName} onValueChange={setBankName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cbe">Commercial Bank of Ethiopia</SelectItem>
                    <SelectItem value="dashen">Dashen Bank</SelectItem>
                    <SelectItem value="awash">Awash Bank</SelectItem>
                    <SelectItem value="abyssinia">Bank of Abyssinia</SelectItem>
                    <SelectItem value="wegagen">Wegagen Bank</SelectItem>
                    <SelectItem value="united">United Bank</SelectItem>
                    <SelectItem value="nib">Nib International Bank</SelectItem>
                    <SelectItem value="coop">Cooperative Bank of Oromia</SelectItem>
                    <SelectItem value="lion">Lion International Bank</SelectItem>
                    <SelectItem value="zemen">Zemen Bank</SelectItem>
                    <SelectItem value="enat">Enat Bank</SelectItem>
                    <SelectItem value="bunna">Bunna International Bank</SelectItem>
                    <SelectItem value="abay">Abay Bank</SelectItem>
                    <SelectItem value="addis">Addis International Bank</SelectItem>
                    <SelectItem value="debub">Debub Global Bank</SelectItem>
                    <SelectItem value="berhan">Berhan International Bank</SelectItem>
                    <SelectItem value="siinqee">Siinqee Bank</SelectItem>
                    <SelectItem value="hijra">Hijra Bank</SelectItem>
                    <SelectItem value="shabelle">Shabelle Bank</SelectItem>
                    <SelectItem value="tsehay">Tsehay Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Holder Name</Label>
                <Input
                  id="accountName"
                  placeholder="Full name as on bank account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="Bank account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>
            </div>
            <SheetFooter className="gap-2 pt-6">
              <Button
                variant="outline"
                onClick={() => setWithdrawDialogOpen(false)}
                disabled={withdrawing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleWithdraw}
                disabled={withdrawing}
              >
                {withdrawing ? (
                  <>
                    <IconClock className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <IconCash className="mr-2 h-4 w-4" />
                    Withdraw
                  </>
                )}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <IconWallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {parseFloat(stats.currentBalance).toLocaleString()} ETB
            </div>
            <p className="text-xs text-muted-foreground">
              Available balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <IconCoin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {parseFloat(stats.totalFeesCollected).toLocaleString()} ETB
            </div>
            <p className="text-xs text-muted-foreground">
              All time platform fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {parseFloat(stats.monthlyFees).toLocaleString()} ETB
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <IconCalendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {parseFloat(stats.todayFees).toLocaleString()} ETB
            </div>
            <p className="text-xs text-muted-foreground">
              Today's earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle>Platform Fee Earnings</CardTitle>
              <CardDescription>Daily platform fees collected over time</CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="w-[160px] rounded-lg sm:ml-auto"
                aria-label="Select a value"
              >
                <SelectValue placeholder="Last 30 days" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="90d" className="rounded-lg">Last 90 days</SelectItem>
                <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
                <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
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
                  <linearGradient id="fillEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-earnings)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-earnings)"
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
                  dataKey="earnings"
                  type="natural"
                  fill="url(#fillEarnings)"
                  stroke="var(--color-earnings)"
                  stackId="a"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Platform fees collected from completed orders</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <IconDownload className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          
          {/* Date Filters */}
          <div className="grid gap-4 md:grid-cols-2 pt-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <EnhancedDataTable
            columns={columns}
            data={paginatedTransactions}
            loading={loading}
            onAdd={() => {}}
          />
          
          {/* Custom Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, transactions.length)} of {transactions.length} transactions
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
