"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { orpc } from "@/lib/oprc";
import { URL } from "@/config";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Map, MapMarker, MarkerContent, MarkerLabel, MarkerPopup, MapControls } from "@/components/ui/map";
import { Check, X } from "lucide-react";
import { IconPlus, IconEdit, IconTrash, IconSearch, IconDots, IconChartBar, IconMapPin, IconStar, IconEye, IconShieldCheck } from "@tabler/icons-react";
import { PhoneInput } from "@/components/phone-input";
import { normalizeEthiopianPhone } from "@/lib/phone";
import { uploadFile } from "@/lib/upload";
import { LocationPicker } from "@/components/location-picker";
import { AnalyticsTab } from "./analytics-tab";
import { FileDropZone } from "@/components/file-drop-zone";
import { cn } from "@/lib/utils";

const ETHIOPIAN_REGIONS = [
  "Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz", "Central Ethiopia",
  "Dire Dawa", "Gambela", "Harari", "Oromia", "Sidama",
  "Somali", "South Ethiopia", "South West Ethiopia", "Tigray",
];

const CITIES_BY_REGION: Record<string, string[]> = {
  "Addis Ababa": ["Addis Ababa"],
  "Afar": ["Samara", "Asayita", "Dubti", "Awash", "Logiya"],
  "Amhara": ["Bahir Dar", "Gondar", "Dessie", "Debre Markos", "Kombolcha", "Woldia", "Debre Tabor", "Lalibela"],
  "Benishangul-Gumuz": ["Asosa", "Metekel", "Kamashi"],
  "Central Ethiopia": ["Worabe", "Hosaena", "Butajira"],
  "Dire Dawa": ["Dire Dawa"],
  "Gambela": ["Gambela", "Itang"],
  "Harari": ["Harar"],
  "Oromia": ["Adama", "Jimma", "Bishoftu", "Shashamane", "Ambo", "Nekemte", "Burayu", "Sebeta", "Legetafo", "Batu", "Meki", "Mojo", "Dukem", "Guder", "Gimbi", "Mettu", "Bale Robe", "Bule Hora"],
  "Sidama": ["Hawassa", "Yirgalem", "Aleta Wendo", "Bona"],
  "Somali": ["Jijiga", "Gode", "Dollo", "Kebri Dahar", "Shinile", "Degahbur"],
  "South Ethiopia": ["Arba Minch", "Sodo", "Dilla", "Konso", "Jinka", "Mizan Teferi", "Bonga", "Turmi"],
  "South West Ethiopia": ["Bonga", "Tepi", "Maji"],
  "Tigray": ["Mekelle", "Adigrat", "Axum", "Shire", "Adwa", "Alamata"],
};

const TOWNS: Record<string, string[]> = {
  "Adama": ["Adama", "Batu", "Mojo", "Dukem"],
  "Bahir Dar": ["Bahir Dar", "Zegie", "Meshenti"],
  "Mekelle": ["Mekelle", "Quiha", "Aynalem"],
  "Legetafo": ["Legetafo", "Gefersa"],
};

interface Agent {
  id: string;
  name: string;
  phone: string;
  email?: string;
  nationalId?: string;
  profilePhoto?: string;
  gender?: string;
  assignedCity?: string;
  assignedTown?: string;
  assignedTownManager?: string;
  agentType?: string;
  latitude?: string;
  longitude?: string;
  idCardFrontId?: string;
  idCardBackId?: string;
  accountStatus: string;
  rejectionReason?: string;
  createdAt: string;
}

interface AgentPerformance {
  agent: {
    id: string;
    name: string;
    phoneNumber: string;
    assignedCity?: string;
    assignedTown?: string;
    accountStatus: string;
  } | null;
  stats: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    rejectedOrders: number;
  } | null;
  commissions: {
    totalEarnings: number;
    userCommissions: number;
    driverCommissions: number;
    assistedCommissions: number;
  } | null;
  recentJobs: Array<{
    id: string;
    status: string;
    finalPrice: number | null;
    createdAt: string;
    completedAt: string | null;
  }>;
}

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

  const displayText = value || placeholder;

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
        <span className="truncate">{displayText}</span>
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

interface AgentsViewProps {
  hideTabNav?: boolean;
}

