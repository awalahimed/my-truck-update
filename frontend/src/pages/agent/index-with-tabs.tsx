import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from "@/hooks/auth/auth-client"
import { AgentDashboardView } from "./dashboard-view"
import { AgentWalletView } from "./wallet-view"
import { CustomerProgressionView } from "./customer-progression-view"
import { DriverProgressionView } from "./driver-progression-view"
import dynamic from 'next/dynamic'
const ReferralsView = dynamic(() => import('./referrals-view'), { ssr: false })
import { IconDashboard, IconUsers, IconWallet, IconTruck, IconLogout } from "@tabler/icons-react"

function AgentPageWithTabs() {
  const { data: session } = useSession()

  const handleLogout = () => {
    // Implement logout
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Agent Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {session?.user?.name || "Agent"}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <IconLogout className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <IconDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <IconWallet className="h-4 w-4" />
              <span>Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <IconUsers className="h-4 w-4" />
              <span>Customers</span>
            </TabsTrigger>
            <TabsTrigger value="drivers" className="flex items-center gap-2">
              <IconTruck className="h-4 w-4" />
              <span>Drivers</span>
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <IconUsers className="h-4 w-4" />
              <span>Referrals</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <AgentDashboardView />
          </TabsContent>

          <TabsContent value="wallet" className="space-y-4">
            <AgentWalletView />
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <CustomerProgressionView />
          </TabsContent>

          <TabsContent value="drivers" className="space-y-4">
            <DriverProgressionView />
          </TabsContent>

          <TabsContent value="referrals" className="space-y-4">
            <ReferralsView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AgentPageWithTabs
