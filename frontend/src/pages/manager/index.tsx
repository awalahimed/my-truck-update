"use client";

import { useState } from "react";
import DashboardShell from "@/components/layouts/dashboard-shell"
import { IconDashboard, IconList, IconMapPin, IconChartBar, IconShieldCheck } from "@tabler/icons-react"
import { useSession } from "@/hooks/auth/auth-client"
import { AgentsView } from "./agents-view";
import AgentAssignView from "./agent-assign-view";
import DashboardView from "./dashboard-view";
import { DigitalDelalaTab } from "./digital-delala-tab";
import { PoDReviewTab } from "./pod-review-tab";

export default function ManagerPage() {
  const { data: session } = useSession()
  const [activeView, setActiveView] = useState("dashboard")

  const sidebarData = {
    primary: [
      { title: "Dashboard", url: "#", icon: IconDashboard, onClick: () => setActiveView("dashboard") },
      { title: "PoD Reviews (ደረሰኝ ማረጋገጫ)", url: "#", icon: IconShieldCheck, onClick: () => setActiveView("pod-review") },
      { title: "Digital Delala (የገበያ ዋጋ)", url: "#", icon: IconChartBar, onClick: () => setActiveView("digital-delala") },
      { title: "Agent List", url: "#", icon: IconList, onClick: () => setActiveView("agent-list") },
      { title: "Agent Assign", url: "#", icon: IconMapPin, onClick: () => setActiveView("agent-assign") },
    ],
    secondary: [],
  }

  const userObj = (session as any)?.data?.user || (session as any)?.user;
  const currentUser = {
    name: userObj?.name || "Manager",
    email: userObj?.email || "manager@example.com",
    avatar: userObj?.image || undefined,
    id: userObj?.id || "",
  }

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView />
      case "pod-review":
        return <PoDReviewTab />
      case "digital-delala":
        return <DigitalDelalaTab />
      case "agent-list":
        return <AgentsView />
      case "agent-assign":
        return <AgentAssignView />
      default:
        return null
    }
  }

  return (
    <DashboardShell
      sidebar={sidebarData}
      title="Manager Dashboard"
      user={currentUser}
    >
      {renderContent()}
    </DashboardShell>
  )
}
