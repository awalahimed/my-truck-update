import { useState, useEffect } from "react"
import DashboardShell from "@/components/layouts/dashboard-shell"
import { IconDashboard, IconUsers, IconWallet, IconTruck, IconBell, IconMedal } from "@tabler/icons-react"
import { useSession } from "@/hooks/auth/auth-client"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Clock } from "lucide-react"
import { orpc } from "@/lib/oprc"
import { AgentDashboardView } from "./dashboard-view"
import { AgentWalletView } from "./wallet-view"
import { CustomerProgressionView } from "./customer-progression-view"
import { DriverProgressionView } from "./driver-progression-view"
import { JobsView } from "./jobs-view"
import ReferralsView from "./referrals-view"
import { NotificationsView } from "./notifications-view"
import { TierView } from "./tier-view"

function AgentPage() {
  const { data: session } = useSession()
  const [activeView, setActiveView] = useState("dashboard")
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [pendingJobs, setPendingJobs] = useState(0)

  // Fetch notification and job counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch unread notifications count
        const notificationsRes = await orpc.notifications.getUserNotifications({ limit: 50 })
        if (notificationsRes.success && notificationsRes.notifications) {
          const unread = (notificationsRes.notifications as any[]).filter((n: any) => !n.read).length
          setUnreadNotifications(unread)
        }

        // Fetch pending jobs count
        try {
          const jobsRes = await orpc.agent.getAssignedOrders()
          if (jobsRes.orders) {
            const pending = jobsRes.orders.filter((o: any) => {
              const status = (o.status || '').toString()
              return !['completed', 'delivered', 'cancelled', 'rejected'].includes(status)
            }).length
            setPendingJobs(pending)
          }
        } catch (e) {
          console.warn('Failed to fetch jobs:', e)
        }
      } catch (error) {
        console.error('Failed to fetch counts:', error)
      }
    }

    fetchCounts()
    // Poll every 30 seconds for updates
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  const sidebarData = {
    primary: [
      { title: "Dashboard", url: "#", icon: IconDashboard, onClick: () => setActiveView("dashboard") },
      { title: "Tier", url: "#", icon: IconMedal, onClick: () => setActiveView("tier") },
      { title: "Wallet", url: "#", icon: IconWallet, onClick: () => setActiveView("wallet") },
      { title: "Customers", url: "#", icon: IconUsers, onClick: () => setActiveView("customers") },
      { title: "Drivers", url: "#", icon: IconTruck, onClick: () => setActiveView("drivers") },
      { 
        title: "Notifications", 
        url: "#", 
        icon: IconBell, 
        badge: unreadNotifications > 0 ? unreadNotifications : undefined,
        onClick: () => setActiveView("notifications") 
      },
      { title: "Referrals", url: "#", icon: IconUsers, onClick: () => setActiveView("referrals") },
      { 
        title: "Jobs", 
        url: "#", 
        icon: IconTruck, 
        badge: pendingJobs > 0 ? pendingJobs : undefined,
        onClick: () => setActiveView("jobs") 
      },
    ],
    secondary: []
  }

  const currentUser = {
    name: session?.user?.name || "Agent User",
    email: session?.user?.email || "agent@example.com",
    avatar: session?.user?.image || undefined,
    id: session?.user?.id || ""
  }

  const renderContent = () => {
    const accountStatus = session?.user?.accountStatus
    const isPending = accountStatus === 'pending'

    // Show pending banner on all pages
    const PendingBanner = isPending ? (
      <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="text-amber-900 dark:text-amber-100">Account Pending Approval</AlertTitle>
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          Your agent account is currently under review. A reviewer will approve your registration shortly.
          {activeView === 'wallet' || activeView === 'jobs' ? ' Access to this section will be granted after approval.' : ''}
        </AlertDescription>
      </Alert>
    ) : null

    // Block wallet and jobs if pending
    if (isPending && (activeView === 'wallet' || activeView === 'jobs')) {
      return (
        <div className="space-y-4">
          {PendingBanner}
          <Alert>
            <AlertDescription>
              This section is not available until your account is approved.
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    switch (activeView) {
      case "dashboard":
        return (
          <>
            {PendingBanner}
            <AgentDashboardView />
          </>
        )
      case "tier":
        return (
          <>
            {PendingBanner}
            <TierView />
          </>
        )
      case "wallet":
        return (
          <>
            {PendingBanner}
            <AgentWalletView />
          </>
        )
      case "customers":
        return (
          <>
            {PendingBanner}
            <CustomerProgressionView />
          </>
        )
      case "drivers":
        return (
          <>
            {PendingBanner}
            <DriverProgressionView />
          </>
        )
      case "notifications":
        return (
          <>
            {PendingBanner}
            <NotificationsView />
          </>
        )
      case "referrals":
        return (
          <>
            {PendingBanner}
            <ReferralsView />
          </>
        )
      case "jobs":
        return (
          <>
            {PendingBanner}
            <JobsView />
          </>
        )
      default:
        return null
    }
  }

  return (
    <DashboardShell
      sidebar={sidebarData}
      title="Agent Dashboard"
      user={currentUser}
    >
      {renderContent()}
    </DashboardShell>
  )
}

export default AgentPage
