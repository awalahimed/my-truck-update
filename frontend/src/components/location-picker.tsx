import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { IconMapPin, IconMap } from "@tabler/icons-react";
import { Map, MapMarker, MarkerContent, MapControls } from "@/components/ui/map";

interface LocationPickerProps {
  latitude: string;
  longitude: string;
  onLocationChange: (lat: string, lng: string) => void;
}

export function LocationPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
  const [lat, setLat] = useState(latitude || "9.0320");
  const [lng, setLng] = useState(longitude || "38.7469");
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([
    parseFloat(longitude || "38.7469"),
    parseFloat(latitude || "9.0320"),
  ]);
  const [mapInstance, setMapInstance] = useState<any>(null);

  useEffect(() => {
    setLat(latitude || "9.0320");
    setLng(longitude || "38.7469");
    setMarkerPosition([
      parseFloat(longitude || "38.7469"),
      parseFloat(latitude || "9.0320"),
    ]);
  }, [latitude, longitude]);

  // Add click handler to map when it's loaded
  useEffect(() => {
    if (!mapInstance) return;

    const handleMapClick = (e: any) => {
      console.log('Map clicked:', e.lngLat);
      const newLat = e.lngLat.lat.toFixed(6);
      const newLng = e.lngLat.lng.toFixed(6);
      console.log('Setting coordinates:', { lat: newLat, lng: newLng });
      setLat(newLat);
      setLng(newLng);
      setMarkerPosition([e.lngLat.lng, e.lngLat.lat]);
    };

    mapInstance.on('click', handleMapClick);

    return () => {
      mapInstance.off('click', handleMapClick);
    };
  }, [mapInstance]);

  const handleMarkerDragEnd = (lngLat: { lng: number; lat: number }) => {
    const newLat = lngLat.lat.toFixed(6);
    const newLng = lngLat.lng.toFixed(6);
    setLat(newLat);
    setLng(newLng);
    setMarkerPosition([lngLat.lng, lngLat.lat]);
  };

  const handleSaveLocation = () => {
    onLocationChange(lat, lng);
    setIsMapOpen(false);
  };

  const handleLocate = (coords: { longitude: number; latitude: number }) => {
    const newLat = coords.latitude.toFixed(6);
    const newLng = coords.longitude.toFixed(6);
    setLat(newLat);
    setLng(newLng);
    setMarkerPosition([coords.longitude, coords.latitude]);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            value={lat}
            readOnly
            placeholder="9.0320"
            className="h-11 px-4"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            value={lng}
            readOnly
            placeholder="38.7469"
            className="h-11 px-4"
          />
        </div>
      </div>
      
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsMapOpen(true)}
        className="w-full h-11"
      >
        <IconMap className="mr-2 h-4 w-4" />
        Select Location on Map
      </Button>

      {lat && lng && (
        <div className="rounded-lg border p-3 bg-muted/50">
          <a
            href={`https://www.google.com/maps?q=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <IconMapPin className="h-3 w-3" />
            View on Google Maps
          </a>
        </div>
      )}

      {/* Map Dialog */}
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Select Location</DialogTitle>
            <DialogDescription>
              Drag the marker or use the locate button to select a location
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col gap-4 px-6 overflow-hidden">
            <div className="flex-1 rounded-lg border overflow-hidden">
              <Map
                ref={(map) => setMapInstance(map)}
                center={markerPosition}
                zoom={12}
                className="h-full w-full"
                styles={{
                  light: {
                    version: 8,
                    sources: {
                      osm: {
                        type: 'raster',
                        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                        tileSize: 256,
                        attribution: '&copy; OpenStreetMap Contributors',
                        maxzoom: 19
                      }
                    },
                    layers: [
                      {
                        id: 'osm',
                        type: 'raster',
                        source: 'osm'
                      }
                    ]
                  },
                  dark: {
                    version: 8,
                    sources: {
                      osm: {
                        type: 'raster',
                        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                        tileSize: 256,
                        attribution: '&copy; OpenStreetMap Contributors',
                        maxzoom: 19
                      }
                    },
                    layers: [
                      {
                        id: 'osm',
                        type: 'raster',
                        source: 'osm'
                      }
                    ]
                  }
                }}
              >
                <MapMarker
                  longitude={markerPosition[0]}
                  latitude={markerPosition[1]}
                  draggable
                  onDragEnd={handleMarkerDragEnd}
                >
                  <MarkerContent>
                    <div className="relative h-8 w-8 rounded-full border-4 border-white bg-blue-500 shadow-lg" />
                  </MarkerContent>
                </MapMarker>
                <MapControls
                  position="top-right"
                  showZoom
                  showLocate
                  showCompass
                  onLocate={handleLocate}
                />
              </Map>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input value={lat} readOnly className="h-11 px-4" />
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input value={lng} readOnly className="h-11 px-4" />
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 pb-6 pt-4">
            <Button variant="outline" onClick={() => setIsMapOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLocation}>
              Save Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