export function AgentsView({ hideTabNav }: AgentsViewProps = {}) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAgentType, setFilterAgentType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCity, setFilterCity] = useState<string>("all");
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBanning, setIsBanning] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    nationalId: "",
    profilePhoto: "",
    idCardFrontId: "",
    idCardBackId: "",
    gender: "",
    assignedCity: "",
    assignedTown: "",
    assignedTownManager: "",
    agentType: "",
    latitude: "",
    longitude: "",
  });
  const [editProfilePhotoFile, setEditProfilePhotoFile] = useState<File | null>(null);
  const [editProfilePhotoUploading, setEditProfilePhotoUploading] = useState(false);
  const [editProfilePhotoProgress, setEditProfilePhotoProgress] = useState(0);

  // Create form file uploads
  const [createProfilePhotoFile, setCreateProfilePhotoFile] = useState<File | null>(null);
  const [createProfilePhotoUploading, setCreateProfilePhotoUploading] = useState(false);
  const [createProfilePhotoProgress, setCreateProfilePhotoProgress] = useState(0);
  const [createIdCardFrontFile, setCreateIdCardFrontFile] = useState<File | null>(null);
  const [createIdCardFrontUploading, setCreateIdCardFrontUploading] = useState(false);
  const [createIdCardFrontProgress, setCreateIdCardFrontProgress] = useState(0);
  const [createIdCardBackFile, setCreateIdCardBackFile] = useState<File | null>(null);
  const [createIdCardBackUploading, setCreateIdCardBackUploading] = useState(false);
  const [createIdCardBackProgress, setCreateIdCardBackProgress] = useState(0);

  // Edit form ID card uploads
  const [editIdCardFrontFile, setEditIdCardFrontFile] = useState<File | null>(null);
  const [editIdCardFrontUploading, setEditIdCardFrontUploading] = useState(false);
  const [editIdCardFrontProgress, setEditIdCardFrontProgress] = useState(0);
  const [editIdCardBackFile, setEditIdCardBackFile] = useState<File | null>(null);
  const [editIdCardBackUploading, setEditIdCardBackUploading] = useState(false);
  const [editIdCardBackProgress, setEditIdCardBackProgress] = useState(0);

  const [phoneError, setPhoneError] = useState("");
  const [activeTab, setActiveTab] = useState("list");

  // Managers for selected city
  const [cityManagers, setCityManagers] = useState<Array<{ userId: string; name: string; phone: string; townName: string; cityName: string }>>([]);

  useEffect(() => {
    if (formData.assignedCity) {
      orpc.admin.townManager.listByCity({ cityName: formData.assignedCity }).then((res: any) => {
        if (res?.managers) setCityManagers(res.managers);
      }).catch(() => setCityManagers([]));
    } else {
      setCityManagers([]);
    }
  }, [formData.assignedCity]);

  // View sheet state
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [viewAgent, setViewAgent] = useState<Agent | null>(null);

  // Approval state
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approveTarget, setApproveTarget] = useState<Agent | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Performance sheet state
  const [isPerformanceSheetOpen, setIsPerformanceSheetOpen] = useState(false);
  const [selectedAgentPerformance, setSelectedAgentPerformance] = useState<AgentPerformance | null>(null);
  const [loadingPerformance, setLoadingPerformance] = useState(false);

  // Map assign state
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

  // Ethiopian cities/towns from cache or API
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
      const names = ([...new Set(data.elements.map((e: any) => e.tags?.name).filter(Boolean))].sort()) as string[];
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
      const names = ([...new Set(data.map((p: any) => p.display_name.split(",")[0].trim()).filter(Boolean))].sort()) as string[];
      setCityTowns(names);
    } catch (e) {
      console.error("Failed to fetch towns:", e);
      setCityTowns([]);
    } finally {
      setLoadingTowns(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "assign") {
      fetchCities();
    }
  }, [activeTab, fetchCities]);

  const handleCitySelect = (value: string) => {
    setMapEditForm(prev => ({ ...prev, assignedCity: value, assignedTown: "" }));
    setCityTowns([]);
    if (value) fetchTowns(value);
  };

  const handleTownSelect = (value: string) => {
    setMapEditForm(prev => ({ ...prev, assignedTown: value }));
  };

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await orpc.admin.agents.list({ search: searchQuery });
      
      if (response.success && response.agents) {
        const formattedAgents: Agent[] = response.agents.map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          phone: agent.phoneNumber,
          email: agent.email || undefined,
          nationalId: agent.nationalId || undefined,
          profilePhoto: agent.image || undefined,
          gender: agent.gender || undefined,
          agentType: agent.agentType || undefined,
          assignedCity: agent.assignedCity || undefined,
          assignedTown: agent.assignedTown || undefined,
          assignedTownManager: agent.assignedTownManager || undefined,
          latitude: agent.latitude || undefined,
          longitude: agent.longitude || undefined,
          idCardFrontId: agent.idCardFrontId || undefined,
          idCardBackId: agent.idCardBackId || undefined,
          accountStatus: agent.accountStatus || 'pending',
          rejectionReason: agent.rejectionReason || undefined,
          createdAt: agent.createdAt,
        }));
        setAgents(formattedAgents);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreateAgent = async () => {
    try {
      setIsCreating(true);
      
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error('Please enter agent name');
        document.getElementById('name')?.focus();
        document.getElementById('name')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      
      if (!formData.phone.trim()) {
        toast.error('Please enter phone number');
        document.getElementById('phone')?.focus();
        document.getElementById('phone')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      
      const norm = normalizeEthiopianPhone(formData.phone);
      if (!norm.ok) {
        setPhoneError('Must start with 9 or 7 and be 9 digits');
        toast.error('Invalid phone number format');
        document.getElementById('phone')?.focus();
        document.getElementById('phone')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      
      if (!formData.password.trim()) {
        toast.error('Please enter password');
        document.getElementById('password')?.focus();
        document.getElementById('password')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        document.getElementById('password')?.focus();
        document.getElementById('password')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      
      if (!formData.agentType) {
        toast.error('Please select agent type');
        document.getElementById('agentType')?.focus();
        document.getElementById('agentType')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Upload files
      let profilePhotoId: string | undefined;
      if (createProfilePhotoFile) {
        setCreateProfilePhotoUploading(true);
        profilePhotoId = await uploadFile(createProfilePhotoFile, {
          onProgress: setCreateProfilePhotoProgress,
          documentType: "profile_photo",
        });
        setCreateProfilePhotoUploading(false);
      }

      let idCardFrontId: string | undefined;
      if (createIdCardFrontFile) {
        setCreateIdCardFrontUploading(true);
        idCardFrontId = await uploadFile(createIdCardFrontFile, {
          onProgress: setCreateIdCardFrontProgress,
          documentType: "id_card",
        });
        setCreateIdCardFrontUploading(false);
      }

      let idCardBackId: string | undefined;
      if (createIdCardBackFile) {
        setCreateIdCardBackUploading(true);
        idCardBackId = await uploadFile(createIdCardBackFile, {
          onProgress: setCreateIdCardBackProgress,
          documentType: "id_card",
        });
        setCreateIdCardBackUploading(false);
      }

      await orpc.admin.agents.create({
        name: formData.name,
        phone: norm.e164!,
        email: formData.email || undefined,
        password: formData.password,
        nationalId: formData.nationalId || undefined,
        gender: formData.gender || undefined,
        assignedCity: formData.assignedCity || undefined,
        assignedTown: formData.assignedTown || undefined,
        assignedTownManager: formData.assignedTownManager || undefined,
        agentType: formData.agentType || undefined,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        profilePhotoId,
        idCardFrontId,
        idCardBackId,
      });

      toast.success('Agent created successfully');
      setIsCreateSheetOpen(false);
      setFormData({ 
        name: "", 
        phone: "", 
        email: "", 
        password: "",
        nationalId: "",
        profilePhoto: "",
        idCardFrontId: "",
        idCardBackId: "",
        gender: "",
        assignedCity: "",
        assignedTown: "",
        assignedTownManager: "",
        agentType: "",
        latitude: "",
        longitude: "",
      });
      setCreateProfilePhotoFile(null);
      setCreateIdCardFrontFile(null);
      setCreateIdCardBackFile(null);
      setPhoneError("");
      await fetchAgents();
    } catch (error: any) {
      console.error('Failed to create agent:', error);
      const errorMessage = error?.message || 'Failed to create agent';
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateAgent = async () => {
    if (!selectedAgent) return;

    try {
      setIsUpdating(true);
      
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error('Please enter agent name');
        document.getElementById('edit-name')?.focus();
        document.getElementById('edit-name')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      
      if (!formData.phone.trim()) {
        toast.error('Please enter phone number');
        document.getElementById('edit-phone')?.focus();
        document.getElementById('edit-phone')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      
      const norm = normalizeEthiopianPhone(formData.phone);
      if (!norm.ok) {
        setPhoneError('Must start with 9 or 7 and be 9 digits');
        toast.error('Invalid phone number format');
        document.getElementById('edit-phone')?.focus();
        document.getElementById('edit-phone')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      
      if (formData.password && formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        document.getElementById('edit-password')?.focus();
        document.getElementById('edit-password')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      
      if (!formData.agentType) {
        toast.error('Please select agent type');
        document.getElementById('edit-agentType')?.focus();
        document.getElementById('edit-agentType')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Upload new profile photo if selected
      let profilePhotoId: string | undefined;
      if (editProfilePhotoFile) {
        setEditProfilePhotoUploading(true);
        profilePhotoId = await uploadFile(editProfilePhotoFile, {
          onProgress: setEditProfilePhotoProgress,
          documentType: "profile_photo",
        });
        setEditProfilePhotoUploading(false);
      }

      // Upload new ID card images if selected
      let idCardFrontId: string | undefined;
      if (editIdCardFrontFile) {
        setEditIdCardFrontUploading(true);
        idCardFrontId = await uploadFile(editIdCardFrontFile, {
          onProgress: setEditIdCardFrontProgress,
          documentType: "id_card",
        });
        setEditIdCardFrontUploading(false);
      }

      let idCardBackId: string | undefined;
      if (editIdCardBackFile) {
        setEditIdCardBackUploading(true);
        idCardBackId = await uploadFile(editIdCardBackFile, {
          onProgress: setEditIdCardBackProgress,
          documentType: "id_card",
        });
        setEditIdCardBackUploading(false);
      }

      const updateData: any = {
        id: selectedAgent.id,
        name: formData.name,
        phone: norm.e164!,
        email: formData.email || undefined,
        nationalId: formData.nationalId || undefined,
        gender: formData.gender || undefined,
        assignedCity: formData.assignedCity || undefined,
        assignedTown: formData.assignedTown || undefined,
        assignedTownManager: formData.assignedTownManager || undefined,
        agentType: formData.agentType || undefined,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        profilePhotoId: profilePhotoId,
        idCardFrontId,
        idCardBackId,
      };

      // Only include password if it was changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      await orpc.admin.agents.update(updateData);

      toast.success('Agent updated successfully');
      setIsEditSheetOpen(false);
      setSelectedAgent(null);
      setFormData({ 
        name: "", 
        phone: "", 
        email: "", 
        password: "",
        nationalId: "",
        profilePhoto: "",
        idCardFrontId: "",
        idCardBackId: "",
        gender: "",
        assignedCity: "",
        assignedTown: "",
        assignedTownManager: "",
        agentType: "",
        latitude: "",
        longitude: "",
      });
      setEditProfilePhotoFile(null);
      setEditIdCardFrontFile(null);
      setEditIdCardBackFile(null);
      setPhoneError("");
      await fetchAgents();
    } catch (error: any) {
      console.error('Failed to update agent:', error);
      const errorMessage = error?.message || 'Failed to update agent';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBanAgent = async () => {
    if (!selectedAgent) return;

    try {
      setIsBanning(true);
      const newStatus = selectedAgent.accountStatus === 'active' ? 'suspended' : 'active';
      
      await orpc.admin.agents.updateStatus({ 
        id: selectedAgent.id,
        status: newStatus
      });

      toast.success(newStatus === 'suspended' ? 'Agent banned successfully' : 'Agent unbanned successfully');
      setIsBanDialogOpen(false);
      setSelectedAgent(null);
      await fetchAgents();
    } catch (error) {
      console.error('Failed to update agent status:', error);
      toast.error('Failed to update agent status');
    } finally {
      setIsBanning(false);
    }
  };

  const openEditSheet = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData({
      name: agent.name,
      phone: agent.phone || "",
      email: agent.email || "",
      password: "",
      nationalId: agent.nationalId || "",
      profilePhoto: agent.profilePhoto || "",
      idCardFrontId: agent.idCardFrontId || "",
      idCardBackId: agent.idCardBackId || "",
      gender: agent.gender || "",
      assignedCity: agent.assignedCity || "",
      assignedTown: agent.assignedTown || "",
      assignedTownManager: agent.assignedTownManager || "",
      agentType: agent.agentType || "",
      latitude: agent.latitude || "",
      longitude: agent.longitude || "",
    });
    setPhoneError("");
    setIsEditSheetOpen(true);
  };

  const openBanDialog = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsBanDialogOpen(true);
  };

  const openViewSheet = (agent: Agent) => {
    setViewAgent(agent);
    setIsViewSheetOpen(true);
  };

  const handleApproveAgent = async () => {
    if (!approveTarget) return;
    try {
      setActionLoading(true);
      await orpc.admin.agents.updateStatus({ id: approveTarget.id, status: 'active' });
      toast.success(`Agent "${approveTarget.name}" approved`);
      setIsApproveDialogOpen(false);
      setApproveTarget(null);
      fetchAgents();
    } catch (error) {
      toast.error('Failed to approve agent');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectAgent = async () => {
    if (!approveTarget) return;
    try {
      setActionLoading(true);
      await orpc.admin.agents.rejectAgent({ agentId: approveTarget.id, reason: rejectReason });
      toast.success(`Agent "${approveTarget.name}" rejected`);
      setIsRejectDialogOpen(false);
      setRejectReason("");
      setApproveTarget(null);
      fetchAgents();
    } catch (error) {
      toast.error('Failed to reject agent');
    } finally {
      setActionLoading(false);
    }
  };

  const openPerformanceSheet = async (agent: Agent) => {
    try {
      setLoadingPerformance(true);
      const response = await orpc.admin.agents.getPerformance({ agentId: agent.id });
      if (response.success) {
        setSelectedAgentPerformance({
          agent: response.agent,
          stats: response.stats,
          commissions: response.commissions,
          recentJobs: (response.recentJobs as any) || [],
        });
        setIsPerformanceSheetOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch agent performance:', error);
      toast.error('Failed to load agent performance');
    } finally {
      setLoadingPerformance(false);
    }
  };

  const fetchMapData = async () => {
    try {
      setLoadingMap(true);
      const response = await orpc.admin.agents.getMapData();
      if (response.success && response.agents) {
        setMapAgents(response.agents);
      }
    } catch (error) {
      console.error('Failed to fetch map data:', error);
      toast.error('Failed to load agent locations');
    } finally {
      setLoadingMap(false);
    }
  };

  useEffect(() => {
    if (activeTab === "assign") {
      fetchMapData();
    }
  }, [activeTab]);

  const handleMapAgentClick = (agent: AgentMapItem) => {
    setSelectedMapAgent(agent);
    const city = agent.assignedCity || "";
    setMapEditForm({
      assignedCity: city,
      assignedTown: agent.assignedTown || "",
      latitude: agent.latitude || "",
      longitude: agent.longitude || "",
    });
    if (city) fetchTowns(city);
  };

  const updateFormLocation = useCallback((lat: string, lng: string) => {
    setMapEditForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
  }, []);

  const reverseGeocode = useCallback(async (lat: string, lng: string) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      if (!res.ok) return;
      const data = await res.json();
      const addr = data.address || {};
      const state = addr.state || "";
      const city = addr.city || addr.town || addr.county || addr.village || "";
      setMapEditForm(prev => ({
        ...prev,
        assignedCity: state || prev.assignedCity,
        assignedTown: city || prev.assignedTown,
      }));
    } catch (e) {
      console.error("Reverse geocode failed:", e);
    }
  }, []);

  const handleMarkerDrag = useCallback(async (agentId: string, lngLat: { lng: number; lat: number }) => {
    const lat = lngLat.lat.toFixed(6);
    const lng = lngLat.lng.toFixed(6);
    updateFormLocation(lat, lng);
    setMapAgents(prev => prev.map(a =>
      a.id === agentId ? { ...a, latitude: lat, longitude: lng } : a
    ));
    await reverseGeocode(lat, lng);
  }, [updateFormLocation, reverseGeocode]);

  const handleUpdateLocation = async () => {
    if (!selectedMapAgent) return;
    try {
      setIsUpdatingLocation(true);
      await orpc.admin.agents.updateLocation({
        id: selectedMapAgent.id,
        latitude: mapEditForm.latitude || undefined,
        longitude: mapEditForm.longitude || undefined,
        assignedCity: mapEditForm.assignedCity || undefined,
        assignedTown: mapEditForm.assignedTown || undefined,
      });
      toast.success('Location updated successfully');
      setSelectedMapAgent(null);
      await fetchMapData();
    } catch (error) {
      console.error('Failed to update location:', error);
      toast.error('Failed to update location');
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.phone.includes(searchQuery) ||
      agent.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAgentType = filterAgentType === "all" || agent.agentType === filterAgentType;
    const matchesStatus = filterStatus === "all" || agent.accountStatus === filterStatus;
    const matchesCity = filterCity === "all" || agent.assignedCity === filterCity;
    
    return matchesSearch && matchesAgentType && matchesStatus && matchesCity;
  });

  // Get unique cities for filter dropdown
  const uniqueCities = Array.from(new Set(agents.map(a => a.assignedCity).filter(Boolean)));

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {!hideTabNav ? (
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <IconSearch className="h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="approval" className="flex items-center gap-2">
                <IconShieldCheck className="h-4 w-4" />
                Approval
              </TabsTrigger>
              <TabsTrigger value="assign" className="flex items-center gap-2">
                <IconMapPin className="h-4 w-4" />
                Assign
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <IconStar className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
            {activeTab === "list" && (
              <Button onClick={() => setIsCreateSheetOpen(true)}>
                <IconPlus className="mr-2 h-4 w-4" />
                Add Agent
              </Button>
            )}
          </div>
        ) : activeTab === "list" && (
          <div className="flex items-center justify-end mb-6">
            <Button onClick={() => setIsCreateSheetOpen(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              Add Agent
            </Button>
          </div>
        )}

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Agent Management</CardTitle>
                  <CardDescription>Manage agents who can access the system</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 space-y-4">
                <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Agent Type</Label>
                <Select value={filterAgentType} onValueChange={setFilterAgentType}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="paid_agent">Paid Agent</SelectItem>
                    <SelectItem value="field_agent">Field Agent</SelectItem>
                    <SelectItem value="verification_agent">Verification Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Assigned City</Label>
                <Select value={filterCity} onValueChange={setFilterCity}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {uniqueCities.map((city) => (
                      <SelectItem key={city} value={city!}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(filterAgentType !== "all" || filterStatus !== "all" || filterCity !== "all") && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {filterAgentType !== "all" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setFilterAgentType("all")}
                    className="h-7 text-xs"
                  >
                    {filterAgentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ×
                  </Button>
                )}
                {filterStatus !== "all" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setFilterStatus("all")}
                    className="h-7 text-xs"
                  >
                    {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} ×
                  </Button>
                )}
                {filterCity !== "all" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setFilterCity("all")}
                    className="h-7 text-xs"
                  >
                    {filterCity} ×
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterAgentType("all");
                    setFilterStatus("all");
                    setFilterCity("all");
                  }}
                  className="h-7 text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">Loading agents...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Agent Type</TableHead>
                  <TableHead>Assigned City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No agents found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAgents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell>{agent.phone}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700">
                          {agent.agentType ? agent.agentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "-"}
                        </span>
                      </TableCell>
                      <TableCell>{agent.assignedCity || "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium w-fit ${
                              agent.accountStatus === "active"
                                 ? "bg-green-50 text-green-700"
                                 : agent.accountStatus === "pending"
                                ? "bg-yellow-50 text-yellow-700"
                                : agent.accountStatus === "rejected"
                                ? "bg-red-50 text-red-700"
                                : "bg-gray-50 text-gray-700"
                            }`}
                          >
                              {agent.accountStatus}
                          </span>
                          {agent.accountStatus === "rejected" && agent.rejectionReason && (
                            <span className="text-xs text-red-600 max-w-[200px] truncate" title={agent.rejectionReason}>
                              Reason: {agent.rejectionReason}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(agent.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <IconDots className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openViewSheet(agent)}>
                              <IconEye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditSheet(agent)}>
                              <IconEdit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openPerformanceSheet(agent)}>
                              <IconChartBar className="mr-2 h-4 w-4" />
                              Performance
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openBanDialog(agent)}
                              className={agent.accountStatus === 'active' ? 'text-orange-600' : 'text-green-600'}
                            >
                              <IconTrash className="mr-2 h-4 w-4" />
                              {agent.accountStatus === 'active' ? 'Ban Agent' : 'Unban Agent'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Agent Approval</CardTitle>
                  <CardDescription>Review and approve pending agent registrations</CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {agents.filter(a => a.accountStatus === "pending").length} Pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading agents...</div>
              ) : agents.filter(a => a.accountStatus === "pending").length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <IconShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No pending agent approvals</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Agent Type</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>ID Card</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.filter(a => a.accountStatus === "pending").map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">{agent.name}</TableCell>
                        <TableCell>{agent.phone}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700">
                            {agent.agentType ? agent.agentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "-"}
                          </span>
                        </TableCell>
                        <TableCell>{agent.assignedCity || "-"}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {agent.idCardFrontId ? (
                              <a href={`${URL.IMAGE}/uploads/${agent.idCardFrontId}`} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={`${URL.IMAGE}/uploads/${agent.idCardFrontId}`}
                                  alt="Front"
                                  className="w-10 h-10 object-cover rounded border cursor-pointer hover:opacity-80"
                                  title="Click to view front"
                                />
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                            {agent.idCardBackId && (
                              <a href={`${URL.IMAGE}/uploads/${agent.idCardBackId}`} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={`${URL.IMAGE}/uploads/${agent.idCardBackId}`}
                                  alt="Back"
                                  className="w-10 h-10 object-cover rounded border cursor-pointer hover:opacity-80"
                                  title="Click to view back"
                                />
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{new Date(agent.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openViewSheet(agent)}
                            >
                              <IconEye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => {
                                setApproveTarget(agent);
                                setIsApproveDialogOpen(true);
                              }}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setApproveTarget(agent);
                                setIsRejectDialogOpen(true);
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assign" className="space-y-4">
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
                          onClick={() => {
                            handleMapAgentClick(agent);
                          }}
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
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>
      </Tabs>

      {/* Create Agent Sheet */}
      <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
        <SheetContent className="sm:max-w-3xl overflow-y-auto">
          <SheetHeader className="pb-6 px-6 pt-6">
            <SheetTitle>Create New Agent</SheetTitle>
            <SheetDescription>
              Add a new agent to the system with complete profile information
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-6 py-4 px-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    className="h-11 px-4"
                    required
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                  <PhoneInput
                    id="phone"
                    value={formData.phone}
                    onChange={(v) => {
                      setFormData({ ...formData, phone: (v as string) ?? "" });
                      if (phoneError) setPhoneError("");
                    }}
                    className={`h-11 px-4 ${phoneError ? "border-red-500" : ""}`}
                    required
                  />
                  {phoneError && <p className="text-sm text-red-500">{phoneError}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="agent@example.com"
                    className="h-11 px-4"
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="nationalId" className="text-sm font-medium">National ID / Verification ID</Label>
                  <Input
                    id="nationalId"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    placeholder="Enter national ID"
                    className="h-11 px-4"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger className="h-11 px-4">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    className="h-11 px-4"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Assignment Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-900">Assignment Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="agentType" className="text-sm font-medium">Agent Type *</Label>
                  <Select value={formData.agentType} onValueChange={(value) => setFormData({ ...formData, agentType: value })}>
                    <SelectTrigger className="h-11 px-4">
                      <SelectValue placeholder="Select agent type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid_agent">Paid Agent</SelectItem>
                      <SelectItem value="field_agent">Field Agent</SelectItem>
                      <SelectItem value="verification_agent">Verification Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="assignedCity" className="text-sm font-medium">Assigned City</Label>
                  <Select
                    value={formData.assignedCity}
                    onValueChange={(value) => setFormData({ ...formData, assignedCity: value, assignedTown: "" })}
                  >
                    <SelectTrigger id="assignedCity" className="h-11 px-4">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CITIES_BY_REGION).flat().filter((v, i, a) => a.indexOf(v) === i).sort().map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="assignedTown" className="text-sm font-medium">Assigned Town</Label>
                  <Select
                    value={formData.assignedTown}
                    onValueChange={(value) => setFormData({ ...formData, assignedTown: value })}
                    disabled={!formData.assignedCity}
                  >
                    <SelectTrigger id="assignedTown" className="h-11 px-4">
                      <SelectValue placeholder={!formData.assignedCity ? "Select city first" : "Select town"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(TOWNS[formData.assignedCity] || (formData.assignedCity ? [formData.assignedCity] : [])).map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="assignedTownManager" className="text-sm font-medium">Assigned Town Manager</Label>
                  <Select
                    value={formData.assignedTownManager}
                    onValueChange={(value) => setFormData({ ...formData, assignedTownManager: value })}
                    disabled={!formData.assignedCity || cityManagers.length === 0}
                  >
                    <SelectTrigger id="assignedTownManager" className="h-11 px-4">
                      <SelectValue placeholder={!formData.assignedCity ? "Select city first" : cityManagers.length === 0 ? "No managers for this city" : "Select town manager"} />
                    </SelectTrigger>
                    <SelectContent>
                      {cityManagers.map((m) => (
                        <SelectItem key={m.userId} value={m.name}>{m.name} ({m.phone})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-900">Documents</h3>
              <div className="grid grid-cols-3 gap-4">
                <FileDropZone
                  label="Profile Photo"
                  file={createProfilePhotoFile}
                  onFileSelect={(f) => setCreateProfilePhotoFile(f)}
                  onClear={() => setCreateProfilePhotoFile(null)}
                  uploading={createProfilePhotoUploading}
                  progress={createProfilePhotoProgress}
                />
                <FileDropZone
                  label="ID Card Front"
                  file={createIdCardFrontFile}
                  onFileSelect={(f) => setCreateIdCardFrontFile(f)}
                  onClear={() => setCreateIdCardFrontFile(null)}
                  uploading={createIdCardFrontUploading}
                  progress={createIdCardFrontProgress}
                />
                <FileDropZone
                  label="ID Card Back"
                  file={createIdCardBackFile}
                  onFileSelect={(f) => setCreateIdCardBackFile(f)}
                  onClear={() => setCreateIdCardBackFile(null)}
                  uploading={createIdCardBackUploading}
                  progress={createIdCardBackProgress}
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-900">Location</h3>
              <LocationPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
              />
            </div>
          </div>
          <SheetFooter className="pt-6 pb-6 px-6 gap-3">
            <Button variant="outline" onClick={() => setIsCreateSheetOpen(false)} className="h-11 px-6" disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreateAgent} className="h-11 px-6" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Agent"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Edit Agent Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="sm:max-w-3xl overflow-y-auto">
          <SheetHeader className="pb-6 px-6 pt-6">
            <SheetTitle>Edit Agent</SheetTitle>
            <SheetDescription>
              Update agent profile information
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-6 py-4 px-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>

              <div className="grid grid-cols-3 gap-4">
                <FileDropZone
                  label="Profile Photo"
                  file={editProfilePhotoFile}
                  onFileSelect={(f) => setEditProfilePhotoFile(f)}
                  onClear={() => setEditProfilePhotoFile(null)}
                  uploading={editProfilePhotoUploading}
                  progress={editProfilePhotoProgress}
                />
                <FileDropZone
                  label="ID Card Front"
                  file={editIdCardFrontFile}
                  onFileSelect={(f) => setEditIdCardFrontFile(f)}
                  onClear={() => setEditIdCardFrontFile(null)}
                  uploading={editIdCardFrontUploading}
                  progress={editIdCardFrontProgress}
                />
                <FileDropZone
                  label="ID Card Back"
                  file={editIdCardBackFile}
                  onFileSelect={(f) => setEditIdCardBackFile(f)}
                  onClear={() => setEditIdCardBackFile(null)}
                  uploading={editIdCardBackUploading}
                  progress={editIdCardBackProgress}
                />
              </div>
              <div className="flex gap-4 mt-1">
                {formData.profilePhoto && !editProfilePhotoFile && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Current Profile Photo</p>
                    <img src={`${URL.IMAGE}/uploads/${formData.profilePhoto}`} alt="Profile" className="h-16 w-16 rounded-full object-cover border mx-auto" />
                  </div>
                )}
                {formData.idCardFrontId && !editIdCardFrontFile && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Current ID Front</p>
                    <img src={`${URL.IMAGE}/uploads/${formData.idCardFrontId}`} alt="ID Front" className="h-16 w-24 object-cover border rounded mx-auto" />
                  </div>
                )}
                {formData.idCardBackId && !editIdCardBackFile && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Current ID Back</p>
                    <img src={`${URL.IMAGE}/uploads/${formData.idCardBackId}`} alt="ID Back" className="h-16 w-24 object-cover border rounded mx-auto" />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="edit-name" className="text-sm font-medium">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    className="h-11 px-4"
                    required
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="edit-phone" className="text-sm font-medium">Phone Number *</Label>
                  <PhoneInput
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(v) => {
                      setFormData({ ...formData, phone: (v as string) ?? "" });
                      if (phoneError) setPhoneError("");
                    }}
                    className={`h-11 px-4 ${phoneError ? "border-red-500" : ""}`}
                    required
                  />
                  {phoneError && <p className="text-sm text-red-500">{phoneError}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="edit-email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="agent@example.com"
                    className="h-11 px-4"
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="edit-nationalId" className="text-sm font-medium">National ID / Verification ID</Label>
                  <Input
                    id="edit-nationalId"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    placeholder="Enter national ID"
                    className="h-11 px-4"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="edit-gender" className="text-sm font-medium">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger className="h-11 px-4">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="edit-password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Leave blank to keep current password"
                    className="h-11 px-4"
                  />
                  <p className="text-xs text-muted-foreground">Leave blank to keep current password</p>
                </div>
              </div>
            </div>

            {/* Assignment Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-900">Assignment Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="edit-agentType" className="text-sm font-medium">Agent Type *</Label>
                  <Select value={formData.agentType} onValueChange={(value) => setFormData({ ...formData, agentType: value })}>
                    <SelectTrigger className="h-11 px-4">
                      <SelectValue placeholder="Select agent type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid_agent">Paid Agent</SelectItem>
                      <SelectItem value="field_agent">Field Agent</SelectItem>
                      <SelectItem value="verification_agent">Verification Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="edit-assignedCity" className="text-sm font-medium">Assigned City</Label>
                  <Select
                    value={formData.assignedCity}
                    onValueChange={(value) => setFormData({ ...formData, assignedCity: value, assignedTown: "" })}
                  >
                    <SelectTrigger className="h-11 px-4">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CITIES_BY_REGION).flat().filter((v, i, a) => a.indexOf(v) === i).map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="edit-assignedTown" className="text-sm font-medium">Assigned Town</Label>
                  <Select
                    value={formData.assignedTown}
                    onValueChange={(value) => setFormData({ ...formData, assignedTown: value })}
                    disabled={!formData.assignedCity}
                  >
                    <SelectTrigger className="h-11 px-4">
                      <SelectValue placeholder={!formData.assignedCity ? "Select city first" : "Select town"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(TOWNS[formData.assignedCity] || (formData.assignedCity ? [formData.assignedCity] : [])).map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="edit-assignedTownManager" className="text-sm font-medium">Assigned Town Manager</Label>
                  <Select
                    value={formData.assignedTownManager}
                    onValueChange={(value) => setFormData({ ...formData, assignedTownManager: value })}
                    disabled={!formData.assignedCity || cityManagers.length === 0}
                  >
                    <SelectTrigger id="edit-assignedTownManager" className="h-11 px-4">
                      <SelectValue placeholder={!formData.assignedCity ? "Select city first" : cityManagers.length === 0 ? "No managers for this city" : "Select town manager"} />
                    </SelectTrigger>
                    <SelectContent>
                      {cityManagers.map((m) => (
                        <SelectItem key={m.userId} value={m.name}>{m.name} ({m.phone})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-900">Location</h3>
              <LocationPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
              />
            </div>
          </div>
          <SheetFooter className="pt-6 pb-6 px-6 gap-3">
            <Button variant="outline" onClick={() => setIsEditSheetOpen(false)} className="h-11 px-6" disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAgent} className="h-11 px-6" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Agent"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Ban/Unban Confirmation Dialog */}
      <AlertDialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedAgent?.accountStatus === 'active' ? 'Ban Agent?' : 'Unban Agent?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAgent?.accountStatus === 'active' 
                ? `This will suspend the agent "${selectedAgent?.name}" and prevent them from accessing the system.`
                : `This will restore access for agent "${selectedAgent?.name}" and allow them to use the system again.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBanning}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBanAgent} 
              disabled={isBanning}
              className={selectedAgent?.accountStatus === 'active' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'}
            >
              {isBanning 
                ? (selectedAgent?.accountStatus === 'active' ? 'Banning...' : 'Unbanning...') 
                : (selectedAgent?.accountStatus === 'active' ? 'Ban Agent' : 'Unban Agent')
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Agent Sheet */}
      <Sheet open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
        <SheetContent side="right" className="sm:max-w-xl p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetTitle>Agent Details</SheetTitle>
          </SheetHeader>
          {viewAgent && (
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                {viewAgent.profilePhoto ? (
                  <img
                    src={`${URL.IMAGE}/uploads/${viewAgent.profilePhoto}`}
                    alt={viewAgent.name}
                    className="h-16 w-16 rounded-full object-cover border"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                    {viewAgent.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold">{viewAgent.name}</h3>
                  <p className="text-sm text-muted-foreground">{viewAgent.phone}</p>
                  <Badge
                    variant="outline"
                    className={
                      viewAgent.accountStatus === "active"
                        ? "bg-green-50 text-green-700 border-green-200 mt-1"
                        : viewAgent.accountStatus === "pending"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200 mt-1"
                        : "bg-gray-50 text-gray-700 border-gray-200 mt-1"
                    }
                  >
                    {viewAgent.accountStatus}
                  </Badge>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Contact Information</h4>
                <dl className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd className="font-medium">{viewAgent.phone}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="font-medium">{viewAgent.email || "—"}</dd>
                  </div>
                </dl>
              </div>

              {/* Identity */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Identity</h4>
                <dl className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">National ID</dt>
                    <dd className="font-medium">{viewAgent.nationalId || "—"}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">Gender</dt>
                    <dd className="font-medium capitalize">{viewAgent.gender || "—"}</dd>
                  </div>
                </dl>
              </div>

              {/* ID Card Images */}
              {(viewAgent.idCardFrontId || viewAgent.idCardBackId) && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">ID Card</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewAgent.idCardFrontId && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Front</p>
                        <img
                          src={`${URL.IMAGE}/uploads/${viewAgent.idCardFrontId}`}
                          alt="ID Card Front"
                          className="w-full h-auto rounded-lg border"
                        />
                      </div>
                    )}
                    {viewAgent.idCardBackId && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Back</p>
                        <img
                          src={`${URL.IMAGE}/uploads/${viewAgent.idCardBackId}`}
                          alt="ID Card Back"
                          className="w-full h-auto rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Assignment */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Assignment</h4>
                <dl className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">Agent Type</dt>
                    <dd className="font-medium capitalize">{viewAgent.agentType?.replace(/_/g, " ") || "—"}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">Assigned City</dt>
                    <dd className="font-medium">{viewAgent.assignedCity || "—"}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">Assigned Town</dt>
                    <dd className="font-medium">{viewAgent.assignedTown || "—"}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">Town Manager</dt>
                    <dd className="font-medium">{viewAgent.assignedTownManager || "—"}</dd>
                  </div>
                </dl>
              </div>

              {/* Location */}
              {viewAgent.latitude && viewAgent.longitude && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Location</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <dt className="text-muted-foreground">Latitude</dt>
                      <dd className="font-medium font-mono text-sm">{viewAgent.latitude}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <dt className="text-muted-foreground">Longitude</dt>
                      <dd className="font-medium font-mono text-sm">{viewAgent.longitude}</dd>
                    </div>
                  </dl>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Timeline</h4>
                <dl className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="font-medium">{new Date(viewAgent.createdAt).toLocaleString()}</dd>
                  </div>
                </dl>
              </div>

              {/* Rejection Reason */}
              {viewAgent.accountStatus === "rejected" && viewAgent.rejectionReason && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 text-red-600">Rejection Reason</h4>
                  <p className="text-sm text-red-600 bg-red-50 rounded-md p-3 border border-red-200">
                    {viewAgent.rejectionReason}
                  </p>
                </div>
              )}

              {/* Approve/Reject Actions */}
              {viewAgent.accountStatus === "pending" && (
                <div className="border-t pt-4 flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setApproveTarget(viewAgent);
                      setIsApproveDialogOpen(true);
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={() => {
                      setApproveTarget(viewAgent);
                      setIsRejectDialogOpen(true);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve "{approveTarget?.name}"? This will grant them access as an agent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApproveAgent} disabled={actionLoading}>
              {actionLoading ? "Approving..." : "Approve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Provide a reason for rejecting "{approveTarget?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label className="text-sm font-medium mb-2 block">Rejection Reason</Label>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectAgent}
              disabled={actionLoading || !rejectReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? "Rejecting..." : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Performance Sheet */}
      <Sheet open={isPerformanceSheetOpen} onOpenChange={setIsPerformanceSheetOpen}>
        <SheetContent className="sm:max-w-3xl overflow-y-auto">
          <SheetHeader className="pb-6 px-6 pt-6">
            <SheetTitle>Agent Performance</SheetTitle>
            <SheetDescription>
              Detailed performance metrics and job history
            </SheetDescription>
          </SheetHeader>
          {loadingPerformance ? (
            <div className="text-center py-16 text-muted-foreground">Loading performance data...</div>
          ) : selectedAgentPerformance ? (
            <div className="px-6 space-y-6">
              {/* Agent Info */}
              {selectedAgentPerformance.agent && (
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-semibold text-lg">{selectedAgentPerformance.agent.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedAgentPerformance.agent.phoneNumber}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span>City: {selectedAgentPerformance.agent.assignedCity || "-"}</span>
                    <span>Town: {selectedAgentPerformance.agent.assignedTown || "-"}</span>
                    <span>Status: <span className={selectedAgentPerformance.agent.accountStatus === "active" ? "text-green-600 font-medium" : "text-muted-foreground"}>{selectedAgentPerformance.agent.accountStatus}</span></span>
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              {selectedAgentPerformance.stats && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Order Statistics</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border rounded-lg">
                      <p className="text-2xl font-bold">{selectedAgentPerformance.stats.totalOrders}</p>
                      <p className="text-xs text-muted-foreground">Total Orders</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-green-50">
                      <p className="text-2xl font-bold text-green-700">{selectedAgentPerformance.stats.completedOrders}</p>
                      <p className="text-xs text-green-600">Completed</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-yellow-50">
                      <p className="text-2xl font-bold text-yellow-700">{selectedAgentPerformance.stats.pendingOrders}</p>
                      <p className="text-xs text-yellow-600">Pending</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-red-50">
                      <p className="text-2xl font-bold text-red-700">{selectedAgentPerformance.stats.rejectedOrders}</p>
                      <p className="text-xs text-red-600">Rejected</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Commissions */}
              {selectedAgentPerformance.commissions && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Commission Earnings</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border rounded-lg col-span-2 bg-blue-50">
                      <p className="text-2xl font-bold text-blue-700">
                        ETB {selectedAgentPerformance.commissions.totalEarnings.toLocaleString()}
                      </p>
                      <p className="text-xs text-blue-600">Total Earnings</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-lg font-semibold">ETB {selectedAgentPerformance.commissions.userCommissions.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">User Commissions</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-lg font-semibold">ETB {selectedAgentPerformance.commissions.driverCommissions.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Driver Commissions</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-lg font-semibold">ETB {selectedAgentPerformance.commissions.assistedCommissions.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Assisted Commissions</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Jobs */}
              {selectedAgentPerformance.recentJobs.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Recent Jobs ({selectedAgentPerformance.recentJobs.length})</h4>
                  <div className="border rounded-lg max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedAgentPerformance.recentJobs.map((job) => (
                          <TableRow key={job.id}>
                            <TableCell className="font-mono text-xs">{job.id.slice(0, 8)}...</TableCell>
                            <TableCell>
                              <span className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                                job.status === "completed" ? "bg-green-50 text-green-700" :
                                job.status === "rejected" || job.status === "cancelled" ? "bg-red-50 text-red-700" :
                                "bg-yellow-50 text-yellow-700"
                              )}>
                                {job.status.replace(/_/g, " ")}
                              </span>
                            </TableCell>
                            <TableCell>{job.finalPrice ? `ETB ${job.finalPrice}` : "-"}</TableCell>
                            <TableCell className="text-xs">{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">No performance data available</div>
          )}
          <SheetFooter className="pt-6 pb-6 px-6">
            <Button variant="outline" onClick={() => setIsPerformanceSheetOpen(false)} className="h-11 px-6">
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
