import { cn } from "../lib/utils"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useAuth } from "../hooks"
import { PhoneInput } from "./phone-input"
import { normalizeEthiopianPhone } from "../lib/phone"
import { useState } from "react"

export function ForgotForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { sendResetCode, loading } = useAuth()
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
    await sendResetCode(norm.e164!)
  }
  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={onSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your phone number and we'll send you a reset code
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
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </div>
      <div className="text-center text-sm">
        Remember your password?{" "}
        <a href="/login" className="underline underline-offset-4">
          Sign in
        </a>
      </div>
    </form>
  )
}