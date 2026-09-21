import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, phoneNumber, useSession } from './auth-client'
import { useFetchConfig } from '../FetchConfig'
import { toast } from 'sonner'

export function useAuth() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const { data: handshake, isLoading: isHandshakeLoading, error: handshakeError } = useFetchConfig()

  const login = async (phoneNumberValue: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      if (isHandshakeLoading) throw new Error('Initializing, please wait')
      if (handshakeError) throw new Error('Failed to handshake with API')
      if (!handshake?.auth?.login) throw new Error('Login is currently disabled')
      
      console.log('Attempting login for phone:', phoneNumberValue)
      const res = await signIn.phoneNumber({ phoneNumber: phoneNumberValue, password })
      
      if (res.error) {
        console.error('Login error:', res.error)
        toast.error(res.error?.message || 'Login failed invaled phone or password ')
        setLoading(false)
      } else {
        console.log('Login successful, response:', res)
        toast.success('Login successful')
        
        // Keep loading state true during redirect
        // Don't set loading to false here
        
        // Check if we have user data in the response
        if (res.data?.user && (res.data.user as any).role) {
          const userRole = (res.data.user as any).role
          console.log('User role from login response:', userRole)
          
          let redirectUrl = '/'
          if (userRole === 'call_center') {
            redirectUrl = '/call-center'
          } else if (userRole === 'admin') {
            redirectUrl = '/dashboard'
          } else if (userRole === 'agent') {
            redirectUrl = '/agent-dashboard'
          } else if (userRole === 'town_manager') {
            redirectUrl = '/manager-dashboard'
          }
          
          console.log('Redirecting to:', redirectUrl)
          
          // Show redirecting message
          toast.success('Redirecting to dashboard...')
          
          // Use React Router navigation instead of window.location.replace
          // This preserves the session state and React context
          setTimeout(() => {
            navigate(redirectUrl, { replace: true })
          }, 500)
        }
      }
    } catch (err) {
      console.error('Login exception:', err)
      setError(err instanceof Error ? err.message : 'Login failed')
      toast.error(err instanceof Error ? err.message : 'Login failed invaled  phone number or password ')
      setLoading(false)
    }
  }

  const sendRegistrationOtp = async (phoneNumberValue: string) => {
    setLoading(true)
    setError(null)
    try {
      if (isHandshakeLoading) throw new Error('Initializing, please wait')
      if (handshakeError) throw new Error('Failed to handshake with API')
      if (!handshake?.auth?.register) throw new Error('Registration is currently disabled')
      const res = await phoneNumber.sendOtp({ phoneNumber: phoneNumberValue })
      if (res.error) {
        toast.error(res.error.message || 'Failed to send code')
      } else {
        toast.success('Verification code sent')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code')
      toast.error(err instanceof Error ? err.message : 'Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  const verifyAndRegister = async (phoneNumberValue: string, otp: string) => {
    setLoading(true)
    setError(null)
    try {
      if (isHandshakeLoading) throw new Error('Initializing, please wait')
      if (handshakeError) throw new Error('Failed to handshake with API')
      if (!handshake?.auth?.register) throw new Error('Registration is currently disabled')
      const res = await phoneNumber.verify({ phoneNumber: phoneNumberValue, code: otp })
      if (res.error) {
        toast.error('Registration failed to verify code')
      } else {
        toast.success('Registration successful')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      toast.error(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const sendResetCode = async (phoneNumberValue: string) => {
    setLoading(true)
    setError(null)
    try {
      if (isHandshakeLoading) throw new Error('Initializing, please wait')
      if (handshakeError) throw new Error('Failed to handshake with API')
      if (!handshake?.auth?.forgotPassword) throw new Error('Forgot password is disabled')
      const res = await phoneNumber.sendOtp({ phoneNumber: phoneNumberValue })
      if (res.error) {
        toast.error(res.error.message || 'Failed to send code')
      } else {
        toast.success('Verification code sent')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code')
      toast.error(err instanceof Error ? err.message : 'Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  const verifyResetCode = async (phoneNumberValue: string, otp: string) => {
    setLoading(true)
    setError(null)
    try {
      if (isHandshakeLoading) throw new Error('Initializing, please wait')
      if (handshakeError) throw new Error('Failed to handshake with API')
      if (!handshake?.auth?.forgotPassword) throw new Error('Forgot password is disabled')
      const res = await phoneNumber.verify({ phoneNumber: phoneNumberValue, code: otp })
      if (res.error) {
        toast.error(res.error?.message || 'Invalid code')
      } else {
        toast.success('Code verified')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code')
      toast.error(err instanceof Error ? err.message : 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  return {
    login,
    sendRegistrationOtp,
    verifyAndRegister,
    sendResetCode,
    verifyResetCode,
    loading,
    error,
    session,
    isAuthenticated: !!session
  }
}