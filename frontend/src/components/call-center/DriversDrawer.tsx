import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Phone, Package, Clock } from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  phoneNumber: string;
  accountStatus: string;
  banned: boolean;
  vehicleType?: string;
  createdAt: Date;
}

interface DriversDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drivers: Driver[];
  loading: boolean;
  filter: 'active' | 'pending' | 'rejected' | 'banned' | 'all';
  onFilterChange: (filter: 'active' | 'pending' | 'rejected' | 'banned' | 'all') => void;
  formatTimeAgo: (date: Date) => string;
}

export function DriversDrawer({
  open,
  onOpenChange,
  drivers,
  loading,
  filter,
  onFilterChange,
  formatTimeAgo,
}: DriversDrawerProps) {
  const filteredDrivers = drivers.filter(driver => {
    if (filter === 'all') return true;
    if (filter === 'active') return driver.accountStatus === 'active';
    if (filter === 'pending') return driver.accountStatus === 'pending';
    if (filter === 'rejected') return driver.accountStatus === 'rejected';
    if (filter === 'banned') return driver.banned === true;
    return true;
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Drivers</h2>
              <p className="text-sm text-gray-500 mt-1">{filteredDrivers.length} drivers</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-4 border-b overflow-x-auto">
          <Button
            size="sm"
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => onFilterChange('active')}
          >
            Active
          </Button>
          <Button
            size="sm"
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => onFilterChange('pending')}
          >
            Pending
          </Button>
          <Button
            size="sm"
            variant={filter === 'rejected' ? 'default' : 'outline'}
            onClick={() => onFilterChange('rejected')}
          >
            Rejected
          </Button>
          <Button
            size="sm"
            variant={filter === 'banned' ? 'default' : 'outline'}
            onClick={() => onFilterChange('banned')}
          >
            Banned
          </Button>
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => onFilterChange('all')}
          >
            All
          </Button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-200px)] p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">Loading drivers...</div>
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Users className="w-12 h-12 mb-2" />
              <p className="text-sm">No drivers found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDrivers.map((driver) => (
                <Card key={driver.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{driver.name}</p>
                        <p className="text-xs text-gray-500">{driver.id.slice(0, 16)}...</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          driver.accountStatus === 'active'
                            ? 'bg-green-100 text-green-800'
                            : driver.accountStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : driver.accountStatus === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : driver.banned
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {driver.banned ? 'Banned' : driver.accountStatus}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        <span>{driver.phoneNumber || 'N/A'}</span>
                      </div>
                      {driver.vehicleType && (
                        <div className="flex items-center gap-2">
                          <Package className="w-3 h-3" />
                          <span>{driver.vehicleType}</span>
                        </div>
                      )}
                      {driver.createdAt && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(new Date(driver.createdAt))}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
