import { useState, useCallback, useEffect } from "react"
import { cn } from "../lib/utils"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { PhoneInput } from "./phone-input"
import { normalizeEthiopianPhone } from "../lib/phone"
import { uploadFile } from "../lib/upload"
import { orpc } from "../lib/oprc"
import { toast } from "sonner"
import { Map, MapMarker, MarkerContent, MapControls } from "@/components/ui/map"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import {
  Phone,
  User,
  MapPin,
  CreditCard,
  Check,
  Eye,
  EyeOff,
  Clock,
} from "lucide-react"
import { FileDropZone } from "./file-drop-zone"

// ── Step definitions ──
const STEPS = [
  { id: 1, label: "Account", icon: Phone },
  { id: 2, label: "Profile", icon: User },
  { id: 3, label: "ID Upload", icon: CreditCard },
] as const

// ── Timeline indicator ──
function StepTimeline({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, idx) => {
        const isCompleted = currentStep > step.id
        const isCurrent = currentStep === step.id
        const Icon = step.icon

        return (
          <div key={step.id} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isCompleted && "bg-emerald-500 border-emerald-500 text-white",
                  isCurrent && "bg-white dark:bg-neutral-900 border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-500/20",
                  !isCompleted && !isCurrent && "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 text-gray-400"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={cn(
                  "text-xs mt-1.5 font-medium transition-colors",
                  isCurrent && "text-emerald-600 dark:text-emerald-400",
                  isCompleted && "text-emerald-500",
                  !isCompleted && !isCurrent && "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-16 sm:w-24 h-0.5 mx-2 mb-5 transition-all duration-500",
                  currentStep > step.id ? "bg-emerald-500" : "bg-gray-200 dark:bg-neutral-700"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Reverse geocoding helper ──
async function reverseGeocode(
  lat: string,
  lng: string
): Promise<{ city: string; town: string } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=en`,
      { headers: { "User-Agent": "MyTrackApp/1.0" } }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const addr = data.address || {};
    const city =
      addr.city ||
      addr.town ||
      addr.state_district ||
      addr.county ||
      addr.state ||
      "";
    const town =
      addr.suburb ||
      addr.neighbourhood ||
      addr.village ||
      addr.hamlet ||
      addr.quarter ||
      "";
    return { city, town };
  } catch {
    return null;
  }
}

// ── Main form ──
export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // Step tracking
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1: Account
  const [phoneValue, setPhoneValue] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [fullName, setFullName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Step 2: Profile
  const [gender, setGender] = useState("")
  const [agentType, setAgentType] = useState("")
  const [city, setCity] = useState("")
  const [town, setTown] = useState("")
  const [lat, setLat] = useState("9.0320")
  const [lng, setLng] = useState("38.7469")
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([38.7469, 9.0320])
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [profilePhotoUploading, setProfilePhotoUploading] = useState(false)
  const [profilePhotoProgress, setProfilePhotoProgress] = useState(0)

  // Step 3: ID Upload
  const [nationalId, setNationalId] = useState("")
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [frontUploading, setFrontUploading] = useState(false)
  const [backUploading, setBackUploading] = useState(false)
  const [frontProgress, setFrontProgress] = useState(0)
  const [backProgress, setBackProgress] = useState(0)

  // Global state
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)

  // ── Step 1 handler ──
  const handleStep1Next = () => {
    if (!fullName.trim()) {
      toast.error("Please enter your full name")
      return
    }
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    setCurrentStep(2)
  }

  // ── Step 2 geocoding & map event handlers ──
  const handleMapClick = useCallback(async (e: any) => {
    const clickLat = e.lngLat.lat.toFixed(6)
    const clickLng = e.lngLat.lng.toFixed(6)
    setLat(clickLat)
    setLng(clickLng)
    setMarkerPosition([e.lngLat.lng, e.lngLat.lat])

    toast.promise(
      reverseGeocode(clickLat, clickLng).then((res) => {
        if (res) {
          setCity(res.city)
          setTown(res.town)
        }
      }),
      {
        loading: "Fetching address...",
        success: "Location updated!",
        error: "Could not fetch address details",
      }
    )
  }, [])

  const handleMarkerDragEnd = useCallback(async (lngLat: { lng: number; lat: number }) => {
    const dragLat = lngLat.lat.toFixed(6)
    const dragLng = lngLat.lng.toFixed(6)
    setLat(dragLat)
    setLng(dragLng)
    setMarkerPosition([lngLat.lng, lngLat.lat])

    toast.promise(
      reverseGeocode(dragLat, dragLng).then((res) => {
        if (res) {
          setCity(res.city)
          setTown(res.town)
        }
      }),
      {
        loading: "Fetching address...",
        success: "Location updated!",
        error: "Could not fetch address details",
      }
    )
  }, [])

  const handleLocate = useCallback(async (coords: { longitude: number; latitude: number }) => {
    const locLat = coords.latitude.toFixed(6)
    const locLng = coords.longitude.toFixed(6)
    setLat(locLat)
    setLng(locLng)
    setMarkerPosition([coords.longitude, coords.latitude])

    toast.promise(
      reverseGeocode(locLat, locLng).then((res) => {
        if (res) {
          setCity(res.city)
          setTown(res.town)
        }
      }),
      {
        loading: "Fetching address...",
        success: "Location updated!",
        error: "Could not fetch address details",
      }
    )
  }, [])

  useEffect(() => {
    if (!mapInstance) return

    mapInstance.on("click", handleMapClick)
    return () => {
      mapInstance.off("click", handleMapClick)
    }
  }, [mapInstance, handleMapClick])

  // ── Step 2 handler ──
  const handleStep2Next = () => {
    if (!agentType) {
      toast.error("Please select an agent type")
      return
    }
    setCurrentStep(3)
  }

  // ── Step 3 / Final submit ──
  const handleSubmit = async () => {
    if (!frontFile || !backFile) {
      toast.error("Please upload both sides of your ID card")
      return
    }

    const norm = normalizeEthiopianPhone(phoneValue)
    if (!norm.ok) {
      toast.error("Invalid phone number")
      return
    }

    setSubmitting(true)
    try {
      // Upload front ID
      setFrontUploading(true)
      const frontId = await uploadFile(frontFile, {
        onProgress: setFrontProgress,
        documentType: "id_card_front",
      })
      setFrontUploading(false)

      // Upload back ID
      setBackUploading(true)
      const backId = await uploadFile(backFile, {
        onProgress: setBackProgress,
        documentType: "id_card_back",
      })
      setBackUploading(false)

      // Upload profile photo (optional)
      let profilePhotoId: string | undefined
      if (profilePhoto) {
        setProfilePhotoUploading(true)
        profilePhotoId = await uploadFile(profilePhoto, {
          onProgress: setProfilePhotoProgress,
          documentType: "profile_photo",
        })
        setProfilePhotoUploading(false)
      }

      // Call self-registration endpoint (modeled after admin.agents.create)
      await orpc.agent.selfRegister({
        name: fullName,
        phone: norm.e164!,
        password: password,
        nationalId: nationalId || undefined,
        idCardFrontId: frontId,
        idCardBackId: backId,
        gender: gender || undefined,
        agentType: (agentType as "paid_agent" | "field_agent" | "verification_agent") || undefined,
        assignedCity: city || undefined,
        assignedTown: town || undefined,
        latitude: lat || undefined,
        longitude: lng || undefined,
        profilePhotoId: profilePhotoId,
      })

      toast.success("Registration submitted successfully!")
      setCompleted(true)
    } catch (error: any) {
      console.error("Registration error:", error)
      toast.error(error?.message || "Registration failed. Please try again.")
      setFrontUploading(false)
      setBackUploading(false)
      setProfilePhotoUploading(false)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success screen ──
  if (completed) {
    return (
      <div className={cn("flex flex-col items-center gap-6 py-8", className)}>
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
          <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Pending Approval</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Your agent registration has been submitted. An reviwer will review your application and approve it shortly.
          </p>
        </div>
        <a
          href="/agent-login"
          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium underline underline-offset-4"
        >
          Go to Agent Login
        </a>
      </div>
    )
  }

  // ── Render ──
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Agent Registration</h1>
        <p className="text-muted-foreground text-sm">
          Complete the steps below to register as an agent
        </p>
      </div>

      <StepTimeline currentStep={currentStep} />

      {/* ── STEP 1: Account Setup ── */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Account Setup
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="reg-name">Full Name</Label>
              <Input
                id="reg-name"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-phone">Phone Number</Label>
              <PhoneInput
                id="reg-phone"
                className={cn("w-full", phoneError && "border-red-500")}
                value={phoneValue}
                onChange={(v) => {
                  setPhoneValue((v as string) ?? "")
                  if (phoneError) setPhoneError("")
                }}
              />
              {phoneError && <p className="text-xs text-red-500">{phoneError}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-password">Password</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button
            onClick={handleStep1Next}
            disabled={!fullName || !phoneValue || !password}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Continue to Profile
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/agent-login" className="text-emerald-600 hover:underline font-medium">
              Sign in
            </a>
          </p>
        </div>
      )}

      {/* ── STEP 2: Profile & Region ── */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Profile & Region
            </h3>

            <div className="space-y-3">
              <FileDropZone
                label="Profile Photo"
                file={profilePhoto}
                onFileSelect={(f) => setProfilePhoto(f)}
                onClear={() => setProfilePhoto(null)}
                uploading={profilePhotoUploading}
                progress={profilePhotoProgress}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Agent Type</Label>
                <Select value={agentType} onValueChange={setAgentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="field_agent">Field Agent</SelectItem>
                    <SelectItem value="paid_agent">Paid Agent</SelectItem>
                    <SelectItem value="verification_agent">Verification Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Location Selection</Label>
              <div className="h-64 rounded-xl border overflow-hidden relative shadow-inner">
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
                          type: "raster",
                          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                          tileSize: 256,
                          attribution: "&copy; OpenStreetMap Contributors",
                          maxzoom: 19,
                        },
                      },
                      layers: [
                        {
                          id: "osm",
                          type: "raster",
                          source: "osm",
                        },
                      ],
                    },
                    dark: {
                      version: 8,
                      sources: {
                        osm: {
                          type: "raster",
                          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                          tileSize: 256,
                          attribution: "&copy; OpenStreetMap Contributors",
                          maxzoom: 19,
                        },
                      },
                      layers: [
                        {
                          id: "osm",
                          type: "raster",
                          source: "osm",
                        },
                      ],
                    },
                  }}
                >
                  <MapMarker
                    longitude={markerPosition[0]}
                    latitude={markerPosition[1]}
                    draggable
                    onDragEnd={handleMarkerDragEnd}
                  >
                    <MarkerContent>
                      <div className="relative h-8 w-8 rounded-full border-4 border-white bg-emerald-500 shadow-lg flex items-center justify-center text-white">
                        <MapPin className="w-4 h-4" />
                      </div>
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
              <p className="text-[11px] text-muted-foreground">
                Drag the marker or tap on the map to set coordinates and auto-fill address details.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="reg-lat">Latitude</Label>
                <Input id="reg-lat" value={lat} readOnly className="bg-muted text-muted-foreground" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-lng">Longitude</Label>
                <Input id="reg-lng" value={lng} readOnly className="bg-muted text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="reg-city">City</Label>
                <Input
                  id="reg-city"
                  placeholder="e.g. Addis Ababa"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-town">Town / Sub-city</Label>
                <Input
                  id="reg-town"
                  placeholder="e.g. Bole"
                  value={town}
                  onChange={(e) => setTown(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleStep2Next}
              disabled={!agentType}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Continue to ID Upload
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: ID Verification ── */}
      {currentStep === 3 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Identity Verification
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="reg-national-id">National ID / Kebele ID Number</Label>
              <Input
                id="reg-national-id"
                placeholder="Enter your ID number"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FileDropZone
                label="ID Card — Front"
                file={frontFile}
                onFileSelect={setFrontFile}
                onClear={() => { setFrontFile(null); setFrontProgress(0) }}
                uploading={frontUploading}
                progress={frontProgress}
              />
              <FileDropZone
                label="ID Card — Back"
                file={backFile}
                onFileSelect={setBackFile}
                onClear={() => { setBackFile(null); setBackProgress(0) }}
                uploading={backUploading}
                progress={backProgress}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(2)}
              disabled={submitting}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !frontFile || !backFile}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Registration
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}