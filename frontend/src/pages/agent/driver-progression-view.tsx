import { useState, useEffect } from "react";
import { orpc } from "@/lib/oprc";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "./data-table";
import { driverColumns, type DriverRow } from "./driver-columns";

export function DriverProgressionView() {
  const [vehicles, setVehicles] = useState<DriverRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orpc.agent.commissions.getDriverProgression()
      .then((res) => {
        if (res.success) {
          const formattedDrivers = res.vehicles.map((d: any) => ({
            ...d,
            userLifetimeEarnings: parseFloat(d.userLifetimeEarnings || 0),
            createdAt: new Date(d.createdAt),
          }));
          setVehicles(formattedDrivers);
        }
      })
      .catch((error) => {
        console.error('Failed to load driver progression:', error);
        toast.error("Failed to load driver progression");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading drivers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Driver Lifecycle</CardTitle>
          <CardDescription>
            {vehicles.length} registered driver{vehicles.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No drivers registered yet. Start registering drivers to earn commissions!
            </div>
          ) : (
            <DataTable
              columns={driverColumns}
              data={vehicles}
              searchKey="name"
              searchPlaceholder="Search by driver name..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
