import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Phone, Navigation } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  phoneNumber: string;
  latitude?: string | null;
  longitude?: string | null;
  distance?: number | null;
}

interface AgentSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: Agent[];
  loading: boolean;
  selectedAgentId: string | null;
  onAgentSelect: (agentId: string) => void;
  onConfirm: () => void;
  orderId: string;
}

export function AgentSelectionDialog({
  open,
  onOpenChange,
  agents,
  loading,
  selectedAgentId,
  onAgentSelect,
  onConfirm,
  orderId,
}: AgentSelectionDialogProps) {
  const handleConfirm = () => {
    if (selectedAgentId) {
      onConfirm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Agent for Order</DialogTitle>
          <DialogDescription>
            Choose an agent to assign to this order. Agents are sorted by distance to pickup location.
          </DialogDescription>
        </DialogHeader>

        <div className="h-[400px] w-full overflow-y-auto pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">Loading nearby agents...</div>
            </div>
          ) : agents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Navigation className="w-12 h-12 mb-2" />
              <p className="text-sm">No agents available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {agents.map((agent) => (
                <Card
                  key={agent.id}
                  className={`p-3 cursor-pointer transition-all ${
                    selectedAgentId === agent.id
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onAgentSelect(agent.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{agent.name}</p>
                      <p className="text-xs text-gray-500">{agent.id.slice(0, 12)}...</p>
                    </div>
                    {agent.distance !== null && agent.distance !== undefined && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {(agent.distance / 1000).toFixed(1)} km
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      <span>{agent.phoneNumber || 'N/A'}</span>
                    </div>
                    {agent.latitude && agent.longitude && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {parseFloat(agent.latitude).toFixed(3)}, {parseFloat(agent.longitude).toFixed(3)}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onAgentSelect(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedAgentId || loading}
          >
            Assign & Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
