import { Button } from '@/components/ui/button';
import { Map as MapIcon, Satellite, Layers, Users, LogOut } from 'lucide-react';

interface MapControlsProps {
  mapType: 'roadmap' | 'satellite' | 'hybrid';
  onMapTypeChange: (type: 'roadmap' | 'satellite' | 'hybrid') => void;
  onOpenDrivers: () => void;
  onLogout: () => void;
}

export function MapControls({ mapType, onMapTypeChange, onOpenDrivers, onLogout }: MapControlsProps) {
  return (
    <div className="absolute bottom-20 right-4 z-10 pointer-events-none">
      <div className="flex flex-col gap-2 pointer-events-auto">
        <Button
          size="icon"
          variant="outline"
          onClick={() => onMapTypeChange('roadmap')}
          className={`h-12 w-12 rounded-lg shadow-lg transition-all ${
            mapType === 'roadmap' 
              ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          title="Roadmap"
        >
          <MapIcon className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() => onMapTypeChange('satellite')}
          className={`h-12 w-12 rounded-lg shadow-lg transition-all ${
            mapType === 'satellite' 
              ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          title="Satellite"
        >
          <Satellite className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() => onMapTypeChange('hybrid')}
          className={`h-12 w-12 rounded-lg shadow-lg transition-all ${
            mapType === 'hybrid' 
              ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          title="Hybrid"
        >
          <Layers className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={onOpenDrivers}
          className="h-12 w-12 rounded-lg shadow-lg transition-all bg-white text-gray-700 hover:bg-gray-50"
          title="Drivers"
        >
          <Users className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          onClick={onLogout}
          className="h-12 w-12 rounded-lg shadow-lg transition-all bg-red-600 hover:bg-red-700"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
