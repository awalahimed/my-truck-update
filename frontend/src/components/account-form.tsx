"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { authClient } from "@/hooks/auth/auth-client"

interface AccountFormData {
  name: string;
  password: string;
  confirmPassword: string;
}

interface AccountFormProps {
  initialData?: { name: string; id: string };
  onSuccess?: () => void;
}

export function AccountForm({ initialData, onSuccess }: AccountFormProps) {
  const [formData, setFormData] = useState<AccountFormData>({
    name: initialData?.name || "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!initialData?.id) {
      toast.error("No user ID provided")
      return
    }
    
    if (!formData.name.trim()) {
      toast.error("Name is required")
      return
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    
    try {
      setLoading(true)
      
      // Update name if changed
      if (formData.name !== initialData.name) {
        await authClient.admin.updateUser({
          userId: initialData.id,
          data: { name: formData.name }
        })
      }
      
      // Update password if provided
      if (formData.password) {
        await authClient.admin.setUserPassword({
          userId: initialData.id,
          newPassword: formData.password
        })
      }
      
      toast.success("Account updated successfully!")
      setFormData({ ...formData, password: "", confirmPassword: "" })
      onSuccess?.()
    } catch (error) {
      console.error('Update error:', error)
      toast.error("Failed to update account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input 
              placeholder="Enter your name" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </FormControl>
        </FormItem>

        <FormItem>
          <FormLabel>New Password</FormLabel>
          <FormControl>
            <Input 
              placeholder="Enter new password (leave blank to keep current)" 
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </FormControl>
        </FormItem>

        <FormItem>
          <FormLabel>Confirm Password</FormLabel>
          <FormControl>
            <Input 
              placeholder="Confirm new password" 
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </FormControl>
        </FormItem>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Updating..." : "Update Account"}
      </Button>
    </form>
  )
}