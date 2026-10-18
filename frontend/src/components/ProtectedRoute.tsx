import { Navigate } from 'react-router-dom'
import { useSession } from '@/hooks/auth/auth-client'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { data: session, isPending } = useSession()
  
  const user = (session as any)?.user
  const userRole = user?.role

  // Debug session state
  useEffect(() => {
    console.log('ProtectedRoute session debug:', {
      isPending,
      hasSession: !!session,
      sessionData: session,
      userRole,
      requiredRole,
      cookies: document.cookie
    })
  }, [session, isPending, requiredRole, userRole])
  
  console.log('ProtectedRoute check:', { 
    isPending, 
    hasSession: !!session, 
    userRole, 
    requiredRole 
  })
  
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading session...</span>
      </div>
    )
  }
  
  if (!session) {
    console.log('No session found, cookies:', document.cookie)
    console.log('Redirecting to login')
    return <Navigate to="/login" replace />
  }
  
  if (requiredRole && userRole !== requiredRole) {
    console.log(`Role mismatch: required ${requiredRole}, got ${userRole}`)
    return <Navigate to="/" replace />
  }
  
  console.log('ProtectedRoute: Access granted')
  return <>{children}</>
}