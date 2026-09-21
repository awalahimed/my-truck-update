import type { ReactNode } from 'react'
import { useFetchConfig } from '../hooks/FetchConfig'
import { useLocation } from 'react-router-dom' // Assuming React Router

type HandshakeGuardProps = {
  children: ReactNode
  fallback?: ReactNode
}

export function HandshakeGuard({ children, fallback = null }: HandshakeGuardProps) {
  const { data: handshake } = useFetchConfig()
  const location = useLocation()
  const path = location.pathname

  const auth = handshake?.auth

  if (!auth) return <>{fallback}</>

  const pathRequires: { [key: string]: keyof typeof auth } = {
    '/login': 'login',
    '/register': 'register',
    '/forgot-password': 'forgotPassword',
  }

  // Match the current path to an auth key
  const requiredKey = Object.keys(pathRequires).find(route => path.startsWith(route))
  if (requiredKey) {
    const authKey = pathRequires[requiredKey]
    if (auth[authKey] !== 'true') {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}
