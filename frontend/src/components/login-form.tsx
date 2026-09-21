import { useState } from "react"
import { useAuth } from "../hooks/auth/use-auth"
import { cn } from "../lib/utils"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { PhoneInput } from "./phone-input"
import { normalizeEthiopianPhone } from "../lib/phone"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading } = useAuth()
  const [phoneValue, setPhoneValue] = useState<string>("")
  const [phoneError, setPhoneError] = useState<string>("")
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const rawPhone = String(form.get('phone') || '')
    const norm = normalizeEthiopianPhone(rawPhone)
    if (!norm.ok) {
      setPhoneError('Must start with 9 or 7 and be 9 digits')
      return
    }
    const password = String(form.get('password') || '')
    await login(norm.e164!, password)
  }
  
  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={onSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your phone number below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-1.5">
          <Label htmlFor="phone">Phone Number</Label>
          <PhoneInput
            id="phone"
            name="phone"
            className={cn("w-full", phoneError && "border-red-500 focus-visible:ring-red-500")}
            value={phoneValue}
            onChange={(v) => {
              setPhoneValue((v as string) ?? "")
              if (phoneError) setPhoneError("")
            }}
            required
          />
          {phoneError && <p className="text-sm text-red-500">{phoneError}</p>}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input id="password" name="password" type={showPassword ? "text" : "password"} className="pr-10" required />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </div>
    </form>
  )
}
