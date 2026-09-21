"use client";

import { useState, useEffect } from "react";
import { orpc } from "@/lib/oprc";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconWallet, IconCoin, IconClock, IconTrendingUp, IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

interface WalletData {
  currentBalance: number;
  pendingEarnings: number;
  withdrawableAmount: number;
  totalLifetimeEarnings: number;
  lastPaymentDate: string | null;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string | Date;
}

export function AgentWalletView() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      // Fetch wallet data
      const walletResponse = await orpc.agent.wallet.getWallet();
      if (walletResponse.success && walletResponse.wallet) {
        const w = walletResponse.wallet;
        setWallet({
          currentBalance: w.currentBalance,
          pendingEarnings: w.pendingEarnings,
          withdrawableAmount: w.withdrawableAmount,
          totalLifetimeEarnings: w.totalLifetimeEarnings,
          lastPaymentDate: w.lastPaymentDate ? new Date(w.lastPaymentDate).toISOString() : null,
        });
      }

      // Fetch transactions
      const transactionsResponse = await orpc.agent.wallet.getTransactions({ limit: 50, offset: 0 });
      if (transactionsResponse.success && transactionsResponse.transactions) {
        setTransactions(transactionsResponse.transactions.map((t: any) => ({
          ...t,
          createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date(t.createdAt).toISOString(),
        })));
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      toast.error('Failed to load wallet information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleWithdraw = () => {
    toast.info('Withdrawal feature coming soon');
  };

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

  if (!wallet) {
    return (
      <div className="space-y-4">
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
      {/* Wallet Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <IconWallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {wallet.currentBalance.toLocaleString()} ETB
            </div>
            <p className="text-xs text-muted-foreground">
              Available balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
            <IconClock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {wallet.pendingEarnings.toLocaleString()} ETB
            </div>
            <p className="text-xs text-muted-foreground">
              Processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Withdrawable Amount</CardTitle>
            <IconCoin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {wallet.withdrawableAmount.toLocaleString()} ETB
            </div>
            <p className="text-xs text-muted-foreground">
              Ready to withdraw
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lifetime Earnings</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {wallet.totalLifetimeEarnings.toLocaleString()} ETB
            </div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Withdraw Funds</CardTitle>
              <CardDescription>
                Request a withdrawal to your registered bank account
              </CardDescription>
            </div>
            <Button onClick={handleWithdraw} disabled={wallet.withdrawableAmount <= 0}>
              <IconArrowDown className="mr-2 h-4 w-4" />
              Request Withdrawal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Available for Withdrawal</p>
                <p className="text-2xl font-bold text-green-600">
                  {wallet.withdrawableAmount.toLocaleString()} ETB
                </p>
              </div>
              {wallet.lastPaymentDate && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Last Payment</p>
                  <p className="text-sm font-medium">
                    {new Date(wallet.lastPaymentDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Your commission earnings, withdrawals, and deductions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transaction.amount > 0 ? (
                          <IconArrowUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <IconArrowDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className="capitalize font-medium">
                          {transaction.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <span className={transaction.amount > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} ETB
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.status === "completed"
                            ? "default"
                            : transaction.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.createdAt).toLocaleDateString()}
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
