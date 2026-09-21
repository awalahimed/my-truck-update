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
import { Eye, EyeOff } from "lucide-react"
import { PhoneInput } from "@/components/phone-input"

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
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
          <h3 className="text-sm font-semibold">Manager Territory</h3>
          <FormItem>
            <FormLabel>Region / State</FormLabel>
            <FormControl>
              <Select
                value={formData.region}
                onValueChange={(value) => setFormData({...formData, region: value, cityName: "", townName: ""})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {ETHIOPIAN_REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
          {formData.region && (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Select
                  value={formData.cityName}
                  onValueChange={(value) => setFormData({...formData, cityName: value, townName: ""})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES_BY_REGION[formData.region]?.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
          {formData.cityName && (
            <FormItem>
              <FormLabel>Town</FormLabel>
              <FormControl>
                <Select
                  value={formData.townName}
                  onValueChange={(value) => setFormData({...formData, townName: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select town" />
                  </SelectTrigger>
                  <SelectContent>
                    {(TOWNS[formData.cityName] || [formData.cityName]).map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        </div>
      )}

      <Button type="submit" className="w-full">
        {initialData ? "Update" : "Create"}
      </Button>
    </form>
  )
}