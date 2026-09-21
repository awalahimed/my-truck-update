import { useState, useEffect } from "react";
import { orpc } from "@/lib/oprc";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "./data-table";
import { customerColumns, type CustomerRow } from "./customer-columns";

export function CustomerProgressionView() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orpc.agent.commissions.getUserProgression()
      .then((res) => {
        if (res.success) {
          const formattedCustomers = res.customers.map((c: any) => ({
            ...c,
            userLifetimeEarnings: parseFloat(c.userLifetimeEarnings || 0),
            createdAt: new Date(c.createdAt),
          }));
          setCustomers(formattedCustomers);
        }
      })
      .catch((error) => {
        console.error('Failed to load customer progression:', error);
        toast.error("Failed to load customer progression");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Customer Lifecycle</CardTitle>
          <CardDescription>
            {customers.length} registered customer{customers.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No customers registered yet. Start registering customers to earn commissions!
            </div>
          ) : (
            <DataTable
              columns={customerColumns}
              data={customers}
              searchKey="name"
              searchPlaceholder="Search customers..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
