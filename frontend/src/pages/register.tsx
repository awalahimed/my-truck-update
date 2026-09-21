import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { RegisterForm } from "../components/register-form"

export default function RegisterPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-svh bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-emerald-950/20">
      <div className="flex flex-col gap-4 p-6 md:p-10 max-w-2xl mx-auto">
        <div className="flex justify-start">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center py-4">
          <div className="w-full">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  )
}