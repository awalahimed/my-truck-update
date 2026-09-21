"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { orpc } from "@/lib/oprc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Map, MapMarker, MarkerContent, MarkerLabel, MarkerPopup, MapControls } from "@/components/ui/map";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AgentMapItem {
  id: string;
  name: string;
  phoneNumber: string;
  latitude: string | null;
  longitude: string | null;
  assignedCity: string | null;
  assignedTown: string | null;
  accountStatus: string;
  agentType: string | null;
}

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

function CityTownDropdown({
  label,
  value,
  placeholder,
  items,
  onChange,
  disabled,
  loading,
}: {
  label: string;
  value: string;
  placeholder: string;
  items: string[];
  onChange: (v: string) => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="space-y-1 relative" ref={ref}>
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <button
        type="button"
        onClick={() => !disabled && !loading && setOpen(!open)}
        disabled={disabled}
        className={cn(
          "flex h-8 w-full items-center justify-between rounded-md border border-input bg-transparent px-2.5 text-xs shadow-xs",
          disabled && "opacity-50 cursor-not-allowed",
          !value && "text-muted-foreground"
        )}
      >
        <span className="truncate">{value || placeholder}</span>
        <svg className="size-3 shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && items.length > 0 && (
        <div className="absolute z-[9999] top-full mt-1 left-0 right-0 max-h-32 overflow-y-auto rounded-md border bg-popover shadow-md">
          {items.map((item) => (
            <button
              key={item}
              type="button"
              className={cn(
                "w-full text-left px-2.5 py-1.5 text-xs hover:bg-accent transition-colors border-b last:border-0",
                item === value && "bg-accent font-medium"
              )}
              onClick={() => { onChange(item); setOpen(false); }}
            >
              {item}
            </button>
          ))}
        </div>
      )}
      {loading && (
        <div className="absolute right-2 top-7">
          <div className="size-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

export default function AgentAssignView() {
  const [mapAgents, setMapAgents] = useState<AgentMapItem[]>([]);
  const [loadingMap, setLoadingMap] = useState(false);
  const [selectedMapAgent, setSelectedMapAgent] = useState<AgentMapItem | null>(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [mapEditForm, setMapEditForm] = useState({
    assignedCity: "",
    assignedTown: "",
    latitude: "",
    longitude: "",
  });

  const [ethiopianCities, setEthiopianCities] = useState<string[]>([]);
  const [cityTowns, setCityTowns] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingTowns, setLoadingTowns] = useState(false);
  const [cityError, setCityError] = useState(false);
  const citiesCache = useRef<string[] | null>(null);

  const fetchCities = useCallback(async () => {
    if (citiesCache.current) {
      setEthiopianCities(citiesCache.current);
      return;
    }
    setLoadingCities(true);
    setCityError(false);
    try {
      const query = `[out:json][timeout:15];area["ISO3166-1"="ET"]->.a;node(area.a)["place"="city"];out tags;`;
      const res = await fetch(`${OVERPASS_URL}?data=${encodeURIComponent(query)}`);
      if (res.status === 429) {
        console.warn("Overpass rate limited, using fallback city list");
        throw new Error("Rate limited");
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const names = [...new Set(data.elements.map((e: any) => e.tags?.name).filter(Boolean))].sort();
      citiesCache.current = names;
      setEthiopianCities(names);
    } catch (e) {
      console.error("Failed to fetch cities:", e);
      setCityError(true);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  const fetchTowns = useCallback(async (cityName: string) => {
    setLoadingTowns(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=suburb+in+${encodeURIComponent(cityName)}+ethiopia&format=json&limit=20&countrycodes=et`,
        { headers: { "Accept-Language": "en" } }
      );
      if (res.status === 429) throw new Error("Rate limited");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const names = [...new Set(data.map((p: any) => p.display_name.split(",")[0].trim()).filter(Boolean))].sort();
      setCityTowns(names);
    } catch (e) {
      console.error("Failed to fetch towns:", e);
      setCityTowns([]);
    } finally {
      setLoadingTowns(false);
    }
  }, []);

  useEffect(() => {
    fetchCities();
    fetchMapData();
  }, [fetchCities]);

  const fetchMapData = async () => {
    try {
      setLoadingMap(true);
      const res = await (orpc as any).admin.agents.getMapData();
      if (res?.success) {
        setMapAgents(res.agents || []);
      }
    } catch (e) {
      console.error("Failed to fetch map data", e);
      toast.error("Failed to load agent locations");
    } finally {
      setLoadingMap(false);
    }
  };

  const handleMapAgentClick = (agent: AgentMapItem) => {
    setSelectedMapAgent(agent);
    setMapEditForm({
      assignedCity: agent.assignedCity || "",
      assignedTown: agent.assignedTown || "",
      latitude: agent.latitude || "",
      longitude: agent.longitude || "",
    });
    if (agent.assignedCity) fetchTowns(agent.assignedCity);
  };

  const handleCitySelect = (value: string) => {
    setMapEditForm(prev => ({ ...prev, assignedCity: value, assignedTown: "" }));
    setCityTowns([]);
    if (value) fetchTowns(value);
  };

  const handleTownSelect = (value: string) => {
    setMapEditForm(prev => ({ ...prev, assignedTown: value }));
  };

  const handleMarkerDrag = useCallback(async (agentId: string, lngLat: { lng: number; lat: number }) => {
    try {
      await (orpc as any).admin.agents.updateLocation({
        id: agentId,
        latitude: lngLat.lat.toString(),
        longitude: lngLat.lng.toString(),
      });
      setMapAgents(prev => prev.map(a =>
        a.id === agentId
          ? { ...a, latitude: lngLat.lat.toString(), longitude: lngLat.lng.toString() }
          : a
      ));
      if (selectedMapAgent?.id === agentId) {
        setMapEditForm(prev => ({ ...prev, latitude: lngLat.lat.toString(), longitude: lngLat.lng.toString() }));
      }
    } catch (e) {
      console.error("Failed to update location on drag", e);
    }
  }, [selectedMapAgent]);

  const handleUpdateLocation = async () => {
    if (!selectedMapAgent) return;
    try {
      setIsUpdatingLocation(true);
      await (orpc as any).admin.agents.updateLocation({
        id: selectedMapAgent.id,
        latitude: mapEditForm.latitude || undefined,
        longitude: mapEditForm.longitude || undefined,
        assignedCity: mapEditForm.assignedCity || undefined,
        assignedTown: mapEditForm.assignedTown || undefined,
      });
      toast.success("Location updated successfully");
      setSelectedMapAgent(null);
      await fetchMapData();
    } catch (e) {
      console.error("Failed to update location:", e);
      toast.error("Failed to update location");
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Agents</CardTitle>
          <CardDescription>
            View and update agent locations on the map. Click a marker to edit location details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingMap ? (
            <div className="text-center py-16 text-muted-foreground">Loading map data...</div>
          ) : mapAgents.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              No agents with location data found. Assign locations to agents first.
            </div>
          ) : (
            <div className="h-[600px] w-full rounded-lg overflow-hidden border">
              <Map className="h-full w-full">
                <MapControls showZoom showLocate />
                {mapAgents.map((agent) => {
                  const lat = parseFloat(agent.latitude || "0");
                  const lng = parseFloat(agent.longitude || "0");
                  if (isNaN(lat) || isNaN(lng)) return null;
                  const isSelected = selectedMapAgent?.id === agent.id;
                  return (
                    <MapMarker
                      key={agent.id}
                      latitude={lat}
                      longitude={lng}
                      draggable={isSelected}
                      onClick={() => handleMapAgentClick(agent)}
                      onDragEnd={(lngLat) => handleMarkerDrag(agent.id, lngLat)}
                    >
                      <MarkerContent>
                        <div className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg text-white text-xs font-bold transition-transform hover:scale-110",
                          agent.accountStatus === "active" ? "bg-green-500" : "bg-gray-400"
                        )}>
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <MarkerLabel position="bottom">
                          {agent.assignedTown || agent.assignedCity || agent.name}
                        </MarkerLabel>
                      </MarkerContent>
                      {isSelected && (
                        <MarkerPopup closeButton className="w-72 p-0">
                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-sm">{agent.name}</h3>
                              <span className={cn(
                                "text-[10px] font-medium px-1.5 py-0.5 rounded",
                                agent.accountStatus === "active" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"
                              )}>
                                {agent.accountStatus}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{agent.phoneNumber}</p>
                            <div className="grid grid-cols-2 gap-2">
                              <CityTownDropdown
                                label="State"
                                value={mapEditForm.assignedCity}
                                placeholder={loadingCities ? "Loading..." : cityError ? "API unavailable" : "Select state"}
                                items={ethiopianCities}
                                onChange={handleCitySelect}
                                loading={loadingCities}
                              />
                              <CityTownDropdown
                                label="City"
                                value={mapEditForm.assignedTown}
                                placeholder={!mapEditForm.assignedCity ? "Select state first" : loadingTowns ? "Loading..." : cityTowns.length === 0 ? "No cities" : "Select city"}
                                items={cityTowns}
                                onChange={handleTownSelect}
                                disabled={!mapEditForm.assignedCity}
                              />
                              <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground">Latitude</Label>
                                <Input
                                  value={mapEditForm.latitude}
                                  onChange={(e) => setMapEditForm({ ...mapEditForm, latitude: e.target.value })}
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground">Longitude</Label>
                                <Input
                                  value={mapEditForm.longitude}
                                  onChange={(e) => setMapEditForm({ ...mapEditForm, longitude: e.target.value })}
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 pt-1">
                              <Button
                                size="sm"
                                className="flex-1 h-8 text-xs"
                                onClick={handleUpdateLocation}
                                disabled={isUpdatingLocation}
                              >
                                <Check className="size-3.5 mr-1" />
                                {isUpdatingLocation ? "Saving..." : "Save"}
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="size-8"
                                onClick={() => setSelectedMapAgent(null)}
                              >
                                <X className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        </MarkerPopup>
                      )}
                    </MapMarker>
                  );
                })}
              </Map>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
