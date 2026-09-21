import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Navigation, Package, Clock, Check, X } from 'lucide-react';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  vehicleType: string;
  status: string;
  createdAt: Date;
}

interface OrderCardProps {
  order: Order;
  isSelected: boolean;
  onSelect: () => void;
  onApprove: () => void;
  onReject: () => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  formatTimeAgo: (date: Date) => string;
}

export function OrderCard({
  order,
  isSelected,
  onSelect,
  onApprove,
  onReject,
  getStatusColor,
  getStatusText,
  formatTimeAgo,
}: OrderCardProps) {
  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-semibold text-gray-900">{order.customerName}</p>
            <p className="text-xs text-gray-500">{order.id.slice(0, 16)}...</p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </span>
        </div>

        <div className="space-y-2 text-xs text-gray-600 mb-3">
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3" />
            <span>{order.customerPhone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{order.pickupAddress}</span>
          </div>
          <div className="flex items-center gap-2">
            <Navigation className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{order.deliveryAddress}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-3 h-3" />
            <span>{order.vehicleType}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(new Date(order.createdAt))}</span>
          </div>
        </div>

        {order.status === 'pending_approval' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onApprove();
              }}
            >
              <Check className="w-3 h-3 mr-1" />
              Select Agent
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onReject();
              }}
            >
              <X className="w-3 h-3 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
