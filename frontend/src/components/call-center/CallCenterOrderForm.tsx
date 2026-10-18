import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { orpc } from '@/lib/oprc';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Agent {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
}

interface CallCenterOrderFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  availableAgents: Agent[];
}

export function CallCenterOrderForm({ onSuccess, onCancel, availableAgents }: CallCenterOrderFormProps) {
  const [loading, setLoading] = useState(false);
  
  // Fetch active goods from Master Data
  const { data: goods = [] } = useQuery({
    queryKey: ['masterData', 'goods'],
    queryFn: async () => {
      const res = await (orpc as any).masterData.getGoods();
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
  
  // Form State
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupLatitude, setPickupLatitude] = useState('');
  const [pickupLongitude, setPickupLongitude] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryLatitude, setDeliveryLatitude] = useState('');
  const [deliveryLongitude, setDeliveryLongitude] = useState('');
  const [vehicleType, setVehicleType] = useState<'motorcycle' | 'car' | 'truck'>('truck');
  const [materials, setMaterials] = useState('');
  const [assignedAgentId, setAssignedAgentId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone || !customerName || !pickupAddress || !deliveryAddress || !assignedAgentId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const result = await orpc.order.callCenterCreateOrder({
        customerPhone,
        customerName,
        assignedAgentId,
        pickupAddress,
        // using dummy coordinates if not provided for now, ideally should use a map picker
        pickupLatitude: parseFloat(pickupLatitude) || 9.145,
        pickupLongitude: parseFloat(pickupLongitude) || 40.489,
        deliveryAddress,
        deliveryLatitude: parseFloat(deliveryLatitude) || 9.150,
        deliveryLongitude: parseFloat(deliveryLongitude) || 40.500,
        vehicleType,
        materials: materials.split(',').map(m => m.trim()),
      });

      if (result.success) {
        toast.success(result.message);
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Customer Details</h3>
        <Input 
          placeholder="Customer Phone" 
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          required
        />
        <Input 
          placeholder="Customer Name (if new)" 
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Load Details</h3>
        <Input 
          placeholder="Pickup Address" 
          value={pickupAddress}
          onChange={(e) => setPickupAddress(e.target.value)}
          required
        />
        <Input 
          placeholder="Delivery Address" 
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          required
        />

        <div className="space-y-1">
          {goods.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1">
              {goods.map((g: any) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => setMaterials(g.nameEn)}
                  className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                    materials === g.nameEn
                      ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {g.nameEn}
                </button>
              ))}
            </div>
          )}
          <Input 
            placeholder="Materials / Goods (e.g. Teff, Livestock, Coffee)" 
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            required
          />
        </div>
        
        <Select value={vehicleType} onValueChange={(val: 'motorcycle' | 'car' | 'truck') => setVehicleType(val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select vehicle type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="motorcycle">Motorcycle</SelectItem>
            <SelectItem value="car">Car</SelectItem>
            <SelectItem value="truck">Truck</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Assignment</h3>
        <Select value={assignedAgentId} onValueChange={setAssignedAgentId}>
          <SelectTrigger>
            <SelectValue placeholder="Select Verification Agent" />
          </SelectTrigger>
          <SelectContent>
            {availableAgents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 pt-4">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Create & Assign
        </Button>
      </div>
    </form>
  );
}
