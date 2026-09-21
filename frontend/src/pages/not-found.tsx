import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen grid place-items-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold">404</h1>
        <p className="text-muted-foreground">Page not found.</p>
        <div className="flex justify-center gap-3">
          <Button asChild><Link to="/">Go home</Link></Button>
        </div>
      </div>
    </div>
  )
}


