"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Eye, EyeOff, X, MapPin, Check } from "lucide-react"
import { PhoneInput } from "@/components/phone-input"
import { Badge } from "@/components/ui/badge"
import { orpc } from "@/lib/oprc"
import { useEffect } from "react"

const ETHIOPIAN_REGIONS = [
  "Addis Ababa",
  "Afar",
  "Amhara",
  "Benishangul-Gumuz",
  "Central Ethiopia",
  "Dire Dawa",
  "Gambela",
  "Harari",
  "Oromia",
  "Sidama",
  "Somali",
  "South Ethiopia",
  "South West Ethiopia",
  "Tigray",
]

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
}

const TOWNS: Record<string, string[]> = {
  "Adama": ["Adama", "Batu", "Mojo", "Dukem"],
  "Bahir Dar": ["Bahir Dar", "Zegie", "Meshenti"],
  "Mekelle": ["Mekelle", "Quiha", "Aynalem"],
  "Legetafo": ["Legetafo", "Gefersa"],
}

export interface UserFormData {
  id?: string;
  name: string;
  phoneNumber: string;
  role: string;
  banned: boolean;
  password?: string;
  confirmPassword?: string;
  townName?: string;
  cityName?: string;
  region?: string;
  assignedCityIds?: string[];
}

interface UserFormProps {
  onSubmit: (data: UserFormData) => void;
  initialData?: UserFormData | null;
}

export function UserForm({ onSubmit, initialData }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    id: initialData?.id,
    name: initialData?.name || "",
    phoneNumber: initialData?.phoneNumber || "",
    role: initialData?.role || "",
    banned: initialData?.banned || false,
    password: initialData?.password || "",
    confirmPassword: "",
    townName: initialData?.townName || "",
    cityName: initialData?.cityName || "",
    region: initialData?.region || "",
    assignedCityIds: (initialData as any)?.assignedCityIds || [],
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [masterCities, setMasterCities] = useState<Array<{ id: string; nameEn: string; nameAm: string; region: string }>>([])
  const [citySearchTerm, setCitySearchTerm] = useState("")

  // Fetch verified active master cities
  useEffect(() => {
    (orpc as any).admin.masterData.listCities().then((res: any) => {
      const active = (res?.data || []).filter((c: any) => c.isActive);
      setMasterCities(active);
    }).catch((err: any) => {
      console.error("Failed to load cities in user form:", err);
    });
  }, []);

  // Fetch existing assigned cities if editing a town manager
  useEffect(() => {
    if (initialData?.id && initialData?.role === "town_manager") {
      (orpc as any).admin.user.getManagerCities({ userId: initialData.id }).then((res: any) => {
        if (res?.success && Array.isArray(res.cities)) {
          const ids = res.cities.map((c: any) => c.id);
          setFormData((prev) => ({
            ...prev,
            assignedCityIds: ids,
            cityName: prev.cityName || (res.cities[0]?.nameEn || ""),
            region: prev.region || (res.cities[0]?.region || ""),
          }));
        }
      }).catch((err: any) => {
        console.error("Failed to fetch manager assigned cities:", err);
      });
    }
  }, [initialData?.id, initialData?.role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      toast.error("Name is required")
      return
    }
    
    if (!formData.phoneNumber.trim()) {
      toast.error("Phone number is required")
      return
    }
    
    if (!formData.role) {
      toast.error("Role is required")
      return
    }
    
    if (!initialData && !formData.password) {
      toast.error("Password is required")
      return
    }
    
    if (!initialData && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    
    if (!initialData && formData.password && formData.password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    
    try {
      const { confirmPassword, ...submitData } = formData
      onSubmit(submitData)
      toast.success("User data submitted successfully!")
    } catch (error) {
      console.error("Form submission error", error)
      toast.error("Failed to submit the form. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormItem>
        <FormLabel>Name</FormLabel>
        <FormControl>
          <Input 
            placeholder="Enter name" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </FormControl>
      </FormItem>

      <FormItem>
        <FormLabel>Phone Number</FormLabel>
        <FormControl>
          <PhoneInput
            value={formData.phoneNumber}
            onChange={(value) => setFormData({...formData, phoneNumber: value})}
          />
        </FormControl>
      </FormItem>

      {!initialData && (
        <>
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <div className="relative">
                <Input 
                  placeholder="Enter password" 
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!initialData}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormControl>
          </FormItem>
          
          <FormItem>
            <FormLabel>Confirm Password</FormLabel>
            <FormControl>
              <div className="relative">
                <Input 
                  placeholder="Confirm password" 
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required={!initialData}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormControl>
          </FormItem>
        </>
      )}

      <FormItem>
        <FormLabel>Role</FormLabel>
        <FormControl>
          <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="driver">Driver</SelectItem>
              <SelectItem value="call_center">Call Center</SelectItem>
              <SelectItem value="town_manager">Town Manager</SelectItem>
            </SelectContent>
          </Select>
        </FormControl>
      </FormItem>



      {formData.role === "town_manager" && (
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-blue-600" />
                Operational Areas / Assigned Cities (የሚመራቸው ከተሞች)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                The manager will strictly have authority to set benchmark rates originating from these areas.
              </p>
            </div>
          </div>

          {/* Selected Cities Badges */}
          <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 border rounded-md min-h-[42px] items-center">
            {formData.assignedCityIds && formData.assignedCityIds.length > 0 ? (
              formData.assignedCityIds.map((cId) => {
                const cityObj = masterCities.find((c) => c.id === cId);
                const label = cityObj ? `${cityObj.nameEn} (${cityObj.nameAm})` : cId;
                return (
                  <Badge
                    key={cId}
                    variant="secondary"
                    className="flex items-center gap-1 py-1 px-2.5 bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 text-xs font-medium"
                  >
                    <span>{label}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (formData.assignedCityIds || []).filter((id) => id !== cId);
                        setFormData({ ...formData, assignedCityIds: updated });
                      }}
                      className="hover:text-red-600 focus:outline-none ml-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })
            ) : (
              <span className="text-xs text-muted-foreground italic px-1">
                No operational cities assigned yet. Select cities below.
              </span>
            )}
          </div>

          {/* City Selection Dropdown & Quick Search */}
          <FormItem>
            <FormLabel>Add Verified Operational City</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <Select
                  value=""
                  onValueChange={(cityId) => {
                    if (!cityId) return;
                    const current = formData.assignedCityIds || [];
                    if (!current.includes(cityId)) {
                      const updated = [...current, cityId];
                      const chosenCity = masterCities.find((c) => c.id === cityId);
                      setFormData({
                        ...formData,
                        assignedCityIds: updated,
                        cityName: formData.cityName || chosenCity?.nameEn || "",
                        region: formData.region || chosenCity?.region || "",
                      });
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Click to select and assign a city..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {masterCities
                      .filter((c) => !(formData.assignedCityIds || []).includes(c.id))
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nameEn} - {c.nameAm} ({c.region || "Ethiopia"})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </FormControl>
          </FormItem>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <FormItem>
              <FormLabel>Primary Town / Station Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Central Hub / Station"
                  value={formData.townName || ""}
                  onChange={(e) => setFormData({ ...formData, townName: e.target.value })}
                />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Region Headquarters</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Oromia / Sidama"
                  value={formData.region || ""}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                />
              </FormControl>
            </FormItem>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full">
        {initialData ? "Update" : "Create"}
      </Button>
    </form>
  )
}