"use client";

import { useState } from "react";
import DashboardShell from "@/components/layouts/dashboard-shell"
import { IconDashboard, IconList, IconMapPin } from "@tabler/icons-react"
import { useSession } from "@/hooks/auth/auth-client"
import { AgentsView } from "./agents-view";
import AgentAssignView from "./agent-assign-view";
import DashboardView from "./dashboard-view";

export default function ManagerPage() {
  const { data: session } = useSession()
  const [activeView, setActiveView] = useState("dashboard")

  const sidebarData = {
    primary: [
      { title: "Dashboard", url: "#", icon: IconDashboard, onClick: () => setActiveView("dashboard") },
      { title: "Agent List", url: "#", icon: IconList, onClick: () => setActiveView("agent-list") },
      { title: "Agent Assign", url: "#", icon: IconMapPin, onClick: () => setActiveView("agent-assign") },
    ],
    secondary: [],
  }

  const currentUser = {
    name: session?.user?.name || "Manager",
    email: session?.user?.email || "manager@example.com",
    avatar: session?.user?.image || undefined,
    id: session?.user?.id || "",
  }

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView />
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
