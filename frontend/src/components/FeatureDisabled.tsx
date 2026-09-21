import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

interface FeatureDisabledProps {
  feature: string
}

export function FeatureDisabled({ feature }: FeatureDisabledProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Feature Unavailable</h2>
        <p className="text-gray-600 mb-6">
          {feature} is currently disabled. Please try again later.
        </p>
        <Button onClick={() => navigate('/')} className="w-full">
          Go Home
        </Button>
      </div>
    </div>
  )
}