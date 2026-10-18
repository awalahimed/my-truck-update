import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Navigation, 
  Search, 
  UserCheck, 
  Building2, 
  ShieldCheck, 
  Check, 
  X,
  AlertCircle 
} from 'lucide-react';

export interface Agent {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  distance?: number | null;
  assignedCity?: string | null;
  assignedTown?: string | null;
  assignedTownManager?: string | null;
  agentType?: string | null;
  tier?: string | null;
  isCityMatch?: boolean;
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
  orderPickupAddress?: string;
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
  orderPickupAddress,
}: AgentSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter agents by search query (name, phone, city, town, type)
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agents;
    const q = searchQuery.toLowerCase().trim();
    return agents.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.phoneNumber?.toLowerCase().includes(q) ||
        a.assignedCity?.toLowerCase().includes(q) ||
        a.assignedTown?.toLowerCase().includes(q) ||
        a.agentType?.toLowerCase().includes(q)
    );
  }, [agents, searchQuery]);

  const selectedAgent = useMemo(
    () => agents.find((a) => a.id === selectedAgentId),
    [agents, selectedAgentId]
  );

  const localMatchesCount = useMemo(
    () => agents.filter((a) => a.isCityMatch).length,
    [agents]
  );

  const handleConfirm = () => {
    if (selectedAgentId) {
      onConfirm();
      onOpenChange(false);
      setSearchQuery('');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    onAgentSelect(null as any);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white shadow-2xl rounded-2xl border">
        {/* Header */}
        <div className="p-5 border-b bg-gray-50/70">
          <div className="flex items-center justify-between">
            <DialogHeader className="p-0 text-left">
              <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                Select Verification Agent for Order
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Assign a ground agent to verify cargo, validate documents, and authorize dispatch.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Context pill for targeted order */}
          {orderId && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs bg-white px-3 py-2 rounded-lg border shadow-2xs">
              <span className="font-semibold text-gray-700">Order:</span>
              <code className="text-[11px] text-blue-600 font-mono bg-blue-50 px-1.5 py-0.5 rounded">
                #{orderId.length > 18 ? orderId.slice(0, 10) + '...' + orderId.slice(-6) : orderId}
              </code>
              {orderPickupAddress && (
                <div className="flex items-center gap-1 text-gray-600 ml-auto font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate max-w-[200px]" title={orderPickupAddress}>
                    {orderPickupAddress}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Search Bar */}
          <div className="mt-3 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search agent by name, phone (+251...), or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 text-xs h-9 bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status summary */}
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              Available: <strong className="text-gray-900">{filteredAgents.length}</strong> agent(s)
            </span>
            {localMatchesCount > 0 && (
              <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                🎯 {localMatchesCount} local city match
              </span>
            )}
          </div>
        </div>

        {/* Agents List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[280px] max-h-[420px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
              <Navigation className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-xs">Locating eligible field agents...</p>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-center px-4">
              <AlertCircle className="w-10 h-10 mb-2 text-amber-500/80" />
              <p className="text-sm font-semibold text-gray-700">No agents found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                {searchQuery
                  ? `No agent matching "${searchQuery}". Try clearing your search query.`
                  : 'No active verification agents are currently registered in the system.'}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs h-8"
                >
                  Clear Search Filter
                </Button>
              )}
            </div>
          ) : (
            filteredAgents.map((agent) => {
              const isSelected = selectedAgentId === agent.id;
              return (
                <Card
                  key={agent.id}
                  className={`p-3.5 cursor-pointer transition-all duration-150 relative border ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/50 shadow-sm'
                      : 'hover:border-gray-300 hover:bg-gray-50/60'
                  }`}
                  onClick={() => onAgentSelect(agent.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Avatar + Details */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {agent.name ? agent.name.slice(0, 2).toUpperCase() : 'AG'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {agent.name}
                          </p>
                          {agent.isCityMatch && (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px] font-semibold px-1.5 py-0 border-emerald-200">
                              🎯 Local Match
                            </Badge>
                          )}
                          {agent.agentType && (
                            <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded capitalize">
                              {agent.agentType.replace('_', ' ')}
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                          {/* Phone */}
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="font-mono text-gray-800">{agent.phoneNumber || 'No phone'}</span>
                          </div>

                          {/* Assigned Territory */}
                          {(agent.assignedCity || agent.assignedTown) && (
                            <div className="flex items-center gap-1.5 text-gray-700">
                              <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span>
                                {agent.assignedCity}
                                {agent.assignedTown && agent.assignedTown !== agent.assignedCity
                                  ? ` (${agent.assignedTown})`
                                  : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Distance Badge & Selection Checkmark */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {agent.distance !== null && agent.distance !== undefined ? (
                        <span className="text-[11px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-blue-600" />
                          {(agent.distance / 1000).toFixed(1)} km
                        </span>
                      ) : agent.assignedCity ? (
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          📍 {agent.assignedCity}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">
                          Location uncalibrated
                        </span>
                      )}

                      {/* Selection indicator */}
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t bg-gray-50/80 flex items-center justify-between sm:justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {selectedAgent ? (
              <span>
                Selected: <strong className="text-gray-900 font-semibold">{selectedAgent.name}</strong>
              </span>
            ) : (
              <span>Please select an agent from the list</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel} className="text-xs h-9">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={!selectedAgentId || loading}
              className="text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              {selectedAgent ? `Assign to ${selectedAgent.name.split(' ')[0]}` : 'Assign & Approve'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
