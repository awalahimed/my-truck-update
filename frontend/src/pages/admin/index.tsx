import { useState } from "react"
import DashboardShell from "@/components/layouts/dashboard-shell"
import { IconUsers, IconDashboard, IconShieldCheck, IconSpeakerphone, IconGift, IconWallet, IconUserCog, IconTruckDelivery, IconChartBar, IconMedal, IconCoin, IconBuildingCommunity } from "@tabler/icons-react"
import { useSession } from "@/hooks/auth/auth-client"
import { DashboardView } from "./dashboard-view"
import { UsersView } from "./user/users-view"
import { ApprovalView } from "./approval/approval-view"
import { AnnouncementsView } from "./announcements/announcements-view"
import { ReferralAnalytics } from "./referrals/analytics"
import { ReferralConfig } from "./referrals/config"
import { AdminWalletView } from "./wallet/wallet-view"
import { AgentsView } from "./agents/agents-view"
import { ShipmentOrdersView } from "./order/order-view"
import { ConversionView } from "./conversion/conversion-view"
import { AdminTiersView } from "./tiers/tiers-view"
import { GiveawayView } from "./giveaway/giveaway-view"
import { TownManagerReport } from "./town-managers/town-manager-report"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Referral Tabs Component
function ReferralTabs() {
  return (
    <Tabs defaultValue="analytics" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="config">Configuration</TabsTrigger>
      </TabsList>
      <TabsContent value="analytics">
        <ReferralAnalytics />
      </TabsContent>
      <TabsContent value="config">
        <ReferralConfig />
      </TabsContent>
    </Tabs>
  )
}

function AdminPage() {
  const { data: session } = useSession()
  const [activeView, setActiveView] = useState("dashboard")

  const sidebarData = {
    primary: [
      { title: "Dashboard", url: "#", icon: IconDashboard, onClick: () => setActiveView("dashboard") },
      { title: "Users", url: "#", icon: IconUsers, onClick: () => setActiveView("users") },
      { title: "Agents", url: "#", icon: IconUserCog, onClick: () => setActiveView("agents") },
      { title: "Managers", url: "#", icon: IconBuildingCommunity, onClick: () => setActiveView("townManagers") },
      { title: "Approval", url: "#", icon: IconShieldCheck, onClick: () => setActiveView("approval") },
      { title: "Announcements", url: "#", icon: IconSpeakerphone, onClick: () => setActiveView("announcements") },
      { title: "Referrals", url: "#", icon: IconGift, onClick: () => setActiveView("referrals") },
      { title: "Wallet", url: "#", icon: IconWallet, onClick: () => setActiveView("wallet") },
      { title: "Shipments", url: "#", icon: IconTruckDelivery, onClick: () => setActiveView("shipments") },
      { title: "Conversion", url: "#", icon: IconChartBar, onClick: () => setActiveView("conversion") },
      { title: "Tiers", url: "#", icon: IconMedal, onClick: () => setActiveView("tiers") },
      { title: "Giveaway", url: "#", icon: IconCoin, onClick: () => setActiveView("giveaway") },
    ],
    secondary: [
    ]
  }

  const currentUser = {
    name: session?.user?.name || "Admin User",
    email: session?.user?.email || "admin@example.com",
    avatar: session?.user?.image || undefined,
    id: session?.user?.id || ""
  }

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView />
      case "users":
        return <UsersView />
      case "agents":
        return <AgentsView />
      case "townManagers":
        return <TownManagerReport />
      case "approval":
        return <ApprovalView />
      case "announcements":
        return <AnnouncementsView />
      case "referrals":
        return <ReferralTabs />
      case "wallet":
        return <AdminWalletView />
      case "shipments":
        return <ShipmentOrdersView />
      case "conversion":
        return <ConversionView />
      case "tiers":
        return <AdminTiersView />
      case "giveaway":
        return <GiveawayView />
      default:
        return null
    }
  }

  return (
    <DashboardShell
      sidebar={sidebarData}
      title="Admin Dashboard"
      user={currentUser}
    >
      {renderContent()}
    </DashboardShell>
  )
}



export  default AdminPage